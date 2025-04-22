-- Add rare_item_chance column to monsters table
ALTER TABLE IF EXISTS public.monsters
ADD COLUMN IF NOT EXISTS rare_item_chance INTEGER;

COMMENT ON COLUMN public.monsters.rare_item_chance IS 'Percentage chance (0-100) of dropping a rare item';
