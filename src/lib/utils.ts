import { v4 as uuidv4 } from 'uuid';

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
  const prefixes = [
    'Brave', 'Mighty', 'Wise', 'Swift', 'Cunning', 'Mystic', 'Shadow', 'Wild',
    'Iron', 'Golden', 'Silver', 'Crimson', 'Azure', 'Emerald', 'Obsidian'
  ];
  
  const names = [
    'Warrior', 'Mage', 'Rogue', 'Hunter', 'Knight', 'Wizard', 'Thief', 'Ranger',
    'Blade', 'Caster', 'Shadow', 'Arrow', 'Shield', 'Staff', 'Dagger', 'Bow'
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return `${prefix} ${name}`;
};

// Generate a seed for daily adventures based on character ID and day
export const generateAdventureSeed = (characterId: string, day: number): number => {
  // Convert characterId to a number by summing character codes
  const charSum = characterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Combine with day to create a deterministic but "random" seed
  return charSum * 31 + day * 17;
};

// Generate a seed for daily shop items based on day
export const generateShopSeed = (day: number): string => {
  return `shop-${day}`;
};

// Calculate the current game day (days since launch)
export const getCurrentGameDay = (): number => {
  const launchDate = new Date('2025-04-01'); // Example launch date
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
