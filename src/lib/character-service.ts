'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  getCachedItemById
} from '@/lib/game-data-service';
import type { ApiResponse, Character, CharacterEquipment } from '@/lib/types';
import { getCurrentGameDay } from '@/lib/utils';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets a character by ID with fully populated equipment data
 * This uses the cached item functions to efficiently load equipment
 */
export async function getFullCharacterById(characterId: string, supabase?: SupabaseClient): Promise<ApiResponse<Character>> {
  try {
    if (!supabase) {
      supabase = await createClient();
    }

    // Get character data
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();
    
    if (error || !character) {
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    // Get character equipment IDs
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*')
      .eq('character_id', characterId)
      .single();
    
    if (equipmentError && equipmentError.code !== 'PGRST116') {
      console.error('Error getting character equipment:', equipmentError);
    }

    console.log('Character equipment:', equipment);
    
    // Get character inventory
    let inventory: Array<{
      id: string;
      character_id: string;
      item_id: number;
      quantity: number;
    }> = [];
    try {
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('character_inventory')
        .select(`
          id,
          character_id,
          item_id,
          quantity
        `)
        .eq('character_id', characterId);
      
      if (inventoryError) {
        console.error('Error getting character inventory:', inventoryError);
      } else {
        inventory = inventoryData || [];
      }
    } catch (inventoryErr) {
      console.error('Exception getting character inventory:', inventoryErr);
      // Continue without inventory if there's an error
      inventory = [];
    }
    
    // Check if we need to reset daily adventure count
    const currentDay = getCurrentGameDay();
    if (character.last_played_day < currentDay) {
      // Reset daily values
      const { error: updateError } = await supabase
        .from('characters')
        .update({
          daily_adventure_count: 0,
          current_hitpoints: character.max_hitpoints,
          current_energy: character.max_energy,
          last_played_day: currentDay,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);
      
      if (updateError) {
        console.error('Error resetting daily values:', updateError);
        // Continue anyway, not critical
      }
      
      // Update local character object
      character.daily_adventure_count = 0;
      character.current_hitpoints = character.max_hitpoints;
      character.current_energy = character.max_energy;
      character.last_played_day = currentDay;
    }
    
    // Fetch equipment items using cached functions
    const equipmentData: CharacterEquipment = equipment || {
      id: '',
      character_id: characterId,
      weapon_id: null,
      helmet_id: null,
      armor_id: null,
      trinket_id: null
    };
    
    // Initialize with null values
    let weaponItem = null;
    let helmetItem = null;
    let armorItem = null;
    let trinketItem = null;
    
    // Parallel fetch of equipment items
    const equipmentPromises = [];
    
    if (equipmentData.weapon_id) {
      equipmentPromises.push(
        getCachedItemById(equipmentData.weapon_id, supabase)
          .then(result => {
            if (result.success) {
              weaponItem = result.data;
            } else {
              console.error('Failed to fetch weapon data:', result.error);
            }
          })
          .catch(err => {
            console.error('Exception fetching weapon data:', err);
          })
      );
    }
    
    if (equipmentData.helmet_id) {
      equipmentPromises.push(
        getCachedItemById(equipmentData.helmet_id, supabase)
          .then(result => {
            if (result.success) {
              helmetItem = result.data;
            }
          })
      );
    }
    
    if (equipmentData.armor_id) {
      equipmentPromises.push(
        getCachedItemById(equipmentData.armor_id, supabase)
          .then(result => {
            if (result.success) {
              armorItem = result.data;
            }
          })
      );
    }
    
    if (equipmentData.trinket_id) {
      equipmentPromises.push(
        getCachedItemById(equipmentData.trinket_id, supabase)
          .then(result => {
            if (result.success) {
              trinketItem = result.data;
            }
          })
      );
    }
    
    // Wait for all equipment items to be fetched
    await Promise.all(equipmentPromises);

    console.log('Fetched equipment items:', {
      weaponItem,
      helmetItem,
      armorItem,
      trinketItem
    });
    
    // Create full equipment object
    const fullEquipment: CharacterEquipment = {
      ...equipmentData,
      weapon: weaponItem,
      helmet: helmetItem,
      armor: armorItem,
      trinket: trinketItem
    };
    
    // Fetch item data for inventory items
    const inventoryItems: Array<{
      id: string;
      character_id: string;
      item_id: number;
      quantity: number;
      item: any; // Using any for the item since its structure can vary
    }> = [];
    
    if (inventory && inventory.length > 0) {
      const inventoryPromises = inventory.map(async (invItem) => {
        // Important: Pass the supabase client to the cached function
        const itemResult = await getCachedItemById(invItem.item_id, supabase);
        return {
          ...invItem,
          item: itemResult.success ? itemResult.data : null
        };
      });
      
      const resolvedInventory = await Promise.all(inventoryPromises);
      inventoryItems.push(...resolvedInventory);
    }
    
    // Return complete character data
    return {
      success: true,
      data: {
        ...character,
        equipment: fullEquipment,
        inventory: inventoryItems
      }
    };
  } catch (err) {
    console.error('Unexpected error getting character with equipment:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
