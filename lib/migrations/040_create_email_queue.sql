-- Migration 040: Create email queue table for automated email processing
-- Description: Create table to store scheduled emails for automatic processing

CREATE TABLE IF NOT EXISTS email_queue (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_sent ON email_queue(sent);

-- Add comments
COMMENT ON TABLE email_queue IS 'Queue for scheduled email automation';
COMMENT ON COLUMN email_queue.id IS 'Unique identifier for the email queue item';
COMMENT ON COLUMN email_queue.user_id IS 'User who will receive the email';
COMMENT ON COLUMN email_queue.template_name IS 'Email template to use (welcome, artistPageTip, aiCareerManager)';
COMMENT ON COLUMN email_queue.scheduled_for IS 'When the email should be sent';
COMMENT ON COLUMN email_queue.sent IS 'Whether the email has been sent';
COMMENT ON COLUMN email_queue.created_at IS 'When the email was queued';
