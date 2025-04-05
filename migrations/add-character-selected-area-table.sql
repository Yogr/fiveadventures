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
