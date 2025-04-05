-- Add area_ids column to adventures table
ALTER TABLE adventures ADD COLUMN area_ids INTEGER[] DEFAULT '{-1}';

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  level_requirement INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add character_selected_area table to track which area a character has selected for the day
CREATE TABLE IF NOT EXISTS character_selected_area (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id) UNIQUE,
  area_id INTEGER NOT NULL,
  day INTEGER NOT NULL,
  selected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_character_selected_area_character_id ON character_selected_area(character_id);

-- Enable Row Level Security
ALTER TABLE IF EXISTS character_selected_area ENABLE ROW LEVEL SECURITY;

-- Character selected area can only be accessed by the character's owner
CREATE POLICY character_selected_area_policy ON character_selected_area
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_selected_area.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));
