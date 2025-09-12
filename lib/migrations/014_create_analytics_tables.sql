
-- Create analytics tables for tracking release performance across platforms

-- Table for storing daily analytics data from CSV uploads
CREATE TABLE IF NOT EXISTS analytics_data (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  reporting_date DATE NOT NULL,
  streams INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  country VARCHAR(2),
  city VARCHAR(100),
  shazam_recognitions INTEGER DEFAULT 0,
  tiktok_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing uploaded CSV files metadata
CREATE TABLE IF NOT EXISTS analytics_uploads (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  reporting_date DATE NOT NULL,
  total_records INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_artist_date ON analytics_data(artist_id, reporting_date);
CREATE INDEX IF NOT EXISTS idx_analytics_release_platform ON analytics_data(release_id, platform);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics_data(country);
CREATE INDEX IF NOT EXISTS idx_analytics_city ON analytics_data(city);

-- Add unique constraint to prevent duplicate analytics entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_unique_entry 
ON analytics_data(artist_id, track_name, platform, reporting_date, COALESCE(country, ''), COALESCE(city, ''));
