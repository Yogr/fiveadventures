-- Update delete_character function to explicitly delete character_stats row
CREATE OR REPLACE FUNCTION delete_character(character_id TEXT)
RETURNS void AS $$
BEGIN
    -- Delete from character_adventures first (this will cascade to combat due to our constraint)
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
    
    -- Delete character stats
    DELETE FROM character_stats WHERE character_id = $1;
    
    -- Delete any remaining combat records
    DELETE FROM combat WHERE character_id = $1;
    
    -- Finally delete the character itself
    DELETE FROM characters WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Update the stored procedure version as well
CREATE OR REPLACE PROCEDURE delete_character_procedure(character_id TEXT)
AS $$
BEGIN
    PERFORM delete_character(character_id);
END;
$$ LANGUAGE plpgsql;
