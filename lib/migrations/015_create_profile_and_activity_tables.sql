
-- Migration 015: Create profile and activity tracking tables

-- Update users table to add profile fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);

-- Create login_history table
CREATE TABLE IF NOT EXISTS login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(50),
  location VARCHAR(100),
  status VARCHAR(20) DEFAULT 'success'
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS billing_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount DECIMAL(10,2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- subscription, tip_withdrawal, payout, etc.
  status VARCHAR(20) DEFAULT 'completed', -- completed, failed, pending
  description TEXT,
  reference_id VARCHAR(255),
  payment_method VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_login_time ON login_history(login_time DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_date ON billing_history(transaction_date DESC);

-- Insert mock billing history data
INSERT INTO billing_history (user_id, amount, transaction_type, status, description, reference_id, payment_method) VALUES
(1, 9.99, 'subscription', 'completed', 'Monthly Pro Plan', 'SUB-001', 'Credit Card'),
(1, 45.50, 'payout', 'completed', 'Streaming Royalties Payout', 'PAY-001', 'PayPal'),
(1, 12.75, 'tip_withdrawal', 'completed', 'Fan Tip Withdrawal', 'TIP-001', 'Bank Transfer'),
(1, 9.99, 'subscription', 'completed', 'Monthly Pro Plan', 'SUB-002', 'Credit Card'),
(1, 78.25, 'payout', 'pending', 'Streaming Royalties Payout', 'PAY-002', 'PayPal');

-- Insert mock login history data
INSERT INTO login_history (user_id, ip_address, user_agent, device_type, browser, location) VALUES
(1, '192.168.1.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Desktop', 'Chrome', 'New York, US'),
(1, '192.168.1.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'Mobile', 'Safari', 'New York, US'),
(1, '10.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Desktop', 'Chrome', 'Los Angeles, US'),
(1, '192.168.1.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Desktop', 'Chrome', 'New York, US');
