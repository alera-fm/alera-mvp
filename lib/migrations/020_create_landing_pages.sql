-- Migration 020: Landing pages table for public artist pages

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  page_config JSONB NOT NULL DEFAULT jsonb_build_object(
    'artist_name', '',
    'theme_color', '#E1FF3F',
    'blocks', '[]'::jsonb,
    'social_links', jsonb_build_object(),
    'contact_info', jsonb_build_object('email','', 'management', jsonb_build_object('name','', 'email','', 'phone',''))
  ),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_id)
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_artist ON landing_pages(artist_id);

-- trigger to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_landing_pages_updated_at ON landing_pages;
CREATE TRIGGER trg_landing_pages_updated_at
BEFORE UPDATE ON landing_pages
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();


