-- Migration: Add Metadata Columns for Job Filtering

-- 1. Experience Level (e.g. "Senior", "Mid-Level", "Entry")
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS experience_level text;

-- 2. Job Type (e.g. "Full-time", "Contract", "Remote")
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS job_type text;

-- 3. Category (e.g. "Frontend", "Backend", "Full Stack", "DevOps")
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS category text;

-- Indexing for faster filtering
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
