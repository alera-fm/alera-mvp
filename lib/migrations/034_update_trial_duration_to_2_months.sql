-- Migration 034: Update trial duration from 3 months to 2 months
-- Date: 2025-01-27
-- Description: Update existing trial users to 2-month trial duration
-- NOTE: This migration is now superseded by migration 038 (1 month)

-- Update existing trial users to have 2-month duration instead of 3
-- This will adjust the trial_expires_at for users who still have active trials
-- Only affects users whose trials haven't expired yet

UPDATE subscriptions 
SET trial_expires_at = (
  SELECT created_at + INTERVAL '2 months' 
  FROM users 
  WHERE users.id = subscriptions.user_id
)
WHERE tier = 'trial' 
  AND status = 'active' 
  AND trial_expires_at > CURRENT_TIMESTAMP;

-- Log the changes
INSERT INTO subscription_events (user_id, event_type, details, created_at)
SELECT 
  user_id,
  'trial_duration_updated',
  'Trial duration updated from 3 months to 2 months',
  CURRENT_TIMESTAMP
FROM subscriptions 
WHERE tier = 'trial' 
  AND status = 'active' 
  AND trial_expires_at > CURRENT_TIMESTAMP;
