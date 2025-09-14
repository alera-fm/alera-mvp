-- Migration 029: Update subscription events constraint
-- Date: 2025-09-14
-- Description: Add 'updated' to allowed event types

-- Drop existing constraint
ALTER TABLE subscription_events DROP CONSTRAINT subscription_events_event_type_check;

-- Add new constraint with 'updated' event type
ALTER TABLE subscription_events ADD CONSTRAINT subscription_events_event_type_check 
  CHECK (event_type IN ('created', 'updated', 'upgraded', 'downgraded', 'cancelled', 'reactivated', 'expired', 'payment_failed', 'payment_succeeded'));
