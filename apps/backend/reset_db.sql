-- DESTRUCTIVE: Removes ALL user data (Profiles, Jobs, Applications)
-- Use this to clean the database for a fresh start.
-- Run in Supabase SQL Editor.

TRUNCATE TABLE profiles CASCADE;
TRUNCATE TABLE saved_jobs CASCADE;
TRUNCATE TABLE applications CASCADE;
TRUNCATE TABLE pending_autofills CASCADE;

-- If you also want to remove usage/credits metrics:
-- TRUNCATE TABLE user_usage CASCADE;

-- Note: CASCADE ensures dependent tables (like pending_autofills) are also cleared if linked.
