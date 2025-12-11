-- CareerFlow Database Schema (Supabase Native Auth)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vfgksoguvlrdplbyintl/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (stores resume data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- References Supabase Auth
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending autofills table (jobs ready for extension to auto-fill)
CREATE TABLE IF NOT EXISTS pending_autofills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_url VARCHAR(2000) NOT NULL,
  job_title VARCHAR(500),
  company VARCHAR(500),
  job_description TEXT,
  tailored_resume JSONB, 
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Saved jobs table (jobs scraped from extension for tailoring)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_url VARCHAR(2000) NOT NULL,
  job_title VARCHAR(500),
  company VARCHAR(500),
  job_description TEXT,
  platform VARCHAR(100), 
  status VARCHAR(50) DEFAULT 'saved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (Cloud Application Tracker)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  job_title VARCHAR(255) NOT NULL,
  job_url VARCHAR(2000),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'saved',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(100),
  notes TEXT,
  salary_text VARCHAR(255),
  resume_version UUID REFERENCES profiles(id) ON DELETE SET NULL,
  timeline JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  interview_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_autofills_user_id ON pending_autofills(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_autofills ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Add Policies (Allows Service Role / Backend to access all)
-- Note: For frontend access via Supabase Client, you would need "auth.uid() = user_id" policies.
-- Since we are proxying through our backend API for most things, these are essential for the Service Role.
CREATE POLICY "Service role full access on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Service role full access on pending_autofills" ON pending_autofills FOR ALL USING (true);
CREATE POLICY "Service role full access on saved_jobs" ON saved_jobs FOR ALL USING (true);
CREATE POLICY "Service role full access on applications" ON applications FOR ALL USING (true);
