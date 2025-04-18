'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';
import type { CharacterAdventureState } from '@/components/adventure/AdventureStateContext';

/**
 * Updates the adventure state for a character
 */
export async function updateAdventureState(
  characterId: string,
  state: Partial<Omit<CharacterAdventureState, 'id' | 'character_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<CharacterAdventureState>> {
  try {
    const supabase = await createClient();
    
    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('character_adventures')
      .select('id')
      .eq('character_id', characterId)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      return { success: false, error: checkError.message };
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...state,
      updated_at: new Date().toISOString()
    };
    
    if (!existing) {
      // Create new record
      const { data, error } = await supabase
        .from('character_adventures')
        .insert({
          character_id: characterId,
          current_state: state.current_state || 'none',
          day: state.day || 1,
          adventure_number: state.adventure_number || 0,
          current_adventure_id: state.current_adventure_id || null,
          decision_id: state.decision_id || null,
          outcome_id: state.outcome_id || null,
          combat_id: state.combat_id || null,
          ...updateData
        })
        .select()
        .single();
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data as CharacterAdventureState };
    } else {
      // Update existing record
      const { data, error } = await supabase
        .from('character_adventures')
        .update(updateData)
        .eq('character_id', characterId)
        .select()
        .single();
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, data: data as CharacterAdventureState };
    }
  } catch (error) {
    console.error('Error updating adventure state:', error);
    return { success: false, error: 'Failed to update adventure state' };
  }
}

/**
 * Gets the current adventure state for a character
 */
export async function getAdventureState(
  characterId: string
): Promise<ApiResponse<CharacterAdventureState>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('character_adventures')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'Adventure state not found' };
    }
    
    return { success: true, data: data as CharacterAdventureState };
  } catch (error) {
    console.error('Error getting adventure state:', error);
    return { success: false, error: 'Failed to get adventure state' };
  }
}

/**
 * Increments the adventure number for a character and returns comprehensive state
 * This eliminates the need for subscriptions by returning all necessary data
 */
export async function incrementAdventureNumber(
  characterId: string
): Promise<ApiResponse<{adventureState: CharacterAdventureState, character: any}>> {
  try {
    const supabase = await createClient();
    
    // Get current adventure state
    const { data: current, error: getError } = await supabase
      .from('character_adventures')
      .select('*')
      .eq('character_id', characterId)
      .maybeSingle();
      
    if (getError) {
      return { success: false, error: getError.message };
    }
    
    if (!current) {
      return { success: false, error: 'Adventure state not found' };
    }
    
    // Increment adventure number
    const { data: adventureState, error } = await supabase
      .from('character_adventures')
      .update({
        adventure_number: (current.adventure_number || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('character_id', characterId)
      .select()
      .single();
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Also get the updated character data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();
      
    if (characterError) {
      console.error('Error getting character data:', characterError);
      // Still return success with adventure state even if character fetch fails
      return {
        success: true,
        data: {
          adventureState: adventureState as CharacterAdventureState,
          character: null
        }
      };
    }
    
    // Update the character's daily_adventure_count in the database
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        daily_adventure_count: (character.daily_adventure_count || 0) + 1
      })
      .eq('id', characterId);
      
    if (updateError) {
      console.error('Error updating character daily_adventure_count:', updateError);
    }
    
    // Return both the adventure state and character data
    return {
      success: true,
      data: {
        adventureState: adventureState as CharacterAdventureState,
        character: character
      }
    };
  } catch (error) {
    console.error('Error incrementing adventure number:', error);
    return { success: false, error: 'Failed to increment adventure number' };
  }
}
