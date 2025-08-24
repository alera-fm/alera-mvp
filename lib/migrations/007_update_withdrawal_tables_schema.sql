-- Migration 007: Update withdrawal tables schema to match frontend expectations

-- First, let's standardize on the 'withdrawals' table and update its schema
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS amount_requested DECIMAL(10,2);

-- Copy data from amount_usd to amount_requested if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'withdrawals' AND column_name = 'amount_usd') THEN
        UPDATE withdrawals 
        SET amount_requested = amount_usd 
        WHERE amount_requested IS NULL AND amount_usd IS NOT NULL;
    END IF;
END $$;

-- Add payout_details column
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS payout_details TEXT;

-- Copy data from account_details to payout_details if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'withdrawals' AND column_name = 'account_details') THEN
        UPDATE withdrawals 
        SET payout_details = account_details 
        WHERE payout_details IS NULL AND account_details IS NOT NULL;
    END IF;
END $$;

-- Add artist_name column for easier admin display
ALTER TABLE withdrawals 
ADD COLUMN IF NOT EXISTS artist_name VARCHAR(255);

-- Populate artist_name from users table
UPDATE withdrawals w
SET artist_name = u.artist_name
FROM users u
WHERE w.artist_id = u.id AND w.artist_name IS NULL;

-- Do the same for withdrawal_requests table if it exists
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS amount_requested DECIMAL(10,2);

-- Only update if amount_usd column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'withdrawal_requests' AND column_name = 'amount_usd') THEN
        UPDATE withdrawal_requests 
        SET amount_requested = amount_usd 
        WHERE amount_requested IS NULL AND amount_usd IS NOT NULL;
    END IF;
END $$;

ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS payout_details TEXT;

-- Only update if account_details column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'withdrawal_requests' AND column_name = 'account_details') THEN
        UPDATE withdrawal_requests 
        SET payout_details = account_details 
        WHERE payout_details IS NULL AND account_details IS NOT NULL;
    END IF;
END $$;

ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS artist_name VARCHAR(255);

UPDATE withdrawal_requests wr
SET artist_name = u.artist_name
FROM users u
WHERE wr.artist_id = u.id AND wr.artist_name IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
