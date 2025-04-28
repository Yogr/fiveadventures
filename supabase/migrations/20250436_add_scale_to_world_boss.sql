-- Migration to add 'scale' column to world_boss table
ALTER TABLE "public"."world_boss" ADD COLUMN "scale" NUMERIC DEFAULT 4.0;
