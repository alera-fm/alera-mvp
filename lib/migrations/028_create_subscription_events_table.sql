-- Migration 028: Create subscription events table for analytics
-- Date: 2025-01-27
-- Description: Track subscription lifecycle events for analytics and debugging

-- Create subscription events table
CREATE TABLE IF NOT EXISTS subscription_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('created', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'expired', 'payment_failed', 'payment_succeeded')),
  event_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_type ON subscription_events(user_id, event_type);
