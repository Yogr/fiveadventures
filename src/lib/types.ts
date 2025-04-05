import type { Database } from './database.types';

// Character Types
export type CharacterClass = 'Warrior' | 'Wizard' | 'Thief' | 'Ranger' | 'Cleric';

export type Character = Database['public']['Tables']['characters']['Row'] & {
  equipment?: CharacterEquipment;
  inventory?: CharacterInventoryItem[];
  skills?: CharacterSkill[];
};

export type CharacterSkill = {
  id: string;
  character_id: string;
  skill_id: number;
  level: number;
  acquired_at: string;
  skill: Skill;
};

// Skill Types
export type Skill = {
  id: number;
  name: string;
  description: string;
  class: string;
  energy_cost: number;
  cooldown: number;
  effects: any;
  image_url: string | null;
  created_at: string;
};

export type SkillEffect = {
  type: 'Damage' | 'Healing' | 'StatBoost' | 'StatusEffect' | 'Special';
  value: number;
  duration?: number;
  description: string;
};

// Monster Types
export type Monster = {
  id: number;
  name: string;
  description: string;
  hitpoints: number;
  attack: number;
  defense: number;
  experience_reward: number;
  gold_reward: number;
  difficulty: number;
  attack_type: string;
  abilities: any;
  image_url: string | null;
  created_at: string;
};

export type MonsterAbility = {
  name: string;
  type: 'Damage' | 'StatusEffect' | 'StatBoost' | 'Special';
  value: number;
  chance: number;
  description: string;
};

// Combat Types
export type Combat = {
  id: string;
  character_id: string;
  adventure_id: number;
  outcome_id: number;
  monster_id: number;
  is_completed: boolean;
  is_victory: boolean | null;
  turns: number;
  character_damage_dealt: number;
  monster_damage_dealt: number;
  created_at: string;
  completed_at: string | null;
  monster: Monster;
  turns_data?: CombatTurn[];
};

export type CombatTurn = {
  id: string;
  combat_id: string;
  turn_number: number;
  actor: string;
  action: string;
  skill_id: number | null;
  damage_dealt: number | null;
  healing_done: number | null;
  effects: any;
  created_at: string;
  skill?: Skill;
};

export type CombatAction = 'Attack' | 'Skill' | 'Run';

// Reward Types
export type RewardTable = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  items: RewardItem[];
};

export type RewardItem = {
  id: number;
  reward_table_id: number;
  item_id: number;
  chance: number;
  created_at: string;
  item: Item;
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

// Adventure Types
export type Adventure = Database['public']['Tables']['adventures']['Row'] & {
  decisions?: AdventureDecision[];
  has_combat?: boolean;
};

export type AdventureDecision = Database['public']['Tables']['adventure_decisions']['Row'] & {
  outcomes?: AdventureOutcome[];
};

export type AdventureOutcome = Database['public']['Tables']['adventure_outcomes']['Row'] & {
  item_reward?: Item | null;
  reward_table?: RewardTable | null;
  monsters?: Monster[] | null;
  has_combat?: boolean;
  monster_ids?: number[];
};

export type CharacterAdventure = Database['public']['Tables']['character_adventures']['Row'] & {
  adventure: Adventure;
  decision?: AdventureDecision | null;
  outcome?: AdventureOutcome | null;
  item_gained?: Item | null;
};

// World Boss Types
export type WorldBoss = Database['public']['Tables']['world_boss']['Row'];

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
