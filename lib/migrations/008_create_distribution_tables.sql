-- Migration 008: Create distribution flow tables

-- Releases table for distribution submissions
CREATE TABLE IF NOT EXISTS releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('Single', 'EP', 'Album')),
  artist_name VARCHAR(255) NOT NULL,
  release_title VARCHAR(255) NOT NULL,
  record_label VARCHAR(255),
  primary_genre VARCHAR(100) NOT NULL,
  secondary_genre VARCHAR(100),
  language VARCHAR(100) NOT NULL,
  explicit_lyrics BOOLEAN DEFAULT FALSE,
  instrumental BOOLEAN DEFAULT FALSE,
  version_info VARCHAR(20) DEFAULT 'Normal',
  version_other VARCHAR(255),
  original_release_date DATE,
  previously_released BOOLEAN DEFAULT FALSE,
  album_cover_url TEXT,
  selected_stores JSONB DEFAULT '[]',
  track_price DECIMAL(4,2) DEFAULT 0.99,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'published')),
  terms_agreed BOOLEAN DEFAULT FALSE,
  fake_streaming_agreement BOOLEAN DEFAULT FALSE,
  distribution_agreement BOOLEAN DEFAULT FALSE,
  artist_names_agreement BOOLEAN DEFAULT FALSE,
  snapchat_terms BOOLEAN DEFAULT FALSE,
  youtube_music_agreement BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP
);

-- Tracks table for individual songs in releases
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  track_title VARCHAR(255) NOT NULL,
  artist_names TEXT[] DEFAULT '{}',
  featured_artists TEXT[] DEFAULT '{}',
  songwriters JSONB DEFAULT '[]',
  producer_credits JSONB DEFAULT '[]',
  performer_credits JSONB DEFAULT '[]',
  genre VARCHAR(100) NOT NULL,
  audio_file_url TEXT,
  audio_file_name VARCHAR(255),
  isrc VARCHAR(50),
  lyrics_text TEXT,
  has_lyrics BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_releases_artist_id ON releases(artist_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_tracks_release_id ON tracks(release_id);
CREATE INDEX IF NOT EXISTS idx_tracks_track_number ON tracks(release_id, track_number);
-- Create distribution releases table
CREATE TABLE IF NOT EXISTS distribution_releases (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('single', 'ep', 'album')),
  artist_name VARCHAR(255) NOT NULL,
  release_title VARCHAR(255) NOT NULL,
  record_label VARCHAR(255),
  primary_genre VARCHAR(100) NOT NULL,
  secondary_genre VARCHAR(100),
  language VARCHAR(50) NOT NULL,
  explicit BOOLEAN DEFAULT FALSE,
  instrumental BOOLEAN DEFAULT FALSE,
  version_info VARCHAR(100) DEFAULT 'Normal',
  custom_version VARCHAR(255),
  original_release_date DATE,
  previously_released BOOLEAN DEFAULT FALSE,
  album_cover_url TEXT,
  stores TEXT[], -- JSON array of selected stores
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected', 'distributed')),
  agreed_to_terms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_artist_releases (artist_id),
  INDEX idx_release_status (status),
  INDEX idx_distribution_type (distribution_type)
);

-- Create distribution tracks table
CREATE TABLE IF NOT EXISTS distribution_tracks (
  id SERIAL PRIMARY KEY,
  release_id INTEGER NOT NULL REFERENCES distribution_releases(id) ON DELETE CASCADE,
  track_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  featuring VARCHAR(255),
  version VARCHAR(255),
  isrc VARCHAR(20),
  explicit BOOLEAN DEFAULT FALSE,
  instrumental BOOLEAN DEFAULT FALSE,
  audio_file_url TEXT,
  lyrics TEXT,
  writers TEXT[], -- JSON array of writers
  producers TEXT[], -- JSON array of producers
  performers TEXT[], -- JSON array of performers
  duration_seconds INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_release_tracks (release_id),
  INDEX idx_track_order (release_id, track_order),
  
  -- Constraints
  UNIQUE(release_id, track_order)
);

-- Create trigger to update updated_at timestamp for distribution_releases
CREATE OR REPLACE FUNCTION update_distribution_releases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_distribution_releases_updated_at
  BEFORE UPDATE ON distribution_releases
  FOR EACH ROW
  EXECUTE FUNCTION update_distribution_releases_updated_at();

-- Create trigger to update updated_at timestamp for distribution_tracks
CREATE OR REPLACE FUNCTION update_distribution_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_distribution_tracks_updated_at
  BEFORE UPDATE ON distribution_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_distribution_tracks_updated_at();
