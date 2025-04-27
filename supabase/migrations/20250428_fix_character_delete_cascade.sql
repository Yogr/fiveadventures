-- Fix foreign key constraints to allow proper deletion of characters (2025-04-30)
-- by setting up proper cascading delete operations

-- First, drop the existing foreign key constraint from character_adventures to combat
ALTER TABLE character_adventures
DROP CONSTRAINT IF EXISTS character_adventures_combat_id_fkey;

-- Re-add it with CASCADE DELETE
ALTER TABLE character_adventures
ADD CONSTRAINT character_adventures_combat_id_fkey
FOREIGN KEY (combat_id)
REFERENCES combat(id)
ON DELETE CASCADE;

-- Make sure combat also cascades deletions when a character is deleted
ALTER TABLE combat
DROP CONSTRAINT IF EXISTS combat_character_id_fkey;

ALTER TABLE combat
ADD CONSTRAINT combat_character_id_fkey
FOREIGN KEY (character_id)
REFERENCES characters(id)
ON DELETE CASCADE;

-- Create a function to properly delete a character and all related data
CREATE OR REPLACE FUNCTION delete_character(character_id TEXT)
RETURNS void AS $$
BEGIN
    -- Delete from character_adventures first (this will cascade to combat due to our new constraint)
    DELETE FROM character_adventures WHERE character_id = $1;
    
    -- Delete any boss progress
    DELETE FROM character_boss_progress WHERE character_id = $1;
    
    -- Delete equipment
    DELETE FROM character_equipment WHERE character_id = $1;
    
    -- Delete inventory
    DELETE FROM character_inventory WHERE character_id = $1;
    
    -- Delete skills
    DELETE FROM character_skills WHERE character_id = $1;
    
    -- Delete area selections
    DELETE FROM character_selected_area WHERE character_id = $1;
    
    -- Delete any remaining combat records
    DELETE FROM combat WHERE character_id = $1;
    
    -- Finally delete the character itself
    DELETE FROM characters WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT delete_character('your-character-id-here');

-- Create a stored procedure version for easier calling from server-side code
CREATE OR REPLACE PROCEDURE delete_character_procedure(character_id TEXT)
AS $$
BEGIN
    PERFORM delete_character(character_id);
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- CALL delete_character_procedure('your-character-id-here');
