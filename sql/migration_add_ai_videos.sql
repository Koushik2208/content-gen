-- Migration script to add AI videos table for HeyGen integration
-- Run this in Supabase SQL editor or include in your migration pipeline.

-- Ensure UUID generator is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table to store generated AI videos
CREATE TABLE IF NOT EXISTS ai_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL, -- HeyGen video ID
  video_url TEXT, -- HeyGen video URL (null until completed)
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  error_message TEXT, -- Store error if generation fails
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ -- When video generation completed
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_videos_user_id ON ai_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_videos_topic_id ON ai_videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_ai_videos_status ON ai_videos(status);
CREATE INDEX IF NOT EXISTS idx_ai_videos_created_at ON ai_videos(created_at DESC);

-- Ensure one video per topic per user (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_videos_user_topic_unique ON ai_videos(user_id, topic_id);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION update_ai_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_videos_updated_at ON ai_videos;
CREATE TRIGGER trg_ai_videos_updated_at
  BEFORE UPDATE ON ai_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_videos_updated_at();

-- Enable row level security
ALTER TABLE ai_videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own ai videos" ON ai_videos;
DROP POLICY IF EXISTS "Users can insert own ai videos" ON ai_videos;
DROP POLICY IF EXISTS "Users can update own ai videos" ON ai_videos;
DROP POLICY IF EXISTS "Users can delete own ai videos" ON ai_videos;

-- Create RLS policies
CREATE POLICY "Users can view own ai videos" ON ai_videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai videos" ON ai_videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai videos" ON ai_videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai videos" ON ai_videos
  FOR DELETE USING (auth.uid() = user_id);

