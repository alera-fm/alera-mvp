
-- Migration 016: Add detailed address and business fields to users table
-- This migration adds separate fields for detailed address information and business details

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS business_phone TEXT,
ADD COLUMN IF NOT EXISTS business_address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS business_address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS business_city TEXT,
ADD COLUMN IF NOT EXISTS business_state_province TEXT,
ADD COLUMN IF NOT EXISTS business_postal_code TEXT,
ADD COLUMN IF NOT EXISTS business_country TEXT;

-- Migrate existing address data to address_line_1 if it exists
UPDATE users SET address_line_1 = address WHERE address IS NOT NULL AND address_line_1 IS NULL;

-- Create indexes for commonly searched fields
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_business_country ON users(business_country);

-- Comment the migration
COMMENT ON COLUMN users.address_line_1 IS 'Primary address line (street address)';
COMMENT ON COLUMN users.address_line_2 IS 'Secondary address line (apartment, suite, etc.)';
COMMENT ON COLUMN users.city IS 'City for personal address';
COMMENT ON COLUMN users.state_province IS 'State or province for personal address';
COMMENT ON COLUMN users.postal_code IS 'ZIP or postal code for personal address';
COMMENT ON COLUMN users.business_email IS 'Business contact email address';
COMMENT ON COLUMN users.business_phone IS 'Business contact phone number';
COMMENT ON COLUMN users.business_address_line_1 IS 'Business primary address line';
COMMENT ON COLUMN users.business_address_line_2 IS 'Business secondary address line';
COMMENT ON COLUMN users.business_city IS 'City for business address';
COMMENT ON COLUMN users.business_state_province IS 'State or province for business address';
COMMENT ON COLUMN users.business_postal_code IS 'ZIP or postal code for business address';
COMMENT ON COLUMN users.business_country IS 'Country for business address';
