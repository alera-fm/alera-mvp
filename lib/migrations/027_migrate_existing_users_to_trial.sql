-- Migration 027: Migrate existing users to trial status
-- Date: 2025-01-27
-- Description: Set all existing users to 3-month trial status

-- Insert subscription records for existing users who don't have one
INSERT INTO subscriptions (user_id, tier, status, trial_expires_at)
SELECT 
  id as user_id,
  'trial' as tier,
  'active' as status,
  (created_at + INTERVAL '3 months') as trial_expires_at
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE subscriptions.user_id = users.id
);

-- Update any existing subscription records to ensure proper trial setup
UPDATE subscriptions 
SET 
  tier = 'trial',
  status = 'active',
  trial_expires_at = COALESCE(trial_expires_at, (
    SELECT created_at + INTERVAL '3 months' 
    FROM users 
    WHERE users.id = subscriptions.user_id
  ))
WHERE tier IS NULL OR trial_expires_at IS NULL;
