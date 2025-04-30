-- Add is_dungeon and dungeon_keys_required columns to areas table
ALTER TABLE areas
ADD COLUMN is_dungeon BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN dungeon_keys_required INTEGER NOT NULL DEFAULT 0;

-- Add dungeon_keys and dungeon_key_parts columns to characters table
ALTER TABLE characters
ADD COLUMN dungeon_keys INTEGER NOT NULL DEFAULT 0,
ADD COLUMN dungeon_key_parts FLOAT NOT NULL DEFAULT 0;

-- Create character_dungeons table to track active dungeons
CREATE TABLE IF NOT EXISTS character_dungeons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id uuid NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  area_id INTEGER NOT NULL REFERENCES areas(id),
  current_state VARCHAR NOT NULL DEFAULT 'none',
  current_adventure_id INTEGER REFERENCES adventures(id),
  decision_id INTEGER,
  outcome_id INTEGER,
  combat_id uuid REFERENCES combat(id),
  current_adventure_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, area_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_character_dungeons_character_id ON character_dungeons(character_id);
CREATE INDEX IF NOT EXISTS idx_character_dungeons_area_id ON character_dungeons(area_id);

-- Enable Row Level Security
ALTER TABLE IF EXISTS character_dungeons ENABLE ROW LEVEL SECURITY;

-- Character dungeons can only be accessed by the character's owner
CREATE POLICY character_dungeons_policy ON character_dungeons
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM characters
    WHERE characters.id = character_dungeons.character_id
    AND (characters.user_id::TEXT = auth.uid()::TEXT OR characters.user_id IS NULL)
  ));

-- Add comments to explain the purpose of the columns
COMMENT ON TABLE character_dungeons IS 'Tracks the current dungeon state for each character';
COMMENT ON COLUMN character_dungeons.current_state IS 'Current state of the character in the dungeon flow (none, adventure, combat, outcome)';
COMMENT ON COLUMN character_dungeons.current_adventure_id IS 'ID of the current dungeon adventure';
COMMENT ON COLUMN character_dungeons.decision_id IS 'ID of the selected decision';
COMMENT ON COLUMN character_dungeons.outcome_id IS 'ID of the current outcome';
COMMENT ON COLUMN character_dungeons.combat_id IS 'ID of the active combat';
COMMENT ON COLUMN character_dungeons.current_adventure_count IS 'Number of adventures completed in this dungeon session';
