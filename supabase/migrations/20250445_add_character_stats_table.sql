-- Add character_stats table
CREATE TABLE character_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  power_level INTEGER NOT NULL DEFAULT 0,
  total_adventures_completed INTEGER NOT NULL DEFAULT 0,
  bosses_slain INTEGER NOT NULL DEFAULT 0,
  highest_boss_damage INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT character_stats_character_id_key UNIQUE (character_id)
);

-- Add indexes for better query performance
CREATE INDEX character_stats_power_level_idx ON character_stats(power_level DESC);
CREATE INDEX character_stats_total_adventures_completed_idx ON character_stats(total_adventures_completed DESC);
CREATE INDEX character_stats_bosses_slain_idx ON character_stats(bosses_slain DESC);
CREATE INDEX character_stats_highest_boss_damage_idx ON character_stats(highest_boss_damage DESC);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_character_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_character_stats_updated_at
BEFORE UPDATE ON character_stats
FOR EACH ROW
EXECUTE FUNCTION update_character_stats_updated_at();

-- Create trigger to automatically create a character_stats entry when a character is created
CREATE OR REPLACE FUNCTION create_character_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO character_stats (character_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_character_created
AFTER INSERT ON characters
FOR EACH ROW
EXECUTE FUNCTION create_character_stats();

-- Populate character_stats for existing characters
INSERT INTO character_stats (character_id)
SELECT id FROM characters
WHERE id NOT IN (SELECT character_id FROM character_stats);
