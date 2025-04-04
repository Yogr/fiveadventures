'use server';

import { supabase } from '@/lib/supabase';
import { MAX_SHOP_ITEMS } from '@/lib/constants';
import type { Item, ItemRarity, ApiResponse } from '@/lib/types';
import { getCharacterFromCookie } from './character';
import { revalidatePath } from 'next/cache';
import { getCurrentGameDay, generateShopSeed, getRandomShopItems, generateId } from '@/lib/utils';
import itemsData from '../../../data/items.json';
import { unstable_cache } from 'next/cache';

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
    return selectedItems.map((item: any) => {
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
      
      // Create a shop item
      return {
        id: generateId(), // Generate a unique ID for the shop item
        item: item,
        price: price
      };
    });
  },
  ['shop-items'],
  { revalidate: 86400 } // Cache for 24 hours (in seconds)
);

// Get shop items for the current day
export async function getShopItems(): Promise<ApiResponse<ShopItemSimple[]>> {
  try {
    const currentDay = getCurrentGameDay();
    
    // Get the cached shop items for the current day
    const shopItems = await getShopItemsCached(currentDay);
    
    return { 
      success: true, 
      data: shopItems
    };
  } catch (err) {
    console.error('Error in getShopItems:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Buy an item from the shop
export async function buyItem(itemId: string): Promise<ApiResponse<{ message: string; item: Item }>> {
  try {
    // Get character from cookie
    const characterResponse = await getCharacterFromCookie();
    if (!characterResponse.success || !characterResponse.data) {
      return { success: false, error: 'Character not found' };
    }
    
    const character = characterResponse.data;
    
    // Get current shop items
    const shopItemsResponse = await getShopItems();
    if (!shopItemsResponse.success || !shopItemsResponse.data) {
      return { success: false, error: 'Failed to get shop items' };
    }
    
    // Find the item in the shop
    const shopItem = shopItemsResponse.data.find(item => item.id === itemId);
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
    
    // 2. Add item to character's inventory
    const { error: addItemError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: shopItem.item.id || 0,
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
