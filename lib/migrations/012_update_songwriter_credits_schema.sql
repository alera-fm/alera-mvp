
-- Migration 012: Update songwriter credits to support first, middle, and last name fields

-- Note: This migration updates the existing songwriters JSONB structure
-- The application will handle the transformation from the old { name, role } format
-- to the new { first_name, middle_name, last_name, role } format

-- No database schema changes needed as we're still using JSONB for songwriters
-- The application layer will handle the new structure

-- Update trigger for tracks table to ensure updated_at is maintained
CREATE OR REPLACE FUNCTION update_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for tracks table
DROP TRIGGER IF EXISTS trigger_update_tracks_updated_at ON tracks;
CREATE TRIGGER trigger_update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_tracks_updated_at();
