import type { Database } from './database-types';

// Character Types
export type CharacterClass = 'Warrior' | 'Wizard' | 'Thief' | 'Ranger' | 'Cleric';

export type Character = Database['public']['Tables']['characters']['Row'] & {
  equipment?: CharacterEquipment;
  inventory?: CharacterInventoryItem[];
  skills?: CharacterSkill[];
};

export type CharacterEquipment = Database['public']['Tables']['character_equipment']['Row'] & {
  weapon?: Item | null;
  helmet?: Item | null;
  armor?: Item | null;
  trinket?: Item | null;
};

export type CharacterInventoryItem = Database['public']['Tables']['character_inventory']['Row'] & {
  item: Item;
};

export type CharacterSkill = Database['public']['Tables']['character_skills']['Row'] & {
  skill: Skill;
};

// Item Types
export type ItemType = 'Weapon' | 'Helmet' | 'Armor' | 'Trinket';
export type ItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type WeaponType = 'Slashing' | 'Blunt' | 'Piercing' | 'Magic';

export type Item = Database['public']['Tables']['items']['Row'];

export type ItemEffect = {
  type: 'StatBoost' | 'ElementalModifier' | 'CriticalHit' | 'GoldBoost' | 'ExpBoost' | 'BossDamage' | 'Special';
  value: number;
  description: string;
};

export type ShopItem = Database['public']['Tables']['shop_items']['Row'] & {
  item: Item;
};

// Skill Types
export type Skill = Database['public']['Tables']['skills']['Row'] & {
  attribute?: string;  // The attribute this skill relies on (strength, intelligence, agility, luck)
  power?: number;      // The base power of the skill
};

export type SkillEffect = {
  type: 'Damage' | 'Healing' | 'StatBoost' | 'StatusEffect' | 'Special';
  value: number;
  duration?: number;
  description: string;
};

// Monster Types
export type Monster = Database['public']['Tables']['monsters']['Row'] & {
  is_elite?: boolean;
  level?: number; // Monster level for calculating combat stats
};

export type MonsterAbility = {
  name: string;
  type: 'Damage' | 'StatusEffect' | 'StatBoost' | 'Special';
  value: number;
  chance: number;
  description: string;
};

// Combat Types
export type Combat = Database['public']['Tables']['combat']['Row'] & {
  monster: Monster;
  turns?: CombatTurn[] | number;
  turnEvents?: TurnEvents;
};

export type TurnEvents = {
  characterAction?: {
    type: 'attack' | 'skill' | 'run';
    criticalHit: boolean;
    targetDodged: boolean;
    damageDealt: number;
    skillUsed?: string;
    effectsApplied: string[];
    dotEffects: {
      bleed: { triggered: boolean; amount: number };
      poison: { triggered: boolean; amount: number };
      burn: { triggered: boolean; amount: number };
    };
  };
  monsterAction?: {
    type: 'attack' | 'skill' | 'none';
    skillUsed: string | null;
    criticalHit: boolean;
    targetDodged: boolean;
    damageDealt: number;
    effectsApplied: string[];
    dotEffects: {
      bleed: { triggered: boolean; amount: number };
      poison: { triggered: boolean; amount: number };
      burn: { triggered: boolean; amount: number };
    };
  };
};

export type CombatTurn = Database['public']['Tables']['combat_turns']['Row'] & {
  skill?: Skill;
};

export type CombatAction = 'Attack' | 'Skill' | 'Run';

// Fighter interface - common interface for both Character and Monster
export interface Fighter {
  id: string;
  name: string;
  hitpoints: number;
  current_hitpoints?: number;
  attack: number;
  defense: number;
  
  // Stats that might be used for skill calculations
  strength?: number;
  intelligence?: number;
  agility?: number;
  luck?: number;
  wisdom?: number;
  
  // Extra properties to allow for Character and Monster
  [key: string]: any;
}

// Reward Types
export type RewardTable = Database['public']['Tables']['reward_tables']['Row'] & {
  items: RewardItem[];
};

export type RewardItem = Database['public']['Tables']['reward_items']['Row'] & {
  item: Item;
};

// Area Types
export type Area = Database['public']['Tables']['areas']['Row'] & {
  is_dungeon: boolean;
  dungeon_keys_required: number;
};

// Adventure Types
export type Adventure = Database['public']['Tables']['adventures']['Row'] & {
  decisions?: AdventureDecision[];
  area_ids?: number[]; // Array of area IDs where this adventure can be found
};

export type AdventureDecision = Database['public']['Tables']['adventure_decisions']['Row'] & {
  outcomes?: AdventureOutcome[];
};

export type AdventureOutcome = Database['public']['Tables']['adventure_outcomes']['Row'] & {
  reward_table?: RewardTable | null;
  monsters?: Monster[] | null;
  is_success?: boolean; // Whether this outcome is a success or failure
};

export type CharacterAdventure = Database['public']['Tables']['character_adventures']['Row'] & {
  adventure: Adventure;
  decision?: AdventureDecision | null;
  outcome?: AdventureOutcome | null;
  item_gained?: Item | null;
};

// Dungeon Types
export type CharacterDungeon = Database['public']['Tables']['character_dungeons']['Row'] & {
  area: Area;
  adventure?: Adventure | null;
  decision?: AdventureDecision | null;
  outcome?: AdventureOutcome | null;
  combat?: Combat | null;
};

export type DungeonState = {
  currentArea: Area | null;
  currentAdventure: Adventure | null;
  selectedDecision: AdventureDecision | null;
  outcome: AdventureOutcome | null;
  adventureCount: number;
  currentCombat: Combat | null;
};

// World Boss Types
export type WorldBoss = Database['public']['Tables']['world_boss']['Row'] & {
  scale?: number;
};

export type CharacterBossProgress = Database['public']['Tables']['character_boss_progress']['Row'] & {
  boss: WorldBoss;
};

export type BossReward = Database['public']['Tables']['boss_rewards']['Row'] & {
  item?: Item | null;
};

export type RewardTier = 'Top' | 'Middle' | 'Bottom';

// User Types
export type User = Database['public']['Tables']['users']['Row'];

// Game State Types
export type GameDay = {
  day: number;
  week: number;
};

export type AdventureState = {
  currentAdventure: Adventure | null;
  selectedDecision: AdventureDecision | null;
  outcome: AdventureOutcome | null;
  adventureCount: number;
  adventuresCompleted: CharacterAdventure[];
  currentCombat: Combat | null;
};

export type InventoryState = {
  inventory: CharacterInventoryItem[];
  equipment: CharacterEquipment;
};

export type ShopState = {
  shopItems: ShopItem[];
  gold: number;
};

export type BossState = {
  currentBoss: WorldBoss | null;
  characterProgress: CharacterBossProgress | null;
  pendingRewards: BossReward[] | null;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
