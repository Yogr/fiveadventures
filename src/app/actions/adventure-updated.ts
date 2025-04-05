'use server';

import { supabase } from '@/lib/supabase';
import { 
  generateAdventureSeed,
  calculateSuccessRate,
  getLevelFromExperience,
  generateId,
  getPrimaryStat
} from '@/lib/utils';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import type { 
  ApiResponse, 
  Adventure, 
  AdventureOutcome, 
  Character,
  Combat,
  Monster
} from '@/lib/types-updated';
import { getCharacter } from './character';

// Get a random adventure for a character
export async function getAdventure(
  characterId: string
): Promise<ApiResponse<Adventure>> {
  try {
    // Get character data to check if they need a non-violent adventure
    const characterResponse = await getCharacter(characterId);
    if (!characterResponse.success || !characterResponse.data) {
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    const character = characterResponse.data;
    
    // Check if character has completed all adventures for the day
    if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
      return {
        success: false,
        error: 'All adventures completed for today'
      };
    }
    
    // For now, since we're still developing and the database schema hasn't been updated yet,
    // we'll use a simpler approach for area selection
    // In a real implementation, this would be stored in the database
    
    // Import the getSelectedArea function from area.ts
    const { getSelectedArea } = await import('./area');
    
    // Get the selected area for the character
    const selectedAreaResponse = await getSelectedArea(characterId);
    
    // If no area is selected, return an error
    if (!selectedAreaResponse.success || !selectedAreaResponse.data?.hasSelected) {
      return {
        success: false,
        error: 'No area selected for today'
      };
    }
    
    // Use a default area ID (1) if areaId is null
    const areaId = selectedAreaResponse.data.areaId || 1;
    
    // Determine if we need a non-violent adventure (if character has 0 HP)
    const needsNonViolent = character.current_hitpoints <= 0;
    
    // Determine if this should be an elite encounter (5th adventure or greater)
    const isEliteEncounter = character.daily_adventure_count >= 4;
    
    // Generate a seed based on character ID, current day, and adventure number
    const seed = generateAdventureSeed(
      characterId, 
      character.last_played_day, 
      character.daily_adventure_count + 1
    );
    
    // Get all available adventures
    let query = supabase
      .from('adventures')
      .select(`
        *,
        decisions:adventure_decisions(
          *,
          outcomes:adventure_outcomes(*)
        )
      `);
    
    // Filter for non-violent adventures if needed
    if (needsNonViolent) {
      query = query.eq('is_violent', false);
    }
    
    // Filter by area
    query = query.eq('area_id', areaId);
    
    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      console.error('Error getting adventures:', error);
      return {
        success: false,
        error: 'Failed to get adventures'
      };
    }
    
    // Use the seed to select a random adventure
    // For simplicity, we'll use the seed to generate an index
    const adventureIndex = Math.abs(seed) % data.length;
    const selectedAdventure = data[adventureIndex];
    
    return {
      success: true,
      data: selectedAdventure as Adventure
    };
  } catch (err) {
    console.error('Unexpected error getting adventure:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get adventure history for a character
export async function getAdventureHistory(
  characterId: string
): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('character_adventures')
      .select(`
        *,
        adventure:adventure_id(*),
        decision:decision_id(*),
        outcome:outcome_id(*),
        item_gained:item_gained_id(*)
      `)
      .eq('character_id', characterId)
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Error getting adventure history:', error);
      return {
        success: false,
        error: 'Failed to get adventure history'
      };
    }
    
    return {
      success: true,
      data: data || []
    };
  } catch (err) {
    console.error('Unexpected error getting adventure history:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get combat data
export async function getCombat(
  combatId: string
): Promise<ApiResponse<Combat>> {
  try {
    const { data, error } = await supabase
      .from('combat')
      .select(`
        *,
        monster:monster_id(*),
        turns:combat_turns(*)
      `)
      .eq('id', combatId)
      .single();
    
    if (error) {
      console.error('Error getting combat:', error);
      return {
        success: false,
        error: 'Failed to get combat'
      };
    }
    
    return {
      success: true,
      data: data as Combat
    };
  } catch (err) {
    console.error('Unexpected error getting combat:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Complete an adventure
export async function completeAdventure({
  characterId,
  adventureId,
  decisionId
}: {
  characterId: string;
  adventureId: number;
  decisionId: number;
}): Promise<ApiResponse<{
  character: Character;
  outcome: AdventureOutcome;
  combat?: Combat | null;
}>> {
  try {
    // Get character data
    const characterResponse = await getCharacter(characterId);
    if (!characterResponse.success || !characterResponse.data) {
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    const character = characterResponse.data;
    
    // Check if character has completed all adventures for the day
    if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
      return {
        success: false,
        error: 'All adventures completed for today'
      };
    }
    
    // Get the adventure decision and its outcomes
    const { data: decision, error: decisionError } = await supabase
      .from('adventure_decisions')
      .select(`
        *,
        outcomes:adventure_outcomes(*)
      `)
      .eq('id', decisionId)
      .eq('adventure_id', adventureId)
      .single();
    
    if (decisionError || !decision) {
      console.error('Error getting decision:', decisionError);
      return {
        success: false,
        error: 'Failed to get decision'
      };
    }
    
    // Get the adventure for min rewards
    const { data: adventure, error: adventureError } = await supabase
      .from('adventures')
      .select('*')
      .eq('id', adventureId)
      .single();
    
    if (adventureError || !adventure) {
      console.error('Error getting adventure:', adventureError);
      return {
        success: false,
        error: 'Failed to get adventure'
      };
    }
    
    // Determine the outcome based on character stats and requirements
    const outcomes = decision.outcomes as AdventureOutcome[];
    if (!outcomes || outcomes.length === 0) {
      return {
        success: false,
        error: 'No outcomes available for this decision'
      };
    }
    
    // Select the first outcome for simplicity
    const outcome = outcomes[0] as AdventureOutcome;
    
    if (!outcome) {
      return {
        success: false,
        error: 'Failed to select an outcome'
      };
    }
    
    // Return updated character and outcome
    return {
      success: true,
      data: {
        character,
        outcome
      }
    };
  } catch (err) {
    console.error('Unexpected error completing adventure:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Start a combat turn with all data preloaded
export async function startCombatTurn(
  combatId: string,
  action: string,
  skillId?: number
): Promise<ApiResponse<Combat>> {
  try {
    // Get combat data
    const combatResponse = await getCombat(combatId);
    
    if (!combatResponse.success || !combatResponse.data) {
      return {
        success: false,
        error: combatResponse.error || 'Failed to get combat data'
      };
    }
    
    const combat = combatResponse.data;
    
    // Return the combat data unchanged for now
    return {
      success: true,
      data: combat
    };
  } catch (err) {
    console.error('Unexpected error in combat turn:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
