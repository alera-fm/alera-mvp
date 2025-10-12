-- Migration: Remove display_name column
-- Date: 2025-01-12
-- Description: Remove the redundant display_name field from users table as we are using artist_name as the single source of truth

-- Drop the display_name column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS display_name;

