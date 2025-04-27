'use client';

import type { Skill } from '@/lib/types';

/**
 * Manually determine if an effect is a buff or debuff based on its properties
 * This avoids TypeScript issues with importing from character-utils
 */
function determineEffectType(effect: Record<string, any>): 'buff' | 'debuff' | undefined {
  // Define which properties indicate buffs
  const buffProperties = [
    'strength_boost',
    'intelligence_boost',
    'agility_boost',
    'luck_boost',
    'wisdom_boost',
    'healing',
    'shield',
    'defense_boost',
    'gold_chance',
    'exp_boost'
  ];
  
  // Define which properties indicate debuffs
  const debuffProperties = [
    'slow',
    'immobilize',
    'damage_over_time',
    'defense_reduction',
    'attack_reduction',
    'stun'
  ];
  
  // Count how many buff and debuff properties exist in this effect
  const buffCount = buffProperties.filter(prop => effect[prop] !== undefined).length;
  const debuffCount = debuffProperties.filter(prop => effect[prop] !== undefined).length;
  
  // Classify based on which type has more properties
  if (buffCount > 0 && buffCount >= debuffCount) {
    return 'buff';
  } else if (debuffCount > 0) {
    return 'debuff';
  }
  
  // If no recognizable properties, return undefined
  return undefined;
}

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
 * Add an effect to an effects array
 * If an effect with the same ID already exists, it will be replaced (refreshed)
 */
export function addEffect(
  effects: CombatEffect[], 
  newEffect: CombatEffect, 
  currentTurn: number
): CombatEffect[] {
  // Make sure effects is an array
  const effectsArray = Array.isArray(effects) ? effects : [];
  
  // Check if this effect already exists (by id or similar properties)
  const existingIndex = effectsArray.findIndex(e => e.id === newEffect.id);
  
  if (existingIndex >= 0) {
    // Replace the existing effect (refresh duration)
    return [
      ...effectsArray.slice(0, existingIndex),
      { ...newEffect, turn_applied: currentTurn },
      ...effectsArray.slice(existingIndex + 1)
    ];
  } else {
    // Add new effect
    return [...effectsArray, { ...newEffect, turn_applied: currentTurn }];
  }
}

/**
 * Filter out expired effects based on current turn
 */
export function filterActiveEffects(
  effects: CombatEffect[], 
  currentTurn: number
): CombatEffect[] {
  // Make sure effects is an array
  const effectsArray = Array.isArray(effects) ? effects : [];
  
  return effectsArray.filter(effect => {
    // If no duration, effect is permanent
    if (!effect.duration) return true;
    
    // Calculate if effect is still active
    const turnsPassed = currentTurn - effect.turn_applied;
    return turnsPassed < effect.duration;
  });
}

/**
 * Calculate remaining duration for effects and add it as a property
 */
export function getEffectsWithRemainingDuration(
  effects: CombatEffect[], 
  currentTurn: number
): (CombatEffect & { remaining_duration?: number })[] {
  // Make sure effects is an array
  const effectsArray = Array.isArray(effects) ? effects : [];
  
  return effectsArray.map(effect => {
    if (!effect.duration) return effect;
    
    const turnsPassed = currentTurn - effect.turn_applied;
    const remaining = Math.max(0, effect.duration - turnsPassed);
    
    return {
      ...effect,
      remaining_duration: remaining
    };
  });
}

/**
 * Create an effect object from a skill
 */
export function createEffectFromSkill(
  skill: Skill, 
  currentTurn: number
): CombatEffect | null {
  if (!skill.effects || typeof skill.effects !== 'object') return null;
  
  // Convert skill effects to CombatEffect
  const skillEffects = skill.effects as Record<string, any>;
  
  const effectObj: CombatEffect = {
    id: `${skill.id}_${Date.now()}`,
    name: skill.name,
    source: skill.name,
    turn_applied: currentTurn,
    image_url: skill.image_url
  };
  
  // Copy all properties from skill effects
  Object.entries(skillEffects).forEach(([key, value]) => {
    (effectObj as any)[key] = value;
  });
  
  // Determine effect type
  effectObj.type = determineEffectType(skillEffects);
  
  return effectObj;
}

/**
 * Create an effect object from a monster ability
 */
export function createEffectFromMonsterAbility(
  abilityName: string,
  ability: Record<string, any>,
  currentTurn: number
): CombatEffect | null {
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
  
  // Determine effect type
  effectObj.type = determineEffectType(ability);
  
  return effectObj;
}

/**
 * Process active effects to apply their effects
 * For example, applying damage over time, healing over time, etc.
 */
export function processEffects(
  effects: CombatEffect[],
  currentTurn: number,
  onDamage?: (amount: number) => void,
  onHeal?: (amount: number) => void
): { 
  activeEffects: CombatEffect[],
  expiredEffects: CombatEffect[],
  messages: string[] 
} {
  // Make sure effects is an array
  const effectsArray = Array.isArray(effects) ? effects : [];
  
  const activeEffects: CombatEffect[] = [];
  const expiredEffects: CombatEffect[] = [];
  const messages: string[] = [];

  // Process each effect
  effectsArray.forEach(effect => {
    if (!effect.duration) {
      // Permanent effect
      activeEffects.push(effect);
      return;
    }
    
    // Calculate remaining duration
    const turnsPassed = currentTurn - effect.turn_applied;
    const remaining = effect.duration - turnsPassed;
    
    if (remaining <= 0) {
      // Effect has expired
      expiredEffects.push(effect);
      messages.push(`${effect.name} has worn off.`);
      return;
    }
    
    // Effect is still active
    activeEffects.push(effect);
    
    // Apply damage over time
    if (effect.damage_over_time && onDamage) {
      onDamage(effect.damage_over_time);
      messages.push(`${effect.name} deals ${effect.damage_over_time} damage.`);
    }
    
    // Apply healing over time
    if (effect.healing_over_time && onHeal) {
      onHeal(effect.healing_over_time);
      messages.push(`${effect.name} heals for ${effect.healing_over_time}.`);
    }
  });
  
  return { activeEffects, expiredEffects, messages };
}
