-- Migration 043: Add fields for Edit Release dialog
-- Date: 2025-01-27
-- Description: Add copyright, upc_ean, credits, and lyrics fields to releases table

-- Add edit fields to releases table
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS copyright VARCHAR(255),
ADD COLUMN IF NOT EXISTS upc_ean VARCHAR(50),
ADD COLUMN IF NOT EXISTS credits JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS lyrics TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_releases_copyright ON releases(copyright);
CREATE INDEX IF NOT EXISTS idx_releases_upc_ean ON releases(upc_ean);
CREATE INDEX IF NOT EXISTS idx_releases_credits ON releases USING GIN (credits);

-- Add comments to document the new fields
COMMENT ON COLUMN releases.copyright IS 'Copyright information for the release';
COMMENT ON COLUMN releases.upc_ean IS 'UPC/EAN barcode for the release';
COMMENT ON COLUMN releases.credits IS 'JSON object containing producer, writer, composer credits';
COMMENT ON COLUMN releases.lyrics IS 'Lyrics text for the release';

-- Update the updated_at timestamp for any existing releases
UPDATE releases SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
