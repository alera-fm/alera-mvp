-- Add artist_id column to analytics_uploads table
-- This allows tracking which artist the analytics data belongs to

ALTER TABLE analytics_uploads 
ADD COLUMN artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_uploads_artist_id ON analytics_uploads(artist_id);

-- Note: This column is nullable to maintain compatibility with existing records
-- New uploads will always have an artist_id specified
