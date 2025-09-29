-- Add email delivery logs table for monitoring email delivery
CREATE TABLE IF NOT EXISTS email_delivery_logs (
  id SERIAL PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  message_id VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_to_email ON email_delivery_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_status ON email_delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_logs_created_at ON email_delivery_logs(created_at);

-- Add token expiration to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_users_verification_token_expires ON users(verification_token_expires);
