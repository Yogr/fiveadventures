import type { Character, Item } from '@/lib/types';

/**
 * Get the total strength of a character, including bonuses from equipped items
 */
export function getTotalStrength(character: Character): number {
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
  
  return totalStrength;
}

/**
 * Get the total intelligence of a character, including bonuses from equipped items
 */
export function getTotalIntelligence(character: Character): number {
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
  
  return totalIntelligence;
}

/**
 * Get the total agility of a character, including bonuses from equipped items
 */
export function getTotalAgility(character: Character): number {
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
  
  return totalAgility;
}

/**
 * Get the total luck of a character, including bonuses from equipped items
 */
export function getTotalLuck(character: Character): number {
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
 */
export function calculateTotalDamage(character: Character): number {
  let baseDamage = 5; // Base damage for all characters
  
  // Add primary stat contribution based on class
  switch (character.class) {
    case 'Warrior':
      baseDamage += getTotalStrength(character) * 2;
      break;
    case 'Wizard':
      baseDamage += getTotalIntelligence(character) * 2;
      break;
    case 'Thief':
      baseDamage += getTotalAgility(character) * 1.5 + getTotalLuck(character) * 0.5;
      break;
    case 'Ranger':
      baseDamage += getTotalAgility(character) * 2;
      break;
    case 'Cleric':
      baseDamage += getTotalIntelligence(character) * 1.5 + getTotalStrength(character) * 0.5;
      break;
    default:
      baseDamage += getTotalStrength(character);
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
 */
export function calculateTotalDefense(character: Character): number {
  let baseDefense = 2; // Base defense for all characters
  
  // Add stat contributions
  baseDefense += getTotalStrength(character) * 0.5;
  
  // Add armor and helmet defense
  if (character.equipment?.armor) {
    baseDefense += character.equipment.armor.base_defense || 0;
  }
  
  if (character.equipment?.helmet) {
    baseDefense += character.equipment.helmet.base_defense || 0;
  }
  
  return Math.floor(baseDefense);
}
