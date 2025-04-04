import { Database } from './database-types-updated';

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
export type Skill = Database['public']['Tables']['skills']['Row'];

export type SkillEffect = {
  type: 'Damage' | 'Healing' | 'StatBoost' | 'StatusEffect' | 'Special';
  value: number;
  duration?: number;
  description: string;
};

// Monster Types
export type Monster = Database['public']['Tables']['monsters']['Row'];

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
  turns: CombatTurn[];
};

export type CombatTurn = Database['public']['Tables']['combat_turns']['Row'] & {
  skill?: Skill;
};

export type CombatAction = 'Attack' | 'Skill' | 'Run';

// Reward Types
export type RewardTable = Database['public']['Tables']['reward_tables']['Row'] & {
  items: RewardItem[];
};

export type RewardItem = Database['public']['Tables']['reward_items']['Row'] & {
  item: Item;
};

// Adventure Types
export type Adventure = Database['public']['Tables']['adventures']['Row'] & {
  decisions?: AdventureDecision[];
};

export type AdventureDecision = Database['public']['Tables']['adventure_decisions']['Row'] & {
  outcomes?: AdventureOutcome[];
};

export type AdventureOutcome = Database['public']['Tables']['adventure_outcomes']['Row'] & {
  reward_table?: RewardTable | null;
  monsters?: Monster[] | null;
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
