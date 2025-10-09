-- Migration 052: Add OAuth/Social Login Fields
-- Adds support for Google OAuth and future social login providers

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS oauth_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS oauth_name VARCHAR(255);

-- Make password_hash nullable for OAuth users
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Create indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);

-- Comments for documentation
COMMENT ON COLUMN users.google_id IS 'Unique Google account identifier';
COMMENT ON COLUMN users.oauth_provider IS 'OAuth provider used (google, facebook, etc.)';
COMMENT ON COLUMN users.oauth_avatar_url IS 'Avatar/profile picture URL from OAuth provider';
COMMENT ON COLUMN users.oauth_name IS 'Display name from OAuth provider';

