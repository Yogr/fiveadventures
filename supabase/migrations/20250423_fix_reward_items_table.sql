-- Fix reward_items table ID issue

-- First, drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'reward_items_pkey' 
        AND conrelid = 'reward_items'::regclass
    ) THEN
        ALTER TABLE IF EXISTS public.reward_items DROP CONSTRAINT reward_items_pkey;
    END IF;
END $$;

-- Now, if the ID column is NOT NULL, alter it to allow NULL temporarily
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'reward_items' 
        AND column_name = 'id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE IF EXISTS public.reward_items ALTER COLUMN id DROP NOT NULL;
    END IF;
END $$;

-- Add a sequence for reward_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_sequences WHERE sequencename = 'reward_items_id_seq'
    ) THEN
        CREATE SEQUENCE IF NOT EXISTS public.reward_items_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
    END IF;
END $$;

-- Set the default value of the id column to use the sequence
ALTER TABLE IF EXISTS public.reward_items 
ALTER COLUMN id SET DEFAULT nextval('public.reward_items_id_seq'::regclass);

-- Create a unique constraint on reward_table_id and item_id
ALTER TABLE IF EXISTS public.reward_items
ADD CONSTRAINT reward_items_reward_table_id_item_id_key UNIQUE (reward_table_id, item_id);

-- Create the primary key constraint
ALTER TABLE IF EXISTS public.reward_items
ADD CONSTRAINT reward_items_pkey PRIMARY KEY (id);

-- Update any existing NULL IDs with sequence values
UPDATE public.reward_items SET id = nextval('public.reward_items_id_seq') WHERE id IS NULL;

-- Set the ID column back to NOT NULL
ALTER TABLE IF EXISTS public.reward_items ALTER COLUMN id SET NOT NULL;

-- Set the sequence's last value to the maximum ID
SELECT setval('public.reward_items_id_seq', COALESCE((SELECT MAX(id) FROM public.reward_items), 1), false);
