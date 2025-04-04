'use server';

import { supabase } from '@/lib/supabase';
import { MAX_SHOP_ITEMS } from '@/lib/constants';
import type { Item, ItemRarity, ApiResponse, ShopItem } from '@/lib/types';
import { getCharacterFromCookie } from './character';
import { revalidatePath } from 'next/cache';
import { getCurrentGameDay } from '@/lib/utils';

// Get shop items for a character
export async function getShopItems(): Promise<ApiResponse<ShopItem[]>> {
  try {
    // Get character from cookie
    const characterResponse = await getCharacterFromCookie();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    const currentDay = getCurrentGameDay();
    
    // Get shop items for the character
    const { data: shopItems, error } = await supabase
      .from('shop_items')
      .select('*, item:items(*)')
      .eq('character_id', character.id);
    
    if (error) {
      console.error('Error fetching shop items:', error);
      return { success: false, error: 'Failed to fetch shop items' };
    }
    
    // If no shop items exist for this character, generate them
    if (!shopItems || shopItems.length === 0) {
      return await generateShopItems(character.id, currentDay);
    }
    
    // Check if shop items need to be refreshed (daily)
    // Assuming shop_items has a day field we can use
    if (shopItems[0] && shopItems[0].day !== currentDay) {
      return await generateShopItems(character.id, currentDay);
    }
    
    return { success: true, data: shopItems as ShopItem[] };
  } catch (err) {
    console.error('Error in getShopItems:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Generate new shop items for a character
async function generateShopItems(characterId: string, day: number): Promise<ApiResponse<ShopItem[]>> {
  try {
    // Get character level to determine item quality
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('experience')
      .eq('id', characterId)
      .single();
    
    if (characterError) {
      console.error('Error fetching character:', characterError);
      return { success: false, error: 'Failed to fetch character' };
    }
    
    // Calculate character level from experience
    const level = Math.floor(Math.sqrt(character.experience / 100)) + 1;
    
    // Get random items from the items table
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .order('random()')
      .limit(MAX_SHOP_ITEMS);
    
    if (itemsError || !items) {
      console.error('Error fetching items:', itemsError);
      return { success: false, error: 'Failed to fetch items' };
    }
    
    // Delete existing shop items for this character
    const { error: deleteError } = await supabase
      .from('shop_items')
      .delete()
      .eq('character_id', characterId);
    
    if (deleteError) {
      console.error('Error deleting shop items:', deleteError);
      return { success: false, error: 'Failed to refresh shop items' };
    }
    
    // Calculate prices based on item rarity and character level
    const shopItems = items.map((item: Item) => {
      // Base price multiplier based on rarity
      const rarityMultipliers: Record<ItemRarity, number> = {
        'Common': 1,
        'Uncommon': 2,
        'Rare': 4,
        'Epic': 8,
        'Legendary': 16
      };
      
      // Get multiplier with fallback to 1
      const rarityMultiplier = rarityMultipliers[item.rarity as ItemRarity] || 1;
      
      // Level adjustment (higher level = higher prices)
      const levelAdjustment = 1 + (level / 20);
      
      // Calculate price
      const price = Math.round(item.value * rarityMultiplier * levelAdjustment);
      
      return {
        character_id: characterId,
        item_id: item.id,
        day: day,
        price: price
      };
    });
    
    // Insert new shop items
    const { data: newShopItems, error: insertError } = await supabase
      .from('shop_items')
      .insert(shopItems)
      .select('*, item:items(*)');
    
    if (insertError || !newShopItems) {
      console.error('Error inserting shop items:', insertError);
      return { success: false, error: 'Failed to generate shop items' };
    }
    
    return { success: true, data: newShopItems as ShopItem[] };
  } catch (err) {
    console.error('Error in generateShopItems:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Buy an item from the shop
export async function buyItem(shopItemId: string): Promise<ApiResponse<{ message: string; item: Item }>> {
  try {
    // Get character from cookie
    const characterResponse = await getCharacterFromCookie();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get shop item
    const { data: shopItem, error: shopItemError } = await supabase
      .from('shop_items')
      .select('*, item:items(*)')
      .eq('id', shopItemId)
      .eq('character_id', character.id)
      .single();
    
    if (shopItemError || !shopItem) {
      console.error('Error fetching shop item:', shopItemError);
      return { success: false, error: 'Item not found in shop' };
    }
    
    // Check if character has enough gold
    if (character.gold < shopItem.price) {
      return { success: false, error: 'Not enough gold' };
    }
    
    // Begin transaction
    // 1. Deduct gold from character
    const { error: updateGoldError } = await supabase
      .from('characters')
      .update({ gold: character.gold - shopItem.price })
      .eq('id', character.id);
    
    if (updateGoldError) {
      console.error('Error updating character gold:', updateGoldError);
      return { success: false, error: 'Failed to update character gold' };
    }
    
    // 2. Add item to character's inventory
    const { error: addItemError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: shopItem.item_id,
        quantity: 1,
        acquired_at: new Date().toISOString()
      });
    
    if (addItemError) {
      console.error('Error adding item to inventory:', addItemError);
      // Rollback gold deduction
      await supabase
        .from('characters')
        .update({ gold: character.gold })
        .eq('id', character.id);
      return { success: false, error: 'Failed to add item to inventory' };
    }
    
    // Revalidate paths to update UI
    revalidatePath('/shop');
    revalidatePath('/adventure');
    
    return { 
      success: true, 
      data: { 
        message: `Successfully purchased ${shopItem.item.name}`,
        item: shopItem.item as Item
      } 
    };
  } catch (err) {
    console.error('Error in buyItem:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Sell an item from inventory
export async function sellItem(inventoryItemId: string): Promise<ApiResponse<{ message: string; gold: number }>> {
  try {
    // Get character from cookie
    const characterResponse = await getCharacterFromCookie();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get inventory item and associated item details
    const { data: inventoryItem, error: inventoryItemError } = await supabase
      .from('character_inventory')
      .select('*, item:item_id(*)')
      .eq('id', inventoryItemId)
      .eq('character_id', character.id)
      .single();
    
    if (inventoryItemError || !inventoryItem) {
      console.error('Error fetching inventory item:', inventoryItemError);
      return { success: false, error: 'Item not found in inventory' };
    }
    
    // Check if item is equipped
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*')
      .eq('character_id', character.id)
      .single();
    
    if (!equipmentError && equipment) {
      const isEquipped = 
        equipment.weapon_id === inventoryItem.item_id ||
        equipment.helmet_id === inventoryItem.item_id ||
        equipment.armor_id === inventoryItem.item_id ||
        equipment.trinket_id === inventoryItem.item_id;
      
      if (isEquipped) {
        return { success: false, error: 'Cannot sell equipped item' };
      }
    }
    
    // Calculate sell price (50% of base value)
    const sellPrice = Math.round(inventoryItem.item.value * 0.5);
    
    // Begin transaction
    // 1. Add gold to character
    const { error: updateGoldError } = await supabase
      .from('characters')
      .update({ gold: character.gold + sellPrice })
      .eq('id', character.id);
    
    if (updateGoldError) {
      console.error('Error updating character gold:', updateGoldError);
      return { success: false, error: 'Failed to update character gold' };
    }
    
    // 2. Remove item from character's inventory
    const { error: removeItemError } = await supabase
      .from('character_inventory')
      .delete()
      .eq('id', inventoryItemId)
      .eq('character_id', character.id);
    
    if (removeItemError) {
      console.error('Error removing item from inventory:', removeItemError);
      // Rollback gold addition
      await supabase
        .from('characters')
        .update({ gold: character.gold })
        .eq('id', character.id);
      return { success: false, error: 'Failed to remove item from inventory' };
    }
    
    // Revalidate paths to update UI
    revalidatePath('/shop');
    revalidatePath('/adventure');
    
    return { 
      success: true, 
      data: { 
        message: `Successfully sold ${inventoryItem.item.name} for ${sellPrice} gold`,
        gold: sellPrice
      } 
    };
  } catch (err) {
    console.error('Error in sellItem:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get character inventory
export async function getInventory(): Promise<ApiResponse<any[]>> {
  try {
    // Get character from cookie
    const characterResponse = await getCharacterFromCookie();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get character items
    const { data: inventoryItems, error } = await supabase
      .from('character_inventory')
      .select('*, item:item_id(*)')
      .eq('character_id', character.id);
    
    if (error) {
      console.error('Error fetching inventory items:', error);
      return { success: false, error: 'Failed to fetch inventory' };
    }
    
    return { success: true, data: inventoryItems || [] };
  } catch (err) {
    console.error('Error in getInventory:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
