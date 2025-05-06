-- Create the world_boss_status table to separate boss status from definition
CREATE TABLE IF NOT EXISTS world_boss_status (
  id SERIAL PRIMARY KEY,
  boss_id INTEGER NOT NULL REFERENCES world_boss(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  total_hitpoints INTEGER NOT NULL,
  current_hitpoints INTEGER NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  attack_count INTEGER NOT NULL DEFAULT 0,
  total_damage_received INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  defeated_at TIMESTAMPTZ,
  UNIQUE(boss_id, week)
);

-- Migrate existing status data from world_boss to world_boss_status
INSERT INTO world_boss_status (
  boss_id, week, total_hitpoints, current_hitpoints, player_count, 
  attack_count, total_damage_received, 
  created_at, defeated_at
)
SELECT 
  id, week, total_hitpoints, current_hitpoints, player_count, 
  attack_count, total_damage, 
  created_at, CASE WHEN is_defeated THEN defeated_at ELSE NULL END
FROM world_boss;

-- Add reward table references to world_boss table
ALTER TABLE world_boss
ADD COLUMN legendary_reward_table INTEGER REFERENCES reward_tables(id),
ADD COLUMN challenger_reward_table INTEGER REFERENCES reward_tables(id),
ADD COLUMN basic_reward_table INTEGER REFERENCES reward_tables(id);

-- Update world_boss table to use existing reward tables
UPDATE world_boss
SET 
  legendary_reward_table = (id * 10) + 4,
  challenger_reward_table = (id * 10) + 2,
  basic_reward_table = (id * 10) + 1
WHERE id IN (1, 2, 3);

-- Modify character_boss_progress table
ALTER TABLE character_boss_progress
DROP COLUMN has_pending_reward,
ADD COLUMN reward_claimed BOOLEAN NOT NULL DEFAULT FALSE;

-- Set reward_claimed to true for any character that already has a claimed reward
UPDATE character_boss_progress cbp
SET reward_claimed = true
WHERE EXISTS (
  SELECT 1 FROM boss_rewards br
  WHERE br.character_id = cbp.character_id
  AND br.boss_id = cbp.boss_id
  AND br.week = cbp.week
  AND br.is_claimed = true
);

-- Drop the boss_rewards table as it's no longer needed
DROP TABLE IF EXISTS boss_rewards;

-- Remove status columns from world_boss table
ALTER TABLE world_boss
DROP COLUMN current_hitpoints,
DROP COLUMN player_count,
DROP COLUMN attack_count,
DROP COLUMN total_damage,
DROP COLUMN is_defeated,
DROP COLUMN defeated_at;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_world_boss_status_boss_id ON world_boss_status(boss_id);
CREATE INDEX IF NOT EXISTS idx_world_boss_status_week ON world_boss_status(week);
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_reward_claimed ON character_boss_progress(reward_claimed);
