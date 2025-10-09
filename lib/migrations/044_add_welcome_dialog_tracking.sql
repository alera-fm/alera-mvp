-- Migration 044: Add welcome dialog tracking to users table
-- This migration adds a column to track if the welcome onboarding dialog has been shown to a user

ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_dialog_shown BOOLEAN DEFAULT FALSE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_users_welcome_dialog_shown ON users(welcome_dialog_shown);

-- Comment the migration
COMMENT ON COLUMN users.welcome_dialog_shown IS 'Tracks if the welcome onboarding dialog has been shown to the user after first login';
