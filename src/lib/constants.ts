// Game Constants

// Character Classes
export const CHARACTER_CLASSES = ['Warrior', 'Wizard', 'Thief', 'Ranger', 'Cleric'] as const;

// Item Types
export const ITEM_TYPES = ['Weapon', 'Helmet', 'Armor', 'Trinket'] as const;

// Item Rarities with color codes
export const ITEM_RARITY_COLORS = {
  Common: 'text-gray-200',
  Uncommon: 'text-green-400',
  Rare: 'text-blue-400',
  Epic: 'text-purple-400',
  Legendary: 'text-yellow-400'
};

// Weapon Types
export const WEAPON_TYPES = ['Slashing', 'Blunt', 'Piercing', 'Magic'] as const;

// Game Mechanics
export const MAX_ADVENTURES_PER_DAY = 5;
export const MAX_LEVEL = 50;
export const MAX_SHOP_ITEMS = 8;

// Boss Reward Tiers
export const BOSS_REWARD_TIERS = {
  Top: {
    name: 'Hero\'s Bounty',
    description: 'Exclusive rewards for the top 25% of contributors',
    percentile: 25,
    legendaryChance: 20, // 20% chance for legendary
    epicChance: 50, // 50% chance for epic
    rareChance: 30, // 30% chance for rare
  },
  Middle: {
    name: 'Warrior\'s Spoils',
    description: 'Quality rewards for the top 50% of contributors',
    percentile: 50,
    legendaryChance: 5, // 5% chance for legendary
    epicChance: 25, // 25% chance for epic
    rareChance: 50, // 50% chance for rare
    uncommonChance: 20, // 20% chance for uncommon
  },
  Bottom: {
    name: 'Participant\'s Share',
    description: 'Basic rewards for all participants',
    percentile: 100,
    legendaryChance: 1, // 1% chance for legendary
    epicChance: 10, // 10% chance for epic
    rareChance: 30, // 30% chance for rare
    uncommonChance: 40, // 40% chance for uncommon
    commonChance: 19, // 19% chance for common
  }
};

// Adventure Types
export const ADVENTURE_TYPES = [
  'Combat',
  'Exploration',
  'Puzzle',
  'Social',
  'Rescue',
  'Escort',
  'Gathering',
  'Healing'
] as const;

// Stat Requirements
export const STAT_REQUIREMENT_TYPES = [
  'strength',
  'intelligence',
  'agility',
  'luck',
  'level'
] as const;

// Element Types
export const ELEMENT_TYPES = [
  'Fire',
  'Ice',
  'Lightning',
  'Earth',
  'Wind',
  'Water',
  'Light',
  'Dark'
] as const;

// Item Effects
export const ITEM_EFFECT_TYPES = [
  'StatBoost',
  'ElementalModifier',
  'CriticalHit',
  'GoldBoost',
  'ExpBoost',
  'BossDamage',
  'Special'
] as const;

// Cookie Names
export const COOKIE_NAMES = {
  CHARACTER_ID: 'five-adventures-character-id',
  SESSION: 'five-adventures-session'
};

// Routes
export const ROUTES = {
  HOME: '/',
  CHARACTER_CREATE: '/character/create',
  ADVENTURE: '/adventure',
  INVENTORY: '/inventory',
  SHOP: '/shop',
  WORLD_BOSS: '/worldboss',
  DUNGEON: '/dungeon',
  REWARDS: '/rewards',
  LOGIN: '/login',
  SIGNUP: '/signup',
  LEADERBOARD: '/leaderboard',
  GUILD: '/guild'
};

// API Routes
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout'
  },
  CHARACTER: {
    CREATE: '/api/character/create',
    GET: '/api/character/get',
    UPDATE: '/api/character/update',
    LINK: '/api/character/link'
  },
  ADVENTURE: {
    GET: '/api/adventure/get',
    COMPLETE: '/api/adventure/complete',
    HISTORY: '/api/adventure/history'
  },
  INVENTORY: {
    GET: '/api/inventory/get',
    EQUIP: '/api/inventory/equip',
    UNEQUIP: '/api/inventory/unequip'
  },
  SHOP: {
    GET: '/api/shop/get',
    BUY: '/api/shop/buy',
    SELL: '/api/shop/sell'
  },
  WORLD_BOSS: {
    GET: '/api/worldboss/get',
    ATTACK: '/api/worldboss/attack',
    REWARDS: '/api/worldboss/rewards',
    CLAIM_REWARDS: '/api/worldboss/claim-rewards'
  }
};

// Animation Durations (in ms)
export const ANIMATIONS = {
  PAGE_TRANSITION: 300,
  ADVENTURE_TRANSITION: 500,
  ITEM_PICKUP: 800,
  LEVEL_UP: 1200,
  BOSS_ATTACK: 1000
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CHARACTER_ID: 'five-adventures-character-id',
  SETTINGS: 'five-adventures-settings',
  TUTORIAL_COMPLETED: 'five-adventures-tutorial-completed'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  musicEnabled: true,
  pixelatedMode: true,
  highContrast: false,
  animationsEnabled: true
};
