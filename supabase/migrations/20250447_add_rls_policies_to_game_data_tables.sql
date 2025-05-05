-- Migration: Add Row Level Security policies to game data tables

-- Enable RLS on all specified tables
ALTER TABLE adventure_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_boss ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS public_read_adventure_decisions ON adventure_decisions;
DROP POLICY IF EXISTS public_read_adventure_outcomes ON adventure_outcomes;
DROP POLICY IF EXISTS public_read_adventures ON adventures;
DROP POLICY IF EXISTS public_read_areas ON areas;
DROP POLICY IF EXISTS public_read_character_stats ON character_stats;
DROP POLICY IF EXISTS public_read_items ON items;
DROP POLICY IF EXISTS public_read_monsters ON monsters;
DROP POLICY IF EXISTS public_read_reward_items ON reward_items;
DROP POLICY IF EXISTS public_read_reward_tables ON reward_tables;
DROP POLICY IF EXISTS public_read_shop_items ON shop_items;
DROP POLICY IF EXISTS public_read_skills ON skills;
DROP POLICY IF EXISTS public_read_world_boss ON world_boss;

DROP POLICY IF EXISTS admin_all_adventure_decisions ON adventure_decisions;
DROP POLICY IF EXISTS admin_all_adventure_outcomes ON adventure_outcomes;
DROP POLICY IF EXISTS admin_all_adventures ON adventures;
DROP POLICY IF EXISTS admin_all_areas ON areas;
DROP POLICY IF EXISTS admin_all_character_stats ON character_stats;
DROP POLICY IF EXISTS admin_all_items ON items;
DROP POLICY IF EXISTS admin_all_monsters ON monsters;
DROP POLICY IF EXISTS admin_all_reward_items ON reward_items;
DROP POLICY IF EXISTS admin_all_reward_tables ON reward_tables;
DROP POLICY IF EXISTS admin_all_shop_items ON shop_items;
DROP POLICY IF EXISTS admin_all_skills ON skills;
DROP POLICY IF EXISTS admin_all_world_boss ON world_boss;

-- Add public read access policy to all tables
-- This allows anyone (including non-authenticated users) to read data
CREATE POLICY public_read_adventure_decisions ON adventure_decisions FOR SELECT USING (true);
CREATE POLICY public_read_adventure_outcomes ON adventure_outcomes FOR SELECT USING (true);
CREATE POLICY public_read_adventures ON adventures FOR SELECT USING (true);
CREATE POLICY public_read_areas ON areas FOR SELECT USING (true);
CREATE POLICY public_read_character_stats ON character_stats FOR SELECT USING (true);
CREATE POLICY public_read_items ON items FOR SELECT USING (true);
CREATE POLICY public_read_monsters ON monsters FOR SELECT USING (true);
CREATE POLICY public_read_reward_items ON reward_items FOR SELECT USING (true);
CREATE POLICY public_read_reward_tables ON reward_tables FOR SELECT USING (true);
CREATE POLICY public_read_shop_items ON shop_items FOR SELECT USING (true);
CREATE POLICY public_read_skills ON skills FOR SELECT USING (true);
CREATE POLICY public_read_world_boss ON world_boss FOR SELECT USING (true);

-- Add admin-only policies for all write operations (INSERT, UPDATE, DELETE)
-- This restricts modifications to admin users only
CREATE POLICY admin_all_adventure_decisions ON adventure_decisions 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_adventure_outcomes ON adventure_outcomes 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_adventures ON adventures 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_areas ON areas 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_character_stats ON character_stats 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_items ON items 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_monsters ON monsters 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_reward_items ON reward_items 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_reward_tables ON reward_tables 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_shop_items ON shop_items 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_skills ON skills 
  FOR ALL USING (is_admin());

CREATE POLICY admin_all_world_boss ON world_boss 
  FOR ALL USING (is_admin());

-- Verify the is_admin() function exists, create it if it doesn't
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'is_admin' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    EXECUTE $create_function$
      CREATE FUNCTION is_admin() 
      RETURNS boolean AS $func$
      BEGIN
        RETURN (
          SELECT status = 'admin' 
          FROM users 
          WHERE id = auth.uid()
        );
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER;
    $create_function$;
  END IF;
END
$do$;
