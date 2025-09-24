-- Add last_active_at column to users table for tracking online users
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT NOW();

-- Create index for efficient querying of online users
CREATE INDEX IF NOT EXISTS idx_users_last_active_at ON users(last_active_at);

-- Update existing users to have last_active_at set to their created_at time
UPDATE users SET last_active_at = created_at WHERE last_active_at IS NULL;
