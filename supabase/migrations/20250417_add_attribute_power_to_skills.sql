-- Add attribute and power columns to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS attribute TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS power INTEGER DEFAULT 0;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS level_required INTEGER DEFAULT 1;

-- Add comments to explain the purpose of the columns
COMMENT ON COLUMN skills.attribute IS 'The attribute this skill relies on (strength, intelligence, agility, luck)';
COMMENT ON COLUMN skills.power IS 'The base power of the skill';