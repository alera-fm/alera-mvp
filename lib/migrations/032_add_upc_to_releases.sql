-- Migration 032: Add UPC field to releases table
-- Date: 2025-01-27
-- Description: Add UPC code field to releases table for distributor-assigned codes

-- Add UPC field to releases table
ALTER TABLE releases ADD COLUMN upc VARCHAR(50);

-- Add index for UPC field for better performance
CREATE INDEX IF NOT EXISTS idx_releases_upc ON releases(upc);

-- Add comment to document the field
COMMENT ON COLUMN releases.upc IS 'UPC code assigned by distributor after release is sent to stores';
