-- Migration 018: Link analytics rows to uploads and enable cascade delete

-- Add upload_id to analytics tables
ALTER TABLE IF EXISTS streaming_analytics
  ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES analytics_uploads(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS shazam_analytics
  ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES analytics_uploads(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS meta_analytics
  ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES analytics_uploads(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS tiktok_analytics
  ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES analytics_uploads(id) ON DELETE CASCADE;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_streaming_upload_id ON streaming_analytics(upload_id);
CREATE INDEX IF NOT EXISTS idx_shazam_upload_id ON shazam_analytics(upload_id);
CREATE INDEX IF NOT EXISTS idx_meta_upload_id ON meta_analytics(upload_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_upload_id ON tiktok_analytics(upload_id);

-- Recreate unique indexes to include upload_id so rows are unique per upload file
DROP INDEX IF EXISTS idx_streaming_unique_entry;
CREATE UNIQUE INDEX IF NOT EXISTS idx_streaming_unique_entry
ON streaming_analytics(
  artist_id,
  song_title,
  platform,
  date,
  COALESCE(country, ''),
  COALESCE(device_type, ''),
  COALESCE(source, ''),
  upload_id
);

DROP INDEX IF EXISTS idx_shazam_unique_entry;
CREATE UNIQUE INDEX IF NOT EXISTS idx_shazam_unique_entry
ON shazam_analytics(
  artist_id,
  track_title,
  country,
  COALESCE(state, ''),
  COALESCE(city, ''),
  isrc,
  upload_id
);

DROP INDEX IF EXISTS idx_meta_unique_entry;
CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_unique_entry
ON meta_analytics(
  artist_id,
  song_title,
  service,
  product_type,
  COALESCE(territory, ''),
  isrc,
  upload_id
);

DROP INDEX IF EXISTS idx_tiktok_unique_entry;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tiktok_unique_entry
ON tiktok_analytics(
  artist_id,
  song_title,
  platform_name,
  COALESCE(territory, ''),
  content_type,
  isrc,
  upload_id
);


