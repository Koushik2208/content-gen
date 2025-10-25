-- Migration to update content_topics status values
-- Add 'templates_generated' status to the existing status options

-- First, update any existing 'approved' status to 'templates_generated' if they have templates
UPDATE content_topics 
SET status = 'templates_generated' 
WHERE status = 'approved' 
AND id IN (
  SELECT DISTINCT ct.id 
  FROM content_topics ct 
  INNER JOIN content_templates t ON ct.id = t.topic_id 
  WHERE ct.status = 'approved'
);

-- Update the CHECK constraint to include the new status
ALTER TABLE content_topics 
DROP CONSTRAINT IF EXISTS content_topics_status_check;

ALTER TABLE content_topics 
ADD CONSTRAINT content_topics_status_check 
CHECK (status IN ('draft', 'templates_generated', 'approved', 'rejected', 'done'));

-- Re-apply RLS policies (they should remain the same)
DROP POLICY IF EXISTS "Users can view own topics" ON content_topics;
DROP POLICY IF EXISTS "Users can insert own topics" ON content_topics;
DROP POLICY IF EXISTS "Users can update own topics" ON content_topics;
DROP POLICY IF EXISTS "Users can delete own topics" ON content_topics;

CREATE POLICY "Users can view own topics" ON content_topics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topics" ON content_topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics" ON content_topics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics" ON content_topics
  FOR DELETE USING (auth.uid() = user_id);
