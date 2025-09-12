
-- Migration 011: Add add_featured_to_title field to tracks table

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS add_featured_to_title BOOLEAN DEFAULT FALSE;

-- Add index for better performance if needed
CREATE INDEX IF NOT EXISTS idx_tracks_featured_to_title ON tracks(add_featured_to_title);
