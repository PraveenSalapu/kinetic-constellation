-- DESTRUCTIVE RESET & INIT
-- This script acts as a "Hard Reset". It DROPS existing tables to ensure the new schema
-- (with all required columns like 'embedding' and 'credits') is correctly applied.

-- 1. CLEANUP (Drop existing to allow full recreation)
DROP TABLE IF EXISTS profile_job_matches CASCADE;
DROP TABLE IF EXISTS pending_autofills CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS user_usage CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable necessary extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- 2. PROFILES (User Resumes & Settings)
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  is_active boolean default false,
  has_completed_onboarding boolean default false,
  embedding vector(768), -- Dimensions for Google Gemini Embedding text-embedding-004
  embedding_updated_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for checking active profile quickly
create index idx_profiles_user_active on profiles(user_id) where is_active = true;

-- 3. JOBS (Global Job Listings - Scraped or Added)
create table jobs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company text not null,
  link text not null,
  description text,
  location text,
  platform text,
  embedding vector(768),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. APPLICATIONS (User's Job Tracker)
create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  job_title text not null,
  job_url text,
  location text,
  status text default 'saved', -- saved, applied, screening, etc.
  applied_date timestamp with time zone,
  source text,
  notes text,
  salary_text text,
  resume_version uuid references profiles(id) on delete set null,
  timeline jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. SAVED_JOBS (Extension 'Save for Later' / Staging area)
create table saved_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_url text,
  job_title text,
  company text,
  job_description text,
  platform text,
  status text default 'saved',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. PENDING_AUTOFILLS (Bridge between Web App Tailoring & Extension Autofill)
create table pending_autofills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade,
  job_url text not null,
  job_title text,
  company text,
  job_description text,
  tailored_resume jsonb not null,
  status text default 'pending', -- pending, completed
  expires_at timestamp with time zone default (now() + interval '24 hours'),
  created_at timestamp with time zone default now()
);

-- 7. USER_USAGE (Credits & Rate Limiting)
create table user_usage (
  user_id uuid primary key references auth.users(id) on delete cascade, -- One record per user
  credits int default 500,
  last_refill_at timestamp with time zone default now()
);

-- 8. PROFILE_JOB_MATCHES (Pre-computed Scores Cache)
create table profile_job_matches (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade,
  job_id uuid references jobs(id) on delete cascade,
  match_score float,
  created_at timestamp with time zone default now(),
  unique(profile_id, job_id)
);

-- RLS POLICIES (Security)
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;
alter table pending_autofills enable row level security;
alter table user_usage enable row level security;
alter table jobs enable row level security;
alter table profile_job_matches enable row level security;

-- PROFILES Policy
create policy "Users can view own profiles" on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profiles" on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profiles" on profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profiles" on profiles for delete using (auth.uid() = user_id);

-- APPLICATIONS Policy
create policy "Users can all own applications" on applications for all using (auth.uid() = user_id);

-- SAVED_JOBS Policy
create policy "Users can all own saved_jobs" on saved_jobs for all using (auth.uid() = user_id);

-- PENDING_AUTOFILLS Policy
create policy "Users can all own pending_autofills" on pending_autofills for all using (auth.uid() = user_id);

-- USER_USAGE Policy
create policy "Users can view own usage" on user_usage for select using (auth.uid() = user_id);
create policy "Users can update own usage" on user_usage for update using (auth.uid() = user_id);

-- JOBS Policy (Public Read)
create policy "Public can view jobs" on jobs for select using (true);

-- MATCHES Policy
create policy "Users can view own matches" on profile_job_matches for select using (
  exists (select 1 from profiles where profiles.id = profile_job_matches.profile_id and profiles.user_id = auth.uid())
);
