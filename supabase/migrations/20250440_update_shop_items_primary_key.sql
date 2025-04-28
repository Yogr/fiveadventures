-- First remove the existing primary key constraint
ALTER TABLE shop_items DROP CONSTRAINT shop_items_pkey;

-- Create a unique constraint on shop_id + item_id
ALTER TABLE shop_items 
  ADD CONSTRAINT shop_items_shop_id_item_id_key 
  UNIQUE (shop_id, item_id);

-- Create a new ID column that uses a serial sequence
ALTER TABLE shop_items ADD COLUMN new_id SERIAL;

-- Update existing records to have a unique new_id
UPDATE shop_items SET new_id = DEFAULT;

-- Make the new_id column the primary key
ALTER TABLE shop_items 
  ADD CONSTRAINT shop_items_pkey 
  PRIMARY KEY (new_id);

-- Rename new_id to id (swap out the old id column)
ALTER TABLE shop_items DROP COLUMN id;
ALTER TABLE shop_items RENAME COLUMN new_id TO id;
