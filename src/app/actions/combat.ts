'use server';

import type {
  ApiResponse,
  Combat,
  Character,
  Monster,
  Item,
  Skill
} from '@/lib/types';
import { getCharacterById } from './character';
import { getPrimaryStat, generateId } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { updateCombatEffects, incrementCombatTurn, applySkillEffect, applyMonsterAbilityEffect } from './effect-helpers';
import {
  getTotalStrength,
  getTotalIntelligence,
  getTotalAgility,
  getTotalLuck,
  calculateTotalDamage,
  calculateTotalDefense,
  getTotalMaxHitpoints
} from '@/lib/character-utils';

// Get combat data
export async function getCombat(
  combatId: string
): Promise<ApiResponse<Combat>> {
  try {
    console.log('Combat: Getting combat data for ID:', combatId);
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('combat')
      .select(`
        *,
        monster:monster_id(*),
        player_effects,
        enemy_effects
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
    
    console.log('Combat: Retrieved combat data:', {
      id: data.id,
      is_completed: data.is_completed,
      is_victory: data.is_victory,
      current_turn: data.current_turn || 1
    });
    
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

// Start a combat turn
export async function startCombatTurn(
  combatId: string,
  action: string,
  skill?: Skill | null,
): Promise<ApiResponse<Combat>> {
  try {
    const supabase = await createClient();

    // Get the combat data
    const { data: combat, error: combatError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*), character:character_id(*), player_effects, enemy_effects')
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
    const currentTurn = combat.current_turn || 1;
    
    // Initialize combat log for this turn
    let combatLog = combat.combat_log || [];
    
    // Process character action
    let characterDamageDealt = 0;
    let characterHealingDone = 0;
    
    const character = combat.character as Character;
    const monster = combat.monster as Monster;
    
    // Filter active effects before the turn starts
    await updateCombatEffects(combatId);
    
    // Calculate character damage based on action
    if (action === 'attack') {
      // Basic attack
      // Get character's weapon
      const { data: weaponEquipment, error: equipmentError } = await supabase
        .from('character_equipment')
        .select('*, weapon:weapon_id(*)')
        .eq('character_id', character.id)
        .single();
      
      // Calculate total damage using the same function as in the character display
      let baseDamage = calculateTotalDamage(character);
      
      // Add randomness (±20%)
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      characterDamageDealt = Math.floor(baseDamage * randomFactor);
      
      // Apply monster defense (reduced impact)
      characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 3));
      
      console.log(`Combat: Character basic attack - Base damage: ${baseDamage}, Final damage: ${characterDamageDealt}`);
      
      // Add to combat log
      combatLog.push(`${character.name} attacks for ${characterDamageDealt} damage.`);
    } else if (action === 'skill' && skill) {
      
      // Check if character has enough energy
      if (character.current_energy < skill.energy_cost) {
        return {
          success: false,
          error: 'Not enough energy'
        };
      }
      
      // Process skill effects
      if (skill.effects) {
        const effects = skill.effects as Record<string, any>;
        
        // Get the skill's attribute if specified, or use the character's primary attribute
        let attributeValue = 0;
        let attributeName = skill.attribute || '';
        
        if (!attributeName) {
          // If no attribute specified, use primary stat based on class
          switch(character.class) {
            case 'Warrior': attributeName = 'strength'; break;
            case 'Wizard': attributeName = 'intelligence'; break;
            case 'Thief': attributeName = 'luck'; break;
            case 'Ranger': attributeName = 'agility'; break;
            case 'Cleric': attributeName = 'intelligence'; break;
            default: attributeName = 'strength';
          }
        }
        
        // Get the total attribute value including equipment bonuses
        switch(attributeName) {
          case 'strength': attributeValue = getTotalStrength(character); break;
          case 'intelligence': attributeValue = getTotalIntelligence(character); break;
          case 'agility': attributeValue = getTotalAgility(character); break;
          case 'luck': attributeValue = getTotalLuck(character); break;
          default: attributeValue = getPrimaryStat(character);
        }
        
        if (effects.damage_multiplier) {
          // Damage skill
          // Use weapon damage if available, otherwise use base damage of 5
          let baseDamage = 5;
          if (character.equipment?.weapon) {
            baseDamage = character.equipment.weapon.base_damage || 5;
          }
          
          // Add skill power if available
          const skillPower = skill.power || 0;
          
          // Calculate damage with exponential multiplier based on attribute
          // Formula: (baseDamage + skillPower) * damageMultiplier * (1 + (attributeValue / 50))
          const attributeMultiplier = 1 + (attributeValue / 50);
          characterDamageDealt = Math.floor((baseDamage + skillPower) * effects.damage_multiplier * attributeMultiplier);
          
          // Apply monster defense
          characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 3));
          
          console.log(`Combat: Skill attack - Base damage: ${baseDamage}, Skill power: ${skillPower}, Attribute: ${attributeName}(${attributeValue}), Multiplier: ${effects.damage_multiplier}, Final damage: ${characterDamageDealt}`);
          
          // Add to combat log
          combatLog.push(`${character.name} uses ${skill.name} for ${characterDamageDealt} damage.`);
        }
        
        if (effects.healing) {
          // Healing skill
          characterHealingDone = effects.healing;
          
          // Add to combat log
          combatLog.push(`${character.name} uses ${skill.name} to heal for ${characterHealingDone} HP.`);
        }
        
        // Apply skill effects to combat record if it has a duration
        if (effects.duration) {
          console.log('Combat: Applying skill effect to combat record');
          // For character skills, effects are applied to the monster (enemy_effects)
          await applySkillEffect(combatId, skill, 'character');
          
          // Add to combat log
          combatLog.push(`${skill.name} effect applied to ${monster.name}.`);
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
      
      console.log(`Combat: Run attempt - Roll: ${roll}, Chance: ${runChance}, Success: ${roll <= runChance}`);
      
      // Add to combat log
      combatLog.push(`${character.name} attempts to run away.`);
      
      if (roll <= runChance) {
        // Success - end combat immediately
        // Add to combat log
        combatLog.push(`${character.name} successfully escaped!`);
        
        await supabase
          .from('combat')
          .update({
            is_completed: true,
            is_victory: false,
            combat_log: combatLog,
            completed_at: new Date().toISOString()
          })
          .eq('id', combatId);
        
        // Increment daily adventure count when successfully running away
        console.log('Combat: Character successfully ran away - updating adventure count');
        
        const newAdventureCount = character.daily_adventure_count + 1;
        
        const { error: characterUpdateError } = await supabase
          .from('characters')
          .update({
            daily_adventure_count: newAdventureCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', character.id);
        
        if (characterUpdateError) {
          console.error('Error updating character after running away:', characterUpdateError);
        } else {
          console.log('Character successfully updated after running away');
        }
        
        // Get updated combat
        const { data: updatedCombat } = await supabase
          .from('combat')
          .select('*, monster:monster_id(*), player_effects, enemy_effects')
          .eq('id', combatId)
          .single();
        
        // CRITICAL FIX: Return immediately after successful run, monster doesn't get a turn
        return {
          success: true,
          data: updatedCombat as Combat
        };
      } else {
        // Failed to run
        console.log('Combat: Run attempt failed, monster gets to attack');
        
        // Add to combat log
        combatLog.push(`${character.name} failed to escape!`);
      }
    }
    
    // Apply healing if any
    if (characterHealingDone > 0) {
      await supabase
        .from('characters')
        .update({
          current_hitpoints: Math.min(getTotalMaxHitpoints(character), character.current_hitpoints + characterHealingDone)
        })
        .eq('id', character.id);
    }
    
    // Calculate total damage dealt to monster (accumulate previous + current turn damage)
    const totalDamageDealt = combat.character_damage_dealt + characterDamageDealt;
    
    // Update monster HP based on total accumulated damage
    const monsterRemainingHp = Math.max(0, monster.hitpoints - totalDamageDealt);
    
    console.log(`Combat: Monster HP calculation - Initial HP: ${monster.hitpoints}, Previous Damage: ${combat.character_damage_dealt}, New Damage: ${characterDamageDealt}, Total Damage: ${totalDamageDealt}, Remaining HP: ${monsterRemainingHp}`);
    
    // Check if monster is defeated
    if (monsterRemainingHp === 0) {
      // Monster defeated - This section handles the COMPLETE combat ending process including:
      // 1. Marking combat as completed
      // 2. Awarding experience and gold
      // 3. Incrementing adventure count
      // 4. Updating all necessary database records
      
      // Add to combat log
      combatLog.push(`${monster.name} was defeated!`);
      
      console.log('Combat: Monster defeated - processing complete victory flow');
      await supabase
        .from('combat')
        .update({
          is_completed: true,
          is_victory: true,
          current_turn: currentTurn + 1,
          character_damage_dealt: totalDamageDealt,
          combat_log: combatLog,
          completed_at: new Date().toISOString()
        })
        .eq('id', combatId);
      
      // Add rewards to character in a single transaction
      const { error: updateExpGoldError } = await supabase
        .from('characters')
        .update({
          experience: character.experience + monster.experience_reward,
          gold: character.gold + monster.gold_reward,
          updated_at: new Date().toISOString() // Force update timestamp
        })
        .eq('id', character.id);
        
      if (updateExpGoldError) {
        console.error('Combat: Failed to update character experience and gold:', updateExpGoldError);
        return {
          success: false,
          error: 'Failed to update character with rewards'
        };
      }
      
      console.log('Combat: Added rewards to character:', {
        experienceAdded: monster.experience_reward,
        goldAdded: monster.gold_reward,
        newExperience: character.experience + monster.experience_reward,
        newGold: character.gold + monster.gold_reward
      });
      
      // Increment adventure count in a separate transaction to ensure it's updated correctly
      const { error: updateAdventureCountError } = await supabase
        .from('characters')
        .update({
          daily_adventure_count: character.daily_adventure_count + 1,
          updated_at: new Date().toISOString() // Force update timestamp
        })
        .eq('id', character.id);

      console.log('Combat: Adventure count updated to:', character.daily_adventure_count + 1);
        
      if (updateAdventureCountError) {
        console.error('Combat: Error updating adventure count:', updateAdventureCountError);
        // Continue anyway, this isn't as critical as the rewards
      }
      
      // Update the adventure state to outcome to properly transition to the outcome screen
      const { error: updateAdventureStateError } = await supabase
        .from('character_adventures')
        .upsert(
          {
            character_id: character.id,
            current_state: 'outcome',
            combat_id: null,
            day: character.last_played_day,
            adventure_number: character.daily_adventure_count,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'character_id' }
        );
      
      if (updateAdventureStateError) {
        console.error('Combat: Error updating adventure state:', updateAdventureStateError);
        // Continue anyway, this isn't critical
      }
      
      // Verify all updates by fetching the character data
      const { data: verifiedCharacter, error: verifyError } = await supabase
        .from('characters')
        .select('*')
        .eq('id', character.id)
        .single();
        
      if (verifyError || !verifiedCharacter) {
        console.error('Error verifying character update:', verifyError);
      } else {
        console.log('CRITICAL: Verified character update:', {
          characterId: verifiedCharacter.id,
          experience: verifiedCharacter.experience,
          expectedExperience: character.experience + monster.experience_reward,
          gold: verifiedCharacter.gold,
          expectedGold: character.gold + monster.gold_reward,
          daily_adventure_count: verifiedCharacter.daily_adventure_count
        });
        
        // Double-check if the update was successful
        if (verifiedCharacter.experience !== character.experience + monster.experience_reward ||
            verifiedCharacter.gold !== character.gold + monster.gold_reward) {
          console.error('EMERGENCY ERROR: Character update verification failed!');
          
          // One last desperate attempt with a different approach
          console.log('EMERGENCY: Making one final attempt to update rewards');
          
          // Try a different approach - use raw SQL via RPC if available
          try {
            // Direct SQL-like update as a last resort
            const { error: finalUpdateError } = await supabase
              .from('characters')
              .update({
                experience: verifiedCharacter.experience + monster.experience_reward,
                gold: verifiedCharacter.gold + monster.gold_reward,
                updated_at: new Date().toISOString() // Force update timestamp
              })
              .eq('id', character.id);
              
            if (finalUpdateError) {
              console.error('EMERGENCY ERROR: Final update attempt failed:', finalUpdateError);
            } else {
              console.log('EMERGENCY: Final update attempt completed');
            }
          } catch (finalError) {
            console.error('EMERGENCY ERROR: Exception in final update attempt:', finalError);
          }
        }
      }
      
      // Get updated combat with effects
      const { data: updatedCombat, error: updateError } = await supabase
        .from('combat')
        .select('*, monster:monster_id(*), player_effects, enemy_effects')
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
        data: updatedCombat as Combat
      };
    }
    
    if (monsterRemainingHp > 0) {
      // Monster's turn
      // Base damage with randomness (±20%)
      const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
      let monsterDamageDealt = Math.floor(monster.attack * randomFactor);
      
      // Calculate total defense using the same function as in the character display
      const totalDefense = calculateTotalDefense(character);
      
      // Reduced impact of defense
      monsterDamageDealt = Math.max(1, monsterDamageDealt - Math.floor(totalDefense / 3));
      
      console.log(`Combat: Monster attack - Damage: ${monsterDamageDealt}, Character defense: ${totalDefense}`);
      
      // Add to combat log
      combatLog.push(`${monster.name} attacks for ${monsterDamageDealt} damage.`);
      
      // Check for monster abilities
      if (monster.abilities) {
        const abilities = monster.abilities as Record<string, any>;
        
        // Roll for each ability
        for (const [abilityName, ability] of Object.entries(abilities)) {
          const roll = Math.floor(Math.random() * 100) + 1;
          const typedAbility = ability as Record<string, any>;
          
          if (roll <= typedAbility.chance) {
            // Ability triggers
            if (typedAbility.damage) {
              // Damage ability
              monsterDamageDealt += typedAbility.damage;
              
              // Add to combat log
              combatLog.push(`${monster.name} uses ${abilityName} for ${typedAbility.damage} additional damage.`);
            }
            
            if (typedAbility.defense_boost || typedAbility.immobilize || typedAbility.damage_over_time) {
              // Status effect ability
              // Add to combat log
              combatLog.push(`${monster.name} uses ${abilityName} ability.`);
              
              // Apply monster ability effect to combat record if it has a duration
              if (typedAbility.duration) {
                console.log('Combat: Applying monster ability effect to combat record');
                await applyMonsterAbilityEffect(combatId, abilityName, typedAbility);
                
                // Add to combat log
                combatLog.push(`${abilityName} effect applied to ${character.name}.`);
              }
            }
          }
        }
      }
      
      // Update character HP
      character.current_hitpoints = Math.max(0, character.current_hitpoints - monsterDamageDealt);
      
      await supabase
        .from('characters')
        .update({
          current_hitpoints: character.current_hitpoints
        })
        .eq('id', character.id);
    
      // Check if character is defeated
      if (character.current_hitpoints === 0) {
        // Character defeated - end combat
        // Add to combat log
        combatLog.push(`${character.name} was defeated!`);
        
        await supabase
          .from('combat')
          .update({
            is_completed: true,
            is_victory: false,
            current_turn: currentTurn + 1,
            character_damage_dealt: totalDamageDealt,
            monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt,
            combat_log: combatLog,
            completed_at: new Date().toISOString()
          })
          .eq('id', combatId);
      } else {
        // Combat continues
        await supabase
          .from('combat')
          .update({
            current_turn: currentTurn + 1,
            character_damage_dealt: totalDamageDealt,
            monster_damage_dealt: combat.monster_damage_dealt + monsterDamageDealt,
            combat_log: combatLog
          })
          .eq('id', combatId);
      }
    }
    
    // Update combat effects - filter out expired effects
    await updateCombatEffects(combatId);
    
    // Get updated combat
    const { data: updatedCombat, error: updateError } = await supabase
      .from('combat')
      .select('*, monster:monster_id(*), player_effects, enemy_effects')
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
      data: updatedCombat as Combat
    };
  } catch (err) {
    console.error('Unexpected error in combat turn:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Check if a character is in active combat
export async function getActiveCharacterCombat(
  characterId: string
): Promise<ApiResponse<Combat | null>> {
  try {
    const supabase = await createClient();

    // Query for active combat for this character
    const { data, error } = await supabase
      .from('combat')
      .select(`
        *,
        monster:monster_id(*),
        player_effects,
        enemy_effects
      `)
      .eq('character_id', characterId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      // If no data found, return null (not an error)
      if (error.code === 'PGRST116') {
        return {
          success: true,
          data: null
        };
      }
      
      console.error('Error checking for active combat:', error);
      return {
        success: false,
        error: 'Failed to check for active combat'
      };
    }
    
    return {
      success: true,
      data: data as Combat
    };
  } catch (err) {
    console.error('Unexpected error checking for active combat:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get character skills
export async function getCharacterSkills(
  characterId: string
): Promise<ApiResponse<Array<Skill & { learned: boolean; level: number }>>> {
  try {
    const supabase = await createClient();

    console.log('getCharacterSkills: Fetching skills for character ID:', characterId);

    // Get character data to check class and level
    const characterResponse = await getCharacterById(characterId);
    if (!characterResponse.success || !characterResponse.data) {
      console.error('getCharacterSkills: Character not found');
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    const character = characterResponse.data;
    console.log('getCharacterSkills: Character info:', {
      id: character.id,
      name: character.name,
      class: character.class,
      level: character.level
    });
    
    // Get skills for character's class AND level_required <= character.level
    console.log('getCharacterSkills: Querying skills for class and level:', {
      class: character.class,
      level_required_lte: character.level
    });
    
    const { data: classSkills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('class', character.class)
      .lte('level_required', character.level);
    
    if (skillsError) {
      console.error('getCharacterSkills: Error getting skills:', skillsError);
      return {
        success: false,
        error: 'Failed to get skills'
      };
    }
    
    console.log('getCharacterSkills: Found class skills:', {
      count: classSkills?.length || 0,
      skills: classSkills?.map(s => `${s.name} (level ${s.level_required})`) || []
    });
    
    
    console.log('getCharacterSkills: Returning combined skills data:', {
      totalSkills: classSkills.length,
      skillNames: classSkills.map(s => s.name)
    });
    
    return {
      success: true,
      data: classSkills
    };
  } catch (err) {
    console.error('Unexpected error getting character skills:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Upgrade a skill
export async function upgradeSkill(
  characterId: string,
  skillId: number
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    // Get current skill level
    const { data: characterSkill, error: skillError } = await supabase
      .from('character_skills')
      .select('*')
      .eq('character_id', characterId)
      .eq('skill_id', skillId)
      .single();
    
    if (skillError || !characterSkill) {
      return {
        success: false,
        error: 'Character does not have this skill'
      };
    }
    
    // Upgrade skill
    const { error } = await supabase
      .from('character_skills')
      .update({
        level: characterSkill.level + 1
      })
      .eq('id', characterSkill.id);
    
    if (error) {
      console.error('Error upgrading skill:', error);
      return {
        success: false,
        error: 'Failed to upgrade skill'
      };
    }
    
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error upgrading skill:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}
