-- Migration 039: Add fraud prevention agreement field to releases table
-- Date: 2025-01-27
-- Description: Add fraud_prevention_agreement field to releases table for mandatory fraud prevention checkbox

-- Add fraud_prevention_agreement column to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS fraud_prevention_agreement BOOLEAN DEFAULT FALSE;

-- Add comment to document the new field
COMMENT ON COLUMN releases.fraud_prevention_agreement IS 'Mandatory checkbox: I understand that submitting fraudulent content will result in immediate account termination';

-- Update the updated_at timestamp for any existing releases to ensure triggers work
UPDATE releases SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;
