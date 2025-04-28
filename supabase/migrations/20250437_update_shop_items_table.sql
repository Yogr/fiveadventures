-- Update shop_items table to change day column to chance column
ALTER TABLE shop_items RENAME COLUMN day TO chance;

-- Add shop_id column for easier querying
ALTER TABLE shop_items ADD COLUMN shop_id INTEGER NOT NULL DEFAULT 1;

-- Add index on shop_id
CREATE INDEX IF NOT EXISTS idx_shop_items_shop_id ON shop_items(shop_id);

-- Note: We're keeping the price column for backward compatibility
-- It could be removed in a future migration if no longer needed
