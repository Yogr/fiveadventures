-- Five Adventures Database Schema

-- Enable PostgreSQL UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  strength INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  agility INTEGER NOT NULL,
  luck INTEGER NOT NULL,
  max_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  max_energy INTEGER NOT NULL,
  current_energy INTEGER NOT NULL,
  daily_adventure_count INTEGER NOT NULL DEFAULT 0,
  last_played_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'unlinked',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  weapon_type TEXT,
  base_damage INTEGER,
  base_defense INTEGER,
  effects JSONB,
  value INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Inventory table
CREATE TABLE IF NOT EXISTS character_inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Equipment table
CREATE TABLE IF NOT EXISTS character_equipment (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id) UNIQUE,
  weapon_id INTEGER REFERENCES items(id),
  helmet_id INTEGER REFERENCES items(id),
  armor_id INTEGER REFERENCES items(id),
  trinket_id INTEGER REFERENCES items(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop Items table
CREATE TABLE IF NOT EXISTS shop_items (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id),
  day INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  min_experience INTEGER NOT NULL DEFAULT 10,
  min_gold INTEGER NOT NULL DEFAULT 5,
  is_violent BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure Decisions table
CREATE TABLE IF NOT EXISTS adventure_decisions (
  id INTEGER NOT NULL,
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  description TEXT NOT NULL,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (adventure_id, id)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  class TEXT NOT NULL,
  energy_cost INTEGER NOT NULL,
  cooldown INTEGER NOT NULL DEFAULT 0,
  effects JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Skills table
CREATE TABLE IF NOT EXISTS character_skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  level INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, skill_id)
);

-- Monsters table
CREATE TABLE IF NOT EXISTS monsters (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  hitpoints INTEGER NOT NULL,
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  experience_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  attack_type TEXT NOT NULL,
  abilities JSONB,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Tables
CREATE TABLE IF NOT EXISTS reward_tables (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward Items
CREATE TABLE IF NOT EXISTS reward_items (
  id INTEGER NOT NULL,
  reward_table_id INTEGER NOT NULL REFERENCES reward_tables(id),
  item_id INTEGER NOT NULL REFERENCES items(id),
  chance INTEGER NOT NULL, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (reward_table_id, id)
);

-- Adventure Outcomes table
CREATE TABLE IF NOT EXISTS adventure_outcomes (
  id INTEGER NOT NULL,
  decision_id INTEGER NOT NULL,
  adventure_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  experience_bonus INTEGER NOT NULL DEFAULT 0,
  gold_bonus INTEGER NOT NULL DEFAULT 0,
  reward_table_id INTEGER REFERENCES reward_tables(id),
  hitpoints_change INTEGER NOT NULL DEFAULT 0,
  energy_change INTEGER NOT NULL DEFAULT 0,
  stat_requirements JSONB,
  success_rate_formula JSONB,
  has_combat BOOLEAN NOT NULL DEFAULT false,
  monster_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (adventure_id, decision_id, id),
  FOREIGN KEY (adventure_id, decision_id) REFERENCES adventure_decisions(adventure_id, id)
);

-- Character Adventures table
CREATE TABLE IF NOT EXISTS character_adventures (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  decision_id INTEGER,
  outcome_id INTEGER,
  day INTEGER NOT NULL,
  adventure_number INTEGER NOT NULL,
  experience_gained INTEGER NOT NULL,
  gold_gained INTEGER NOT NULL,
  item_gained_id INTEGER REFERENCES items(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (adventure_id, decision_id) REFERENCES adventure_decisions(adventure_id, id),
  FOREIGN KEY (adventure_id, decision_id, outcome_id) REFERENCES adventure_outcomes(adventure_id, decision_id, id)
);

-- World Boss table
CREATE TABLE IF NOT EXISTS world_boss (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  week INTEGER NOT NULL,
  total_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  is_defeated BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  defeated_at TIMESTAMP WITH TIME ZONE
);

-- Character Boss Progress table
CREATE TABLE IF NOT EXISTS character_boss_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  boss_id INTEGER NOT NULL REFERENCES world_boss(id),
  week INTEGER NOT NULL,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  pending_rewards BOOLEAN NOT NULL DEFAULT false,
  pending_reward_week INTEGER,
  last_attack TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, boss_id)
);

-- Boss Rewards table
CREATE TABLE IF NOT EXISTS boss_rewards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  boss_id INTEGER NOT NULL REFERENCES world_boss(id),
  week INTEGER NOT NULL,
  reward_tier TEXT NOT NULL,
  item_id INTEGER REFERENCES items(id),
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Combat table
CREATE TABLE IF NOT EXISTS combat (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id),
  adventure_id INTEGER NOT NULL REFERENCES adventures(id),
  decision_id INTEGER NOT NULL,
  outcome_id INTEGER NOT NULL,
  monster_id INTEGER NOT NULL REFERENCES monsters(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_victory BOOLEAN,
  turns INTEGER NOT NULL DEFAULT 0,
  character_damage_dealt INTEGER NOT NULL DEFAULT 0,
  monster_damage_dealt INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (adventure_id, decision_id, outcome_id) REFERENCES adventure_outcomes(adventure_id, decision_id, id)
);

-- Combat Turns table
CREATE TABLE IF NOT EXISTS combat_turns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  combat_id uuid NOT NULL REFERENCES combat(id),
  turn_number INTEGER NOT NULL,
  actor TEXT NOT NULL, -- 'character' or 'monster'
  action TEXT NOT NULL, -- 'attack', 'skill', 'run'
  skill_id INTEGER REFERENCES skills(id),
  damage_dealt INTEGER,
  healing_done INTEGER,
  effects JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_equipment_character_id ON character_equipment(character_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_day ON shop_items(day);
CREATE INDEX IF NOT EXISTS idx_adventure_decisions_adventure_id ON adventure_decisions(adventure_id);
CREATE INDEX IF NOT EXISTS idx_adventure_outcomes_decision_id ON adventure_outcomes(decision_id);
CREATE INDEX IF NOT EXISTS idx_character_adventures_character_id ON character_adventures(character_id);
CREATE INDEX IF NOT EXISTS idx_character_adventures_day ON character_adventures(day);
CREATE INDEX IF NOT EXISTS idx_world_boss_week ON world_boss(week);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_character_id ON character_boss_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_boss_id ON character_boss_progress(boss_id);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_character_id ON boss_rewards(character_id);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_boss_id ON boss_rewards(boss_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_character_id ON combat(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_turns_combat_id ON combat_turns(combat_id);
CREATE INDEX IF NOT EXISTS idx_reward_items_reward_table_id ON reward_items(reward_table_id);

-- Row Level Security Policies

-- Enable Row Level Security
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_boss_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS boss_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS combat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS combat_turns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_policy ON users
  FOR ALL
  USING (auth.uid()::TEXT = id::TEXT);

-- Characters can only be accessed by their owner
CREATE POLICY characters_policy ON characters
  FOR ALL
  USING (auth.uid()::TEXT = user_id::TEXT OR user_id IS NULL);

-- Character inventory can only be accessed by the character's owner
CREATE POLICY character_inventory_policy ON character_inventory
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_inventory.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Character equipment can only be accessed by the character's owner
CREATE POLICY character_equipment_policy ON character_equipment
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_equipment.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Character adventures can only be accessed by the character's owner
CREATE POLICY character_adventures_policy ON character_adventures
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_adventures.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Character boss progress can only be accessed by the character's owner
CREATE POLICY character_boss_progress_policy ON character_boss_progress
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_boss_progress.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Boss rewards can only be accessed by the character's owner
CREATE POLICY boss_rewards_policy ON boss_rewards
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = boss_rewards.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Character skills can only be accessed by the character's owner
CREATE POLICY character_skills_policy ON character_skills
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_skills.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Combat can only be accessed by the character's owner
CREATE POLICY combat_policy ON combat
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = combat.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Combat turns can only be accessed by the character's owner
CREATE POLICY combat_turns_policy ON combat_turns
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM combat
    JOIN characters ON combat.character_id = characters.id
    WHERE combat.id = combat_turns.combat_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Add area_ids column to adventures table
ALTER TABLE adventures ADD COLUMN area_ids INTEGER[] DEFAULT '{-1}';

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  level_requirement INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add character_selected_area table to track which area a character has selected for the day
CREATE TABLE IF NOT EXISTS character_selected_area (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id) UNIQUE,
  area_id INTEGER NOT NULL,
  day INTEGER NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_character_selected_area_character_id ON character_selected_area(character_id);

-- Enable Row Level Security
ALTER TABLE IF EXISTS character_selected_area ENABLE ROW LEVEL SECURITY;

-- Character selected area can only be accessed by the character's owner
CREATE POLICY character_selected_area_policy ON character_selected_area
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_selected_area.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Create character_selected_area table
CREATE TABLE IF NOT EXISTS character_selected_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL,
  day INTEGER NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, day)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_character_selected_area_character_id ON character_selected_area(character_id);
CREATE INDEX IF NOT EXISTS idx_character_selected_area_day ON character_selected_area(day);

-- Add area_id column to adventures table if it doesn't exist
ALTER TABLE adventures ADD COLUMN IF NOT EXISTS area_id INTEGER;

-- Add comment to explain the purpose of the table
COMMENT ON TABLE character_selected_area IS 'Tracks which area a character has selected for each day';
COMMENT ON COLUMN character_selected_area.character_id IS 'Reference to the character';
COMMENT ON COLUMN character_selected_area.area_id IS 'ID of the selected area';
COMMENT ON COLUMN character_selected_area.day IS 'Game day when the area was selected';
COMMENT ON COLUMN character_selected_area.selected_at IS 'Timestamp when the area was selected';
