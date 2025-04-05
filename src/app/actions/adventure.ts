'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { 
  generateAdventureSeed, 
  getCurrentGameDay,
  calculateSuccessRate,
  getLevelFromExperience
} from '@/lib/utils';
import { COOKIE_NAMES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import type {
  ApiResponse,
  Adventure,
  AdventureOutcome,
  Character
} from '@/lib/types';
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
    
    // Determine if we need a non-violent adventure (if character has 0 HP)
    const needsNonViolent = character.current_hitpoints <= 0;
    
    // Generate a seed based on character ID, current day, and adventure count
    // Use adventure count + 1 for the next adventure
    const seed = generateAdventureSeed(characterId, character.last_played_day, character.daily_adventure_count + 1);
    
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
  combat?: {
    id: string;
  };
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
    // For now, we'll just pick the first outcome
    // In a real implementation, we would calculate success rates based on character stats
    const outcomes = decision.outcomes as AdventureOutcome[];
    if (!outcomes || outcomes.length === 0) {
      return {
        success: false,
        error: 'No outcomes available for this decision'
      };
    }
    
    // Calculate success rates for each outcome based on character stats
    const characterStats = {
      strength: character.strength,
      intelligence: character.intelligence,
      agility: character.agility,
      luck: character.luck,
      level: getLevelFromExperience(character.experience)
    };
    
    // Calculate success rates for each outcome
    const outcomesWithSuccessRates = outcomes.map(outcome => {
      // Ensure stat_requirements is of the correct type or use an empty object
      const statRequirements = outcome.stat_requirements 
        ? (typeof outcome.stat_requirements === 'object' ? outcome.stat_requirements as { [key: string]: number } : {})
        : {};
      
      const successRate = Object.keys(statRequirements).length > 0
        ? calculateSuccessRate(characterStats, statRequirements)
        : 100; // Default to 100% if no requirements
      
      return {
        outcome,
        successRate
      };
    });
    
    // Choose an outcome based on weighted random selection
    // First, sort by success rate (highest first)
    outcomesWithSuccessRates.sort((a, b) => b.successRate - a.successRate);
    
    // Generate a random number between 0 and 100
    const roll = Math.floor(Math.random() * 100) + 1;
    
    // Make sure we have at least one outcome
    if (outcomesWithSuccessRates.length === 0) {
      return {
        success: false,
        error: 'No valid outcomes available for this decision'
      };
    }
    
    // We know we have at least one outcome at this point
    // Use non-null assertion since we've already checked length > 0
    const firstOutcome = outcomesWithSuccessRates[0]!;
    
    // Select outcome based on roll and success rates
    let selectedOutcome = firstOutcome.outcome; // Default to highest success rate
    
    // If there's only one outcome, use it
    if (outcomesWithSuccessRates.length === 1) {
      selectedOutcome = firstOutcome.outcome;
    } else {
      // If there are multiple outcomes, use weighted selection
      // The higher the success rate, the more likely to be chosen
      
      // Calculate total success rate
      const totalSuccessRate = outcomesWithSuccessRates.reduce(
        (sum, item) => sum + item.successRate, 
        0
      );
      
      // Calculate cumulative probabilities
      let cumulativeProbability = 0;
      
      for (const item of outcomesWithSuccessRates) {
        // Calculate normalized probability (0-100)
        const probability = (item.successRate / totalSuccessRate) * 100;
        cumulativeProbability += probability;
        
        // If roll is less than or equal to cumulative probability, select this outcome
        if (roll <= cumulativeProbability) {
          selectedOutcome = item.outcome;
          break;
        }
      }
    }
    
    const outcome = selectedOutcome;
    
    // Calculate rewards
    const experienceGained = adventure.min_experience + outcome.experience_bonus;
    const goldGained = adventure.min_gold + outcome.gold_bonus;
    
    // Update character stats
    const newExperience = character.experience + experienceGained;
    const newGold = character.gold + goldGained;
    const newHitpoints = Math.max(0, Math.min(character.max_hitpoints, character.current_hitpoints + outcome.hitpoints_change));
    const newEnergy = Math.max(0, Math.min(character.max_energy, character.current_energy + outcome.energy_change));
    const newAdventureCount = character.daily_adventure_count + 1;
    
    // Update character in database
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        experience: newExperience,
        gold: newGold,
        current_hitpoints: newHitpoints,
        current_energy: newEnergy,
        daily_adventure_count: newAdventureCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', characterId);
    
    if (updateError) {
      console.error('Error updating character:', updateError);
      return {
        success: false,
        error: 'Failed to update character'
      };
    }
    
    // Record the adventure in the character's history
    const { error: historyError } = await supabase
      .from('character_adventures')
      .insert({
        character_id: characterId,
        adventure_id: adventureId,
        decision_id: decisionId,
        outcome_id: outcome.id,
        day: character.last_played_day,
        adventure_number: newAdventureCount,
        experience_gained: experienceGained,
        gold_gained: goldGained,
        item_gained_id: outcome.reward_table_id ? outcome.reward_table_id : null,
        completed_at: new Date().toISOString()
      });
    
    if (historyError) {
      console.error('Error recording adventure history:', historyError);
      // Continue anyway, this isn't critical
    }
    
    // If there's a reward table, we could potentially add an item to the character's inventory
    // This would require additional logic to select an item from the reward table
    // For now, we'll skip this part
    
    // Check if outcome has combat
    let combatData = undefined;
    
    if (outcome.has_combat && outcome.monster_ids && outcome.monster_ids.length > 0) {
      // Select a random monster from the outcome's monster_ids
      const randomIndex = Math.floor(Math.random() * outcome.monster_ids.length);
      const monsterId = outcome.monster_ids[randomIndex];
      
      // Make sure we have a valid monster ID
      if (typeof monsterId === 'number') {
        try {
          // Create a combat encounter
          const { data: combat, error: combatError } = await supabase
            .from('combat')
            .insert({
              character_id: characterId,
              adventure_id: adventureId,
              decision_id: decisionId,
              outcome_id: outcome.id,
              monster_id: monsterId,
              is_completed: false,
              turns: 0,
              character_damage_dealt: 0,
              monster_damage_dealt: 0,
              created_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (combatError) {
            console.error('Error creating combat encounter:', combatError);
          } else if (combat) {
            combatData = {
              id: combat.id
            };
          }
        } catch (combatErr) {
          console.error('Unexpected error in combat creation:', combatErr);
          // Continue anyway, this isn't critical
        }
      }
    }
    
    // Return updated character and outcome
    return {
      success: true,
      data: {
        character: {
          ...character,
          experience: newExperience,
          gold: newGold,
          current_hitpoints: newHitpoints,
          current_energy: newEnergy,
          daily_adventure_count: newAdventureCount
        },
        outcome,
        combat: combatData
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
