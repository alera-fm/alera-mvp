-- Create table for storing parsed release link data
CREATE TABLE IF NOT EXISTS release_links (
    id SERIAL PRIMARY KEY,
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    artist_name VARCHAR(255) NOT NULL,
    release_title VARCHAR(255) NOT NULL,
    artwork_url TEXT,
    streaming_services JSONB NOT NULL DEFAULT '[]',
    source_url TEXT NOT NULL,
    parsed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_release_links_release_id ON release_links(release_id);
CREATE INDEX IF NOT EXISTS idx_release_links_parsed_at ON release_links(parsed_at);

-- Add unique constraint to prevent duplicate links for same release
CREATE UNIQUE INDEX IF NOT EXISTS idx_release_links_unique_source 
ON release_links(release_id, source_url);

-- Add comments
COMMENT ON TABLE release_links IS 'Stores parsed release link data from distributor links';
COMMENT ON COLUMN release_links.streaming_services IS 'JSON array of streaming service objects with name and url';
COMMENT ON COLUMN release_links.source_url IS 'Original distributor link that was parsed';

