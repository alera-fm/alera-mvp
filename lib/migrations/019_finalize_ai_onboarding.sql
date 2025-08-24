-- Migration 019: Finalize AI onboarding flow fields

ALTER TABLE IF EXISTS ai_artist_context
  ADD COLUMN IF NOT EXISTS release_rhythm TEXT,
  ADD COLUMN IF NOT EXISTS biggest_challenge TEXT,
  ADD COLUMN IF NOT EXISTS definition_of_success TEXT;


