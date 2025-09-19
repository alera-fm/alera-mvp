-- Migration 035: Add new release fields for enhanced New Release flow
-- Date: 2025-01-27
-- Description: Add copyright fields, artist profile links, and additional delivery options

-- Add new fields to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS c_line VARCHAR(255);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS p_line VARCHAR(255);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS has_spotify_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS spotify_profile_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS has_apple_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS apple_profile_url TEXT;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS additional_delivery JSONB DEFAULT '[]';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_releases_spotify_profile ON releases(has_spotify_profile);
CREATE INDEX IF NOT EXISTS idx_releases_apple_profile ON releases(has_apple_profile);
CREATE INDEX IF NOT EXISTS idx_releases_additional_delivery ON releases USING GIN (additional_delivery);

-- Add comments to document the new fields
COMMENT ON COLUMN releases.c_line IS 'C-Line copyright information (©)';
COMMENT ON COLUMN releases.p_line IS 'P-Line phonogram rights information (℗)';
COMMENT ON COLUMN releases.has_spotify_profile IS 'Whether artist has existing Spotify for Artists profile';
COMMENT ON COLUMN releases.spotify_profile_url IS 'URL to existing Spotify for Artists profile';
COMMENT ON COLUMN releases.has_apple_profile IS 'Whether artist has existing Apple Music for Artists profile';
COMMENT ON COLUMN releases.apple_profile_url IS 'URL to existing Apple Music for Artists profile';
COMMENT ON COLUMN releases.additional_delivery IS 'JSON array of additional delivery services selected';

-- Update the updated_at timestamp for any existing releases to ensure triggers work
UPDATE releases SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
