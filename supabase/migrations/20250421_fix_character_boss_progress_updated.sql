-- Fix the character_boss_progress table by adding both column versions
ALTER TABLE IF EXISTS character_boss_progress 
ADD COLUMN IF NOT EXISTS has_pending_reward BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE IF EXISTS character_boss_progress 
ADD COLUMN IF NOT EXISTS pending_rewards BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure the columns stay in sync with a trigger
CREATE OR REPLACE FUNCTION sync_pending_reward_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.has_pending_reward IS DISTINCT FROM OLD.has_pending_reward THEN
      NEW.pending_rewards := NEW.has_pending_reward;
    ELSIF NEW.pending_rewards IS DISTINCT FROM OLD.pending_rewards THEN
      NEW.has_pending_reward := NEW.pending_rewards;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for synchronizing the columns
DROP TRIGGER IF EXISTS sync_pending_reward_trigger ON character_boss_progress;
CREATE TRIGGER sync_pending_reward_trigger
BEFORE UPDATE ON character_boss_progress
FOR EACH ROW EXECUTE FUNCTION sync_pending_reward_columns();

-- Ensure the indexes are created
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_char_id ON character_boss_progress(character_id);
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_boss_id ON character_boss_progress(boss_id);
CREATE INDEX IF NOT EXISTS idx_char_boss_prog_week ON character_boss_progress(week);

-- Refresh the schema cache for this table
COMMENT ON TABLE character_boss_progress IS 'Tracks character progress against world bosses';
