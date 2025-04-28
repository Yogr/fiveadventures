-- Remove NOT NULL constraint from price column in shop_items table
ALTER TABLE shop_items ALTER COLUMN price DROP NOT NULL;

-- Add a default value of 0 to price column
ALTER TABLE shop_items ALTER COLUMN price SET DEFAULT 0;

-- Update any existing NULL values to use the default
UPDATE shop_items SET price = 0 WHERE price IS NULL;
