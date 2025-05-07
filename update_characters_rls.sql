-- Drop the existing policy
DROP POLICY IF EXISTS "characters_policy" ON "public"."characters";

-- Create a restrictive policy for INSERT, UPDATE, DELETE
CREATE POLICY "characters_modify_policy" 
ON "public"."characters"
FOR ALL 
TO public
USING (((auth.uid())::text = (user_id)::text) OR (user_id IS NULL));

-- Create a permissive policy for SELECT
CREATE POLICY "characters_select_policy" 
ON "public"."characters"
FOR SELECT
TO public
USING (true);  -- 'true' allows all SELECT operations
