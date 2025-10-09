-- Migration 053: Add Identity Verification Pending Status
-- Changes identity verification to require admin approval instead of auto-approval

-- Add new columns for pending verification workflow
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS identity_verification_status VARCHAR(50) DEFAULT 'not_submitted'
CHECK (identity_verification_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS identity_verification_submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS identity_admin_reviewed_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS identity_admin_reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS identity_admin_notes TEXT;

-- Update existing verified users to 'approved' status
UPDATE users 
SET identity_verification_status = 'approved' 
WHERE identity_verified = TRUE;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_users_identity_verification_status ON users(identity_verification_status);
CREATE INDEX IF NOT EXISTS idx_users_identity_submitted_at ON users(identity_verification_submitted_at);

-- Comments for documentation
COMMENT ON COLUMN users.identity_verification_status IS 'Status of identity verification: not_submitted, pending, approved, rejected';
COMMENT ON COLUMN users.identity_verification_submitted_at IS 'When user submitted identity verification';
COMMENT ON COLUMN users.identity_admin_reviewed_by IS 'Admin user ID who reviewed the verification';
COMMENT ON COLUMN users.identity_admin_reviewed_at IS 'When admin reviewed the verification';
COMMENT ON COLUMN users.identity_admin_notes IS 'Admin notes about the verification decision';
