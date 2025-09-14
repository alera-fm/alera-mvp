-- Migration 026: Create AI usage tracking table
-- Date: 2025-01-27
-- Description: Track AI token usage for subscription limits

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS ai_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 0,
  usage_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, usage_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);

-- Function to get or create daily usage record
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id INTEGER, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    usage_id INTEGER;
BEGIN
    -- Try to get existing record
    SELECT id INTO usage_id
    FROM ai_usage
    WHERE user_id = p_user_id AND usage_date = p_date;
    
    -- If not found, create new record
    IF usage_id IS NULL THEN
        INSERT INTO ai_usage (user_id, usage_date, tokens_used)
        VALUES (p_user_id, p_date, 0)
        RETURNING id INTO usage_id;
    END IF;
    
    RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add tokens to daily usage
CREATE OR REPLACE FUNCTION add_ai_tokens(p_user_id INTEGER, p_tokens INTEGER, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
    new_total INTEGER;
BEGIN
    -- Insert or update the daily usage
    INSERT INTO ai_usage (user_id, usage_date, tokens_used)
    VALUES (p_user_id, p_date, p_tokens)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET
        tokens_used = ai_usage.tokens_used + p_tokens
    RETURNING tokens_used INTO new_total;
    
    RETURN new_total;
END;
$$ LANGUAGE plpgsql;
