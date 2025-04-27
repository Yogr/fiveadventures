'use server';

import { createClient } from '@/lib/supabase/server';
import { createEffectFromSkill, createEffectFromMonsterAbility, filterActiveEffects } from '@/lib/effect-utils';
import type { CombatEffect } from '@/lib/effect-utils';
import type { Skill } from '@/lib/types';

/**
 * Apply a skill effect to combat
 */
export async function applySkillEffect(
  combatId: string,
  skill: Skill,
  actor: 'character' | 'monster'
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
    
    // Determine which effects array to update
    const effectField = actor === 'character' ? 'enemy_effects' : 'player_effects';
    const currentEffects = combat[effectField] || [];
    const currentTurn = combat.current_turn || 1;
    
    // Create effect object from skill
    const effect = createEffectFromSkill(skill, currentTurn);
    if (!effect) return false;
    
    // Create an array if it doesn't exist
    const updatedEffects = Array.isArray(currentEffects) ? [...currentEffects] : [];
    
    // Add the new effect
    updatedEffects.push(effect);
    
    // Update combat record
    const { error: updateError } = await supabase
      .from('combat')
      .update({ [effectField]: updatedEffects })
      .eq('id', combatId);
    
    if (updateError) {
      console.error('Error updating combat effects:', updateError);
      return false;
    }
    
    return true;
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
    
    // Monster abilities affect the player
    const effectField = 'player_effects';
    const currentEffects = combat[effectField] || [];
    const currentTurn = combat.current_turn || 1;
    
    // Create effect object from monster ability
    const effect = createEffectFromMonsterAbility(abilityName, ability, currentTurn);
    if (!effect) return false;
    
    // Create an array if it doesn't exist
    const updatedEffects = Array.isArray(currentEffects) ? [...currentEffects] : [];
    
    // Add the new effect
    updatedEffects.push(effect);
    
    // Update combat record
    const { error: updateError } = await supabase
      .from('combat')
      .update({ [effectField]: updatedEffects })
      .eq('id', combatId);
    
    if (updateError) {
      console.error('Error updating combat effects:', updateError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error applying monster ability effect:', err);
    return false;
  }
}

/**
 * Filter out expired effects from combat
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
    
    // Filter out expired effects
    const playerEffects = filterActiveEffects(
      Array.isArray(combat.player_effects) ? combat.player_effects : [], 
      currentTurn
    );
    
    const enemyEffects = filterActiveEffects(
      Array.isArray(combat.enemy_effects) ? combat.enemy_effects : [], 
      currentTurn
    );
    
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
