-- Migration 004: Create upload history table
-- This table will track all TSV file uploads with metadata

CREATE TABLE IF NOT EXISTS upload_history (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  reporting_month DATE,
  total_records INTEGER DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  platform_count INTEGER DEFAULT 0,
  upload_status VARCHAR(50) DEFAULT 'success',
  error_message TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES users(id) -- admin who uploaded
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_upload_history_artist ON upload_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_upload_history_date ON upload_history(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_upload_history_month ON upload_history(reporting_month);
