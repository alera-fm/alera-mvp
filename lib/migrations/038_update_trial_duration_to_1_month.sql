-- Migration 038: Update trial duration from 2 months to 1 month
-- Date: 2025-01-27
-- Description: Update existing trial users to 1-month trial duration and remove free single release

-- Update existing trial users to have 1-month duration instead of 2
UPDATE subscriptions
SET
  trial_expires_at = (u.created_at + INTERVAL '1 month'),
  updated_at = CURRENT_TIMESTAMP
FROM users u
WHERE subscriptions.user_id = u.id
  AND subscriptions.tier = 'trial'
  AND subscriptions.status = 'active'
  AND subscriptions.trial_expires_at IS NOT NULL
  AND subscriptions.trial_expires_at = (u.created_at + INTERVAL '2 months');

-- Log this change in subscription_events for auditing
INSERT INTO subscription_events (user_id, event_type, event_data)
SELECT
  s.user_id,
  'trial_duration_updated',
  jsonb_build_object(
    'old_duration_months', 2,
    'new_duration_months', 1,
    'old_trial_expires_at', (u.created_at + INTERVAL '2 months'),
    'new_trial_expires_at', (u.created_at + INTERVAL '1 month'),
    'free_single_release_removed', true
  )
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.tier = 'trial'
  AND s.status = 'active'
  AND s.trial_expires_at IS NOT NULL
  AND s.trial_expires_at = (u.created_at + INTERVAL '1 month') -- Check for newly updated trials
ON CONFLICT (user_id, event_type, (event_data->>'new_duration_months')) DO NOTHING;
