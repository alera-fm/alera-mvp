-- Migration 031: Update release status constraint to include 'takedown' and align with current status values
-- Date: 2025-01-27
-- Description: Add 'takedown' status and update status values to match application usage

-- Drop the existing constraint
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_status_check;

-- Add the new constraint with all current status values
ALTER TABLE releases ADD CONSTRAINT releases_status_check
  CHECK (status IN ('draft', 'under_review', 'sent_to_stores', 'live', 'rejected', 'takedown', 'approved', 'published'));

-- Update any existing 'approved' statuses to 'sent_to_stores' for consistency
UPDATE releases SET status = 'sent_to_stores' WHERE status = 'approved';

-- Update any existing 'published' statuses to 'live' for consistency  
UPDATE releases SET status = 'live' WHERE status = 'published';
