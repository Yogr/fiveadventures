import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';

// Custom hook for debouncing values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Constants for game mechanics
export const MAX_ADVENTURES_PER_DAY = 5;
export const MAX_LEVEL = 50;

// Character class base stats
export const CLASS_BASE_STATS = {
  Warrior: {
    strength: 10,
    intelligence: 3,
    agility: 6,
    luck: 5,
    hitpoints: 100,
    energy: 50
  },
  Wizard: {
    strength: 3,
    intelligence: 10,
    agility: 5,
    luck: 6,
    hitpoints: 70,
    energy: 100
  },
  Thief: {
    strength: 5,
    intelligence: 6,
    agility: 8,
    luck: 10,
    hitpoints: 80,
    energy: 70
  },
  Ranger: {
    strength: 6,
    intelligence: 6,
    agility: 10,
    luck: 6,
    hitpoints: 85,
    energy: 80
  },
  Cleric: {
    strength: 5,
    intelligence: 8,
    agility: 4,
    luck: 7,
    hitpoints: 90,
    energy: 90
  }
};

// Character class stat growth per level
export const CLASS_STAT_GROWTH = {
  Warrior: {
    strength: 2,
    intelligence: 0.3,
    agility: 1,
    luck: 0.5,
    hitpoints: 10,
    energy: 3
  },
  Wizard: {
    strength: 0.3,
    intelligence: 2,
    agility: 0.5,
    luck: 1,
    hitpoints: 5,
    energy: 8
  },
  Thief: {
    strength: 0.5,
    intelligence: 0.7,
    agility: 1.5,
    luck: 2,
    hitpoints: 7,
    energy: 5
  },
  Ranger: {
    strength: 1,
    intelligence: 1,
    agility: 2,
    luck: 1,
    hitpoints: 8,
    energy: 6
  },
  Cleric: {
    strength: 0.8,
    intelligence: 1.5,
    agility: 0.5,
    luck: 1.2,
    hitpoints: 9,
    energy: 7
  }
};

// Item rarities
export const ITEM_RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

// Weapon types
export const WEAPON_TYPES = ['Slashing', 'Blunt', 'Piercing', 'Magic'];

// Experience required for each level
export const getRequiredExperience = (level: number): number => {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 300;
  if (level === 4) return 600;
  
  // Exponential growth for higher levels
  return Math.floor(100 * Math.pow(level, 2));
};

// Calculate level from experience
export const getLevelFromExperience = (experience: number): number => {
  let level = 1;
  while (level < MAX_LEVEL && experience >= getRequiredExperience(level + 1)) {
    level++;
  }
  return level;
};

// Generate a random name for a character
export const generateRandomName = (): string => {
  // Tokens for the start of names
  const startTokens = [
    'Ar', 'Ro', 'Tyr', 'Seb', 'La', 'Kor', 'Mei', 'Bel', 'Zor', 'Gan',
    'Dra', 'Fen', 'Gar', 'Hal', 'Jor', 'Kha', 'Lun', 'Mor', 'Nar', 'Pal',
    'Qar', 'Sar', 'Tho', 'Var', 'Wex', 'Xan', 'Yor', 'Zan', 'Eth', 'Fro'
  ];
  
  // Optional middle tokens
  const middleTokens = [
    'an', 'or', 'in', 'ar', 'en', 'ir', 'on', 'un', 'am', 'em',
    'im', 'om', 'um', 'ad', 'ed', 'id', 'od', 'ud', 'al', 'el'
  ];
  
  // Tokens for the end of names
  const endTokens = [
    'ion', 'yll', 'beard', 'dion', 'dan', 'tan', 'imar', 'omar', 'ius', 'ath',
    'eth', 'oth', 'uth', 'ax', 'ex', 'ix', 'ox', 'ux', 'an', 'en',
    'in', 'on', 'un', 'ar', 'er', 'ir', 'or', 'ur', 'ack', 'ick'
  ];
  
  // Randomly select tokens (with non-null assertions since arrays are not empty)
  const startToken = startTokens[Math.floor(Math.random() * startTokens.length)]!;
  const endToken = endTokens[Math.floor(Math.random() * endTokens.length)]!;
  
  // 40% chance to include a middle token
  const includeMiddle = Math.random() < 0.4;
  let name = '';
  
  if (includeMiddle) {
    const middleToken = middleTokens[Math.floor(Math.random() * middleTokens.length)]!;
    name = startToken + middleToken + endToken;
  } else {
    name = startToken + endToken;
  }
  
  // Capitalize the first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
};

// Generate a seed for daily adventures based on character ID, day, and adventure number
export const generateAdventureSeed = (characterId: string, day: number, adventureNumber: number): number => {
  // Convert characterId to a number by summing character codes
  const charSum = characterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Combine with day and adventure number to create a deterministic but "random" seed
  return charSum * 31 + day * 17 + adventureNumber * 7;
};

// Get primary stat based on character class
export const getPrimaryStat = (character: { class: string, strength: number, intelligence: number, agility: number, luck: number }): number => {
  switch(character.class) {
    case 'Warrior': return character.strength;
    case 'Wizard': return character.intelligence;
    case 'Thief': return character.luck;
    case 'Ranger': return character.agility;
    case 'Cleric': return character.intelligence;
    default: return character.strength; // Fallback
  }
};

// Generate a seed for daily shop items based on day
export const generateShopSeed = (day: number): number => {
  // Use a fixed, large prime number as the base
  const FIXED_SEED = 68584868;
  
  // Get the current year
  const currentYear = new Date().getFullYear();
  
  // Create a deterministic but "random" seed that changes daily
  // Divide by day and multiply by year to make it unpredictable
  return Math.abs(FIXED_SEED / day * currentYear);
};

// Get random shop items based on a seed
export const getRandomShopItems = (
  items: any[],
  count: number,
  seed: number
): any[] => {
  // Create a seeded random number generator
  const seededRandom = (max: number): number => {
    // Simple LCG (Linear Congruential Generator)
    seed = (seed * 1664525 + 1013904223) % 2147483648;
    return Math.floor((seed / 2147483648) * max);
  };
  
  // Create a copy of the items array to avoid modifying the original
  const itemsCopy = [...items];
  const selectedItems = [];
  
  // Select 'count' random items
  for (let i = 0; i < count && itemsCopy.length > 0; i++) {
    const randomIndex = seededRandom(itemsCopy.length);
    selectedItems.push(itemsCopy[randomIndex]);
    itemsCopy.splice(randomIndex, 1);
  }
  
  return selectedItems;
};

// Calculate the current game day (days since launch)
export const getCurrentGameDay = (): number => {
  const launchDate = new Date('2025-04-04'); // Example launch date
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - launchDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Calculate the current game week
export const getCurrentGameWeek = (): number => {
  const day = getCurrentGameDay();
  return Math.ceil(day / 7);
};

// Generate a UUID
export const generateId = (): string => {
  return uuidv4();
};

// Calculate success rate based on character stats and requirements
export const calculateSuccessRate = (
  characterStats: { [key: string]: number },
  requirements: { [key: string]: number }
): number => {
  if (!requirements) return 100;
  
  let successRate = 100;
  
  Object.entries(requirements).forEach(([stat, requiredValue]) => {
    const characterValue = characterStats[stat] || 0;
    
    if (characterValue < requiredValue) {
      // Reduce success rate if character doesn't meet requirement
      const deficit = requiredValue - characterValue;
      successRate -= deficit * 10;
    } else {
      // Bonus for exceeding requirement
      const excess = characterValue - requiredValue;
      successRate += excess * 2;
    }
  });
  
  // Clamp between 5% and 100%
  return Math.max(5, Math.min(100, successRate));
};

// Calculate boss damage based on character stats and remaining HP
export const calculateBossDamage = (
  character: {
    level: number;
    strength: number;
    intelligence: number;
    agility: number;
    current_hitpoints: number;
    max_hitpoints: number;
  },
  equipment: {
    weapon?: { base_damage: number; effects?: any } | null;
    armor?: { base_defense: number; effects?: any } | null;
    helmet?: { base_defense: number; effects?: any } | null;
    trinket?: { effects?: any } | null;
  }
): number => {
  // Base damage formula
  let baseDamage = character.level * 5;
  
  // Add stat contributions
  baseDamage += character.strength * 2;
  baseDamage += character.intelligence;
  baseDamage += character.agility * 0.5;
  
  // Add weapon damage
  if (equipment.weapon) {
    baseDamage += equipment.weapon.base_damage;
    
    // Apply weapon effects (simplified)
    if (equipment.weapon.effects?.boss_damage_multiplier) {
      baseDamage *= equipment.weapon.effects.boss_damage_multiplier;
    }
  }
  
  // HP multiplier (more attacks based on remaining HP)
  const hpRatio = character.current_hitpoints / character.max_hitpoints;
  const attackCount = Math.max(1, Math.ceil(hpRatio * 5)); // 1-5 attacks based on HP
  
  return Math.floor(baseDamage * attackCount);
};

// Format currency (gold)
export const formatGold = (amount: number): string => {
  return `${amount.toLocaleString()} Gold`;
};

// Format large numbers with K, M suffixes
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Calculate the stats gained when leveling up
export const getLevelUpRewards = (
  characterClass: string,
  levelsGained: number
): { 
  strength: number; 
  intelligence: number; 
  agility: number; 
  luck: number; 
  max_hitpoints: number; 
  max_energy: number;
} => {
  // Get stat growth for character class
  const statGrowth = CLASS_STAT_GROWTH[characterClass as keyof typeof CLASS_STAT_GROWTH] || CLASS_STAT_GROWTH.Warrior;
  
  // Calculate stat increases based on levels gained
  return {
    strength: Math.floor(statGrowth.strength * levelsGained),
    intelligence: Math.floor(statGrowth.intelligence * levelsGained),
    agility: Math.floor(statGrowth.agility * levelsGained),
    luck: Math.floor(statGrowth.luck * levelsGained),
    max_hitpoints: Math.floor(statGrowth.hitpoints * levelsGained),
    max_energy: Math.floor(statGrowth.energy * levelsGained)
  };
};
