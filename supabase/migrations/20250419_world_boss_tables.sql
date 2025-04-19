-- Create the world_boss table if it doesn't exist
CREATE TABLE IF NOT EXISTS world_boss (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  week INTEGER NOT NULL,
  total_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  is_defeated BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  defeated_at TIMESTAMPTZ
);

-- Create the character_boss_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS character_boss_progress (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  boss_id INTEGER NOT NULL REFERENCES world_boss(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage INTEGER NOT NULL DEFAULT 0,
  has_pending_reward BOOLEAN NOT NULL DEFAULT FALSE,
  last_attack TIMESTAMPTZ,
  UNIQUE(character_id, boss_id, week)
);

-- Create the boss_rewards table if it doesn't exist
CREATE TABLE IF NOT EXISTS boss_rewards (
  id UUID PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  boss_id INTEGER NOT NULL REFERENCES world_boss(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  reward_tier TEXT NOT NULL,
  item_id INTEGER REFERENCES items(id),
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

-- Create reward tables for each boss and tier
-- These tables will be used to determine rewards based on boss type and reward tier

-- Create reward tables for Ancient Dragon (boss_id = 1)
INSERT INTO reward_tables (id, name, description, created_at)
VALUES 
  (11, 'Ancient Dragon - Common', 'Common rewards for defeating the Ancient Dragon', NOW()),
  (12, 'Ancient Dragon - Rare', 'Rare rewards for defeating the Ancient Dragon', NOW()),
  (13, 'Ancient Dragon - Epic', 'Epic rewards for defeating the Ancient Dragon', NOW()),
  (14, 'Ancient Dragon - Legendary', 'Legendary rewards for defeating the Ancient Dragon', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create reward tables for Forest Guardian (boss_id = 2)
INSERT INTO reward_tables (id, name, description, created_at)
VALUES 
  (21, 'Forest Guardian - Common', 'Common rewards for defeating the Forest Guardian', NOW()),
  (22, 'Forest Guardian - Rare', 'Rare rewards for defeating the Forest Guardian', NOW()),
  (23, 'Forest Guardian - Epic', 'Epic rewards for defeating the Forest Guardian', NOW()),
  (24, 'Forest Guardian - Legendary', 'Legendary rewards for defeating the Forest Guardian', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create reward tables for Kraken of the Deep (boss_id = 3)
INSERT INTO reward_tables (id, name, description, created_at)
VALUES 
  (31, 'Kraken of the Deep - Common', 'Common rewards for defeating the Kraken of the Deep', NOW()),
  (32, 'Kraken of the Deep - Rare', 'Rare rewards for defeating the Kraken of the Deep', NOW()),
  (33, 'Kraken of the Deep - Epic', 'Epic rewards for defeating the Kraken of the Deep', NOW()),
  (34, 'Kraken of the Deep - Legendary', 'Legendary rewards for defeating the Kraken of the Deep', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_char_id ON character_boss_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_boss_id ON character_boss_progress(boss_id);
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_week ON character_boss_progress(week);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_char_id ON boss_rewards(character_id);
CREATE INDEX IF NOT EXISTS idx_boss_rewards_claimed ON boss_rewards(is_claimed);
CREATE INDEX IF NOT EXISTS idx_world_boss_week ON world_boss(week);
