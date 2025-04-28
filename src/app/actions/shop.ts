'use server';

import { MAX_SHOP_ITEMS } from '@/lib/constants';
import type { Item, ItemRarity, ApiResponse } from '@/lib/types';
import { getCharacterForUser } from './character';
import { revalidatePath } from 'next/cache';
import { getCurrentGameDay, generateShopSeed } from '@/lib/utils';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server-admin';

// Define a custom shop item type that doesn't rely on the database schema
export type ShopItemSimple = {
  id: string;
  item: Item;
  price: number;
};

// Get shop items from the database based on shop_id
// This function uses an admin client without cookies, so it can be cached
const fetchShopItemsFromDB = async (shopId: number) => {
  console.log(`[SHOP DEBUG] fetchShopItemsFromDB - Starting for shop_id: ${shopId}`);
  
  // Use the admin client that doesn't rely on cookies
  const supabase = createAdminClient();
  console.log(`[SHOP DEBUG] fetchShopItemsFromDB - Created admin client`);
  
  try {
    // Get all items for this shop from the shop_items table
    console.log(`[SHOP DEBUG] Querying shop_items table: shop_id=${shopId}`);
    const { data: shopItems, error } = await supabase
      .from('shop_items')
      .select('*, item:item_id(*)')
      .eq('shop_id', shopId);
    
    if (error) {
      console.error('[SHOP DEBUG] Error fetching shop items:', error);
      return [];
    }
    
    console.log(`[SHOP DEBUG] fetchShopItemsFromDB - Found ${shopItems?.length || 0} items for shop_id ${shopId}`);
    
    // Log the first few items for debugging
    if (shopItems && shopItems.length > 0) {
      console.log(`[SHOP DEBUG] Sample items:`, 
        shopItems.slice(0, 2).map(item => ({
          id: item.id,
          shop_id: item.shop_id,
          item_id: item.item_id,
          item_name: item.item?.name || 'NULL',
          chance: item.chance
        }))
      );
    } else {
      console.log('[SHOP DEBUG] No items found - the shop_items table may be empty');
      
      // Let's do a raw count to confirm
      const { count, error: countError } = await supabase
        .from('shop_items')
        .select('*', { count: 'exact', head: true });
        
      console.log(`[SHOP DEBUG] Total shop_items count: ${count}, Error: ${countError ? countError.message : 'None'}`);
    }
    
    return shopItems || [];
  } catch (err) {
    console.error('[SHOP DEBUG] Exception in fetchShopItemsFromDB:', err);
    return [];
  }
};

// Select random items based on chance values
const selectRandomItems = (shopItems: any[], count: number, seed: number): any[] => {
  if (!shopItems || shopItems.length === 0) return [];
  
  // Create a seeded random number generator
  const seededRandom = () => {
    // Simple LCG (Linear Congruential Generator)
    seed = (seed * 1664525 + 1013904223) % 2147483648;
    return seed / 2147483648; // Normalize to [0, 1)
  };
  
  // Calculate total chance sum
  const totalChance = shopItems.reduce((sum, item) => sum + (item.chance || 1), 0);
  
  // Create chance windows (cumulative)
  let cumulativeChance = 0;
  const itemWindows = shopItems.map(item => {
    const itemChance = item.chance || 1;
    const start = cumulativeChance;
    cumulativeChance += itemChance;
    return {
      item,
      start,
      end: cumulativeChance
    };
  });
  
  // Select items without repetition
  const selectedItems = [];
  const usedIndexes = new Set();
  
  // Try to select 'count' unique items
  for (let i = 0; i < count && usedIndexes.size < shopItems.length; i++) {
    // Generate a random value between 0 and totalChance
    const randomValue = seededRandom() * totalChance;
    
    // Find which item window the random value falls into
    let selectedIndex = -1;
    for (let j = 0; j < itemWindows.length; j++) {
      const chanceWindow = itemWindows[j];
      // Check if chanceWindow exists and if it matches our criteria
      if (chanceWindow && randomValue >= chanceWindow.start && randomValue < chanceWindow.end && !usedIndexes.has(j)) {
        selectedIndex = j;
        break;
      }
    }
    
    // If no unused item was found, try again with a different random value
    if (selectedIndex === -1) {
      // Find first unused item
      for (let j = 0; j < itemWindows.length; j++) {
        if (!usedIndexes.has(j)) {
          selectedIndex = j;
          break;
        }
      }
    }
    
    // Add the selected item
    if (selectedIndex !== -1) {
      usedIndexes.add(selectedIndex);
      selectedItems.push(shopItems[selectedIndex]);
    }
  }
  
  return selectedItems;
};

// Cache the shop items for 24 hours
const getShopItemsCached = unstable_cache(
  async (shopId: number, day: number): Promise<ShopItemSimple[]> => {
    console.log(`[SHOP DEBUG] getShopItemsCached - Starting for shop_id: ${shopId}, day: ${day}`);
    
    try {
      // Fetch all items for this shop from the database
      console.log(`[SHOP DEBUG] Calling fetchShopItemsFromDB for shop_id: ${shopId}`);
      const allShopItems = await fetchShopItemsFromDB(shopId);
      
      if (!allShopItems || allShopItems.length === 0) {
        console.error(`[SHOP DEBUG] No items found for shop ID ${shopId}`);
        return [];
      }
      
      console.log(`[SHOP DEBUG] Successfully found ${allShopItems.length} items for shop_id: ${shopId}`);
      
      // Generate a seed for the day that is the same for all users but unique per shop
      const seed = generateShopSeed(day) * (shopId + 1);
      console.log(`[SHOP DEBUG] Generated seed: ${seed} for day: ${day}, shop_id: ${shopId}`);
      
      // Select random items based on chance values
      console.log(`[SHOP DEBUG] Calling selectRandomItems with ${allShopItems.length} items, max: ${MAX_SHOP_ITEMS}`);
      const selectedItems = selectRandomItems(allShopItems, MAX_SHOP_ITEMS, seed);
      console.log(`[SHOP DEBUG] Selected ${selectedItems.length} items`);
      
      // Format the selected items
      console.log(`[SHOP DEBUG] Formatting selected items`);
      return selectedItems.map((shopItem: any) => {
        // Calculate price based on item rarity
        // Base price multiplier based on rarity
        const rarityMultipliers: Record<ItemRarity, number> = {
          'Common': 1,
          'Uncommon': 2,
          'Rare': 4,
          'Epic': 8,
          'Legendary': 16
        };
        
        // Get multiplier with fallback to 1
        const rarityMultiplier = rarityMultipliers[shopItem.item.rarity as ItemRarity] || 1;
        
        // Calculate price based on item value and rarity
        const price = Math.round(shopItem.item.value * rarityMultiplier);
        
        // Return formatted shop item
        return {
          id: shopItem.id.toString(), // Ensure ID is a string
          item: shopItem.item,
          price: price
        };
      });
    } catch (err) {
      console.error('Error in getShopItemsCached:', err);
      return [];
    }
  },
  ['shop-items'],
  { revalidate: 86400 } // Cache for 24 hours (in seconds)
);

// Get shop items for the current day
export async function getShopItems(shopId: number = 1): Promise<ShopItemSimple[]> {
  try {
    const currentDay = getCurrentGameDay();
    
    // Get the cached shop items for the current day and specified shop
    const shopItems = await getShopItemsCached(shopId, currentDay);
    
    return shopItems;
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
    
    // Get shop item directly from database
    const { data: shopItem, error: shopItemError } = await supabase
      .from('shop_items')
      .select('*, item:item_id(*)')
      .eq('id', itemId)
      .single();
    
    if (shopItemError || !shopItem) {
      console.error('Error fetching shop item:', shopItemError);
      return { success: false, error: 'Item not found in shop' };
    }
    
    // Calculate price based on item rarity
    const rarityMultipliers: Record<ItemRarity, number> = {
      'Common': 1,
      'Uncommon': 2,
      'Rare': 4,
      'Epic': 8,
      'Legendary': 16
    };
    
    const rarityMultiplier = rarityMultipliers[shopItem.item.rarity as ItemRarity] || 1;
    const price = Math.round(shopItem.item.value * rarityMultiplier);
    
    // Check if character has enough gold
    if (character.gold < price) {
      return { success: false, error: 'Not enough gold' };
    }
    
    // Begin transaction
    // 1. Deduct gold from character
    const { error: updateGoldError } = await supabase
      .from('characters')
      .update({ gold: character.gold - price })
      .eq('id', character.id);
    
    if (updateGoldError) {
      console.error('Error updating character gold:', updateGoldError);
      return { success: false, error: 'Failed to update character gold' };
    }
    
    // 2. Add item to character's inventory
    const { data: insertData, error: addItemError } = await supabase
      .from('character_inventory')
      .insert({
        character_id: character.id,
        item_id: shopItem.item_id,
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
    
    // Don't revalidate the entire path as it causes a page refresh
    // Instead, we'll handle state updates on the client side
    
    return { 
      success: true, 
      data: { 
        message: `Successfully purchased ${shopItem.item.name}`,
        item: shopItem.item
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
    
    // Don't revalidate the entire path as it causes a page refresh
    // Instead, we'll handle state updates on the client side
    
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
