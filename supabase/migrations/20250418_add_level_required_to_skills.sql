-- Add level_required column to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS level_required INTEGER DEFAULT 1;
