-- Migration script to add per-user AI preferences for HeyGen integration
-- Run this in Supabase SQL editor or include in your migration pipeline.

-- Ensure UUID generator is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table to store optional HeyGen settings per user
CREATE TABLE IF NOT EXISTS ai_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  heygen_avatar_id TEXT,
  heygen_voice_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep one preferences row per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_preferences_user_id ON ai_preferences(user_id);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_ai_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_preferences_updated_at ON ai_preferences;
CREATE TRIGGER trg_ai_preferences_updated_at
  BEFORE UPDATE ON ai_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_preferences_updated_at();

-- Enable row level security and lock access to owners only
ALTER TABLE ai_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai prefs" ON ai_preferences;
DROP POLICY IF EXISTS "Users can insert own ai prefs" ON ai_preferences;
DROP POLICY IF EXISTS "Users can update own ai prefs" ON ai_preferences;
DROP POLICY IF EXISTS "Users can delete own ai prefs" ON ai_preferences;

CREATE POLICY "Users can view own ai prefs" ON ai_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai prefs" ON ai_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai prefs" ON ai_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai prefs" ON ai_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Optional helper: seed default prefs for existing users (run if you need baseline rows)
-- INSERT INTO ai_preferences (user_id, heygen_avatar_id, heygen_voice_id)
-- SELECT id, NULL, NULL FROM auth.users
-- ON CONFLICT (user_id) DO NOTHING;

