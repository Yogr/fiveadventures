'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  CLASS_BASE_STATS, 
  generateId, 
  getCurrentGameDay 
} from '@/lib/utils';
import type { CharacterClass, ApiResponse, Character, CharacterEquipment } from '@/lib/types';
import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';
import { ensureUserRecordExists } from '@/app/actions/auth';

// Helper function to get default weapon based on character class
function getDefaultWeapon(characterClass: CharacterClass): number {
  switch (characterClass) {
    case 'Warrior':
      return 1;
    case 'Thief':
      return 2;
    case 'Cleric':
      return 5;
    case 'Ranger':
      return 3;
    case 'Wizard':
      return 7;
    default:
      return 1; // Default fallback
  }
}

// Set character ID cookie (server action)
export async function setCharacterIdCookie(characterId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.CHARACTER_ID, characterId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    sameSite: 'strict'
  });
}

// Create a new character
export async function createCharacter({
  name,
  characterClass,
  userId,
}: {
  name: string;
  characterClass: CharacterClass;
  userId?: string;
}): Promise<ApiResponse<{ characterId: string }>> {
  try {
    const supabase = await createClient();

    // Check if name is already taken
    const { data: existingCharacter, error: checkError } = await supabase
      .from('characters')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking character name:', checkError);
      return {
        success: false,
        error: 'Failed to check character name'
      };
    }
    
    if (existingCharacter) {
      return {
        success: false,
        error: 'Character name already taken. Please choose a different name.'
      };
    }
    
    const characterId = generateId();
    const currentDay = getCurrentGameDay();
    
    // Get base stats for the selected class
    const baseStats = CLASS_BASE_STATS[characterClass];

    const status = userId ? 'active' : 'unlinked';
    
    // Create character record
    const { error } = await supabase
      .from('characters')
      .insert({
        id: characterId,
        user_id: userId || null,
        name,
        class: characterClass,
        level: 1,
        experience: 0,
        gold: 100, // Starting gold
        strength: baseStats.strength,
        intelligence: baseStats.intelligence,
        agility: baseStats.agility,
        luck: baseStats.luck,
        wisdom: baseStats.wisdom,
        max_hitpoints: baseStats.hitpoints,
        current_hitpoints: baseStats.hitpoints,
        max_energy: baseStats.energy,
        current_energy: baseStats.energy,
        daily_adventure_count: 0,
        last_played_day: currentDay,
        status: status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creating character:', error);
      return { 
        success: false, 
        error: 'Failed to create character' 
      };
    }
    
    // Get default equipment based on character class
    // All characters get Leather Armor, plus a class-specific weapon
    const defaultEquipment = {
      armor: 11,
      weapon: getDefaultWeapon(characterClass)
    };

    // Create equipment record for the character with default items
    const { error: equipmentError } = await supabase
      .from('character_equipment')
      .insert({
        character_id: characterId,
        weapon_id: defaultEquipment.weapon,
        armor_id: defaultEquipment.armor,
        updated_at: new Date().toISOString()
      });
    
    if (equipmentError) {
      console.error('Error creating equipment record:', equipmentError);
      // Continue anyway, this isn't critical
    }
    
    // We'll return the character ID, and the calling code will use the setCharacterIdCookie
    // server action to set the cookie
    
    return {
      success: true,
      data: { characterId }
    };
  } catch (err) {
    console.error('Unexpected error creating character:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get character by ID
export async function getCharacterById(characterId: string): Promise<ApiResponse<Character>> {
  try {
    // Use the getFullCharacterById function from character-service
    // which includes populated equipment and inventory with cached item data
    const { data: { user } } = await (await createClient()).auth.getUser();
    
    // Get character with full equipment data
    const { success, data: character, error } = await import('@/lib/character-service')
      .then(module => module.getFullCharacterById(characterId));
    
    if (!success || !character) {
      return {
        success: false,
        error: error || 'Character not found'
      };
    }
    
    // If character has a linked user_id, check if the current user is authorized to access it
    if (character.user_id) {
      // If no authenticated user or user ID doesn't match, deny access
      if (!user?.id || user.id !== character.user_id) {
        return {
          success: false,
          error: 'Unauthorized access to character'
        };
      }
    }
    
    return {
      success: true,
      data: character
    };
  } catch (err) {
    console.error('Unexpected error getting character:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Link character to user account
export async function linkCharacterToUser(
  characterId: string,
  userId: string
): Promise<ApiResponse<null>> {
  try {
    console.log('linking character to user:', { characterId, userId });
    
    // Ensure the user record exists in our users table before attempting to link
    const userCreated = await ensureUserRecordExists(userId);
    if (!userCreated) {
      return {
        success: false,
        error: 'Failed to ensure user record exists'
      };
    }
    
    const supabase = await createClient();

    // Check if character exists and is unlinked
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .eq('status', 'unlinked')
      .single();
    
    if (characterError || !character) {
      return {
        success: false,
        error: 'Character not found or already linked to an account'
      };
    }
    
    // Link character to user
    const { error } = await supabase
      .from('characters')
      .update({
        user_id: userId,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId);
    
    if (error) {
      console.error('Error linking character to user:', error);
      return {
        success: false,
        error: 'Failed to link character to account'
      };
    }
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error linking character:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get character by user ID
export async function getCharacterByUserId(userId: string): Promise<ApiResponse<Character>> {
  try {
    const supabase = await createClient();

    // Get character data
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !character) {
      return {
        success: false,
        error: 'Character not found for this user'
      };
    }
    
    // Get full character data
    return getCharacterById(character.id);
  } catch (err) {
    console.error('Unexpected error getting character by user ID:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}


// Delete existing character for the current user
export async function deleteExistingCharacter(): Promise<ApiResponse<null>> {
  try {
    // First get the character
    const characterResponse = await getCharacterForUser();
    
    if (!characterResponse.success || !characterResponse.data) {
      return {
        success: false,
        error: 'No character found to delete'
      };
    }
    
    const characterId = characterResponse.data.id;
    console.log(`Deleting character with ID: ${characterId}`);
    
    const supabase = await createClient();
    
    // Ensure the stored procedures exist first
    await ensureDeleteProceduresExist();
    
    // Use the complete character delete procedure
    const { data: success, error } = await supabase.rpc('complete_character_delete', {
      character_id_param: characterId
    });
    
    if (error) {
      console.error('Error deleting character with stored procedure:', error);
      
      // Try the manual deletion as a fallback
      console.log('Attempting manual deletion as fallback...');
      
      // Define a helper function to safely delete from a table
      const safeDelete = async (tableName: string, field: string = 'character_id') => {
        try {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(field, characterId);
          
          if (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            return false;
          }
          console.log(`Successfully deleted from ${tableName}`);
          return true;
        } catch (err) {
          console.error(`Exception deleting from ${tableName}:`, err);
          return false;
        }
      };

      try {
        // First we need to get all combat IDs for this character
        console.log('Getting combat IDs for the character...');
        const { data: combatIds, error: combatError } = await supabase
          .from('combat')
          .select('id')
          .eq('character_id', characterId);
        
        if (combatError) {
          console.error('Error getting combat IDs:', combatError);
        } else if (combatIds && combatIds.length > 0) {
          // Delete combat_turns first - these reference combat.id, not character.id
          console.log(`Found ${combatIds.length} combat records, deleting related combat_turns...`);
          
          for (const combat of combatIds) {
            try {
              const { error: turnError } = await supabase
                .from('combat_turns')
                .delete()
                .eq('combat_id', combat.id);
              
              if (turnError) {
                console.error(`Error deleting combat_turns for combat ${combat.id}:`, turnError);
              } else {
                console.log(`Successfully deleted combat_turns for combat ${combat.id}`);
              }
            } catch (err) {
              console.error(`Exception deleting combat_turns for combat ${combat.id}:`, err);
            }
          }
        } else {
          console.log('No combat records found for this character');
        }
        
        // Delete in order, respecting foreign key constraints
        // Always delete child records before parent records
        
        // 1. Delete from tables with no dependencies
        await safeDelete('character_inventory');
        await safeDelete('character_skills');
        await safeDelete('boss_rewards');
        await safeDelete('character_selected_area');
        
        // 2. Delete from tables that might have dependencies (now that combat_turns are gone)
        await safeDelete('combat');
        await safeDelete('character_boss_progress');
        
        // 3. Delete from tables that depend on level 2
        await safeDelete('character_adventures');
        await safeDelete('character_equipment');
      } catch (err) {
        console.error('Error during manual deletion process:', err);
      }
      
      // Finally, delete the character record
      const { error: finalError } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);
      
      if (finalError) {
        console.error('Error deleting character through manual process:', finalError);
        return {
          success: false,
          error: 'Failed to delete character: ' + finalError.message
        };
      }
    }
    
    // Clear character ID cookie
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.CHARACTER_ID);
    
    console.log('Character successfully deleted');
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error deleting character:', err);
    return {
      success: false,
      error: 'An unexpected error occurred: ' + (err instanceof Error ? err.message : String(err))
    };
  }
}

// Create a stored procedure to handle the force delete if it doesn't exist
export async function ensureDeleteProceduresExist(): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();
    
    // Check if the procedure already exists
    const { error: checkError } = await supabase.rpc('procedure_exists', {
      procedure_name: 'force_delete_character_combat'
    });
    
    if (checkError) {
      // Procedure doesn't exist, create it
      const { error } = await supabase.rpc('create_force_delete_procedures');
      
      if (error) {
        console.error('Error creating delete procedures:', error);
        return {
          success: false,
          error: 'Failed to create delete procedures'
        };
      }
    }
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Error ensuring delete procedures exist:', err);
    return {
      success: false,
      error: 'Failed to ensure delete procedures exist'
    };
  }
}

// Get character from cookie or auth session
export async function getCharacterForUser(): Promise<ApiResponse<Character>> {
  try {
    console.log('getCharacterForUser: Checking for character in cookie or auth session');
    // First check if user is authenticated
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user?.id;
    
    
    console.log('getCharacterForUser: User ID:', userId);
    if (userId && userId != 'Cookie') {
      // User is authenticated
      // Try to get character by user ID
      const userCharacterResponse = await getCharacterByUserId(userId);
      
      console.log('getCharacterForUser: User character response:', userCharacterResponse);
      if (userCharacterResponse.success) {
        
        // User has a character, return it
        return userCharacterResponse;
      }

      // Fetch character from cookies
      const cookieStore = await cookies();
      const characterId = cookieStore.get(COOKIE_NAMES.CHARACTER_ID)?.value;

      console.log('getCharacterForUser: No user character, is signed in, and has Cookie character ID:', characterId);
      
      // If authenticated user doesn't have a character but has a cookie,
      // check if the cookie character needs to be linked
      if (characterId) {
        const characterResponse = await getCharacterById(characterId);
        console.log('getCharacterForUser: Cookie character response:', characterResponse);
        if (characterResponse.success && characterResponse.data) {
          const character = characterResponse.data;
          
      console.log('status for character:', character.status);
      // If character is unlinked, ensure user record exists and link it to the user
      if (character.status === 'unlinked') {
        console.log(`Linking unlinked character ${characterId} to user ${userId}`);
        
        // Ensure user record exists first with auth provider
        const authProvider = user?.app_metadata?.provider || 'email';
        await ensureUserRecordExists(userId, user?.email || '', authProvider);
        
        // Link the character to the user
        const linkResponse = await linkCharacterToUser(characterId, userId);
        
        if (linkResponse.success) {
          // Get the updated character
          return getCharacterById(characterId);
        } else {
          console.error('Failed to link character:', linkResponse.error);
        }
      }
          
          // Return the character even if it couldn't be linked
          return characterResponse;
        }
      }
    } else {
      // Fetch character from cookies
      const cookieStore = await cookies();
      const characterId = cookieStore.get(COOKIE_NAMES.CHARACTER_ID)?.value;
      if (characterId) {
        // User is not authenticated but has a cookie character
        return getCharacterById(characterId);
      }
    }
    
    // No character found
    return {
      success: false,
      error: 'No character found'
    };
  } catch (err) {
    console.error('Unexpected error getting character from cookie:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
