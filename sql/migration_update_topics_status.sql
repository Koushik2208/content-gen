-- Migration script to update content_topics table status constraint
-- Run this in Supabase SQL editor if the table already exists

-- Drop existing constraint if it exists
ALTER TABLE content_topics DROP CONSTRAINT IF EXISTS content_topics_status_check;

-- Add the updated constraint with 'done' status
ALTER TABLE content_topics ADD CONSTRAINT content_topics_status_check 
  CHECK (status IN ('draft', 'approved', 'rejected', 'done'));

-- Ensure the status column has the correct default
ALTER TABLE content_topics ALTER COLUMN status SET DEFAULT 'draft';

-- Update any existing NULL status values to 'draft'
UPDATE content_topics SET status = 'draft' WHERE status IS NULL;

-- Ensure status column is NOT NULL
ALTER TABLE content_topics ALTER COLUMN status SET NOT NULL;

-- Verify the index exists for status column
CREATE INDEX IF NOT EXISTS idx_content_topics_status ON content_topics(status);

-- Verify RLS policies are in place
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view own topics" ON content_topics;
  DROP POLICY IF EXISTS "Users can insert own topics" ON content_topics;
  DROP POLICY IF EXISTS "Users can update own topics" ON content_topics;
  DROP POLICY IF EXISTS "Users can delete own topics" ON content_topics;
  
  -- Create updated policies
  CREATE POLICY "Users can view own topics" ON content_topics
    FOR SELECT USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert own topics" ON content_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own topics" ON content_topics
    FOR UPDATE USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete own topics" ON content_topics
    FOR DELETE USING (auth.uid() = user_id);
END $$;
