import type { Character, Item } from '@/lib/types';

/**
 * Get the total strength of a character, including bonuses from equipped items and active effects
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's strength
 */
export function getTotalStrength(character: Character, activeEffects?: Record<string, any>[]): number {
  let totalStrength = character.strength;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.strength) {
          totalStrength += effects.stat_boosts.strength;
        }
      }
    });
  }
  
  // Add bonuses from active effects (buffs)
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for strength boost effects
      if (effect.strength_boost) {
        totalStrength += effect.strength_boost;
      }
    });
  }
  
  return totalStrength;
}

/**
 * Get the total intelligence of a character, including bonuses from equipped items and active effects
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's intelligence
 */
export function getTotalIntelligence(character: Character, activeEffects?: Record<string, any>[]): number {
  let totalIntelligence = character.intelligence;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.intelligence) {
          totalIntelligence += effects.stat_boosts.intelligence;
        }
      }
    });
  }
  
  // Add bonuses from active effects (buffs)
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for intelligence boost effects
      if (effect.intelligence_boost) {
        totalIntelligence += effect.intelligence_boost;
      }
    });
  }
  
  return totalIntelligence;
}

/**
 * Get the total agility of a character, including bonuses from equipped items and active effects
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's agility
 */
export function getTotalAgility(character: Character, activeEffects?: Record<string, any>[]): number {
  let totalAgility = character.agility;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.agility) {
          totalAgility += effects.stat_boosts.agility;
        }
      }
    });
  }
  
  // Add bonuses from active effects (buffs)
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for agility boost effects
      if (effect.agility_boost) {
        totalAgility += effect.agility_boost;
      }
      // Check for slow effects (decrease agility)
      if (effect.slow) {
        totalAgility -= effect.slow;
      }
    });
  }
  
  // Ensure agility doesn't go below 1
  return Math.max(1, totalAgility);
}

/**
 * Get the total luck of a character, including bonuses from equipped items and active effects
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's luck
 */
export function getTotalLuck(character: Character, activeEffects?: Record<string, any>[]): number {
  let totalLuck = character.luck;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.luck) {
          totalLuck += effects.stat_boosts.luck;
        }
      }
    });
  }
  
  // Add bonuses from active effects (buffs)
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for luck boost effects
      if (effect.luck_boost) {
        totalLuck += effect.luck_boost;
      }
    });
  }
  
  return totalLuck;
}

/**
 * Get the total hitpoints of a character, including bonuses from equipped items
 */
export function getTotalMaxHitpoints(character: Character): number {
  let totalHitpoints = character.max_hitpoints;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.hitpoints) {
          totalHitpoints += effects.stat_boosts.hitpoints;
        }
      }
    });
  }
  
  return totalHitpoints;
}

/**
 * Get the total energy of a character, including bonuses from equipped items
 */
export function getTotalMaxEnergy(character: Character): number {
  let totalEnergy = character.max_energy;
  
  // Add bonuses from equipped items
  if (character.equipment) {
    // Check each equipment slot
    const equipmentItems = [
      character.equipment.weapon,
      character.equipment.helmet,
      character.equipment.armor,
      character.equipment.trinket
    ];
    
    // Add stat boosts from each equipped item
    equipmentItems.forEach(item => {
      if (item && item.effects) {
        const effects = item.effects as any;
        if (effects.stat_boosts && effects.stat_boosts.energy) {
          totalEnergy += effects.stat_boosts.energy;
        }
      }
    });
  }
  
  return totalEnergy;
}

/**
 * Get all the total stats for a character, including bonuses from equipped items
 */
export function getTotalStats(character: Character): {
  strength: number;
  intelligence: number;
  agility: number;
  luck: number;
  max_hitpoints: number;
  max_energy: number;
} {
  return {
    strength: getTotalStrength(character),
    intelligence: getTotalIntelligence(character),
    agility: getTotalAgility(character),
    luck: getTotalLuck(character),
    max_hitpoints: getTotalMaxHitpoints(character),
    max_energy: getTotalMaxEnergy(character)
  };
}

/**
 * Get the stat boost for a specific stat from an item
 */
export function getItemStatBoost(item: Item | null, statName: string): number {
  if (!item || !item.effects) return 0;
  
  const effects = item.effects as any;
  if (!effects.stat_boosts || !effects.stat_boosts[statName]) return 0;
  
  return effects.stat_boosts[statName];
}

/**
 * Get all stat boosts from an item
 */
export function getItemStatBoosts(item: Item | null): Record<string, number> {
  if (!item || !item.effects) return {};
  
  const effects = item.effects as any;
  if (!effects.stat_boosts) return {};
  
  return effects.stat_boosts;
}

/**
 * Calculate the total damage a character can do, including weapon damage and bonuses
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's damage
 */
export function calculateTotalDamage(character: Character, activeEffects?: Record<string, any>[]): number {
  let baseDamage = 5; // Base damage for all characters
  
  // Add primary stat contribution based on class
  switch (character.class) {
    case 'Warrior':
      baseDamage += getTotalStrength(character, activeEffects) * 2;
      break;
    case 'Wizard':
      baseDamage += getTotalIntelligence(character, activeEffects) * 2;
      break;
    case 'Thief':
      baseDamage += getTotalAgility(character, activeEffects) * 1.5 + getTotalLuck(character, activeEffects) * 0.5;
      break;
    case 'Ranger':
      baseDamage += getTotalAgility(character, activeEffects) * 2;
      break;
    case 'Cleric':
      baseDamage += getTotalIntelligence(character, activeEffects) * 1.5 + getTotalStrength(character, activeEffects) * 0.5;
      break;
    default:
      baseDamage += getTotalStrength(character, activeEffects);
  }
  
  // Add weapon damage
  if (character.equipment?.weapon) {
    baseDamage += character.equipment.weapon.base_damage || 0;
    
    // Add elemental damage if any
    if (character.equipment.weapon.effects) {
      const effects = character.equipment.weapon.effects as any;
      if (effects.elemental && effects.elemental.damage) {
        baseDamage += effects.elemental.damage;
      }
    }
  }
  
  return Math.floor(baseDamage);
}

/**
 * Calculate the total defense a character has, including armor and bonuses
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's defense
 */
export function calculateTotalDefense(character: Character, activeEffects?: Record<string, any>[]): number {
  let baseDefense = 2; // Base defense for all characters
  
  // Add stat contributions
  baseDefense += getTotalStrength(character, activeEffects) * 0.5;
  
  // Add armor and helmet defense
  if (character.equipment?.armor) {
    baseDefense += character.equipment.armor.base_defense || 0;
  }
  
  if (character.equipment?.helmet) {
    baseDefense += character.equipment.helmet.base_defense || 0;
  }
  
  // Add defense from active effects
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for defense boost effects
      if (effect.defense_boost) {
        baseDefense += effect.defense_boost;
      }
      // Check for defense reduction debuffs
      if (effect.defense_reduction) {
        baseDefense -= effect.defense_reduction;
      }
    });
  }
  
  // Ensure defense doesn't go below 0
  return Math.max(0, Math.floor(baseDefense));
}

/**
 * Categorize effects as buffs or debuffs based on their properties
 * @param effect The effect to categorize
 * @returns 'buff', 'debuff', or null if the effect is neutral or cannot be categorized
 */
export function categorizeEffect(effect: Record<string, any>): 'buff' | 'debuff' | null {
  // Define which effects are considered buffs
  const buffTypes = [
    'strength_boost',
    'intelligence_boost',
    'agility_boost',
    'luck_boost',
    'healing',
    'shield',
    'defense_boost',
    'gold_chance',
    'exp_boost'
  ];
  
  // Define which effects are considered debuffs
  const debuffTypes = [
    'slow',
    'immobilize',
    'damage_over_time',
    'defense_reduction',
    'attack_reduction',
    'stun'
  ];
  
  // Check if the effect has any property that is in the buff types
  const hasBuff = buffTypes.some(type => effect[type] !== undefined);
  
  // Check if the effect has any property that is in the debuff types
  const hasDebuff = debuffTypes.some(type => effect[type] !== undefined);
  
  if (hasBuff && !hasDebuff) {
    return 'buff';
  } else if (hasDebuff && !hasBuff) {
    return 'debuff';
  } else if (hasBuff && hasDebuff) {
    // If an effect has both buff and debuff properties, consider it a buff if it has more buff properties
    const buffCount = buffTypes.filter(type => effect[type] !== undefined).length;
    const debuffCount = debuffTypes.filter(type => effect[type] !== undefined).length;
    return buffCount >= debuffCount ? 'buff' : 'debuff';
  }
  
  return null; // Neutral effect or cannot be categorized
}

/**
 * Get an array of active effects from combat turn data
 * @param combatTurns Array of combat turns that may contain effects
 * @returns Array of active effects
 */
export function extractActiveEffects(combatTurns: any[]): Record<string, any>[] {
  if (!combatTurns || !Array.isArray(combatTurns) || combatTurns.length === 0) {
    return [];
  }
  
  const activeEffects: Record<string, any>[] = [];
  
  // Process turns in chronological order
  const sortedTurns = [...combatTurns].sort((a, b) => a.turn_number - b.turn_number);
  
  // Extract effects from turns
  sortedTurns.forEach(turn => {
    if (turn.effects) {
      // Add turn effects to active effects array
      activeEffects.push(turn.effects);
    }
  });
  
  return activeEffects;
}
