-- Migration 051: Create audio scan results table
-- Date: 2025-01-09
-- Description: Store AI-powered audio analysis results from IRCAM Amplify for copyright and AI detection

CREATE TABLE IF NOT EXISTS audio_scan_results (
  id SERIAL PRIMARY KEY,
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  track_id UUID,
  track_number INTEGER,
  artist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- IRCAM job tracking
  ircam_job_id VARCHAR(255) UNIQUE,
  scan_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'processing', 'completed', 'failed', 'flagged')),

  -- Audio file info
  audio_url TEXT NOT NULL,
  track_title VARCHAR(500),
  track_artist VARCHAR(500),
  track_isrc VARCHAR(50),

  -- AI-generated content detection (from IRCAM AI Music Detector)
  ai_generated_detected BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(5, 2),
  ai_model_version VARCHAR(100),

  -- Overall assessment
  scan_passed BOOLEAN,
  flagged_reason TEXT,
  admin_reviewed BOOLEAN DEFAULT FALSE,
  admin_decision VARCHAR(50) CHECK (admin_decision IN ('approved', 'rejected', 'needs_review', NULL)),
  admin_notes TEXT,
  admin_reviewed_by INTEGER REFERENCES users(id),
  admin_reviewed_at TIMESTAMP,

  -- Raw response from IRCAM
  raw_response JSONB,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_scan_release_id ON audio_scan_results(release_id);
CREATE INDEX IF NOT EXISTS idx_audio_scan_artist_id ON audio_scan_results(artist_id);
CREATE INDEX IF NOT EXISTS idx_audio_scan_status ON audio_scan_results(scan_status);
CREATE INDEX IF NOT EXISTS idx_audio_scan_ircam_job_id ON audio_scan_results(ircam_job_id);
CREATE INDEX IF NOT EXISTS idx_audio_scan_flagged ON audio_scan_results(scan_status) WHERE scan_status = 'flagged';
CREATE INDEX IF NOT EXISTS idx_audio_scan_needs_review ON audio_scan_results(admin_reviewed, scan_status);

-- Add unique constraint on release_id and track_number (to prevent duplicate scans for same track)
-- Using track_number instead of track_id ensures scans persist even when track records are recreated
CREATE UNIQUE INDEX IF NOT EXISTS idx_audio_scan_release_track_number ON audio_scan_results(release_id, track_number);

-- Add scan_status to releases table to track overall release scanning status
ALTER TABLE releases
ADD COLUMN IF NOT EXISTS audio_scan_status VARCHAR(50) DEFAULT 'not_scanned'
CHECK (audio_scan_status IN ('not_scanned', 'scanning', 'scan_passed', 'scan_failed', 'scan_flagged', 'admin_approved'));

-- Create index
CREATE INDEX IF NOT EXISTS idx_releases_audio_scan_status ON releases(audio_scan_status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_audio_scan_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audio_scan_results_updated_at
  BEFORE UPDATE ON audio_scan_results
  FOR EACH ROW
  EXECUTE FUNCTION update_audio_scan_updated_at();
