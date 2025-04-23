-- Add missing columns to adventure_decisions table for our updated format
ALTER TABLE adventure_decisions ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE adventure_decisions ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE adventure_decisions ADD COLUMN IF NOT EXISTS stat_check TEXT;
ALTER TABLE adventure_decisions ADD COLUMN IF NOT EXISTS base_success_rate INTEGER;
ALTER TABLE adventure_decisions ADD COLUMN IF NOT EXISTS mastery JSONB;

-- Add missing is_success column to adventure_outcomes
ALTER TABLE adventure_outcomes ADD COLUMN IF NOT EXISTS is_success BOOLEAN DEFAULT TRUE;
