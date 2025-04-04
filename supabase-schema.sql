-- Five Adventures Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
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
  id UUID PRIMARY KEY,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  item_id UUID NOT NULL REFERENCES items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Equipment table
CREATE TABLE IF NOT EXISTS character_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) UNIQUE,
  weapon_id UUID REFERENCES items(id),
  helmet_id UUID REFERENCES items(id),
  armor_id UUID REFERENCES items(id),
  trinket_id UUID REFERENCES items(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop Items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id),
  day INTEGER NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventures table
CREATE TABLE IF NOT EXISTS adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id UUID NOT NULL REFERENCES adventures(id),
  description TEXT NOT NULL,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure Outcomes table
CREATE TABLE IF NOT EXISTS adventure_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES adventure_decisions(id),
  description TEXT NOT NULL,
  experience_bonus INTEGER NOT NULL DEFAULT 0,
  gold_bonus INTEGER NOT NULL DEFAULT 0,
  item_reward_id UUID REFERENCES items(id),
  hitpoints_change INTEGER NOT NULL DEFAULT 0,
  energy_change INTEGER NOT NULL DEFAULT 0,
  stat_requirements JSONB,
  success_rate_formula JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Character Adventures table
CREATE TABLE IF NOT EXISTS character_adventures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  adventure_id UUID NOT NULL REFERENCES adventures(id),
  decision_id UUID REFERENCES adventure_decisions(id),
  outcome_id UUID REFERENCES adventure_outcomes(id),
  day INTEGER NOT NULL,
  adventure_number INTEGER NOT NULL,
  experience_gained INTEGER NOT NULL,
  gold_gained INTEGER NOT NULL,
  item_gained_id UUID REFERENCES items(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- World Boss table
CREATE TABLE IF NOT EXISTS world_boss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  boss_id UUID NOT NULL REFERENCES world_boss(id),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id),
  boss_id UUID NOT NULL REFERENCES world_boss(id),
  week INTEGER NOT NULL,
  reward_tier TEXT NOT NULL,
  item_id UUID REFERENCES items(id),
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_at TIMESTAMP WITH TIME ZONE
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

-- Sample data for testing

-- Sample items
INSERT INTO items (id, name, type, rarity, weapon_type, base_damage, value, effects) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Rusty Sword', 'Weapon', 'Common', 'Slashing', 5, 10, '{"stat_boosts": {"strength": 1}}'),
  ('22222222-2222-2222-2222-222222222222', 'Wooden Shield', 'Armor', 'Common', NULL, NULL, 8, '{"stat_boosts": {"defense": 2}}'),
  ('33333333-3333-3333-3333-333333333333', 'Leather Cap', 'Helmet', 'Common', NULL, NULL, 5, '{"stat_boosts": {"defense": 1}}'),
  ('44444444-4444-4444-4444-444444444444', 'Lucky Coin', 'Trinket', 'Uncommon', NULL, NULL, 25, '{"stat_boosts": {"luck": 2}}');

-- Sample adventure
INSERT INTO adventures (id, title, description, min_experience, min_gold, is_violent) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'The Forest Path', 'You encounter a mysterious path leading deep into the forest. Strange sounds echo from within.', 20, 10, true);

-- Sample adventure decisions
INSERT INTO adventure_decisions (id, adventure_id, description) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Follow the path deeper into the forest'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Investigate the strange sounds');

-- Sample adventure outcomes
INSERT INTO adventure_outcomes (id, decision_id, description, experience_bonus, gold_bonus, hitpoints_change, energy_change) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'You discover a hidden treasure chest!', 30, 20, 0, -5),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'You encounter a wild beast and barely escape!', 25, 5, -10, -10);

-- Sample world boss
INSERT INTO world_boss (id, name, description, week, total_hitpoints, current_hitpoints) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Ancient Dragon', 'A fearsome dragon that has awakened from its slumber.', 1, 10000, 10000);
