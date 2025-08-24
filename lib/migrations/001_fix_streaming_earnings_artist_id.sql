-- Migration 001: Fix artist_id type mismatch in streaming_earnings table
-- This addresses the UUID vs INTEGER type conflict

-- First, drop the existing streaming_earnings table if it exists
DROP TABLE IF EXISTS streaming_earnings;

-- Recreate the streaming_earnings table with correct artist_id type (INTEGER to match users table)
CREATE TABLE IF NOT EXISTS streaming_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reporting_month DATE,
  sale_month DATE NOT NULL,
  platform VARCHAR(100) NOT NULL,
  artist VARCHAR(255),
  title VARCHAR(255),
  isrc VARCHAR(50),
  upc VARCHAR(50),
  quantity INTEGER,
  team_percentage DECIMAL(5,2),
  song_album VARCHAR(255),
  country_of_sale VARCHAR(100),
  songwriter_royalties_withheld DECIMAL(10,2),
  amount_usd DECIMAL(10,2) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id, sale_month, platform, title, country_of_sale)
);

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_streaming_earnings_artist_date ON streaming_earnings(artist_id, sale_month);
