'use server';

import {
  generateAdventureSeed,
  calculateSuccessRate,
  getLevelFromExperience,
  generateId,
  getPrimaryStat,
  getCurrentGameDay,
  CLASS_STAT_GROWTH
} from '@/lib/utils';
import { getTotalMaxHitpoints, getTotalMaxEnergy } from '@/lib/character-utils';
import { MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import type {
  ApiResponse,
  Adventure,
  AdventureOutcome,
  Character,
  Combat,
  Monster,
  CharacterAdventure,
  Item,
  Area,
  RewardItem
} from '@/lib/types';
import { getCharacterById } from './character';
import { createClient } from '@/lib/supabase/server';

// No need for getOutcomeById - we already have the outcome from the decision

// Get a random adventure for a character
export async function getAdventure(
  character: Character,
  area: Area,
): Promise<ApiResponse<Adventure>> {
  const startTime = new Date().getTime();
  console.log(`[${new Date().toISOString()}] getAdventure: Starting adventure selection process`);
  console.log('getAdventure: Character info:', {
    id: character.id,
    name: character.name,
    level: getLevelFromExperience(character.experience),
    adventureCount: character.daily_adventure_count,
    hp: `${character.current_hitpoints}/${character.max_hitpoints}`
  });
  
  try {
    const supabase = await createClient();
    
    // Check if character has completed all adventures for the day
    if (character.daily_adventure_count >= MAX_ADVENTURES_PER_DAY) {
      console.log('getAdventure: All adventures completed for today');
      return {
        success: false,
        error: 'All adventures completed for today'
      };
    }
    
    // Determine if we need a non-violent adventure (if character has 0 HP)
    const needsNonViolent = character.current_hitpoints <= 0;
    console.log('getAdventure: Needs non-violent adventure:', needsNonViolent);
    
    // Determine if this should be an elite encounter (5th adventure or greater)
    // Since daily_adventure_count is 0-indexed, the 5th adventure is when count >= 4
    const isEliteEncounter = character.daily_adventure_count >= 4;
    console.log(`getAdventure: Character adventure count: ${character.daily_adventure_count}, isEliteEncounter: ${isEliteEncounter}`);

    const currentDay = await getCurrentGameDay();
    console.log('getAdventure: Current game day:', currentDay);
    
    // Generate a seed based on character ID, current day, and adventure count
    const adventureNumber = character.daily_adventure_count;
    const seed = generateAdventureSeed(
      character.id, 
      currentDay, 
      adventureNumber
    );
    console.log(`getAdventure: Adventure seed generation params - characterId: ${character.id.substring(0, 8)}..., day: ${currentDay}, adventure number: ${adventureNumber}`);
    console.log(`getAdventure: Generated seed: ${seed}`);
    
    console.log('getAdventure: Fetching available adventures');
    // Get valid adventures
    const fetchStartTime = new Date().getTime();
    const { data: adventures, error } = await supabase
    .from('adventures')
    .select(`
      *,
      decisions:adventure_decisions(
        *,
        outcomes:adventure_outcomes(*)
      )
    `)
    .eq('area_id', area.id)
    .eq('is_violent', !needsNonViolent)
    
    if (error || !adventures || adventures.length === 0) {
      console.error('getAdventure: Error getting adventures:', error);
      return {
        success: false,
        error: 'Failed to get adventures'
      };
    }
    
    console.log(`getAdventure: Fetched ${adventures.length} available adventures in ${new Date().getTime() - fetchStartTime}ms`);
    
    // Log the available adventures for debugging
    if (adventures.length <= 10) {
      console.log('getAdventure: Available adventures:', adventures.map(a => ({
        id: a.id,
        title: a.title,
        isViolent: a.is_violent
      })));
    } else {
      console.log(`getAdventure: Available adventures count: ${adventures.length} (too many to log all)`);
    }
    
    // Use the seed to select a random adventure
    // For simplicity, we'll use the seed to generate an index
    const adventureIndex = Math.abs(seed) % adventures.length;
    const selectedAdventure = adventures[adventureIndex];
    
    console.log(`getAdventure: Selected adventure index ${adventureIndex} out of ${adventures.length} adventures`);
    console.log('getAdventure: Selected adventure:', {
      id: selectedAdventure.id,
      title: selectedAdventure.title,
      isViolent: selectedAdventure.is_violent,
      decisionCount: selectedAdventure.decisions?.length || 0
    });
    
    console.log(`[${new Date().toISOString()}] getAdventure: Adventure selection completed in ${new Date().getTime() - startTime}ms`);
    
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
  character,
  adventureId,
  decisionId
}: {
  character: Character;
  adventureId: number;
  decisionId: number;
}): Promise<ApiResponse<{
  character: Character;
  outcome: AdventureOutcome;
  combat?: Combat | null;
  rewardItem?: RewardItem | null;
}>> {
  try {
    const supabase = await createClient();
    
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
      let successRate = 100; // Default to 100% if no requirements
      
      if (outcome.stat_requirements && typeof outcome.stat_requirements === 'object') {
        // Convert stat_requirements to the expected format for calculateSuccessRate
        const statRequirements: { [key: string]: number } = {};
        
        // Safely extract stat requirements
        for (const [key, value] of Object.entries(outcome.stat_requirements)) {
          if (typeof value === 'number') {
            statRequirements[key] = value;
          }
        }
        
        successRate = calculateSuccessRate(characterStats, statRequirements);
      }
      
      return {
        outcome,
        successRate
      };
    });
    
    // Choose an outcome based on weighted random selection
    // First, sort by success rate (highest first)
    outcomesWithSuccessRates.sort((a, b) => b.successRate - a.successRate);
    
    // Generate a random number between 0 and 100
    const roll = Math.floor(Math.random() * 100);
    
    // Select outcome based on roll and success rates
    const firstOutcomeSuccessRate = outcomesWithSuccessRates[0];
    if (!firstOutcomeSuccessRate) {
      return {
        success: false,
        error: 'No valid outcomes found'
      };
    }

    let selectedOutcome = firstOutcomeSuccessRate.outcome; // Default to highest success rate
    
    // If there's only one outcome, use it
    if (outcomesWithSuccessRates.length === 1) {
      selectedOutcome = firstOutcomeSuccessRate.outcome;
    } else {
      // If there are multiple outcomes, use weighted selection
      // The higher the success rate, the more likely to be chosen
      
      // Calculate total success rate
      const totalSuccessRate = outcomesWithSuccessRates.reduce(
        (sum, item) => sum + item.successRate, 
        0
      );
      
      if (totalSuccessRate > 0) {
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
    }
    
    const outcome = selectedOutcome;
    
      // Check if this outcome has combat
      let combat = null;
      if (outcome.has_combat && outcome.monster_ids && outcome.monster_ids.length > 0) {
        // Determine if this should be an elite encounter (5th adventure or greater)
        // Using >= 4 because any adventure after the 4th should be elite
        const isEliteEncounter = character.daily_adventure_count >= 4;
        console.log(`Character adventure count: ${character.daily_adventure_count}, isEliteEncounter: ${isEliteEncounter}`);
        
        // Just use the monster IDs directly as specified in the outcome
        // No manipulation of IDs whatsoever
        const randomIndex = Math.floor(Math.random() * outcome.monster_ids.length);
        const monsterId = outcome.monster_ids[randomIndex];
        
        if (monsterId === undefined) {
          console.error('No monster ID found at index', randomIndex);
          return {
            success: false,
            error: 'Failed to select monster'
          };
        }
        
        console.log(`Selected monster ID ${monsterId} from monster_ids array. Is elite encounter: ${isEliteEncounter}`);
      
      // Create a new combat record
      const { data: newCombat, error: combatError } = await supabase
        .from('combat')
        .insert({
          id: generateId(), // Generate UUID for the record
          character_id: character.id,
          adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: outcome.id,
          monster_id: monsterId as number, // Ensure it's treated as a number
          is_completed: false,
          turns: 0,
          character_damage_dealt: 0,
          monster_damage_dealt: 0
        })
        .select('*, monster:monster_id(*)')
        .single();
      
      if (combatError) {
        console.error('Error creating combat:', combatError);
        // Continue anyway, this isn't critical
      } else {
        combat = newCombat;
      }
      
      // Don't update character stats yet, as combat will be resolved separately
      return {
        success: true,
        data: {
          character,
          outcome,
          combat
        }
      };
    }
    
    // If there's no combat, process rewards immediately
    
    // Check if there's a reward table
    let itemRewardId = null;
    let selectedRewardItem = null;
    
    if (outcome.reward_table_id) {
      // Get the reward table
      const { data: rewardItems, error: rewardError } = await supabase
        .from('reward_items')
        .select('*, item:item_id(*)')
        .eq('reward_table_id', outcome.reward_table_id);
      
      if (!rewardError && rewardItems && rewardItems.length > 0) {
        // Roll for each reward item
        const roll = Math.floor(Math.random() * 100) + 1; // 1-100
        
        // Sort by chance (lowest to highest)
        const sortedRewards = rewardItems.sort((a, b) => a.chance - b.chance);
        
        // Find the first reward where roll < chance
        for (const reward of sortedRewards) {
          if (roll <= reward.chance) {
            itemRewardId = reward.item_id;
            selectedRewardItem = reward; // Store the full reward item
            break;
          }
        }
      }
    }
    
    // Calculate rewards
    const experienceGained = adventure.min_experience + (outcome.experience_bonus || 0);
    const goldGained = adventure.min_gold + (outcome.gold_bonus || 0);
    
    // Update character stats
    const newExperience = character.experience + experienceGained;
    const newGold = character.gold + goldGained;
    let newHitpoints = Math.max(0, Math.min(getTotalMaxHitpoints(character), character.current_hitpoints + (outcome.hitpoints_change || 0)));
    let newEnergy = Math.max(0, Math.min(getTotalMaxEnergy(character), character.current_energy + (outcome.energy_change || 0)));
    const newAdventureCount = character.daily_adventure_count + 1;
    
    // Check if character has leveled up
    const oldLevel = getLevelFromExperience(character.experience);
    const newLevel = getLevelFromExperience(newExperience);
    const leveledUp = newLevel > oldLevel;
    
    // Calculate new stats if leveled up
    let newStrength = character.strength;
    let newIntelligence = character.intelligence;
    let newAgility = character.agility;
    let newLuck = character.luck;
    let newMaxHitpoints = character.max_hitpoints;
    let newMaxEnergy = character.max_energy;
    
    if (leveledUp) {
      console.log(`Character ${character.name} leveled up from ${oldLevel} to ${newLevel}`);
      
      // Get stat growth for character class
      const statGrowth = CLASS_STAT_GROWTH[character.class as keyof typeof CLASS_STAT_GROWTH];
      
      // Calculate levels gained
      const levelsGained = newLevel - oldLevel;
      
      // Update stats based on levels gained and class stat growth
      newStrength += Math.floor(statGrowth.strength * levelsGained);
      newIntelligence += Math.floor(statGrowth.intelligence * levelsGained);
      newAgility += Math.floor(statGrowth.agility * levelsGained);
      newLuck += Math.floor(statGrowth.luck * levelsGained);
      newMaxHitpoints += Math.floor(statGrowth.hitpoints * levelsGained);
      newMaxEnergy += Math.floor(statGrowth.energy * levelsGained);
      
      console.log(`New stats: STR ${newStrength}, INT ${newIntelligence}, AGI ${newAgility}, LCK ${newLuck}, HP ${newMaxHitpoints}, MP ${newMaxEnergy}`);
      
      // Also heal character to full when leveling up
      newHitpoints = newMaxHitpoints;
      newEnergy = newMaxEnergy;
    }
    
    // Update character in database
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        experience: newExperience,
        gold: newGold,
        strength: newStrength,
        intelligence: newIntelligence,
        agility: newAgility,
        luck: newLuck,
        max_hitpoints: newMaxHitpoints,
        max_energy: newMaxEnergy,
        current_hitpoints: newHitpoints,
        current_energy: newEnergy,
        daily_adventure_count: newAdventureCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', character.id);
    
    if (updateError) {
      console.error('Error updating character:', updateError);
      return {
        success: false,
        error: 'Failed to update character'
      };
    }
    
    // Update the adventure state to outcome
    const { error: historyError } = await supabase
      .from('character_adventures')
      .upsert(
        {
          character_id: character.id,
          current_state: 'outcome',
          current_adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: outcome.id,
          day: character.last_played_day,
          adventure_number: newAdventureCount,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'character_id' }
      );
    
    if (historyError) {
      console.error('Error recording adventure history:', historyError);
      // Continue anyway, this isn't critical
    }
    
    // If there's an item reward, add it to the character's inventory
    if (itemRewardId) {
      const { error: inventoryError } = await supabase
        .from('character_inventory')
        .insert({
          id: generateId(), // Generate UUID for the record
          character_id: character.id,
          item_id: itemRewardId,
          quantity: 1,
          acquired_at: new Date().toISOString()
        });
      
      if (inventoryError) {
        console.error('Error adding item to inventory:', inventoryError);
        // Continue anyway, this isn't critical
      }
    }
    
    // Return updated character, outcome, and reward item
    return {
      success: true,
      data: {
        character: {
          ...character,
          experience: newExperience,
          gold: newGold,
          strength: newStrength,
          intelligence: newIntelligence,
          agility: newAgility,
          luck: newLuck,
          max_hitpoints: newMaxHitpoints,
          max_energy: newMaxEnergy,
          current_hitpoints: newHitpoints,
          current_energy: newEnergy,
          daily_adventure_count: newAdventureCount
        },
        outcome,
        rewardItem: selectedRewardItem
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
): Promise<ApiResponse<CharacterAdventure[]>> {
  try {
    const supabase = await createClient();

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
      data: data as CharacterAdventure[] || []
    };
  } catch (err) {
    console.error('Unexpected error getting adventure history:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
