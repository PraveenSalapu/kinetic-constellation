-- =============================================================================
-- Vector-Based Match Scoring Migration (Simplified)
-- =============================================================================
-- Run this in your Supabase SQL Editor to enable vector match scoring.
-- Match scores are calculated ON-DEMAND, no caching table needed.
-- =============================================================================

-- 1. Enable pgvector extension (for vector embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to jobs table (768 dimensions for text-embedding-004)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Add embedding columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

-- =============================================================================
-- Optional: Create index for very large job tables (1000+ jobs)
-- Skip this if you have fewer than 1000 jobs
-- =============================================================================
-- CREATE INDEX IF NOT EXISTS jobs_embedding_idx
-- ON jobs USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- =============================================================================
-- Verification (run these to check it worked)
-- =============================================================================
-- SELECT * FROM pg_extension WHERE extname = 'vector';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'embedding';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'embedding';
