'use server';

import type { 
  ApiResponse, 
  Character, 
  CharacterDungeon, 
  Area, 
  Adventure, 
  AdventureOutcome,
  Combat,
  RewardItem
} from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { getLevelFromExperience, generateId, CLASS_STAT_GROWTH, calculateSuccessRate } from '@/lib/utils';
import { getTotalMaxHitpoints, getTotalMaxEnergy } from '@/lib/character-utils';

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
          current_adventure_id: null,
          decision_id: null,
          outcome_id: null,
          combat_id: null,
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
          current_adventure_count: 0,
          current_adventure_id: null,
          decision_id: null,
          outcome_id: null,
          combat_id: null
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

/**
 * Get an adventure for a dungeon
 * This is similar to getAdventure but specifically for dungeons
 */
export async function getDungeonAdventure(
  character: Character,
  dungeonId: string
): Promise<ApiResponse<Adventure>> {
  console.log(`getDungeonAdventure: Starting for dungeon ${dungeonId}`);
  
  try {
    const supabase = await createClient();
    
    // Get the dungeon
    const { data: dungeon, error: dungeonError } = await supabase
      .from('character_dungeons')
      .select('*, area:area_id(*)')
      .eq('id', dungeonId)
      .single();
    
    if (dungeonError || !dungeon) {
      console.error('getDungeonAdventure: Error getting dungeon:', dungeonError);
      return {
        success: false,
        error: 'Failed to get dungeon data'
      };
    }
    
    // Check if dungeon has been completed (3 adventures)
    const MAX_DUNGEON_ADVENTURES = 3;
    if (dungeon.current_adventure_count >= MAX_DUNGEON_ADVENTURES) {
      console.log('getDungeonAdventure: Dungeon is completed (3/3 adventures)');
      return {
        success: false,
        error: 'Dungeon is complete'
      };
    }
    
    const area = dungeon.area;
    if (!area) {
      console.error('getDungeonAdventure: No area data for dungeon');
      return {
        success: false,
        error: 'Invalid dungeon area'
      };
    }
    
    // Check if we have a saved adventure ID - if so, fetch that specific adventure
    if (dungeon.current_adventure_id) {
      console.log(`getDungeonAdventure: Found saved adventure ID ${dungeon.current_adventure_id}, fetching it`);
      
      const { data: savedAdventure, error: savedAdventureError } = await supabase
        .from('adventures')
        .select(`
          *,
          decisions:adventure_decisions(
            *,
            outcomes:adventure_outcomes(*)
          )
        `)
        .eq('id', dungeon.current_adventure_id)
        .single();
      
      if (savedAdventureError) {
        console.error('getDungeonAdventure: Error fetching saved adventure:', savedAdventureError);
        // If there's an error fetching the saved adventure, continue to get a new random one
        console.log('getDungeonAdventure: Falling back to selecting a new random adventure');
      } else if (savedAdventure) {
        console.log(`getDungeonAdventure: Successfully retrieved saved adventure: ${savedAdventure.title}`);
        return {
          success: true,
          data: savedAdventure as Adventure
        };
      }
    }
    
    // If no saved adventure or couldn't retrieve it, get a new random one
    
    // Determine if we need a non-violent adventure (if character has 0 HP)
    const needsNonViolent = character.current_hitpoints <= 0;
    console.log('getDungeonAdventure: Needs non-violent adventure:', needsNonViolent);
    
    // Dungeon adventures need to be more challenging
    // Use the dungeon progress count (0-2) to determine difficulty
    const isEliteEncounter = dungeon.current_adventure_count >= 1;
    console.log(`getDungeonAdventure: Dungeon progress: ${dungeon.current_adventure_count}/3, isEliteEncounter: ${isEliteEncounter}`);
    
    // Get valid adventures for this area
    const { data: adventures, error } = await supabase
      .from('adventures')
      .select(`
        *,
        decisions:adventure_decisions(
          *,
          outcomes:adventure_outcomes(*)
        )
      `)
      .filter('area_ids', 'cs', `{${area.id}}`)
      .eq('is_violent', !needsNonViolent);
    
    if (error || !adventures || adventures.length === 0) {
      console.error('getDungeonAdventure: Error getting adventures:', error);
      return {
        success: false,
        error: 'Failed to get dungeon adventures'
      };
    }
    
    console.log(`getDungeonAdventure: Found ${adventures.length} possible adventures`);
    
    // Generate a seed for pseudo-random selection
    // For dungeons, we use a different algorithm to ensure unique adventures
    const seed = Math.floor(Date.now() * Math.random());
    const adventureIndex = Math.abs(seed) % adventures.length;
    const selectedAdventure = adventures[adventureIndex];
    
    console.log(`getDungeonAdventure: Selected new adventure ID ${selectedAdventure.id}`);
    
    // Update the dungeon to save the selected adventure ID
    const { error: updateError } = await supabase
      .from('character_dungeons')
      .update({
        current_adventure_id: selectedAdventure.id,
        current_state: 'adventure',
        updated_at: new Date().toISOString()
      })
      .eq('id', dungeonId);
    
    if (updateError) {
      console.error('getDungeonAdventure: Error saving adventure ID to dungeon:', updateError);
      // Continue anyway, this isn't critical for functionality
    }
    
    return {
      success: true,
      data: selectedAdventure as Adventure
    };
  } catch (err) {
    console.error('Unexpected error getting dungeon adventure:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

/**
 * Complete a dungeon adventure
 * This is similar to completeAdventure but updates dungeon progress
 */
export async function completeDungeonAdventure({
  character,
  dungeonId,
  adventureId,
  decisionId
}: {
  character: Character;
  dungeonId: string;
  adventureId: number;
  decisionId: number;
}): Promise<ApiResponse<{
  character: Character;
  dungeon: CharacterDungeon;
  outcome: AdventureOutcome;
  combat?: Combat | null;
  rewardItem?: RewardItem | null;
}>> {
  try {
    const supabase = await createClient();
    
    // Get the dungeon
    const { data: dungeon, error: dungeonError } = await supabase
      .from('character_dungeons')
      .select('*, area:area_id(*)')
      .eq('id', dungeonId)
      .single();
    
    if (dungeonError || !dungeon) {
      console.error('completeDungeonAdventure: Error getting dungeon:', dungeonError);
      return {
        success: false,
        error: 'Failed to get dungeon data'
      };
    }
    
    // Check if dungeon has been completed (3 adventures)
    const MAX_DUNGEON_ADVENTURES = 3;
    if (dungeon.current_adventure_count >= MAX_DUNGEON_ADVENTURES) {
      return {
        success: false,
        error: 'Dungeon is already complete'
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
      console.error('completeDungeonAdventure: Error getting decision:', decisionError);
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
      console.error('completeDungeonAdventure: Error getting adventure:', adventureError);
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
    outcomesWithSuccessRates.sort((a, b) => b.successRate - a.successRate);
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
      const totalSuccessRate = outcomesWithSuccessRates.reduce(
        (sum, item) => sum + item.successRate, 
        0
      );
      
      if (totalSuccessRate > 0) {
        let cumulativeProbability = 0;
        
        for (const item of outcomesWithSuccessRates) {
          const probability = (item.successRate / totalSuccessRate) * 100;
          cumulativeProbability += probability;
          
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
      // Determine if this should be an elite encounter (based on dungeon progress)
      const isEliteEncounter = dungeon.current_adventure_count >= 1;
      
      const randomIndex = Math.floor(Math.random() * outcome.monster_ids.length);
      const monsterId = outcome.monster_ids[randomIndex];
      
      if (monsterId === undefined) {
        console.error('No monster ID found at index', randomIndex);
        return {
          success: false,
          error: 'Failed to select monster'
        };
      }
      
      // Create a new combat record
      const { data: newCombat, error: combatError } = await supabase
        .from('combat')
        .insert({
          id: generateId(),
          character_id: character.id,
          adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: outcome.id,
          monster_id: monsterId as number,
          is_completed: false,
          turns: 0,
          character_damage_dealt: 0,
          monster_damage_dealt: 0,
          is_dungeon_combat: true, // Mark this as a dungeon combat
          dungeon_id: dungeonId // Link to the dungeon
        })
        .select('*, monster:monster_id(*)')
        .single();
      
      if (combatError) {
        console.error('Error creating dungeon combat:', combatError);
      } else {
        combat = newCombat;
      }
      
      // Update dungeon state to combat
      const { error: updateDungeonError } = await supabase
        .from('character_dungeons')
        .update({
          current_state: 'combat',
          current_adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: outcome.id,
          combat_id: combat?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', dungeonId);
      
      if (updateDungeonError) {
        console.error('Error updating dungeon state:', updateDungeonError);
      }
      
      // Don't update character stats yet, as combat will be resolved separately
      return {
        success: true,
        data: {
          character,
          dungeon: dungeon as CharacterDungeon,
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
    
    // Note: We don't update daily_adventure_count for dungeons
    
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
      
      // Also heal character to full when leveling up
      newHitpoints = newMaxHitpoints;
      newEnergy = newMaxEnergy;
    }
    
    // Update character in database
    const { error: updateError } = await supabase
      .from('characters')
      .update({
        level: newLevel,
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
    
    // Update the dungeon progress
    const newAdventureCount = dungeon.current_adventure_count + 1;
    let newDungeonState = 'adventure';
    
    // Check if dungeon is now complete (3 adventures)
    if (newAdventureCount >= MAX_DUNGEON_ADVENTURES) {
      newDungeonState = 'completed';
    }
    
    const { error: updateDungeonError } = await supabase
      .from('character_dungeons')
      .update({
        current_state: newDungeonState,
        current_adventure_id: adventureId,
        decision_id: decisionId,
        outcome_id: outcome.id,
        current_adventure_count: newAdventureCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', dungeonId);
    
    if (updateDungeonError) {
      console.error('Error updating dungeon progress:', updateDungeonError);
      return {
        success: false,
        error: 'Failed to update dungeon progress'
      };
    }
    
    // If there's an item reward, add it to the character's inventory
    if (itemRewardId) {
      const { error: inventoryError } = await supabase
        .from('character_inventory')
        .insert({
          id: generateId(),
          character_id: character.id,
          item_id: itemRewardId,
          quantity: 1,
          acquired_at: new Date().toISOString(),
          source: 'dungeon' // Mark items acquired from dungeons
        });
      
      if (inventoryError) {
        console.error('Error adding dungeon reward item to inventory:', inventoryError);
      }
    }
    
    // Get the updated dungeon data
    const { data: updatedDungeon, error: getDungeonError } = await supabase
      .from('character_dungeons')
      .select('*, area:area_id(*)')
      .eq('id', dungeonId)
      .single();
    
    if (getDungeonError) {
      console.error('Error getting updated dungeon data:', getDungeonError);
    }
    
    // Return updated character, dungeon, outcome, and reward item
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
          current_energy: newEnergy
        },
        dungeon: updatedDungeon || dungeon as CharacterDungeon,
        outcome,
        rewardItem: selectedRewardItem
      }
    };
  } catch (err) {
    console.error('Unexpected error completing dungeon adventure:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
