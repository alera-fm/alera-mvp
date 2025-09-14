-- Migration 030: Update subscription status constraint to include 'cancelling'
-- Date: 2025-09-14
-- Description: Add 'cancelling' status for subscriptions that are cancelled but still active until period end

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'expired', 'cancelled', 'cancelling'));
