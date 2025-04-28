-- Add a stored procedure to completely reset the items table
-- This is needed to handle cases where there are duplicate IDs across different item files

CREATE OR REPLACE FUNCTION reset_items_table()
RETURNS void AS $$
BEGIN
  -- Delete all rows from items table
  -- First we need to remove foreign key constraints that might block deletion
  
  -- Temporarily disable referential triggers to allow deleting items
  SET session_replication_role = 'replica';
  
  -- Delete all items
  DELETE FROM items;
  
  -- Reset the ID sequence if we're using serial IDs
  -- If you're not using a sequence, this can be removed
  -- ALTER SEQUENCE items_id_seq RESTART WITH 1;
  
  -- Re-enable referential triggers
  SET session_replication_role = 'origin';
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION reset_items_table() TO service_role;
