'use server';

import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { 
  generateAdventureSeed, 
  getCurrentGameDay,
  calculateSuccessRate,
  getLevelFromExperience,
  generateId,
  getPrimaryStat
} from '@/lib/utils';
import { COOKIE_NAMES, MAX_ADVENTURES_PER_DAY } from '@/lib/constants';
import type { 
  ApiResponse, 
  Adventure, 
  AdventureOutcome, 
  Character,
  Combat,
  Monster,
  RewardTable,
  RewardItem
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
      const successRate = outcome.stat_requirements 
        ? calculateSuccessRate(characterStats, outcome.stat_requirements)
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
    
    // Select outcome based on roll and success rates
    let selectedOutcome = outcomesWithSuccessRates[0].outcome; // Default to highest success rate
    
    // If there's only one outcome, use it
    if (outcomesWithSuccessRates.length === 1) {
      selectedOutcome = outcomesWithSuccessRates[0].outcome;
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
    
    // Check if this outcome has combat
    let combat = null;
    if (outcome.has_combat && outcome.monster_ids && outcome.monster_ids.length > 0) {
      // Determine if this should be an elite encounter (5th adventure)
      const isEliteEncounter = character.daily_adventure_count >= 4;
      
      // Select a random monster from the monster_ids array
      const randomIndex = Math.floor(Math.random() * outcome.monster_ids.length);
      let monsterId = outcome.monster_ids[randomIndex];
      
      // If this is an elite encounter, use the elite version of the monster
      if (isEliteEncounter) {
        // Elite monster IDs are 100 + the regular monster ID
        // For example, if the regular monster ID is 1, the elite version is 101
        monsterId = monsterId + 100;
      }
      
      // Create a new combat record
      const { data: newCombat, error: combatError } = await supabase
        .from('combat')
        .insert({
          id: generateId(), // Generate UUID for the record
          character_id: characterId,
          adventure_id: adventureId,
          decision_id: decisionId,
          outcome_id: outcome.id,
          monster_id: monsterId,
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
            break;
          }
        }
      }
    }
    
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
        id: generateId(), // Generate UUID for the record
        character_id: characterId,
        adventure_id: adventureId,
        decision_id: decisionId,
        outcome_id: outcome.id,
        day: character.last_played_day,
        adventure_number: newAdventureCount,
        experience_gained: experienceGained,
        gold_gained: goldGained,
        item_gained_id: itemRewardId,
        completed_at: new Date().toISOString()
      });
    
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
          character_id: characterId,
          item_id: itemRewardId,
          quantity: 1,
          acquired_at: new Date().toISOString()
        });
      
      if (inventoryError) {
        console.error('Error adding item to inventory:', inventoryError);
        // Continue anyway, this isn't critical
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

// Combat functions

// Start a combat turn
export async function startCombatTurn(
  combatId: string,
  action: string,
  skillId?: number
): Promise<ApiResponse<Combat>> {
  try {
    // Get the combat data
    const { data: combat, error: combatError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*), character:character_id(*)')
      .eq('id', combatId)
      .single();
    
    if (combatError || !combat) {
      console.error('Error getting combat:', combatError);
      return {
        success: false,
        error: 'Failed to get combat'
      };
    }
    
    if (combat.is_completed) {
      return {
        success: false,
        error: 'Combat is already completed'
      };
    }
    
    // Get the current turn number
    const turnNumber = combat.turns + 1;
    
    // Process character action
    let characterDamageDealt = 0;
    let characterHealingDone = 0;
    let characterEffects = null;
    
    const character = combat.character as Character;
    const monster = combat.monster as Monster;
    
    // Calculate character damage based on action
    if (action === 'attack') {
      // Basic attack
      // Get character's weapon
      const { data: equipment, error: equipmentError } = await supabase
        .from('character_equipment')
        .select('*, weapon:weapon_id(*)')
        .eq('character_id', character.id)
        .single();
      
      // Get primary stat based on class
      const primaryStat = getPrimaryStat(character);
      
      if (!equipmentError && equipment && equipment.weapon) {
        const weapon = equipment.weapon;
        const baseDamage = weapon.base_damage || 5;
        const statBonus = Math.floor(primaryStat / 2);
        characterDamageDealt = baseDamage + statBonus;
      } else {
        // Unarmed attack
        characterDamageDealt = 3 + Math.floor(primaryStat / 3);
      }
      
      // Apply monster defense
      characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 2));
    } else if (action === 'skill' && skillId) {
      // Skill attack
      const { data: skill, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();
      
      if (skillError || !skill) {
        return {
          success: false,
          error: 'Skill not found'
        };
      }
      
      // Check if character has enough energy
      if (character.current_energy < skill.energy_cost) {
        return {
          success: false,
          error: 'Not enough energy'
        };
      }
      
      // Process skill effects
      if (skill.effects) {
        const effects = skill.effects as any;
        
        if (effects.damage_multiplier) {
          // Damage skill
          const baseDamage = 5; // Base damage
          const primaryStat = getPrimaryStat(character);
          characterDamageDealt = Math.floor(baseDamage * effects.damage_multiplier) + Math.floor(primaryStat / 2);
          
          // Apply monster defense
          characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 3));
        }
        
        if (effects.healing) {
          // Healing skill
          characterHealingDone = effects.healing;
        }
        
        if (effects.strength_boost || effects.slow || effects.gold_chance) {
          // Status effect skill
          characterEffects = effects;
        }
      }
      
      // Update character energy
      await supabase
        .from('characters')
        .update({
          current_energy: Math.max(0, character.current_energy - skill.energy_cost)
        })
        .eq('id', character.id);
    } else if (action === 'run') {
      // Run away
      // 50% chance of success, modified by agility
      const runChance = 50 + character.agility * 2;
      const roll = Math.floor(Math.random() * 100) + 1;
      
      if (roll <= runChance) {
        // Success - end combat
        await supabase
          .from('combat')
          .update({
            is_completed: true,
            is_victory: false,
            completed_at: new Date().toISOString()
          })
          .eq('id', combatId);
        
        // Record the turn
        await supabase
          .from('combat_turns')
          .insert({
            id: generateId(), // Generate UUID for the record
            combat_id: combatId,
            turn_number: turnNumber,
            actor: 'character',
            action: 'run',
            effects: { success: true }
          });
        
        return {
          success: true,
          data: {
            ...combat,
            is_completed: true,
            is_victory: false,
            turns: turnNumber
          } as any
        };
      } else {
        // Failed to run
        // Record the turn
        await supabase
          .from('combat_turns')
          .insert({
            id: generateId(), // Generate UUID for the record
            combat_id: combatId,
            turn_number: turnNumber,
            actor: 'character',
            action: 'run',
            effects: { success: false }
          });
        
        // Monster still gets to attack
        characterEffects = { run_failed: true };
      }
    }
    
    // Record character turn
    await supabase
      .from('combat_turns')
      .insert({
        id: generateId(), // Generate UUID for the record
        combat_id: combatId,
        turn_number: turnNumber,
        actor: 'character',
        action,
        skill_id: skillId,
        damage_dealt: characterDamageDealt > 0 ? characterDamageDealt : null,
        healing_done: characterHealingDone > 0 ? characterHealingDone : null,
        effects: characterEffects
      });
    
    // Apply healing if any
    if (characterHealingDone > 0) {
      await supabase
        .from('characters')
        .update({
          current_hitpoints: Math.min(character.max_hitpoints, character.current_hitpoints + characterHealingDone)
        })
        .eq('id', character.id);
    }
    
    // Update monster HP
    const monsterRemainingHp = Math.max(0, monster.hitpoints - characterDamageDealt);
    
    // Check if monster is defeated
    if (monsterRemainingHp === 0) {
      // Monster defeated - end combat
      await supabase
        .from('combat')
        .update({
          is_completed: true,
          is_victory: true,
          turns: turnNumber,
          character_damage_dealt: combat.character_damage_dealt + characterDamageDealt,
          completed_at: new Date().toISOString()
        })
        .eq('id', combatId);
      
      // Award experience and gold
      await supabase
        .from('characters')
        .update({
          experience: character.experience + monster.experience_reward,
          gold: character.gold + monster.gold_reward
        })
        .eq('id', character.id);
      
      // Get updated combat
      const { data: updatedCombat, error: updateError } = await supabase
        .from('combat')
        .select('*, monster:monster_id(*), turns:combat_turns(*)')
        .eq('id', combatId)
        .single();
      
      if (updateError) {
        console.error('Error getting updated combat:', updateError);
        return {
          success: false,
          error: 'Failed to get updated combat'
        };
      }
      
      return {
        success: true,
        data: updatedCombat as any
      };
    }
    
    // Monster's turn
    let monsterDamageDealt = monster.attack;
    let monsterEffects = null;
    
    // Apply character defense from equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select('*, armor:armor_id(*), helmet:helmet_id(*)')
      .eq('character_id', character.id)
      .single();
    
    if (!equipmentError && equipment) {
      let defense = 0;
      
      if (equipment.armor) {
        defense += equipment.armor.base_defense || 0;
      }
      
      if (equipment.helmet) {
        defense += equipment.helmet.base_defense || 0;
      }
      
      monsterDamageDealt = Math.max(1, monsterDamageDealt - Math.floor(defense / 2));
    }
    
    // Check for monster abilities
    if (monster.abilities) {
      const abilities = monster.abilities as any;
      
      // Roll for each ability
      for (const [abilityName, ability] of Object.entries(abilities)) {
        const roll = Math.floor(Math.random() * 100) + 1;
        
        if (roll <= (ability as any).chance) {
          // Ability triggers
          if ((ability as any).damage) {
            // Damage ability
            monsterDamageDealt += (ability as any).damage;
          }
          
          if ((ability as any).defense_boost || (ability as any).immobilize || (ability as any).damage_over_time) {
            // Status effect ability
            monsterEffects = {
              ability: abilityName,
              ...ability
            };
          }
        }
      }
    }
    
    // Record monster turn
    await supabase
      .from('combat_turns')
      .insert({
        id: generateId(), // Generate UUID for the record
        combat_id: combatId,
        turn_number: turnNumber,
        actor: 'monster',
        action: 'attack',
        damage_dealt: monsterDamageDealt,
        effects: monsterEffects
      });
    
    // Update character HP
    const characterRemainingHp = Math.max(0, character.current_hitpoints - monsterDamageDealt);
    
    await supabase
      .from('characters')
      .update({
        current_hitpoints: characterRemainingHp
      })
      .eq('id', character.id);
    
    // Check if character is defeated
    if (characterRemainingHp === 0) {
      // Character defeated - end combat
      await supabase
        .from('combat')
        .update({
          is_completed: true,
          is_victory: false,
          turns: turnNumber,
          character_damage_dealt: combat.character_damage_dealt + characterDamageDealt,
          monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt,
          completed_at: new Date().toISOString()
        })
        .eq('id', combatId);
    } else {
      // Combat continues
      await supabase
        .from('combat')
        .update({
          turns: turnNumber,
          character_damage_dealt: combat.character_damage_dealt + characterDamageDealt,
          monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt
        })
        .eq('id', combatId);
    }
    
    // Get updated combat
    const { data: updatedCombat, error: updateError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*), turns:combat_turns(*)')
      .eq('id', combatId)
      .single();
    
    if (updateError) {
      console.error('Error getting updated combat:', updateError);
      return {
        success: false,
        error: 'Failed to get updated combat'
      };
    }
    
    return {
      success: true,
      data: updatedCombat as any
    };
  } catch (err) {
    console.error('Unexpected error in combat turn:', err);
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
