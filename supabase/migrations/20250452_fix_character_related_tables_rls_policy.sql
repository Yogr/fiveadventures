-- Migration: Fix RLS policies for character-related tables to allow users to manage their own data

-- Character Equipment Table
DROP POLICY IF EXISTS admin_all_character_equipment ON character_equipment;

CREATE POLICY user_manage_own_character_equipment ON character_equipment
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_equipment.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_equipment.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_equipment ON character_equipment 
  FOR ALL USING (is_admin());

-- Character Inventory Table
DROP POLICY IF EXISTS admin_all_character_inventory ON character_inventory;

CREATE POLICY user_manage_own_character_inventory ON character_inventory
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_inventory.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_inventory.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_inventory ON character_inventory 
  FOR ALL USING (is_admin());

-- Character Skills Table
DROP POLICY IF EXISTS admin_all_character_skills ON character_skills;

CREATE POLICY user_manage_own_character_skills ON character_skills
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_skills.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_skills.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_skills ON character_skills 
  FOR ALL USING (is_admin());

-- Character Adventures Table
DROP POLICY IF EXISTS admin_all_character_adventures ON character_adventures;

CREATE POLICY user_manage_own_character_adventures ON character_adventures
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_adventures.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_adventures.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_adventures ON character_adventures 
  FOR ALL USING (is_admin());

-- Character Selected Area Table
DROP POLICY IF EXISTS admin_all_character_selected_area ON character_selected_area;

CREATE POLICY user_manage_own_character_selected_area ON character_selected_area
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_selected_area.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_selected_area.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_selected_area ON character_selected_area 
  FOR ALL USING (is_admin());

-- Character Boss Progress Table
DROP POLICY IF EXISTS admin_all_character_boss_progress ON character_boss_progress;

CREATE POLICY user_manage_own_character_boss_progress ON character_boss_progress
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_boss_progress.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_boss_progress.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_boss_progress ON character_boss_progress 
  FOR ALL USING (is_admin());

-- Combat Table
DROP POLICY IF EXISTS admin_all_combat ON combat;

CREATE POLICY user_manage_own_combat ON combat
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = combat.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = combat.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_combat ON combat 
  FOR ALL USING (is_admin());

-- Combat Turns Table
DROP POLICY IF EXISTS admin_all_combat_turns ON combat_turns;

CREATE POLICY user_manage_own_combat_turns ON combat_turns
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if combat belongs to the current user's character
    EXISTS (
      SELECT 1 FROM combat
      JOIN characters ON combat.character_id = characters.id
      WHERE combat.id = combat_turns.combat_id
      AND characters.user_id = auth.uid()
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_combat_turns ON combat_turns 
  FOR ALL USING (is_admin());

-- Character Dungeons Table
DROP POLICY IF EXISTS admin_all_character_dungeons ON character_dungeons;

CREATE POLICY user_manage_own_character_dungeons ON character_dungeons
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_dungeons.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for triggers)
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_dungeons.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_character_dungeons ON character_dungeons 
  FOR ALL USING (is_admin());

-- Characters Table - Make sure users can create and manage their own characters
DROP POLICY IF EXISTS admin_all_characters ON characters;

CREATE POLICY user_manage_own_characters ON characters
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    (user_id = auth.uid()) OR
    -- Allow if character is unlinked (for new character creation)
    (user_id IS NULL OR status = 'unlinked')
  );

-- Add back the admin policy with lower priority
CREATE POLICY admin_all_characters ON characters 
  FOR ALL USING (is_admin());
