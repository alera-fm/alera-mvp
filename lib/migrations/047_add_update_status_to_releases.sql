-- Add update_status column to releases table
ALTER TABLE releases 
ADD COLUMN IF NOT EXISTS update_status VARCHAR(50) DEFAULT NULL;

-- Create index for update_status
CREATE INDEX IF NOT EXISTS idx_releases_update_status ON releases(update_status);

-- Add comment to explain the column
COMMENT ON COLUMN releases.update_status IS 'Tracks post-submission changes: NULL (no changes), Changes Submitted (pending admin review), Up-to-Date (admin approved)';
