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
    
    // Create empty equipment record for the character
    const { error: equipmentError } = await supabase
      .from('character_equipment')
      .insert({
        character_id: characterId,
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
    const supabase = await createClient();

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
    
    // If character has a linked user_id, check if the current user is authorized to access it
    if (character.user_id) {
      // Get the current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no authenticated user or user ID doesn't match, deny access
      if (!session?.user?.id || session.user.id !== character.user_id) {
        return {
          success: false,
          error: 'Unauthorized access to character'
        };
      }
    }
    
    // Get character equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select(`
        *,
        weapon:items!character_equipment_weapon_id_fkey(*),
        helmet:items!character_equipment_helmet_id_fkey(*),
        armor:items!character_equipment_armor_id_fkey(*),
        trinket:items!character_equipment_trinket_id_fkey(*)
      `)
      .eq('character_id', characterId)
      .single();
    
    // Get character inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('character_inventory')
      .select(`
        *,
        item:item_id(*)
      `)
      .eq('character_id', characterId);
    
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

    // Handle equipment data
    let characterEquipment: CharacterEquipment;
    
    if (equipment) {
      // Use the equipment data from the database
      characterEquipment = {
        id: equipment.id,
        character_id: equipment.character_id,
        weapon_id: equipment.weapon_id,
        helmet_id: equipment.helmet_id,
        armor_id: equipment.armor_id,
        trinket_id: equipment.trinket_id,
        weapon: equipment.weapon || null,
        helmet: equipment.helmet || null,
        armor: equipment.armor || null,
        trinket: equipment.trinket || null,
        updated_at: equipment.updated_at
      };
    } else {
      // Create a default equipment object if none was found
      characterEquipment = {
        id: generateId(),
        character_id: characterId,
        weapon_id: null,
        helmet_id: null,
        armor_id: null,
        trinket_id: null,
        weapon: null,
        helmet: null,
        armor: null,
        trinket: null,
        updated_at: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      data: {
        ...character,
        equipment: characterEquipment,
        inventory: inventory || []
      }
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

// Get character from cookie or auth session
export async function getCharacterForUser(): Promise<ApiResponse<Character>> {
  try {
    // First check if user is authenticated
    const supabaseClient = await createClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session?.user?.id) {
      // Try to get character by user ID
      const userCharacterResponse = await getCharacterByUserId(session.user.id);
      
      if (userCharacterResponse.success) {
        // User has a character, return it
        return userCharacterResponse;
      }
    }
    
    // If we get here, either:
    // 1. User is not authenticated, or
    // 2. User is authenticated but doesn't have a character

    // Fetch character from cookies
    const cookieStore = await cookies();
    const characterId = cookieStore.get(COOKIE_NAMES.CHARACTER_ID)?.value;
    
    // Try to get character from the cookie
    if (characterId) {
      return getCharacterById(characterId);
    }
    
    // No character ID provided
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
