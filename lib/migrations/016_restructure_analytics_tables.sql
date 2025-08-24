-- Migration 016: Restructure analytics tables for streaming vs social media platforms

-- Drop existing analytics_data table and analytics_uploads table
DROP TABLE IF EXISTS analytics_data CASCADE;
DROP TABLE IF EXISTS analytics_uploads CASCADE;

-- Create streaming analytics table (Spotify, Apple Music, Deezer)
CREATE TABLE IF NOT EXISTS streaming_analytics (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('Spotify', 'Apple Music', 'Deezer')),
  date DATE NOT NULL,
  streams INTEGER DEFAULT 0,
  country VARCHAR(2),
  device_type VARCHAR(100),
  source VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Shazam analytics table
CREATE TABLE IF NOT EXISTS shazam_analytics (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  country VARCHAR(2),
  state VARCHAR(100),
  city VARCHAR(100),
  isrc VARCHAR(50),
  shazam_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Meta analytics table
CREATE TABLE IF NOT EXISTS meta_analytics (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  service VARCHAR(100),
  product_type VARCHAR(100),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  event_count INTEGER DEFAULT 0,
  territory VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create TikTok analytics table
CREATE TABLE IF NOT EXISTS tiktok_analytics (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  song_title VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255) NOT NULL,
  platform_name VARCHAR(100),
  song_id VARCHAR(100),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  platform_classified_genre VARCHAR(100),
  territory VARCHAR(100),
  content_type VARCHAR(100),
  creations INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  average_watchtime DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics uploads table (updated)
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
-- Streaming analytics indexes
CREATE INDEX IF NOT EXISTS idx_streaming_artist_date ON streaming_analytics(artist_id, date);
CREATE INDEX IF NOT EXISTS idx_streaming_release_platform ON streaming_analytics(release_id, platform);
CREATE INDEX IF NOT EXISTS idx_streaming_country ON streaming_analytics(country);
CREATE INDEX IF NOT EXISTS idx_streaming_device_type ON streaming_analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_streaming_source ON streaming_analytics(source);

-- Shazam analytics indexes
CREATE INDEX IF NOT EXISTS idx_shazam_artist ON shazam_analytics(artist_id);
CREATE INDEX IF NOT EXISTS idx_shazam_release ON shazam_analytics(release_id);
CREATE INDEX IF NOT EXISTS idx_shazam_country ON shazam_analytics(country);
CREATE INDEX IF NOT EXISTS idx_shazam_city ON shazam_analytics(city);
CREATE INDEX IF NOT EXISTS idx_shazam_isrc ON shazam_analytics(isrc);

-- Meta analytics indexes
CREATE INDEX IF NOT EXISTS idx_meta_artist ON meta_analytics(artist_id);
CREATE INDEX IF NOT EXISTS idx_meta_release ON meta_analytics(release_id);
CREATE INDEX IF NOT EXISTS idx_meta_service ON meta_analytics(service);
CREATE INDEX IF NOT EXISTS idx_meta_product_type ON meta_analytics(product_type);
CREATE INDEX IF NOT EXISTS idx_meta_territory ON meta_analytics(territory);
CREATE INDEX IF NOT EXISTS idx_meta_isrc ON meta_analytics(isrc);

-- TikTok analytics indexes
CREATE INDEX IF NOT EXISTS idx_tiktok_artist ON tiktok_analytics(artist_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_release ON tiktok_analytics(release_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_content_type ON tiktok_analytics(content_type);
CREATE INDEX IF NOT EXISTS idx_tiktok_territory ON tiktok_analytics(territory);
CREATE INDEX IF NOT EXISTS idx_tiktok_isrc ON tiktok_analytics(isrc);

-- Add unique constraints to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_streaming_unique_entry 
ON streaming_analytics(artist_id, song_title, platform, date, COALESCE(country, ''), COALESCE(device_type, ''), COALESCE(source, ''));

CREATE UNIQUE INDEX IF NOT EXISTS idx_shazam_unique_entry 
ON shazam_analytics(artist_id, track_title, country, COALESCE(state, ''), COALESCE(city, ''), isrc);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meta_unique_entry 
ON meta_analytics(artist_id, song_title, service, product_type, COALESCE(territory, ''), isrc);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tiktok_unique_entry 
ON tiktok_analytics(artist_id, song_title, platform_name, COALESCE(territory, ''), content_type, isrc); 