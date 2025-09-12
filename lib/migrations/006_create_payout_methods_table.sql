-- Migration 006: Create payout_methods table
CREATE TABLE IF NOT EXISTS payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL,
  encrypted_account_info TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to ensure one payout method per artist
ALTER TABLE payout_methods ADD CONSTRAINT unique_artist_payout_method UNIQUE (artist_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payout_methods_artist_id ON payout_methods(artist_id);
