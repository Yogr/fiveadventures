-- Create a function to check if a procedure exists
CREATE OR REPLACE FUNCTION procedure_exists(procedure_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = procedure_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to force delete character combat records
CREATE OR REPLACE FUNCTION force_delete_character_combat(character_id_param UUID)
RETURNS VOID AS $$
DECLARE
  combat_ids UUID[];
BEGIN
  -- Get all combat IDs related to this character
  SELECT ARRAY_AGG(id) INTO combat_ids
  FROM combat
  WHERE character_id = character_id_param;
  
  -- Delete combat turns first using the combat IDs
  IF combat_ids IS NOT NULL THEN
    DELETE FROM combat_turns 
    WHERE combat_id = ANY(combat_ids);
  END IF;
  
  -- Then delete combat records
  DELETE FROM combat 
  WHERE character_id = character_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get references to a character
CREATE OR REPLACE FUNCTION get_character_references(character_id_param UUID)
RETURNS TABLE(table_name TEXT, column_name TEXT, count BIGINT) AS $$
DECLARE
  combat_ids UUID[];
BEGIN
  -- Get all combat IDs related to this character
  SELECT ARRAY_AGG(id) INTO combat_ids
  FROM combat
  WHERE character_id = character_id_param;
  
  -- Return counts from each table
  RETURN QUERY
  SELECT 
    'combat_turns'::TEXT as table_name, 
    'combat_id'::TEXT as column_name, 
    COALESCE((SELECT COUNT(*)::BIGINT FROM combat_turns WHERE combat_id = ANY(combat_ids)), 0)
  UNION ALL
  SELECT 
    'combat'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM combat 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'character_adventures'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM character_adventures 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'character_inventory'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM character_inventory 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'character_equipment'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM character_equipment 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'character_skills'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM character_skills 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'character_boss_progress'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM character_boss_progress 
  WHERE character_id = character_id_param
  UNION ALL
  SELECT 
    'boss_rewards'::TEXT, 
    'character_id'::TEXT, 
    COUNT(*)::BIGINT
  FROM boss_rewards 
  WHERE character_id = character_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create a master function that creates all delete procedures
CREATE OR REPLACE FUNCTION create_force_delete_procedures()
RETURNS BOOLEAN AS $$
BEGIN
  -- The implementation is already handled by creating the individual functions above
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a complete delete function to handle all character data
CREATE OR REPLACE FUNCTION complete_character_delete(character_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN := TRUE;
  combat_ids UUID[];
BEGIN
  -- Get all combat IDs related to this character first
  SELECT ARRAY_AGG(id) INTO combat_ids
  FROM combat
  WHERE character_id = character_id_param;
  
  -- First level - Delete combat turns first using combat IDs
  IF combat_ids IS NOT NULL AND array_length(combat_ids, 1) > 0 THEN
    RAISE NOTICE 'Deleting combat turns for combat IDs: %', combat_ids;
    DELETE FROM combat_turns 
    WHERE combat_id = ANY(combat_ids);
  ELSE
    RAISE NOTICE 'No combat IDs found for character: %', character_id_param;
  END IF;
  
  -- Delete from other tables with no dependencies
  DELETE FROM character_inventory WHERE character_id = character_id_param;
  DELETE FROM character_skills WHERE character_id = character_id_param;
  DELETE FROM boss_rewards WHERE character_id = character_id_param;
  DELETE FROM character_selected_area WHERE character_id = character_id_param;
  
  -- Second level - delete combat records
  DELETE FROM combat WHERE character_id = character_id_param;
  DELETE FROM character_boss_progress WHERE character_id = character_id_param;
  
  -- Third level
  DELETE FROM character_adventures WHERE character_id = character_id_param;
  DELETE FROM character_equipment WHERE character_id = character_id_param;
  
  -- Finally, delete the character
  DELETE FROM characters WHERE id = character_id_param;
  
  -- Check if the character was deleted
  IF EXISTS (SELECT 1 FROM characters WHERE id = character_id_param) THEN
    success := FALSE;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql;
