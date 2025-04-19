-- Add music_enabled and sound_enabled columns to users table
ALTER TABLE users
ADD COLUMN music_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN sound_enabled BOOLEAN NOT NULL DEFAULT false;
