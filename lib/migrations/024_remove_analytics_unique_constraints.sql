-- Remove unique constraints from analytics tables to allow batch inserts
-- This allows inserting all rows from uploads without constraint violations

-- Remove streaming analytics unique constraint
DROP INDEX IF EXISTS idx_streaming_unique_entry;

-- Remove Shazam analytics unique constraint  
DROP INDEX IF EXISTS idx_shazam_unique_entry;

-- Remove Meta analytics unique constraint
DROP INDEX IF EXISTS idx_meta_unique_entry;

-- Remove TikTok analytics unique constraint
DROP INDEX IF EXISTS idx_tiktok_unique_entry;

-- Note: This allows duplicate entries but enables fast batch processing
-- All rows from uploads will be inserted regardless of duplicates
