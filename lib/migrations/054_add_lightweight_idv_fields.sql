-- Migration 054: Add Lightweight IDV (Document Upload) Fields
-- Simple fallback verification method for users who can't use social media

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS idv_method VARCHAR(50) DEFAULT 'social'
CHECK (idv_method IN ('social', 'document')),
ADD COLUMN IF NOT EXISTS idv_document_type VARCHAR(50)
CHECK (idv_document_type IN ('passport', 'drivers_license', 'national_id', 'other')),
ADD COLUMN IF NOT EXISTS idv_document_url TEXT,
ADD COLUMN IF NOT EXISTS idv_document_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS idv_full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS idv_date_of_birth DATE,
ADD COLUMN IF NOT EXISTS idv_document_number VARCHAR(100);

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_users_idv_method ON users(idv_method);

-- Comments for documentation
COMMENT ON COLUMN users.idv_method IS 'Verification method: social (social media) or document (ID upload)';
COMMENT ON COLUMN users.idv_document_type IS 'Type of document uploaded for verification';
COMMENT ON COLUMN users.idv_document_url IS 'URL to uploaded document image';
COMMENT ON COLUMN users.idv_document_name IS 'Original filename of uploaded document';
COMMENT ON COLUMN users.idv_full_name IS 'Full name as shown on document';
COMMENT ON COLUMN users.idv_date_of_birth IS 'Date of birth as shown on document';
COMMENT ON COLUMN users.idv_document_number IS 'Document number/ID number';
