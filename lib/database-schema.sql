-- Users table with admin support
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  artist_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streaming earnings table for revenue reports
CREATE TABLE IF NOT EXISTS streaming_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL,
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
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- UNIQUE constraint removed to allow duplicate records (migration 022)
);

-- Withdrawal requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10,2) NOT NULL,
  method VARCHAR(100) NOT NULL,
  account_details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id)
);

-- Alternative table name that some APIs might be using
CREATE TABLE IF NOT EXISTS withdrawals (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount_usd DECIMAL(10,2) NOT NULL,
  method VARCHAR(100) NOT NULL,
  account_details TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id)
);

-- Payout methods table
CREATE TABLE IF NOT EXISTS payout_methods (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  method VARCHAR(100) NOT NULL,
  account_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_streaming_earnings_artist_date ON streaming_earnings(artist_id, sale_month);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_artist ON withdrawal_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_artist ON withdrawals(artist_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_admin ON users(is_admin);
