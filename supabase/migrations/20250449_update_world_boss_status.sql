-- Add total_hitpoints to world_boss_status table
ALTER TABLE world_boss_status
ADD COLUMN total_hitpoints INTEGER NOT NULL DEFAULT 0;

-- Update total_hitpoints from world_boss table
UPDATE world_boss_status wbs
SET total_hitpoints = wb.total_hitpoints
FROM world_boss wb
WHERE wbs.boss_id = wb.id;

-- Remove is_defeated column from world_boss_status
ALTER TABLE world_boss_status
DROP COLUMN is_defeated;

-- Create function to check if a boss is defeated
CREATE OR REPLACE FUNCTION is_boss_defeated(status_id INTEGER) RETURNS BOOLEAN AS $$
DECLARE
  status_record world_boss_status%ROWTYPE;
BEGIN
  SELECT * INTO status_record FROM world_boss_status WHERE id = status_id;
  RETURN (status_record.current_hitpoints <= 0 OR status_record.total_damage_received >= status_record.total_hitpoints);
END;
$$ LANGUAGE plpgsql;

-- Create function to create a new world_boss_status record for a new week if one doesn't exist
CREATE OR REPLACE FUNCTION ensure_world_boss_status_for_week(boss_id INTEGER, week_number INTEGER) RETURNS INTEGER AS $$
DECLARE
  status_id INTEGER;
  boss_record world_boss%ROWTYPE;
BEGIN
  -- Check if a status record already exists for this boss and week
  SELECT id INTO status_id FROM world_boss_status WHERE boss_id = ensure_world_boss_status_for_week.boss_id AND week = week_number;
  
  -- If no record exists, create one
  IF status_id IS NULL THEN
    -- Get the boss record
    SELECT * INTO boss_record FROM world_boss WHERE id = ensure_world_boss_status_for_week.boss_id;
    
    -- Insert a new status record
    INSERT INTO world_boss_status (
      boss_id, 
      week, 
      total_hitpoints,
      current_hitpoints, 
      player_count, 
      attack_count, 
      total_damage_received, 
      created_at
    ) VALUES (
      ensure_world_boss_status_for_week.boss_id,
      week_number,
      boss_record.total_hitpoints,
      boss_record.total_hitpoints,
      0,
      0,
      0,
      NOW()
    ) RETURNING id INTO status_id;
  END IF;
  
  RETURN status_id;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to ensure a world_boss_status record exists when a world_boss record is accessed
CREATE OR REPLACE FUNCTION trigger_ensure_world_boss_status() RETURNS TRIGGER AS $$
BEGIN
  PERFORM ensure_world_boss_status_for_week(NEW.id, NEW.week);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_world_boss_status_trigger
AFTER INSERT ON world_boss
FOR EACH ROW
EXECUTE FUNCTION trigger_ensure_world_boss_status();
