-- Add identity verification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_platform VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_username VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_data JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS identity_verified_at TIMESTAMP;

-- Create index for identity verification queries
CREATE INDEX IF NOT EXISTS idx_users_identity_verified ON users(identity_verified);
CREATE INDEX IF NOT EXISTS idx_users_identity_platform ON users(identity_platform);

-- Add comment for documentation
COMMENT ON COLUMN users.identity_verified IS 'Whether the user has completed identity verification';
COMMENT ON COLUMN users.identity_platform IS 'Platform used for identity verification (instagram, tiktok, youtube, facebook)';
COMMENT ON COLUMN users.identity_username IS 'Username/handle used for identity verification';
COMMENT ON COLUMN users.identity_data IS 'JSON data from the social media platform verification';
COMMENT ON COLUMN users.identity_verified_at IS 'Timestamp when identity verification was completed';
