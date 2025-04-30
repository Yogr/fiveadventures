'use server';

import type { ApiResponse, Character, CharacterDungeon, Area } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Process dungeon key parts for a character after defeating an elite monster
 * There's a 50% chance to get 0.5 dungeon key parts when defeating an elite enemy
 * If the total dungeon_key_parts would be >= 1, increment dungeon_keys and set dungeon_key_parts to the remainder
 */
export async function processDungeonKeyParts(
  characterId: string,
  isEliteMonster: boolean,
  combatLog: any[]
): Promise<ApiResponse<{
  dungeonKeyPartsAdded: number;
  newDungeonKeyParts: number;
  dungeonKeysAdded: number;
  newDungeonKeys: number;
}>> {
  if (!isEliteMonster) {
    return {
      success: true,
      data: {
        dungeonKeyPartsAdded: 0,
        newDungeonKeyParts: 0,
        dungeonKeysAdded: 0,
        newDungeonKeys: 0
      }
    };
  }

  try {
    const supabase = await createClient();
    
    // Get the character's current dungeon key parts
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('dungeon_keys, dungeon_key_parts')
      .eq('id', characterId)
      .single();
    
    if (characterError) {
      console.error('Error getting character for dungeon key parts:', characterError);
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }

    // Determine if the character gets dungeon key parts (50% chance)
    const roll = Math.random();
    if (roll > 0.5) {
      // No dungeon key parts this time
      combatLog.push('No dungeon key parts found.');
      return {
        success: true,
        data: {
          dungeonKeyPartsAdded: 0,
          newDungeonKeyParts: character.dungeon_key_parts,
          dungeonKeysAdded: 0,
          newDungeonKeys: character.dungeon_keys
        }
      };
    }

    // Character gets 0.5 dungeon key parts
    const dungeonKeyPartsAdded = 0.5;
    let newDungeonKeyParts = character.dungeon_key_parts + dungeonKeyPartsAdded;
    let dungeonKeysAdded = 0;
    let newDungeonKeys = character.dungeon_keys;

    // Check if total dungeon key parts is >= 1
    if (newDungeonKeyParts >= 1) {
      // Convert 1 dungeon key part to 1 dungeon key
      dungeonKeysAdded = 1;
      newDungeonKeys = character.dungeon_keys + dungeonKeysAdded;
      newDungeonKeyParts -= 1;
      
      combatLog.push(`Found 0.5 dungeon key parts! You now have 1 more dungeon key and ${newDungeonKeyParts.toFixed(1)} dungeon key parts.`);
    } else {
      combatLog.push(`Found 0.5 dungeon key parts! You now have ${newDungeonKeyParts.toFixed(1)} dungeon key parts.`);
    }

    // Update the character's dungeon keys and parts
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        dungeon_keys: newDungeonKeys,
        dungeon_key_parts: newDungeonKeyParts
      })
      .eq('id', characterId);

    if (updateError) {
      console.error('Error updating character dungeon keys:', updateError);
      return {
        success: false,
        error: 'Failed to update dungeon keys'
      };
    }

    return {
      success: true,
      data: {
        dungeonKeyPartsAdded,
        newDungeonKeyParts,
        dungeonKeysAdded,
        newDungeonKeys
      }
    };
  } catch (err) {
    console.error('Unexpected error processing dungeon key parts:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Get available dungeons for a character
 */
export async function getAvailableDungeons(
  characterId: string
): Promise<ApiResponse<Area[]>> {
  try {
    const supabase = await createClient();
    
    // Get the character's current dungeon keys
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('dungeon_keys')
      .eq('id', characterId)
      .single();
    
    if (characterError) {
      console.error('Error getting character for available dungeons:', characterError);
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }

    // Get dungeons that the character has enough keys for
    const { data: dungeons, error: dungeonsError } = await supabase
      .from('areas')
      .select('*')
      .eq('is_dungeon', true)
      .lte('dungeon_keys_required', character.dungeon_keys);
    
    if (dungeonsError) {
      console.error('Error getting available dungeons:', dungeonsError);
      return {
        success: false,
        error: 'Failed to get available dungeons'
      };
    }

    return {
      success: true,
      data: dungeons
    };
  } catch (err) {
    console.error('Unexpected error getting available dungeons:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Enter a dungeon and consume a key
 */
export async function enterDungeon(
  characterId: string,
  areaId: number
): Promise<ApiResponse<CharacterDungeon>> {
  try {
    const supabase = await createClient();
    
    // Get the area to check if it's a dungeon and how many keys it requires
    const { data: area, error: areaError } = await supabase
      .from('areas')
      .select('*')
      .eq('id', areaId)
      .single();
    
    if (areaError || !area) {
      console.error('Error getting dungeon area:', areaError);
      return {
        success: false,
        error: 'Failed to get dungeon area'
      };
    }

    if (!area.is_dungeon) {
      return {
        success: false,
        error: 'Area is not a dungeon'
      };
    }

    // Get the character's current dungeon keys
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('dungeon_keys')
      .eq('id', characterId)
      .single();
    
    if (characterError) {
      console.error('Error getting character for dungeon entry:', characterError);
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }

    if (character.dungeon_keys < area.dungeon_keys_required) {
      return {
        success: false,
        error: 'Not enough dungeon keys'
      };
    }

    // Consume the required dungeon keys
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        dungeon_keys: character.dungeon_keys - area.dungeon_keys_required
      })
      .eq('id', characterId);

    if (updateError) {
      console.error('Error consuming dungeon keys:', updateError);
      return {
        success: false,
        error: 'Failed to consume dungeon keys'
      };
    }

    // Create or update the character_dungeons entry
    const { data: existingDungeon, error: checkError } = await supabase
      .from('character_dungeons')
      .select('*')
      .eq('character_id', characterId)
      .eq('area_id', areaId)
      .maybeSingle();

    let dungeonData;

    if (existingDungeon) {
      // Update the existing dungeon entry
      const { data: updatedDungeon, error: updateDungeonError } = await supabase
        .from('character_dungeons')
        .update({
          current_state: 'started',
          current_adventure_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDungeon.id)
        .select('*, area:area_id(*)')
        .single();

      if (updateDungeonError) {
        console.error('Error updating dungeon entry:', updateDungeonError);
        return {
          success: false,
          error: 'Failed to update dungeon entry'
        };
      }

      dungeonData = updatedDungeon;
    } else {
      // Create a new dungeon entry
      const { data: newDungeon, error: createError } = await supabase
        .from('character_dungeons')
        .insert({
          character_id: characterId,
          area_id: areaId,
          current_state: 'started',
          current_adventure_count: 0
        })
        .select('*, area:area_id(*)')
        .single();

      if (createError) {
        console.error('Error creating dungeon entry:', createError);
        return {
          success: false,
          error: 'Failed to create dungeon entry'
        };
      }

      dungeonData = newDungeon;
    }

    return {
      success: true,
      data: dungeonData as CharacterDungeon
    };
  } catch (err) {
    console.error('Unexpected error entering dungeon:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Exit a dungeon
 */
export async function exitDungeon(
  characterId: string,
  areaId: number
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    
    // Update the character_dungeons entry
    const { error: updateError } = await supabase
      .from('character_dungeons')
      .update({
        current_state: 'exited',
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId)
      .eq('area_id', areaId);

    if (updateError) {
      console.error('Error exiting dungeon:', updateError);
      return {
        success: false,
        error: 'Failed to exit dungeon'
      };
    }

    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error exiting dungeon:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
