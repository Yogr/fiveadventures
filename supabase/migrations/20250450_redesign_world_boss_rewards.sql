-- Drop the boss_rewards table
DROP TABLE IF EXISTS boss_rewards;

-- Modify the character_boss_progress table
ALTER TABLE character_boss_progress 
  DROP COLUMN IF EXISTS reward_id,
  ADD COLUMN IF NOT EXISTS reward_claimed BOOLEAN DEFAULT FALSE;

-- Create the world_boss_status table
CREATE TABLE IF NOT EXISTS world_boss_status (
  id SERIAL PRIMARY KEY,
  boss_id INTEGER NOT NULL REFERENCES world_boss(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  total_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  player_count INTEGER DEFAULT 0,
  attack_count INTEGER DEFAULT 0,
  total_damage_received INTEGER DEFAULT 0,
  is_defeated BOOLEAN DEFAULT FALSE,
  defeated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(boss_id, week)
);

-- Move columns from world_boss to world_boss_status
ALTER TABLE world_boss
  DROP COLUMN IF EXISTS current_hitpoints,
  DROP COLUMN IF EXISTS player_count,
  DROP COLUMN IF EXISTS attack_count,
  DROP COLUMN IF EXISTS total_damage_received,
  DROP COLUMN IF EXISTS is_defeated,
  DROP COLUMN IF EXISTS defeated_at;

-- Add reward table columns to world_boss
ALTER TABLE world_boss
  ADD COLUMN IF NOT EXISTS legendary_reward_table INTEGER REFERENCES reward_tables(id),
  ADD COLUMN IF NOT EXISTS challenger_reward_table INTEGER REFERENCES reward_tables(id),
  ADD COLUMN IF NOT EXISTS basic_reward_table INTEGER REFERENCES reward_tables(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_character_id ON character_boss_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_boss_id ON character_boss_progress(boss_id);
CREATE INDEX IF NOT EXISTS idx_character_boss_progress_week ON character_boss_progress(week);
CREATE INDEX IF NOT EXISTS idx_world_boss_status_boss_id ON world_boss_status(boss_id);
CREATE INDEX IF NOT EXISTS idx_world_boss_status_week ON world_boss_status(week);
