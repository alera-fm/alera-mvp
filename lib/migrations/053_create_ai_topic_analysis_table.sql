-- Migration 053: Create AI topic analysis table
-- Date: 2025-01-27
-- Description: Store AI-generated topic analysis results for user queries

CREATE TABLE IF NOT EXISTS ai_topic_analysis (
  id SERIAL PRIMARY KEY,
  analysis_date DATE NOT NULL,
  user_tier VARCHAR(20) NOT NULL, -- 'trial', 'plus', 'pro', 'all'
  time_range_days INTEGER NOT NULL, -- 7, 30, 90, 365
  total_queries INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  topics JSONB NOT NULL, -- Array of topic objects with name, count, percentage, keywords
  wordcloud_data JSONB NOT NULL, -- Array of word objects with text, value, color
  analysis_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_topic_analysis_date ON ai_topic_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_ai_topic_analysis_tier ON ai_topic_analysis(user_tier);
CREATE INDEX IF NOT EXISTS idx_ai_topic_analysis_range ON ai_topic_analysis(time_range_days);
CREATE INDEX IF NOT EXISTS idx_ai_topic_analysis_status ON ai_topic_analysis(analysis_status);
CREATE INDEX IF NOT EXISTS idx_ai_topic_analysis_date_tier_range ON ai_topic_analysis(analysis_date, user_tier, time_range_days);

-- Create unique constraint to prevent duplicate analysis for same date/tier/range
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_topic_analysis_unique 
ON ai_topic_analysis(analysis_date, user_tier, time_range_days);

-- Add comments for documentation
COMMENT ON TABLE ai_topic_analysis IS 'Stores AI-generated topic analysis results for user queries';
COMMENT ON COLUMN ai_topic_analysis.analysis_date IS 'Date when the analysis was performed';
COMMENT ON COLUMN ai_topic_analysis.user_tier IS 'User tier filter: trial, plus, pro, or all';
COMMENT ON COLUMN ai_topic_analysis.time_range_days IS 'Time range in days: 7, 30, 90, or 365';
COMMENT ON COLUMN ai_topic_analysis.total_queries IS 'Total number of queries analyzed';
COMMENT ON COLUMN ai_topic_analysis.total_users IS 'Total number of users who made queries';
COMMENT ON COLUMN ai_topic_analysis.topics IS 'JSON array of topic objects with name, count, percentage, keywords';
COMMENT ON COLUMN ai_topic_analysis.wordcloud_data IS 'JSON array of word objects with text, value, color for wordcloud';
COMMENT ON COLUMN ai_topic_analysis.analysis_status IS 'Status of the analysis: pending, processing, completed, failed';
COMMENT ON COLUMN ai_topic_analysis.error_message IS 'Error message if analysis failed';
