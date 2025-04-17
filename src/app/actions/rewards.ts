'use server';

import { createClient } from '@/lib/supabase/server';
import type { RewardItem, Item, ApiResponse } from '@/lib/types';

/**
 * Get a random reward item from a reward table
 * @param rewardTableId The ID of the reward table to draw from
 * @returns The selected reward item or null if no item is selected
 */
export async function getRewardForTable(rewardTableId: number): Promise<ApiResponse<RewardItem | null>> {
  console.log(`getRewardForTable called with rewardTableId: ${rewardTableId}`);
  
  try {
    const supabase = await createClient();
    
    // Fetch all possible items from the reward table
    console.log(`Querying reward_items table for reward_table_id: ${rewardTableId}`);
    const { data: rewardItems, error: rewardItemsError } = await supabase
      .from('reward_items')
      .select(`
        *,
        item:items(*)
      `)
      .eq('reward_table_id', rewardTableId);
    
    if (rewardItemsError) {
      console.error('Error fetching reward items:', rewardItemsError);
      return {
        success: false,
        error: `Failed to fetch reward items: ${rewardItemsError.message}`
      };
    }
    
    if (!rewardItems || rewardItems.length === 0) {
      console.log(`No reward items found for table ID ${rewardTableId}`);
      return {
        success: true,
        data: null
      };
    }
    
    console.log(`Found ${rewardItems.length} reward items for table ID ${rewardTableId}:`,
      rewardItems.map(item => ({
        id: item.id,
        itemId: item.item_id,
        itemName: item.item?.name,
        chance: item.chance
      }))
    );
    
    // Roll a random number between 0-100
    const roll = Math.floor(Math.random() * 101);
    console.log(`Rolled ${roll} for reward table ${rewardTableId}`);
    
    // Calculate cumulative chance and select an item
    let cumulativeChance = 0;
    
    for (const rewardItem of rewardItems) {
      cumulativeChance += rewardItem.chance;
      
      if (roll <= cumulativeChance) {
        console.log(`Selected item ${rewardItem.item.name} with chance ${rewardItem.chance} (cumulative: ${cumulativeChance})`);
        return {
          success: true,
          data: rewardItem as RewardItem
        };
      }
    }
    
    // If we get here, no item was selected
    console.log(`No item selected from table ${rewardTableId} (roll: ${roll}, total chance: ${cumulativeChance})`);
    return {
      success: true,
      data: null
    };
  } catch (error) {
    console.error('Error in getRewardForTable:', error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error}`
    };
  }
}

/**
 * Add an item to a character's inventory
 * @param characterId The ID of the character
 * @param itemId The ID of the item to add
 * @returns Success status and error message if applicable
 */
export async function addItemToInventory(characterId: string, itemId: number): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    // Add the item to the character's inventory
    const { error } = await supabase
      .from('character_inventory')
      .insert({
        character_id: characterId,
        item_id: itemId,
        equipped: false
      });
    
    if (error) {
      console.error('Error adding item to inventory:', error);
      return {
        success: false,
        error: `Failed to add item to inventory: ${error.message}`
      };
    }
    
    return {
      success: true,
      data: true
    };
  } catch (error) {
    console.error('Error in addItemToInventory:', error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error}`
    };
  }
}