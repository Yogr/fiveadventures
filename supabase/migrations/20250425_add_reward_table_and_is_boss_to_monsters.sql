-- Add reward_table and is_boss columns to monsters table
ALTER TABLE IF EXISTS public.monsters
ADD COLUMN IF NOT EXISTS reward_table INTEGER;

ALTER TABLE IF EXISTS public.monsters
ADD COLUMN IF NOT EXISTS is_boss BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.monsters.reward_table IS 'Reference to the reward table ID';
COMMENT ON COLUMN public.monsters.is_boss IS 'Whether the monster is a boss';
