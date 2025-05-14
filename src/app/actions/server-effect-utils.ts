'use server';

import type { Skill } from '@/lib/types';
import { determineEffectType as determineEffectTypeFromCentral } from '@/lib/effect-types'

/**
 * Represents a combat effect applied to a character or monster
 */
export interface CombatEffect {
  id: string;           // Unique identifier for the effect
  name: string;         // Display name
  type?: string;        // Effect type (buff, debuff)
  source: string;       // Skill or ability that caused it
  turn_applied: number; // Turn when the effect was applied
  duration?: number;    // Total duration in turns (if applicable)
  image_url?: string;   // Icon to display
  
  // Effect-specific properties
  strength_boost?: number;
  intelligence_boost?: number;
  agility_boost?: number;
  luck_boost?: number;
  wisdom_boost?: number;
  
  defense_boost?: number;
  damage_boost?: number;
  damage_multiplier?: number;
  
  slow?: number;
  stun?: boolean;
  immobilize?: boolean;
  
  damage_over_time?: number;
  healing?: number;
  healing_over_time?: number;
  
  shield?: number;
  
  gold_chance?: number;
  item_chance?: number;
  
  // Additional properties allowed
  [key: string]: any;
}

/**
 * Manually determine if an effect is a buff or debuff based on its properties
 * Server-side version
 */
export async function determineEffectType(effect: Record<string, any>): Promise<'buff' | 'debuff' | undefined> {
  return determineEffectTypeFromCentral(effect);
}

/**
 * Filter out expired effects based on current turn
 * Server-side version
 */
export async function filterActiveEffects(
  effects: CombatEffect[], 
  currentTurn: number
): Promise<CombatEffect[]> {
  // Make sure effects is an array
  const effectsArray = Array.isArray(effects) ? effects : [];
  
  return effectsArray.filter(effect => {
    // If no duration, effect is permanent
    if (!effect.duration) return true;
    
    // When an effect is applied on Turn X with duration Y:
    // - On Turn X, it should show Y remaining turns
    // - On Turn X+1, it should show Y-1 remaining turns
    // - On Turn X+Y, it should show 1 remaining turn (last turn active)
    // - On Turn X+Y+1, it should be gone (0 remaining)
    const turnsPassed = currentTurn - effect.turn_applied;
    
    // Add 1 to duration to make it work as expected
    return turnsPassed <= effect.duration;
  });
}

/**
 * Create an effect object from a skill
 * Server-side version
 */
export async function createEffectFromSkill(
  skill: Skill, 
  currentTurn: number
): Promise<CombatEffect | null> {
  if (!skill.effects || typeof skill.effects !== 'object') return null;
  
  // Convert skill effects to CombatEffect
  const skillEffects = skill.effects as Record<string, any>;
  
  const effectObj: CombatEffect = {
    id: `${skill.id}_${Date.now()}`,
    name: skill.name,
    source: skill.name,
    turn_applied: currentTurn
  };
  
  // Handle image_url separately to convert null to undefined
  if (skill.image_url !== null) {
    effectObj.image_url = skill.image_url;
  }
  
  // Copy all properties from skill effects
  Object.entries(skillEffects).forEach(([key, value]) => {
    (effectObj as any)[key] = value;
  });
  
  // Determine effect type (handle null/undefined properly)
  const effectType = await determineEffectType(skillEffects);
  if (effectType) {
    effectObj.type = effectType;
  }
  
  return effectObj;
}

/**
 * Create an effect object from a monster ability
 * Server-side version
 */
export async function createEffectFromMonsterAbility(
  abilityName: string,
  ability: Record<string, any>,
  currentTurn: number
): Promise<CombatEffect | null> {
  // Convert ability to CombatEffect
  const effectObj: CombatEffect = {
    id: `monster_${abilityName}_${Date.now()}`,
    name: abilityName,
    source: 'monster_ability',
    turn_applied: currentTurn
  };
  
  // Copy all properties from ability
  Object.entries(ability).forEach(([key, value]) => {
    (effectObj as any)[key] = value;
  });
  
  // Determine effect type (handle null/undefined properly)
  const effectType = await determineEffectType(ability);
  if (effectType) {
    effectObj.type = effectType;
  }
  
  return effectObj;
}
