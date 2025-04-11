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

// Get combat data
export async function getCombat(
  combatId: string
): Promise<ApiResponse<Combat>> {
  try {
    const supabase = await createClient();
    
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

// Start a combat turn
export async function startCombatTurn(
  combatId: string,
  action: string,
  skillId?: number
): Promise<ApiResponse<Combat>> {
  try {
    const supabase = await createClient();

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
      const { data: weaponEquipment, error: equipmentError } = await supabase
        .from('character_equipment')
        .select('*, weapon:weapon_id(*)')
        .eq('character_id', character.id)
        .single();
      
      // Get primary stat based on class
      const primaryStat = getPrimaryStat(character);
      
      let baseDamage = 5; // Default base damage
      let statBonus = Math.floor(primaryStat / 2);
      
      if (!equipmentError && weaponEquipment && weaponEquipment.weapon) {
        // Check if weapon is an Item object with base_damage property
        const weapon = weaponEquipment.weapon as unknown as Item;
        if (weapon && typeof weapon === 'object' && 'base_damage' in weapon) {
          baseDamage = weapon.base_damage || 5;
        }
        
        // Base damage with randomness (±20%)
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        characterDamageDealt = Math.floor((baseDamage + statBonus) * randomFactor);
      } else {
        // Unarmed attack with randomness
        const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
        characterDamageDealt = Math.floor((3 + Math.floor(primaryStat / 3)) * randomFactor);
      }
      
      // Apply monster defense (reduced impact)
      characterDamageDealt = Math.max(1, characterDamageDealt - Math.floor(monster.defense / 3));
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
        const effects = skill.effects as Record<string, any>;
        
        if (effects.damage_multiplier) {
          // Damage skill
          const baseDamage = 5; // Base damage
          const statBonus = character.class === 'Wizard' ? character.intelligence : character.strength;
          characterDamageDealt = Math.floor(baseDamage * effects.damage_multiplier) + Math.floor(statBonus / 2);
          
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
          } as Combat
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
        data: updatedCombat as Combat
      };
    }
    
    // Monster's turn
    // Base damage with randomness (±20%)
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    let monsterDamageDealt = Math.floor(monster.attack * randomFactor);
    let monsterEffects = null;
    
    // Apply character defense from equipment
    const { data: defenseEquipment, error: defenseEquipmentError } = await supabase
      .from('character_equipment')
      .select('*, armor:armor_id(*), helmet:helmet_id(*)')
      .eq('character_id', character.id)
      .single();
    
    if (!defenseEquipmentError && defenseEquipment) {
      let defense = 0;
      
      // Check if armor is an Item object with base_defense property
      if (defenseEquipment.armor) {
        const armor = defenseEquipment.armor as unknown as Item;
        if (armor && typeof armor === 'object' && 'base_defense' in armor) {
          defense += armor.base_defense || 0;
        }
      }
      
      // Check if helmet is an Item object with base_defense property
      if (defenseEquipment.helmet) {
        const helmet = defenseEquipment.helmet as unknown as Item;
        if (helmet && typeof helmet === 'object' && 'base_defense' in helmet) {
          defense += helmet.base_defense || 0;
        }
      }
      
      // Reduced impact of defense
      monsterDamageDealt = Math.max(1, monsterDamageDealt - Math.floor(defense / 3));
    }
    
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
          }
          
          if (typedAbility.defense_boost || typedAbility.immobilize || typedAbility.damage_over_time) {
            // Status effect ability
            monsterEffects = {
              ability: abilityName,
              ...typedAbility
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
        monster:monster_id(*)
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

    // Get character data to check class
    const characterResponse = await getCharacterById(characterId);
    if (!characterResponse.success || !characterResponse.data) {
      return {
        success: false,
        error: 'Character not found'
      };
    }
    
    const character = characterResponse.data;
    
    // Get skills for character's class
    const { data: classSkills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('class', character.class);
    
    if (skillsError) {
      console.error('Error getting skills:', skillsError);
      return {
        success: false,
        error: 'Failed to get skills'
      };
    }
    
    // Get character's learned skills
    const { data: characterSkills, error: characterSkillsError } = await supabase
      .from('character_skills')
      .select('*, skill:skill_id(*)')
      .eq('character_id', characterId);
    
    if (characterSkillsError) {
      console.error('Error getting character skills:', characterSkillsError);
      // Continue anyway, character might not have any skills yet
    }
    
    // Combine skills data
    const skills = classSkills?.map(skill => {
      const characterSkill = characterSkills?.find(cs => cs.skill_id === skill.id);
      return {
        ...skill,
        learned: !!characterSkill,
        level: characterSkill?.level || 0
      };
    }) || [];
    
    return {
      success: true,
      data: skills
    };
  } catch (err) {
    console.error('Unexpected error getting character skills:', err);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Learn a skill
export async function learnSkill(
  characterId: string,
  skillId: number
): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient();

    // Check if character already has this skill
    const { data: existingSkill, error: existingSkillError } = await supabase
      .from('character_skills')
      .select('*')
      .eq('character_id', characterId)
      .eq('skill_id', skillId)
      .single();
    
    if (existingSkill) {
      return {
        success: false,
        error: 'Character already has this skill'
      };
    }
    
    // Add skill to character
    const { error } = await supabase
      .from('character_skills')
      .insert({
        id: generateId(), // Generate UUID for the record
        character_id: characterId,
        skill_id: skillId,
        level: 1,
        acquired_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error learning skill:', error);
      return {
        success: false,
        error: 'Failed to learn skill'
      };
    }
    
    return {
      success: true,
      data: null
    };
  } catch (err) {
    console.error('Unexpected error learning skill:', err);
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
