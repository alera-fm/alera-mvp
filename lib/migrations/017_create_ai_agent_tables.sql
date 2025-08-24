-- Migration: Create AI Agent Chat History and Artist Context Tables
-- Date: 2025-01-27
-- Description: Tables for persistent chat memory and artist context for AI agent

-- Table for storing chat messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL DEFAULT true,
    intent_classified VARCHAR(50),
    data_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing artist context and onboarding information
CREATE TABLE IF NOT EXISTS ai_artist_context (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    career_description TEXT,
    current_goals TEXT,
    release_strategy TEXT,
    preferred_genres TEXT[],
    target_audience TEXT,
    experience_level VARCHAR(50), -- beginner, intermediate, professional
    monthly_release_frequency INTEGER,
    primary_platforms TEXT[],
    collaboration_preferences TEXT,
    marketing_focus TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking onboarding completion status
CREATE TABLE IF NOT EXISTS ai_onboarding_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_questions TEXT[],
    onboarding_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_artist_context_user_id ON ai_artist_context(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_onboarding_status_user_id ON ai_onboarding_status(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_ai_chat_messages_updated_at 
    BEFORE UPDATE ON ai_chat_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_artist_context_updated_at 
    BEFORE UPDATE ON ai_artist_context 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_onboarding_status_updated_at 
    BEFORE UPDATE ON ai_onboarding_status 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 