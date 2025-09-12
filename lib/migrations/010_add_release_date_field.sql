
-- Migration 010: Add release_date field to releases table

ALTER TABLE releases ADD COLUMN release_date DATE;

-- Update existing records to have a default release date (30 days from creation)
UPDATE releases 
SET release_date = (created_at + INTERVAL '30 days')::date 
WHERE release_date IS NULL;

-- Make the field NOT NULL after setting default values
ALTER TABLE releases ALTER COLUMN release_date SET NOT NULL;

-- Add constraint to ensure release_date is at least 7 days in the future
ALTER TABLE releases ADD CONSTRAINT check_release_date_future 
CHECK (release_date >= CURRENT_DATE + INTERVAL '7 days');
