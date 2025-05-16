'use server';

import { createClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/lib/types';

export interface CharacterDungeonState {
  id: string;
  character_id: string;
  area_id: number;
  current_state: string; // 'started', 'adventure', 'combat', 'outcome', 'completed', 'exited'
  current_adventure_id: number | null;
  current_adventure_count: number;
  decision_id: number | null;
  outcome_id: number | null;
  combat_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Updates the dungeon state for a character
 */
export async function updateDungeonState(
  dungeonId: string,
  state: Partial<Omit<CharacterDungeonState, 'id' | 'character_id' | 'area_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<CharacterDungeonState>> {
  try {
    const supabase = await createClient();
    
    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from('character_dungeons')
      .select('id')
      .eq('id', dungeonId)
      .maybeSingle();
      
    if (checkError) {
      return { success: false, error: checkError.message };
    }
    
    if (!existing) {
      return { success: false, error: 'Dungeon not found' };
    }
    
    // Add updated_at timestamp
    const updateData = {
      ...state,
      updated_at: new Date().toISOString()
    };
    
    // Update existing record
    const { data, error } = await supabase
      .from('character_dungeons')
      .update(updateData)
      .eq('id', dungeonId)
      .select('*, area:area_id(*)')
      .single();
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as any };
  } catch (error) {
    console.error('Error updating dungeon state:', error);
    return { success: false, error: 'Failed to update dungeon state' };
  }
}

/**
 * Gets the current dungeon state for a character's dungeon
 */
export async function getDungeonState(
  dungeonId: string
): Promise<ApiResponse<CharacterDungeonState>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('character_dungeons')
      .select('*, area:area_id(*)')
      .eq('id', dungeonId)
      .maybeSingle();
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'Dungeon state not found' };
    }
    
    return { success: true, data: data as any };
  } catch (error) {
    console.error('Error getting dungeon state:', error);
    return { success: false, error: 'Failed to get dungeon state' };
  }
}

/**
 * Gets active dungeons for a character
 */
export async function getActiveDungeons(
  characterId: string
): Promise<ApiResponse<CharacterDungeonState[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('character_dungeons')
      .select('*, area:area_id(*)')
      .eq('character_id', characterId)
      .not('current_state', 'eq', 'exited')
      .not('current_state', 'eq', 'completed')
      .order('updated_at', { ascending: false });
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: data as any || [] };
  } catch (error) {
    console.error('Error getting active dungeons:', error);
    return { success: false, error: 'Failed to get active dungeons' };
  }
}
