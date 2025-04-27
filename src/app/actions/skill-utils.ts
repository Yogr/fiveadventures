'use server';

import type { Fighter, Skill, Combat } from '@/lib/types';
import type { CombatEffect } from './server-effect-utils';
import { createEffectFromSkill, createEffectFromMonsterAbility } from './server-effect-utils';
import { createClient } from '@/lib/supabase/server';
import {
  getTotalStrength,
  getTotalIntelligence,
  getTotalAgility,
  getTotalLuck,
  getTotalWisdom
} from '@/lib/character-utils';

/**
 * Calculate the attribute value for a fighter (either character or monster)
 * @param fighter The fighter to get attribute value for
 * @param attributeName The name of the attribute
 * @returns Calculated attribute value
 */
export async function getAttributeValue(fighter: Fighter, attributeName: string): Promise<number> {
  // For Characters, use the utility functions that account for equipment bonuses
  if ('class' in fighter && typeof fighter.class === 'string') {
    const character = fighter as any; // Cast to any to avoid TypeScript errors
    switch(attributeName.toLowerCase()) {
      case 'strength': return getTotalStrength(character);
      case 'intelligence': return getTotalIntelligence(character);
      case 'agility': return getTotalAgility(character);
      case 'luck': return getTotalLuck(character);
      case 'wisdom': return getTotalWisdom(character);
      default: return fighter[attributeName as keyof Fighter] as number || 0;
    }
  } else {
    // This is a Monster or other Fighter
    return fighter[attributeName as keyof Fighter] as number || 0;
  }
}

/**
 * Execute a skill
 * @param skill The skill to execute
 * @param caster The entity using the skill (character or monster)
 * @param target The target of the skill
 * @param combat Current combat state for context
 * @returns Damage dealt, healing done, applied effects, and messages
 */
export async function executeSkill(
  skill: Skill,
  caster: Fighter,
  target: Fighter,
  combat: Combat
): Promise<{
  damageDealt: number,
  healingDone: number,
  effectApplied: boolean,
  messages: string[]
}> {
  const messages: string[] = [];
  let damageDealt = 0;
  let healingDone = 0;
  let effectApplied = false;
  
  // Current turn from combat
  const currentTurn = combat.current_turn || 1;
  
  // Process skill effects
  if (skill.effects) {
    const effects = skill.effects as Record<string, any>;
    
    // Get the skill's attribute if specified, or use a default
    let attributeName = skill.attribute || 'strength';
    
    if (!attributeName) {
      // If no attribute specified and caster is character, use primary stat based on class
      if ('class' in caster) {
        switch(caster.class) {
          case 'Warrior': attributeName = 'strength'; break;
          case 'Wizard': attributeName = 'intelligence'; break;
          case 'Thief': attributeName = 'luck'; break;
          case 'Ranger': attributeName = 'agility'; break;
          case 'Cleric': attributeName = 'intelligence'; break;
          default: attributeName = 'strength';
        }
      } else {
        // Default for monsters
        attributeName = 'attack';
      }
    }
    
    // Get the attribute value
    const attributeValue = await getAttributeValue(caster, attributeName);
    
    // Process damage effects
    if (effects.damage_multiplier) {
      // Calculate base damage - use weapon damage if available for characters
      let baseDamage = caster.attack || 5;
      
      if ('class' in caster) {
        const character = caster as any; // Cast to any to avoid TypeScript errors
        if (character.equipment?.weapon) {
          baseDamage = character.equipment.weapon.base_damage || baseDamage;
        }
      }
      
      // Add skill power if available
      const skillPower = skill.power || 0;
      
      // Calculate damage with attribute multiplier
      const attributeMultiplier = 1 + (attributeValue / 50);
      damageDealt = Math.floor((baseDamage + skillPower) * effects.damage_multiplier * attributeMultiplier);
      
      // Apply target defense
      damageDealt = Math.max(1, damageDealt - Math.floor(target.defense / 3));
      
      // Add to messages
      messages.push(`${caster.name} uses ${skill.name} for ${damageDealt} damage.`);
    }
    
    // Process healing effects
    if (effects.healing) {
      // Basic healing amount
      healingDone = effects.healing;
      
      // Scale with attribute if it's a character
      if ('class' in caster && (attributeName === 'intelligence' || attributeName === 'wisdom')) {
        const healingMultiplier = 1 + (attributeValue / 50);
        healingDone = Math.floor(healingDone * healingMultiplier);
      }
      
      // Add to messages
      messages.push(`${caster.name} uses ${skill.name} to heal for ${healingDone} HP.`);
    }
    
    // Apply effects with duration
    if (effects.duration) {
      try {
        // Create effect from skill
        const effect = await createEffectFromSkill(skill, currentTurn);
        if (effect) {
          // Add to messages
          messages.push(`${skill.name} effect applied.`);
          effectApplied = true;
        }
      } catch (err) {
        console.error('Error creating effect from skill:', err);
      }
    }
  }
  
  return {
    damageDealt,
    healingDone,
    effectApplied,
    messages
  };
}

/**
 * Apply status effects to a combat
 * @param combatId The combat ID
 * @param effect The effect to apply
 * @param sourceType 'character' or 'monster' indicating who created the effect
 * @param targetType 'player_effects' or 'enemy_effects' indicating which array to update
 */
export async function applyEffectToCombat(
  combatId: string,
  effect: CombatEffect,
  sourceType: 'character' | 'monster',
  targetType: 'player_effects' | 'enemy_effects'
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current combat state
    const { data: combat, error } = await supabase
      .from('combat')
      .select(`
        *,
        ${targetType}
      `)
      .eq('id', combatId)
      .single();
    
    if (error || !combat) {
      console.error('Error getting combat:', error);
      return false;
    }
    
    // Get current effects array
    const currentEffects = combat[targetType] || [];
    
    // Create an array if it doesn't exist
    const updatedEffects = Array.isArray(currentEffects) ? [...currentEffects] : [];
    
  // Check if this effect already exists (by name/source)
  const existingEffectIndex = updatedEffects.findIndex(e => 
    e.name === effect.name && e.source === effect.source
  );
  
  if (existingEffectIndex >= 0) {
    // Update existing effect's duration by resetting its turn_applied
    updatedEffects[existingEffectIndex] = {
      ...updatedEffects[existingEffectIndex],
      turn_applied: effect.turn_applied,
      // Preserve the original effect ID
      id: updatedEffects[existingEffectIndex].id
    };
    console.log(`Updated existing effect: ${effect.name}`);
  } else {
    // Add as a new effect
    updatedEffects.push(effect);
    console.log(`Added new effect: ${effect.name}`);
  }
    
    // Update combat record
    const { error: updateError } = await supabase
      .from('combat')
      .update({ [targetType]: updatedEffects })
      .eq('id', combatId);
    
    if (updateError) {
      console.error('Error updating combat effects:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error applying effect to combat:', err);
    return false;
  }
}

/**
 * Process active effects on fighters
 * @param combat Current combat state with player and monster effects
 * @param currentTurn Current combat turn
 * @returns Messages generated from processing effects and damage/healing values
 */
export async function processActiveEffects(
  combat: Combat,
  currentTurn: number
): Promise<{
  playerDamageFromEffects: number,
  playerHealingFromEffects: number,
  monsterDamageFromEffects: number,
  monsterHealingFromEffects: number,
  messages: string[]
}> {
  const messages: string[] = [];
  let playerDamageFromEffects = 0;
  let playerHealingFromEffects = 0;
  let monsterDamageFromEffects = 0;
  let monsterHealingFromEffects = 0;
  
  // Process player effects (effects on the player)
  if (Array.isArray(combat.player_effects)) {
    // Cast to CombatEffect[] to work with TypeScript
    const playerEffects = combat.player_effects as unknown as CombatEffect[];
    
    for (const effect of playerEffects) {
      // Skip invalid effects or effects without durations
      if (!effect || !effect.duration || !effect.turn_applied) continue;
      
      // When an effect is applied on Turn X with duration Y:
      // - On Turn X, it should show Y remaining turns
      // - On Turn X+1, it should show Y-1 remaining turns
      // - On Turn X+Y, it should show 1 remaining turn (last turn active)
      // - On Turn X+Y+1, it should be gone (0 remaining)
      const turnsPassed = currentTurn - effect.turn_applied;
      const isActive = turnsPassed < (effect.duration + 1);
      
      if (isActive) {
        // Apply damage over time
        if (effect.damage_over_time) {
          playerDamageFromEffects += effect.damage_over_time;
          messages.push(`${effect.name} deals ${effect.damage_over_time} damage to the player.`);
        }
        
        // Apply healing over time
        if (effect.healing_over_time) {
          playerHealingFromEffects += effect.healing_over_time;
          messages.push(`${effect.name} heals the player for ${effect.healing_over_time} HP.`);
        }
      } else {
        messages.push(`${effect.name} effect has expired.`);
      }
    }
  }
  
  // Process monster effects (effects on the monster)
  if (Array.isArray(combat.enemy_effects)) {
    // Cast to CombatEffect[] to work with TypeScript  
    const enemyEffects = combat.enemy_effects as unknown as CombatEffect[];
    
    for (const effect of enemyEffects) {
      // Skip invalid effects or effects without durations
      if (!effect || !effect.duration || !effect.turn_applied) continue;
      
      // Check if effect is still active
      // Using <= instead of < to ensure effect lasts for full duration
      const turnsPassed = currentTurn - effect.turn_applied;
      const isActive = turnsPassed <= effect.duration;
      
      if (isActive) {
        // Apply damage over time
        if (effect.damage_over_time) {
          monsterDamageFromEffects += effect.damage_over_time;
          messages.push(`${effect.name} deals ${effect.damage_over_time} damage to the monster.`);
        }
        
        // Apply healing over time
        if (effect.healing_over_time) {
          monsterHealingFromEffects += effect.healing_over_time;
          messages.push(`${effect.name} heals the monster for ${effect.healing_over_time} HP.`);
        }
      } else {
        messages.push(`${effect.name} effect has expired.`);
      }
    }
  }
  
  return {
    playerDamageFromEffects,
    playerHealingFromEffects,
    monsterDamageFromEffects,
    monsterHealingFromEffects,
    messages
  };
}
