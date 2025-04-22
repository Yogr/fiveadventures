-- Add wisdom column to characters table
ALTER TABLE "characters" ADD COLUMN "wisdom" integer NOT NULL DEFAULT 0;

-- Update existing records with default wisdom values based on class
UPDATE "characters" SET "wisdom" = 4 WHERE "class" = 'Warrior';
UPDATE "characters" SET "wisdom" = 7 WHERE "class" = 'Wizard';
UPDATE "characters" SET "wisdom" = 5 WHERE "class" = 'Thief';
UPDATE "characters" SET "wisdom" = 6 WHERE "class" = 'Ranger';
UPDATE "characters" SET "wisdom" = 10 WHERE "class" = 'Cleric';

-- Allow wisdom for requirements in adventure outcomes and other json fields
COMMENT ON COLUMN "adventure_outcomes"."stat_requirements" IS 'JSON object with stat requirements (strength, intelligence, agility, luck, wisdom)';
