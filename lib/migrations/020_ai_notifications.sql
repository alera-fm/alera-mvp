-- Migration 020: AI notifications support (unread + log)

ALTER TABLE ai_chat_messages
  ADD COLUMN IF NOT EXISTS is_unread BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS message_kind VARCHAR(20) DEFAULT 'chat';

CREATE TABLE IF NOT EXISTS ai_notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_key TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, notification_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_notification_log_user ON ai_notification_log(user_id);


