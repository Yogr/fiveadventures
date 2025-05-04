'use server';

import { createClient } from '@/lib/supabase/server';
import { createEffectFromSkill, createEffectFromMonsterAbility, filterActiveEffects, type CombatEffect } from './server-effect-utils';
import type { Skill } from '@/lib/types';

/**
 * Apply a skill effect to combat
 */
export async function applySkillEffect(
  combatId: string,
  skill: Skill,
  actor: 'character' | 'monster'
): Promise<boolean> {
  // Import directly here to avoid circular dependencies
  const { applyEffectToCombat } = await import('./skill-utils');
  
  try {
    const supabase = await createClient();
    
    // Get current combat state
    const { data: combat, error } = await supabase
      .from('combat')
      .select('*, player_effects, enemy_effects, current_turn')
      .eq('id', combatId)
      .single();
    
    if (error || !combat) {
      console.error('Error getting combat:', error);
      return false;
    }
    
    const currentTurn = combat.current_turn || 1;
    
    // Create effect from skill
    const effect = await createEffectFromSkill(skill, currentTurn);
    if (!effect) return false;
    
    // Determine which effects array to update based on skill type and target
    // Get skill type and target, defaulting if not specified
    const skillType = skill.skillType || (effect.type === 'buff' ? 'buff' : 'debuff');
    const skillTarget = skill.target || (skillType === 'buff' ? 'self' : 'singleEnemy');
    
    let targetField: 'player_effects' | 'enemy_effects';
    
    if (actor === 'character') {
      // For character skills
      if (skillType === 'buff' || skillTarget === 'self' || skillTarget === 'team') {
        targetField = 'player_effects'; // Buffs always go to player
      } else {
        targetField = 'enemy_effects';  // Debuffs and damage go to enemy
      }
    } else {
      // For monster skills
      if (skillType === 'buff' || skillTarget === 'self' || skillTarget === 'team') {
        targetField = 'enemy_effects';  // Buffs always go to monster
      } else {
        targetField = 'player_effects'; // Debuffs and damage go to player
      }
    }
    
    // Apply the effect to the combat using our utility function - pass supabase client
    return await applyEffectToCombat(combatId, effect, actor, targetField, supabase);
  } catch (err) {
    console.error('Error applying skill effect:', err);
    return false;
  }
}

/**
 * Apply a monster ability effect to combat
 */
export async function applyMonsterAbilityEffect(
  combatId: string,
  abilityName: string,
  ability: Record<string, any>
): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current combat state
    const { data: combat, error } = await supabase
      .from('combat')
      .select('*, player_effects, enemy_effects, current_turn')
      .eq('id', combatId)
      .single();
    
    if (error || !combat) {
      console.error('Error getting combat:', error);
      return false;
    }
    
    const currentTurn = combat.current_turn || 1;
    
    // Create effect object from monster ability
    const effect = await createEffectFromMonsterAbility(abilityName, ability, currentTurn);
    if (!effect) return false;
    
    // Determine if this is a buff or debuff ability
    // For monsters, buffs should go to enemy_effects (themselves)
    // Debuffs should go to player_effects (the player)
    
    // Determine target based on effect type and properties
    let abilityType = 'debuff'; // Default to debuff
    
    // Check if this is likely a buff (self-targeting) ability
    if (effect.defense_boost || 
        effect.strength_boost || 
        effect.agility_boost || 
        effect.healing || 
        effect.healing_over_time) {
      abilityType = 'buff';
    }
    
    const effectField = abilityType === 'buff' ? 'enemy_effects' : 'player_effects';
    
    // Import the applyEffectToCombat function to avoid code duplication
    const { applyEffectToCombat } = await import('./skill-utils');
    
    // Apply the effect using our common utility function
    return await applyEffectToCombat(combatId, effect, 'monster', effectField, supabase);
  } catch (err) {
    console.error('Error applying monster ability effect:', err);
    return false;
  }
}

/**
 * Filter out expired effects from combat and update remaining durations
 * @param combatId The combat ID
 * @param nextTurn The next turn number to calculate remaining durations (optional)
 */
export async function updateCombatEffects(combatId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current combat state
    const { data: combat, error } = await supabase
      .from('combat')
      .select('*, player_effects, enemy_effects, current_turn')
      .eq('id', combatId)
      .single();
    
    if (error || !combat) {
      console.error('Error getting combat:', error);
      return false;
    }
    
    const currentTurn = combat.current_turn || 1;
    
    // Filter out expired effects and update remaining durations
    let playerEffects = await filterActiveEffects(
      Array.isArray(combat.player_effects) ? combat.player_effects : [], 
      currentTurn
    );
    
    let enemyEffects = await filterActiveEffects(
      Array.isArray(combat.enemy_effects) ? combat.enemy_effects : [], 
      currentTurn
    );
    
    
    playerEffects = playerEffects.map(effect => {
      if (!effect.duration) return effect;
      
      // Calculate remaining duration using formula:
      // effectRemainingDuration = effect.duration - (present_turn - (turn_applied+1))
      
      const remainingDuration = effect.duration - (currentTurn - (effect.turn_applied + 1));
      console.log('Remaining duration:', effect.duration, currentTurn, effect.turn_applied + 1);
      console.log('Remaining duration result is:', remainingDuration);
      
      return {
        ...effect,
        remaining_duration: Math.max(0, remainingDuration)
      };
    });
    
    enemyEffects = enemyEffects.map(effect => {
      if (!effect.duration) return effect;
      
      // Calculate remaining duration using formula:
      // effectRemainingDuration = effect.duration - (present_turn - (turn_applied+1))
      const remainingDuration = effect.duration - (currentTurn - (effect.turn_applied + 1));
      
      return {
        ...effect,
        remaining_duration: Math.max(0, remainingDuration)
      };
    });
    
    // Update combat record
    const { error: updateError } = await supabase
      .from('combat')
      .update({
        player_effects: playerEffects,
        enemy_effects: enemyEffects
      })
      .eq('id', combatId);
    
    if (updateError) {
      console.error('Error updating combat effects:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error updating combat effects:', err);
    return false;
  }
}

/**
 * Increment the combat turn counter
 */
export async function incrementCombatTurn(combatId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current combat state
    const { data: combat, error } = await supabase
      .from('combat')
      .select('current_turn')
      .eq('id', combatId)
      .single();
    
    if (error || !combat) {
      console.error('Error getting combat:', error);
      return false;
    }
    
    const currentTurn = combat.current_turn || 1;
    
    // Update combat record
    const { error: updateError } = await supabase
      .from('combat')
      .update({
        current_turn: currentTurn + 1
      })
      .eq('id', combatId);
    
    if (updateError) {
      console.error('Error incrementing combat turn:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error incrementing combat turn:', err);
    return false;
  }
}
