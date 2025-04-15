'use server';

import { MAX_SHOP_ITEMS } from '@/lib/constants';
import type { Item, ItemRarity, ApiResponse } from '@/lib/types';
import { getCharacterForUser } from './character';
import { revalidatePath } from 'next/cache';
import { getCurrentGameDay, generateShopSeed, getRandomShopItems, generateId } from '@/lib/utils';
import itemsData from '../../../data/items.json';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Define a custom shop item type that doesn't rely on the database schema
export type ShopItemSimple = {
  id: string;
  item: Item;
  price: number;
};

// Cache the shop items for 24 hours
const getShopItemsCached = unstable_cache(
  async (day: number): Promise<ShopItemSimple[]> => {
    // Generate a seed for the day that is the same for all users
    const seed = generateShopSeed(day);
    
    // Get random items from the items data using the seed
    const selectedItems = getRandomShopItems(itemsData, MAX_SHOP_ITEMS, seed);
    
    // Calculate prices based on item rarity
    return selectedItems.map((item: any, index: number) => {
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
      
      // Calculate price based on item value and rarity
      const price = Math.round(item.value * rarityMultiplier);
      
      // Assign an ID to the item based on its index in the array
      // Add 1000 to avoid conflicts with existing items
      const itemWithId = {
        ...item,
        id: index + 1000
      };
      
      // Create a shop item
      return {
        id: generateId(), // Generate a unique ID for the shop item
        item: itemWithId,
        price: price
      };
    });
  },
  ['shop-items'],
  { revalidate: 86400 } // Cache for 24 hours (in seconds)
);

// Get shop items for the current day
export async function getShopItems(): Promise<ShopItemSimple[]> {
  try {
    const currentDay = getCurrentGameDay();
    
    // Get the cached shop items for the current day
    const shopItems = await getShopItemsCached(currentDay);
    
    return shopItems
  } catch (err) {
    console.error('Error in getShopItems:', err);
    return [];
  }
}

// Buy an item from the shop
export async function buyItem(itemId: string): Promise<ApiResponse<{ message: string; item: Item }>> {
  try {
    const supabase = await createClient();

    // Get character from cookie
    const characterResponse = await getCharacterForUser();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get current shop items
    const shopItems = await getShopItems();

    // Find the item in the shop
    const shopItem = shopItems.find(item => item.id === itemId);
    if (!shopItem) {
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
    
    // Log detailed information about the item being purchased
    console.log('Attempting to purchase item:', {
      shopItemId: itemId,
      itemDetails: shopItem.item,
      itemId: shopItem.item.id,
      characterId: character.id,
      price: shopItem.price,
      characterGold: character.gold
    });
    
    // First, check if the item exists in the items table
    const { data: itemExists, error: itemCheckError } = await supabase
      .from('items')
      .select('id')
      .eq('id', shopItem.item.id)
      .maybeSingle();
    
    if (itemCheckError) {
      console.error('Error checking if item exists:', itemCheckError);
      // Rollback gold deduction
      const { error: rollbackError } = await supabase
        .from('characters')
        .update({ gold: character.gold })
        .eq('id', character.id);
        
      if (rollbackError) {
        console.error('Error rolling back gold deduction:', rollbackError);
      } else {
        console.log('Successfully rolled back gold deduction');
      }
      
      return { success: false, error: 'Failed to check if item exists in database' };
    }
    
    // If the item doesn't exist in the database, we need to create it first
    if (!itemExists) {
      console.log('Item does not exist in database, creating it first:', shopItem.item);
      
      const { data: createdItem, error: createItemError } = await supabase
        .from('items')
        .insert({
          id: shopItem.item.id,
          name: shopItem.item.name,
          type: shopItem.item.type,
          rarity: shopItem.item.rarity,
          weapon_type: shopItem.item.weapon_type || null,
          base_damage: shopItem.item.base_damage || null,
          base_defense: shopItem.item.base_defense || null,
          effects: shopItem.item.effects || null,
          value: shopItem.item.value,
          image_url: shopItem.item.image_url || null,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (createItemError) {
        console.error('Error creating item in database:', createItemError);
        // Rollback gold deduction
        const { error: rollbackError } = await supabase
          .from('characters')
          .update({ gold: character.gold })
          .eq('id', character.id);
          
        if (rollbackError) {
          console.error('Error rolling back gold deduction:', rollbackError);
        } else {
          console.log('Successfully rolled back gold deduction');
        }
        
        return { success: false, error: 'Failed to create item in database' };
      }
      
      console.log('Successfully created item in database:', createdItem);
    }
    
    // 2. Add item to character's inventory
    const { data: insertData, error: addItemError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: shopItem.item.id,
        quantity: 1,
        acquired_at: new Date().toISOString()
      })
      .select();
    
    if (addItemError) {
      console.error('Error adding item to inventory:', addItemError);
      console.error('Error details:', {
        code: addItemError.code,
        message: addItemError.message,
        details: addItemError.details,
        hint: addItemError.hint
      });
      
      // Rollback gold deduction
      const { error: rollbackError } = await supabase
        .from('characters')
        .update({ gold: character.gold })
        .eq('id', character.id);
        
      if (rollbackError) {
        console.error('Error rolling back gold deduction:', rollbackError);
      } else {
        console.log('Successfully rolled back gold deduction');
      }
      
      return { success: false, error: `Failed to add item to inventory: ${addItemError.message}` };
    }
    
    console.log('Successfully added item to inventory:', insertData);
    
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
    const supabase = await createClient();

    // Get character from cookie
    const characterResponse = await getCharacterForUser();
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
    const supabase = await createClient();

    // Get character from cookie
    const characterResponse = await getCharacterForUser();
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
