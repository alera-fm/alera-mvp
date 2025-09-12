-- Add status column to payout_methods table
-- This allows admins to approve/reject payout methods

ALTER TABLE payout_methods 
ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index for status queries
CREATE INDEX idx_payout_methods_status ON payout_methods(status);

-- Update existing records to have 'approved' status (assuming they were previously approved)
UPDATE payout_methods SET status = 'approved' WHERE status IS NULL;
