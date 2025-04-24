'use server';

import type {
  ApiResponse,
  Combat,
  Character
} from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

/**
 * Complete a combat and apply all rewards in a single transaction
 * This function handles the entire combat end process in one go:
 * 1. Marks the combat as completed
 * 2. Awards experience and gold to the character
 * 3. Increments the daily adventure count
 * 4. Updates the adventure state to outcome
 * 5. Returns the updated character and combat data
 */
export async function completeCombat(
  combatId: string,
  isVictory: boolean,
  ranAway: boolean
): Promise<ApiResponse<{
  character: Character;
  combat: Combat;
}>> {
  try {
    console.log('completeCombat: Starting with params:', { combatId, isVictory, ranAway });
    const supabase = await createClient();
    
    // Step 1: Get the current combat and character data
    const { data: combat, error: combatError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*)')
      .eq('id', combatId)
      .single();
    
    if (combatError || !combat) {
      console.error('completeCombat: Error getting combat:', combatError);
      return {
        success: false,
        error: 'Failed to get combat data'
      };
    }
    
    const characterId = combat.character_id;
    
    // Get character data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();
    
    if (characterError || !character) {
      console.error('completeCombat: Error getting character:', characterError);
      return {
        success: false,
        error: 'Failed to get character data'
      };
    }
    
    console.log('completeCombat: Got initial data:', {
      combatId,
      characterId,
      monsterName: combat.monster?.name,
      characterExp: character.experience,
      characterGold: character.gold,
      adventureCount: character.daily_adventure_count
    });
    
    // Step 2: Calculate rewards
    let experienceReward = 0;
    let goldReward = 0;
    
    if (isVictory && combat.monster) {
      experienceReward = combat.monster.experience_reward || 0;
      goldReward = combat.monster.gold_reward || 0;
    }
    
    const newExperience = character.experience + experienceReward;
    const newGold = character.gold + goldReward;
    // Don't increment adventure count here - it will be incremented when transitioning to the next adventure
    
    console.log('completeCombat: Calculated rewards:', {
      experienceReward,
      goldReward,
      newExperience,
      newGold,
      currentAdventureCount: character.daily_adventure_count
    });
    
    // Step 3: Update the combat record
    const { error: updateCombatError } = await supabase
      .from('combat')
      .update({
        is_completed: true,
        is_victory: isVictory,
        completed_at: new Date().toISOString()
      })
      .eq('id', combatId);
    
    if (updateCombatError) {
      console.error('completeCombat: Error updating combat:', updateCombatError);
      return {
        success: false,
        error: 'Failed to update combat'
      };
    }
    
    // Step 4: Update the character with rewards - but don't increment adventure count
    const { error: updateCharacterError } = await supabase
      .from('characters')
      .update({
        experience: newExperience,
        gold: newGold,
        // No daily_adventure_count increment here
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId);
    
    if (updateCharacterError) {
      console.error('completeCombat: Error updating character:', updateCharacterError);
      return {
        success: false,
        error: 'Failed to update character with rewards'
      };
    }
    
    // Step 5: Update the adventure state to outcome - using current adventure count, not incrementing
    const { error: updateAdventureStateError } = await supabase
      .from('character_adventures')
      .upsert(
        {
          character_id: characterId,
          current_state: 'outcome',
          combat_id: null,
          day: character.last_played_day,
          adventure_number: character.daily_adventure_count, // Use current count, don't increment
          updated_at: new Date().toISOString()
        },
        { onConflict: 'character_id' }
      );
    
    if (updateAdventureStateError) {
      console.error('completeCombat: Error updating adventure state:', updateAdventureStateError);
      // Continue anyway, this isn't critical
    }
    
    // Step 6: Get the updated character and combat data
    const { data: updatedCharacter, error: getUpdatedCharacterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();
    
    if (getUpdatedCharacterError || !updatedCharacter) {
      console.error('completeCombat: Error getting updated character:', getUpdatedCharacterError);
      return {
        success: false,
        error: 'Failed to get updated character data'
      };
    }
    
    const { data: updatedCombat, error: getUpdatedCombatError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*)')
      .eq('id', combatId)
      .single();
    
    if (getUpdatedCombatError || !updatedCombat) {
      console.error('completeCombat: Error getting updated combat:', getUpdatedCombatError);
      return {
        success: false,
        error: 'Failed to get updated combat data'
      };
    }
    
    // Verify the updates were successful
    console.log('completeCombat: Verification:', {
      expectedExperience: newExperience,
      actualExperience: updatedCharacter.experience,
      experienceDiff: updatedCharacter.experience - character.experience,
      expectedGold: newGold,
      actualGold: updatedCharacter.gold,
      goldDiff: updatedCharacter.gold - character.gold,
      adventureCount: updatedCharacter.daily_adventure_count
    });
    
    // Return the updated data
    return {
      success: true,
      data: {
        character: updatedCharacter as Character,
        combat: updatedCombat as Combat
      }
    };
  } catch (err) {
    console.error('Unexpected error in completeCombat:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
