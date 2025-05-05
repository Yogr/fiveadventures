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
 * Get the total wisdom of a character, including bonuses from equipped items and active effects
 * @param character The character object
 * @param activeEffects Optional active effects that may modify the character's wisdom
 */
export function getTotalWisdom(character: Character, activeEffects?: Record<string, any>[]): number {
  let totalWisdom = character.wisdom;
  
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
        if (effects.stat_boosts && effects.stat_boosts.wisdom) {
          totalWisdom += effects.stat_boosts.wisdom;
        }
      }
    });
  }
  
  // Add bonuses from active effects (buffs)
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Check for wisdom boost effects
      if (effect.wisdom_boost) {
        totalWisdom += effect.wisdom_boost;
      }
    });
  }
  
  return totalWisdom;
}

/**
 * Get all the total stats for a character, including bonuses from equipped items
 */
export function getTotalStats(character: Character): {
  strength: number;
  intelligence: number;
  agility: number;
  luck: number;
  wisdom: number;
  max_hitpoints: number;
  max_energy: number;
} {
  return {
    strength: getTotalStrength(character),
    intelligence: getTotalIntelligence(character),
    agility: getTotalAgility(character),
    luck: getTotalLuck(character),
    wisdom: getTotalWisdom(character),
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
  let baseDamage = 0;

  const weapon = character.equipment?.weapon;
  
  // Log more details about the weapon when it's undefined
  if (!weapon) {
    console.warn('Weapon is undefined, using unarmed damage calculation.');    
    // Use base damage of 5 when unarmed
    baseDamage = 5;
  } else {
    // Use weapon's base damage as the starting point
    baseDamage = weapon.base_damage || 5;
    
    if (weapon.weapon_type === "Slashing" || weapon.weapon_type === "Blunt") {
      // Strength-based weapons: +1 damage per 4 strength points
      baseDamage += Math.floor(getTotalStrength(character, activeEffects) / 2);
    } else if (weapon.weapon_type === "Piercing") {
      // Agility-based weapons: +1 damage per 4 agility points
      baseDamage += Math.floor(getTotalAgility(character, activeEffects) / 2);
    } else if (weapon.weapon_type === "Magic") {
      if (character.class === 'Cleric') {
        // Wisdom-based weapons for Clerics: +1 damage per 4 wisdom points
        baseDamage += Math.floor(getTotalWisdom(character, activeEffects) / 2);
      } else {
        // Intelligence-based weapons: +1 damage per 4 intelligence points
        baseDamage += Math.floor(getTotalIntelligence(character, activeEffects) / 2);
      }
    }
    
    // Add elemental damage if any (reduced impact)
    if (weapon.effects) {
      const effects = weapon.effects as any;
      if (effects.elemental && effects.elemental.damage) {
        baseDamage += Math.ceil(effects.elemental.damage / 2);
      }
    }

    console.log('Base damage after weapon and stats:', baseDamage);
  }
  
  // Apply active effects that directly modify damage
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      // Direct damage boosts (like Rage)
      if (effect.damage_boost) {
        baseDamage += effect.damage_boost;
      }
      
      // Percentage-based damage boosts
      if (effect.damage_percent_boost) {
        baseDamage *= (1 + effect.damage_percent_boost / 100);
      }
      
      // Damage reduction debuffs
      if (effect.damage_reduction) {
        baseDamage *= (1 - effect.damage_reduction / 100);
      }
      
      // Special effect: Elemental damage boost
      if (effect.elemental_boost && weapon?.effects) {
        const weaponEffects = weapon.effects as any;
        if (weaponEffects.elemental && effect.elemental_boost.type === weaponEffects.elemental.type) {
          baseDamage += effect.elemental_boost.value;
        }
      }
    });
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
 * Calculate the damage reduction percentage from defense
 * @param defense The total defense value
 * @param playerLevel The player's level
 * @param monsterLevel The monster's level
 */
export function calculateDamageReduction(defense: number, playerLevel: number, monsterLevel: number): number {
  // Base reduction percentage from defense
  let reductionPercentage = defense * 2; // Each point of defense is worth 2% reduction
  
  // Level difference adjustment
  const levelDifference = playerLevel - monsterLevel;
  if (levelDifference > 0) {
    // Player has level advantage
    reductionPercentage += levelDifference * 2; // +2% per level difference
  } else if (levelDifference < 0) {
    // Monster has level advantage
    reductionPercentage += levelDifference * 2; // -2% per level difference
  }
  
  // Soft cap implementation with diminishing returns
  const softCap = 60; // 60% damage reduction soft cap
  
  if (reductionPercentage <= softCap) {
    // Below soft cap, linear scaling
    return reductionPercentage / 100;
  } else {
    // Above soft cap, diminishing returns
    // Formula: softCap + (1 - softCap/100) * (1 - e^(-k * (reduction - softCap)))
    // where k is a constant that controls how quickly diminishing returns kick in
    const k = 0.05;
    const excess = reductionPercentage - softCap;
    const diminishedExcess = (1 - softCap/100) * (1 - Math.exp(-k * excess));
    return (softCap / 100) + diminishedExcess;
  }
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
    'wisdom_boost',
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

/**
 * Calculate the chance for a character to dodge an attack
 * @param character The character potentially dodging
 * @param opponent The opponent attacking
 * @param activeEffects Optional active effects that may modify dodge chance
 */
export function calculateDodgeChance(character: Character, opponent: any, activeEffects?: Record<string, any>[]): number {
  // Base dodge chance based on agility
  let dodgeChance = getTotalAgility(character, activeEffects) * 1.5; // 1.5% per agility point
  
  // Adjust based on level difference
  const levelDifference = character.level - opponent.level;
  dodgeChance += levelDifference * 2; // +/-2% per level difference
  
  // Apply active effects that modify dodge chance
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      if (effect.dodge_boost) {
        dodgeChance += effect.dodge_boost;
      }
      
      if (effect.dodge_reduction) {
        dodgeChance -= effect.dodge_reduction;
      }
      
      // Immobilize effects prevent dodging
      if (effect.immobilize) {
        dodgeChance = 0;
      }
    });
  }
  
  // Cap dodge chance between 5% and 40%
  return Math.min(40, Math.max(5, dodgeChance));
}

/**
 * Calculate the chance for an attacker to miss their attack
 * @param attacker The character or monster attacking
 * @param defender The character or monster defending
 * @param attackerEffects Optional active effects on the attacker
 * @param defenderEffects Optional active effects on the defender
 */
export function calculateMissChance(attacker: any, defender: any, attackerEffects?: Record<string, any>[], defenderEffects?: Record<string, any>[]): number {
  // Base miss chance
  let missChance = 5; // 5% base miss chance
  
  // Defender's agility increases miss chance
  const defenderAgility = defender.agility || 0;
  missChance += defenderAgility * 0.5; // +0.5% per agility point
  
  // Attacker's luck decreases miss chance
  const attackerLuck = attacker.luck || 0;
  missChance -= attackerLuck * 0.5; // -0.5% per luck point
  
  // Apply attacker's active effects
  if (attackerEffects && attackerEffects.length > 0) {
    attackerEffects.forEach(effect => {
      if (effect.accuracy_boost) {
        missChance -= effect.accuracy_boost;
      }
      
      if (effect.accuracy_reduction) {
        missChance += effect.accuracy_reduction;
      }
      
      // Blind effect significantly increases miss chance
      if (effect.blind) {
        missChance += effect.blind;
      }
    });
  }
  
  // Apply defender's active effects
  if (defenderEffects && defenderEffects.length > 0) {
    defenderEffects.forEach(effect => {
      if (effect.evasion_boost) {
        missChance += effect.evasion_boost;
      }
    });
  }
  
  // Cap miss chance between 2% and 25%
  return Math.min(25, Math.max(2, missChance));
}

/**
 * Calculate critical hit chance and multiplier
 * @param character The character potentially landing a critical hit
 * @param weapon The weapon being used
 * @param activeEffects Optional active effects that may modify critical chance
 */
export function calculateCriticalHit(character: Character, weapon?: Item | null, activeEffects?: Record<string, any>[]): { isCritical: boolean; multiplier: number } {
  // Base critical chance from luck
  let critChance = getTotalLuck(character, activeEffects); // 1% per luck point
  let critMultiplier = 2; // Default multiplier
  
  // Add weapon critical hit bonuses
  if (weapon?.effects) {
    const effects = weapon.effects as any;
    if (effects.critical_hit) {
      critChance += effects.critical_hit.chance || 0;
      critMultiplier = effects.critical_hit.multiplier || 1.5;
    }
  }
  
  // Apply active effects that modify critical chance
  if (activeEffects && activeEffects.length > 0) {
    activeEffects.forEach(effect => {
      if (effect.critical_chance_boost) {
        critChance += effect.critical_chance_boost;
      }
      
      if (effect.critical_damage_boost) {
        critMultiplier += effect.critical_damage_boost / 100;
      }
    });
  }
  
  // Determine if critical hit occurs
  const roll = Math.random() * 100;
  const isCritical = roll <= critChance;

  console.log(`Critical Hit Roll: ${roll} (Chance: ${critChance}%) = isCritical? ${isCritical}`);
  
  return {
    isCritical,
    multiplier: isCritical ? critMultiplier : 1.0
  };
}

/**
 * Adjust a random roll based on luck
 * @param character The character making the roll
 * @param min The minimum possible value
 * @param max The maximum possible value
 * @param activeEffects Optional active effects
 */
export function luckAdjustedRoll(character: Character, min: number, max: number, activeEffects?: Record<string, any>[]): number {
  // Generate base random number
  const baseRoll = Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Apply luck bonus (assuming higher is better)
  const luckBonus = getTotalLuck(character, activeEffects);
  
  // Calculate adjusted roll with luck
  let adjustedRoll = baseRoll + luckBonus;
  
  // Cap the roll at the maximum value
  return Math.min(max, adjustedRoll);
}

/**
 * Calculate a character's power level based on their stats and equipment
 * @param character The character to calculate power level for
 * @returns Power level as a numeric value
 */
export function calculatePowerLevel(character: Character): number {
  // Base power is weighted sum of all stats
  let powerLevel = 0;
  
  // Level contribution - higher levels have more impact
  powerLevel += character.level * 10;
  
  // Stat contribution with weights
  powerLevel += character.strength * 2;
  powerLevel += character.intelligence * 2;
  powerLevel += character.agility * 2;
  powerLevel += character.luck * 1.5;
  powerLevel += character.wisdom * 2;
  
  // HP and Energy contribution
  powerLevel += Math.floor(character.max_hitpoints / 5);
  powerLevel += Math.floor(character.max_energy / 2);
  
  // Equipment contribution
  if (character.equipment) {
    // Get weapon contribution
    if (character.equipment.weapon) {
      const weapon = character.equipment.weapon;
      // Base damage value
      powerLevel += (weapon.base_damage || 0) * 3;
      
      // Rarity multiplier
      const rarityMultiplier = getRarityMultiplier(weapon.rarity);
      powerLevel += Math.floor(10 * rarityMultiplier);
      
      // Weapon effects
      if (weapon.effects) {
        powerLevel += calculateItemEffectsPower(weapon.effects);
      }
    }
    
    // Get armor contribution
    if (character.equipment.armor) {
      const armor = character.equipment.armor;
      // Base defense value
      powerLevel += (armor.base_defense || 0) * 3;
      
      // Rarity multiplier
      const rarityMultiplier = getRarityMultiplier(armor.rarity);
      powerLevel += Math.floor(8 * rarityMultiplier);
      
      // Armor effects
      if (armor.effects) {
        powerLevel += calculateItemEffectsPower(armor.effects);
      }
    }
    
    // Get helmet contribution
    if (character.equipment.helmet) {
      const helmet = character.equipment.helmet;
      // Base defense value
      powerLevel += (helmet.base_defense || 0) * 2;
      
      // Rarity multiplier
      const rarityMultiplier = getRarityMultiplier(helmet.rarity);
      powerLevel += Math.floor(6 * rarityMultiplier);
      
      // Helmet effects
      if (helmet.effects) {
        powerLevel += calculateItemEffectsPower(helmet.effects);
      }
    }
    
    // Get trinket contribution
    if (character.equipment.trinket) {
      const trinket = character.equipment.trinket;
      
      // Rarity multiplier
      const rarityMultiplier = getRarityMultiplier(trinket.rarity);
      powerLevel += Math.floor(8 * rarityMultiplier);
      
      // Trinket effects
      if (trinket.effects) {
        powerLevel += calculateItemEffectsPower(trinket.effects);
      }
    }
  }
  
  return Math.max(1, Math.floor(powerLevel));
}

/**
 * Calculate item effects contribution to power level
 * @param effects Item effects object
 * @returns Numeric power contribution from effects
 */
function calculateItemEffectsPower(effects: any): number {
  let effectsPower = 0;
  
  // Stat boost effects
  if (effects.stat_boosts) {
    const statBoosts = effects.stat_boosts;
    // Add each stat boost with appropriate weighting
    if (statBoosts.strength) effectsPower += statBoosts.strength * 2;
    if (statBoosts.intelligence) effectsPower += statBoosts.intelligence * 2;
    if (statBoosts.agility) effectsPower += statBoosts.agility * 2;
    if (statBoosts.luck) effectsPower += statBoosts.luck * 1.5;
    if (statBoosts.wisdom) effectsPower += statBoosts.wisdom * 2;
    if (statBoosts.hitpoints) effectsPower += Math.floor(statBoosts.hitpoints / 5);
    if (statBoosts.energy) effectsPower += Math.floor(statBoosts.energy / 2);
  }
  
  // Critical hit modifiers
  if (effects.critical_hit) {
    effectsPower += effects.critical_hit.chance * 1.5;
    if (effects.critical_hit.multiplier) {
      effectsPower += (effects.critical_hit.multiplier - 1) * 10;
    }
  }
  
  // Elemental damage
  if (effects.elemental && effects.elemental.damage) {
    effectsPower += effects.elemental.damage * 2;
  }
  
  // Special effects often have high impact
  if (effects.special) {
    effectsPower += 15;
  }
  
  return Math.floor(effectsPower);
}

/**
 * Get rarity multiplier for power level calculations
 * @param rarity Item rarity
 * @returns Numeric multiplier based on rarity
 */
function getRarityMultiplier(rarity: string): number {
  switch (rarity) {
    case 'Common': return 1;
    case 'Uncommon': return 1.5;
    case 'Rare': return 2;
    case 'Epic': return 3;
    case 'Legendary': return 5;
    default: return 1;
  }
}

/**
 * Calculate equipment rating based on all equipped items
 * @param character The character to calculate equipment rating for
 * @returns Equipment rating as a numeric value
 */
export function calculateEquipmentRating(character: Character): number {
  if (!character.equipment) return 0;
  
  let rating = 0;
  
  // Add rating for each equipped item
  const equipmentItems = [
    character.equipment.weapon,
    character.equipment.helmet,
    character.equipment.armor,
    character.equipment.trinket
  ];
  
  equipmentItems.forEach(item => {
    if (item) {
      // Base rating for having an item equipped
      let itemRating = 10;
      
      // Add rating based on item value
      itemRating += Math.floor(item.value / 10);
      
      // Add rating based on item rarity
      const rarityMultiplier = getRarityMultiplier(item.rarity);
      itemRating *= rarityMultiplier;
      
      // Add weapon/armor specific bonuses
      if (item.type === 'Weapon' && item.base_damage) {
        itemRating += item.base_damage * 2;
      } else if ((item.type === 'Armor' || item.type === 'Helmet') && item.base_defense) {
        itemRating += item.base_defense * 2;
      }
      
      // Add effects bonuses
      if (item.effects) {
        itemRating += calculateItemEffectsPower(item.effects);
      }
      
      rating += Math.floor(itemRating);
    }
  });
  
  return rating;
}

/**
 * Process active effects at the start of a turn
 * @param character The character with active effects
 * @param activeEffects Array of active effects
 */
export function processActiveEffects(character: Character, activeEffects: Record<string, any>[]): {
  remainingEffects: Record<string, any>[];
  expiredEffects: Record<string, any>[];
  messages: string[];
} {
  const remainingEffects: Record<string, any>[] = [];
  const expiredEffects: Record<string, any>[] = [];
  const newMessages: string[] = [];
  
  // Process each effect
  activeEffects.forEach(effect => {
    // Reduce duration
    if (effect.duration !== undefined) {
      effect.duration--;
      
      // Check if effect has expired
      if (effect.duration <= 0) {
        expiredEffects.push(effect);
        newMessages.push(`${effect.name} has worn off.`);
        return;
      }
    }
    
    // Apply damage over time effects
    if (effect.damage_over_time) {
      const dotDamage = effect.damage_over_time;
      character.current_hitpoints = Math.max(0, character.current_hitpoints - dotDamage);
      newMessages.push(`${character.name} takes ${dotDamage} damage from ${effect.name}.`);
    }
    
    // Apply healing over time effects
    if (effect.healing_over_time) {
      const hotHealing = effect.healing_over_time;
      character.current_hitpoints = Math.min(character.max_hitpoints, character.current_hitpoints + hotHealing);
      newMessages.push(`${character.name} heals ${hotHealing} from ${effect.name}.`);
    }
    
    // Keep effect for next turn
    remainingEffects.push(effect);
  });
  
  return {
    remainingEffects,
    expiredEffects,
    messages: newMessages
  };
}
