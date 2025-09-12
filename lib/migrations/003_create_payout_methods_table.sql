-- Migration 003: Create payout methods table
-- This table stores encrypted payout method information for artists

CREATE TABLE IF NOT EXISTS payout_methods (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(50) NOT NULL, -- e.g., 'PayPal', 'Bank Transfer', 'Stripe'
  encrypted_account_info TEXT NOT NULL, -- encrypted account details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id) -- Each artist can only have one payout method
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payout_methods_artist_id ON payout_methods(artist_id);
