-- Reset Study Sessions Script
-- This script deletes all study sessions older than today
-- This will reset your total study time to only include today's sessions

-- First, check what columns exist (run this to see the actual column names)
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'study_sessions';

-- Option 1: Delete all sessions older than today (keeps today's sessions)
-- Try this first (Prisma default naming - camelCase with quotes)
DELETE FROM study_sessions 
WHERE DATE("startTime") < CURRENT_DATE;

-- If the above doesn't work, try this (snake_case naming):
-- DELETE FROM study_sessions 
-- WHERE DATE(start_time) < CURRENT_DATE;

-- Option 2: Delete ALL sessions (uncomment if you want to start completely fresh)
-- DELETE FROM study_sessions;

-- Verify the deletion
SELECT COUNT(*) as remaining_sessions FROM study_sessions;

-- Check total time remaining (try both naming conventions)
-- For camelCase:
SELECT 
  COUNT(*) as total_sessions,
  SUM(EXTRACT(EPOCH FROM ("endTime" - "startTime")) / 60) as total_minutes
FROM study_sessions
WHERE "endTime" IS NOT NULL;

-- For snake_case (if above doesn't work):
-- SELECT 
--   COUNT(*) as total_sessions,
--   SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 60) as total_minutes
-- FROM study_sessions
-- WHERE end_time IS NOT NULL;

