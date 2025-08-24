
-- Migration 013: Create Fan Zone tables

-- Fan database table
CREATE TABLE IF NOT EXISTS fans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50),
  country VARCHAR(100),
  gender VARCHAR(20),
  age INTEGER,
  birth_year INTEGER,
  subscribed_status VARCHAR(20) DEFAULT 'free' CHECK (subscribed_status IN ('free', 'paid')),
  source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('tip', 'email_capture', 'manual', 'import')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id, email) -- Ensure unique emails per artist
);

-- Email campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  link VARCHAR(1000),
  audience_filter JSONB, -- Store audience criteria as JSON
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS campaign_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  fan_id UUID NOT NULL REFERENCES fans(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fans_artist_id ON fans(artist_id);
CREATE INDEX IF NOT EXISTS idx_fans_email ON fans(email);
CREATE INDEX IF NOT EXISTS idx_fans_subscribed_status ON fans(subscribed_status);
CREATE INDEX IF NOT EXISTS idx_fans_country ON fans(country);
CREATE INDEX IF NOT EXISTS idx_fans_created_at ON fans(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_artist_id ON email_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign_id ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_fan_id ON campaign_logs(fan_id);
