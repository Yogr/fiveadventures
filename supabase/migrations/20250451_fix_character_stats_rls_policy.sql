-- Migration: Fix character_stats RLS policy to allow users to create and update their own character stats

-- Drop the existing admin-only policy for character_stats
DROP POLICY IF EXISTS admin_all_character_stats ON character_stats;

-- Add a policy that allows users to create and update their own character stats
-- This policy checks if the character_id in character_stats belongs to the current user
CREATE POLICY user_manage_own_character_stats ON character_stats
  FOR ALL USING (
    -- Allow if user is admin
    is_admin() OR
    -- Allow if character belongs to the current user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_stats.character_id
      AND characters.user_id = auth.uid()
    ) OR
    -- Allow if this is a new character being created (for the trigger)
    -- This is needed because the trigger runs before the character is fully linked to a user
    EXISTS (
      SELECT 1 FROM characters
      WHERE characters.id = character_stats.character_id
      AND (characters.user_id IS NULL OR characters.status = 'unlinked')
    )
  );

-- Add back the admin policy with lower priority (it will be checked after the user policy)
CREATE POLICY admin_all_character_stats ON character_stats 
  FOR ALL USING (is_admin());
