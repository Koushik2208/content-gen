-- Migration to add topic-level customization and improvement tracking
-- Run this in Supabase SQL editor

-- Add columns to content_topics table
ALTER TABLE content_topics 
ADD COLUMN IF NOT EXISTS has_been_improved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS tone TEXT;

-- Add index for has_been_improved for faster queries
CREATE INDEX IF NOT EXISTS idx_content_topics_has_been_improved ON content_topics(has_been_improved);

