-- Migration 049: Update trial model from time-based to one-release model
-- Date: 2025-10-06
-- Description: Change the trial model to allow one free release instead of a time-limited trial

-- Add a new column to track if a user has used their free release
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS free_release_used BOOLEAN DEFAULT FALSE;

-- Add a new column to track the release ID of the free trial release
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS free_release_id UUID;

-- Add a foreign key constraint to the releases table
ALTER TABLE subscriptions 
ADD CONSTRAINT fk_free_release 
FOREIGN KEY (free_release_id) 
REFERENCES releases(id) 
ON DELETE SET NULL;

-- Remove trial_expires_at from existing trial users since we're moving to a release-based model
UPDATE subscriptions
SET 
  trial_expires_at = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE tier = 'trial' AND status = 'active';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_free_release ON subscriptions(free_release_used, free_release_id);

-- Log this change in subscription_events for auditing using a valid event_type
INSERT INTO subscription_events (user_id, event_type, event_data)
SELECT
  user_id,
  'upgraded', -- Using 'upgraded' as it's an allowed event type
  jsonb_build_object(
    'reason', 'trial_model_updated',
    'old_model', 'time_based',
    'new_model', 'one_release',
    'migration_date', CURRENT_TIMESTAMP
  )
FROM subscriptions
WHERE tier = 'trial';

-- Add a new column to track the onboarding status
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create a table for tracking onboarding steps
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, step_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user ON onboarding_progress(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress_updated_at();