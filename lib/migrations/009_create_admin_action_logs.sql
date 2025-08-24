-- Migration 009: Create admin action logs for audit trail

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON admin_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_action_logs(created_at);

-- Common action types:
-- RELEASE_STATUS_UPDATE
-- WITHDRAWAL_STATUS_UPDATE  
-- UPLOAD_REVENUE_DATA
-- DELETE_UPLOAD
-- CREATE_ARTIST
-- UPDATE_ARTIST
