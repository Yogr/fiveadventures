-- Remove NOT NULL constraint from current_hitpoints column in world_boss table
ALTER TABLE world_boss ALTER COLUMN current_hitpoints DROP NOT NULL;

-- Add DEFAULT value for current_hitpoints to equal total_hitpoints if not specified
ALTER TABLE world_boss 
  ADD CONSTRAINT default_current_hitpoints 
  CHECK (current_hitpoints IS NOT NULL OR total_hitpoints IS NOT NULL);

-- Add trigger to set current_hitpoints equal to total_hitpoints on INSERT if current_hitpoints is NULL
CREATE OR REPLACE FUNCTION set_default_current_hitpoints()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_hitpoints IS NULL THEN
    NEW.current_hitpoints := NEW.total_hitpoints;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_world_boss_current_hitpoints
BEFORE INSERT ON world_boss
FOR EACH ROW
EXECUTE FUNCTION set_default_current_hitpoints();

-- Update any existing NULL values
UPDATE world_boss SET current_hitpoints = total_hitpoints WHERE current_hitpoints IS NULL;
