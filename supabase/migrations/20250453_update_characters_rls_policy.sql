-- Drop the existing policies
DROP POLICY IF EXISTS "characters_policy" ON "public"."characters";
DROP POLICY IF EXISTS "user_manage_own_characters" ON "public"."characters";
DROP POLICY IF EXISTS "admin_all_characters" ON "public"."characters";

-- Create a restrictive policy for INSERT, UPDATE, DELETE
CREATE POLICY "characters_modify_policy" 
ON "public"."characters"
FOR ALL 
TO public
USING (
  -- Allow if user is admin
  is_admin() OR
  -- Allow if character belongs to the current user
  ((auth.uid())::text = (user_id)::text) OR 
  -- Allow if character is unlinked (for new character creation)
  (user_id IS NULL OR status = 'unlinked')
);

-- Create a permissive policy for SELECT
CREATE POLICY "characters_select_policy" 
ON "public"."characters"
FOR SELECT
TO public
USING (true);  -- 'true' allows all SELECT operations
