-- Add current_step column to releases table
ALTER TABLE releases ADD COLUMN current_step VARCHAR(50) DEFAULT 'basic_info';

-- Create index for current_step
CREATE INDEX idx_releases_current_step ON releases(current_step);

-- Update existing releases to have basic_info as current step
UPDATE releases SET current_step = 'basic_info' WHERE current_step IS NULL;
