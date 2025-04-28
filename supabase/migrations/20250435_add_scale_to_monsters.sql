-- The database-types.ts already defines the scale column, but we need to ensure it exists in the database

-- Check if the scale column already exists
DO $$ 
BEGIN
  -- Add the scale column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'monsters' 
    AND column_name = 'scale'
  ) THEN
    ALTER TABLE monsters 
    ADD COLUMN scale DOUBLE PRECISION DEFAULT 1.0;
  END IF;
END $$;
