-- Migration 037: Fix subscription status constraint to include new payment statuses
-- Date: 2025-01-27
-- Description: Add 'pending_payment' and 'payment_failed' statuses to subscription constraint

-- Drop the existing constraint
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;

-- Add the new constraint with all current status values including payment statuses
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'expired', 'cancelled', 'pending_payment', 'payment_failed'));

-- Add comments to document the new statuses
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active (paid), expired (past due date), cancelled (user cancelled), pending_payment (waiting for payment), payment_failed (payment failed - downgraded to trial)';

-- Update any existing subscriptions that might have invalid statuses
-- This shouldn't affect existing data, but ensures consistency
UPDATE subscriptions SET status = 'active' WHERE status NOT IN ('active', 'expired', 'cancelled', 'pending_payment', 'payment_failed');
