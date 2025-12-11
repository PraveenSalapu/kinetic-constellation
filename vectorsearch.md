     Vector-Based Match Scoring Implementation Plan

     Overview

     Add intelligent job matching using Gemini Embeddings (text-embedding-004) + Supabase pgvector. Both are    
      FREE within existing service tiers.

     Goal: Auto-calculate match scores (0-100) between user profiles and jobs using semantic vector
     similarity.

     ---
     Phase 1: Database Schema (Supabase pgvector)

     Run in Supabase SQL Editor:

     -- 1. Enable pgvector extension
     CREATE EXTENSION IF NOT EXISTS vector;

     -- 2. Add embedding column to jobs table (768 dimensions for text-embedding-004)
     ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(768);

     -- 3. Create index for fast similarity search
     CREATE INDEX IF NOT EXISTS jobs_embedding_idx
     ON jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

     -- 4. Add embedding to profiles table
     ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding vector(768);
     ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

     -- 5. Create match function
     CREATE OR REPLACE FUNCTION match_jobs_for_profile(
         profile_embedding vector(768),
         match_threshold float DEFAULT 0.3,
         result_limit int DEFAULT 50
     )
     RETURNS TABLE (
         job_id UUID,
         title TEXT,
         company TEXT,
         link TEXT,
         description TEXT,
         match_score INTEGER
     ) AS $$
     BEGIN
         RETURN QUERY
         SELECT
             j.id, j.title, j.company, j.link, j.description,
             ROUND((1 - (j.embedding <=> profile_embedding)) * 100)::INTEGER as match_score
         FROM jobs j
         WHERE j.embedding IS NOT NULL
           AND (1 - (j.embedding <=> profile_embedding)) > match_threshold
         ORDER BY j.embedding <=> profile_embedding
         LIMIT result_limit;
     END;
     $$ LANGUAGE plpgsql;

     ---
     Phase 2: Backend Embedding Service

     New File: apps/backend/src/services/embedding.ts

     // Core functions:
     // - generateEmbedding(text: string): Promise<number[]>
     // - generateResumeEmbedding(resume: Resume): Promise<number[]>
     // - generateJobEmbedding(jobDescription: string): Promise<number[]>

     Key implementation:
     - Use existing @google/genai package
     - Model: text-embedding-004 (768 dimensions, FREE)
     - Task types: RETRIEVAL_DOCUMENT for jobs, RETRIEVAL_QUERY for profiles
     - Rate limiting with exponential backoff

     ---
     Phase 3: Backend Match Score Service

     New File: apps/backend/src/services/matchScore.ts

     // Core functions:
     // - getMatchedJobsForProfile(profileId: string): Promise<Job[]>
     // - updateProfileEmbedding(profileId: string, resume: Resume): Promise<void>
     // - computeMatchScores(profileId: string): Promise<void>

     Uses Supabase RPC to call match_jobs_for_profile() function.

     ---
     Phase 4: Backend API Routes

     New File: apps/backend/src/routes/embeddings.ts

     | Endpoint                         | Purpose                           |
     |----------------------------------|-----------------------------------|
     | POST /api/embeddings/profile/:id | Generate/update profile embedding |
     | GET /api/jobs/matched            | Get jobs sorted by match score    |
     | POST /api/jobs/refresh-scores    | Force recalculate scores          |

     Modify: apps/backend/src/index.ts

     - Register new embedding routes

     ---
     Phase 5: Modify Job Fetcher (Main Scoring Trigger)

     Modify: scripts/fetch-jobs.ts

     After inserting jobs:
     1. Generate embedding for each new job
     2. Store embedding in jobs table
     3. Fetch all active profile embeddings
     4. Calculate match scores for each profile-job pair
     5. Store scores in profile_job_matches table

     // After inserting job:
     const jobEmbedding = await generateJobEmbedding(job.job_description);
     await supabase.from('jobs').update({ embedding: jobEmbedding }).eq('id', insertedJob.id);

     // Calculate scores against all profiles with embeddings
     const { data: profiles } = await supabase.from('profiles').select('id, embedding').not('embedding',        
     'is', null);
     for (const profile of profiles) {
       const score = cosineSimilarity(profile.embedding, jobEmbedding) * 100;
       await supabase.from('profile_job_matches').upsert({ profile_id: profile.id, job_id: insertedJob.id,      
     match_score: Math.round(score) });
     }

     Add to SQL Schema (profile_job_matches table):

     CREATE TABLE IF NOT EXISTS profile_job_matches (
         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
         job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
         match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
         computed_at TIMESTAMPTZ DEFAULT NOW(),
         UNIQUE(profile_id, job_id)
     );
     CREATE INDEX IF NOT EXISTS match_scores_profile_idx ON profile_job_matches(profile_id);

     ---
     Phase 6: Profile Integration

     Modify: apps/backend/src/routes/profiles.ts

     On profile create/update:
     1. Format resume as text
     2. Generate embedding via embedding service
     3. Store embedding in profiles table
     4. Trigger match score recalculation

     ---
     Phase 7: Frontend Integration

     Modify: apps/frontend/src/services/database/supabase.ts

     Update fetchJobsFromDB() to:
     - Call authenticated backend API when logged in
     - Return jobs sorted by match_score descending

     Modify: apps/frontend/src/components/Jobs/JobTable.tsx

     - Default sort by match_score
     - Add "Refresh Scores" button
     - Show loading state during score calculation

     Modify: apps/frontend/src/components/Profile/ProfileManager.tsx

     - Show indicator when embedding is generating
     - Toast: "Match scores are being updated..."
     - Auto-refresh job list after profile save

     ---
     Phase 8: Update Types

     Modify: packages/shared/src/types/job.ts

     export interface Job {
       id?: string;           // Add for database reference
       company: string;
       title: string;
       link: string;
       match_score: number;
       missing_skills: string[];
       summary: string;
       description?: string;  // Full description
     }

     ---
     Files to Create/Modify

     | File                                                    | Action | Purpose                      |        
     |---------------------------------------------------------|--------|------------------------------|        
     | apps/backend/src/services/embedding.ts                  | CREATE | Gemini embedding generation  |        
     | apps/backend/src/services/matchScore.ts                 | CREATE | Score calculation logic      |        
     | apps/backend/src/routes/embeddings.ts                   | CREATE | API endpoints                |        
     | apps/backend/src/index.ts                               | MODIFY | Register routes              |        
     | scripts/fetch-jobs.ts                                   | MODIFY | Generate embeddings on fetch |        
     | apps/backend/src/routes/profiles.ts                     | MODIFY | Trigger embedding on save    |        
     | apps/frontend/src/services/database/supabase.ts         | MODIFY | Fetch matched jobs           |        
     | apps/frontend/src/components/Jobs/JobTable.tsx          | MODIFY | Display & sort by score      |        
     | apps/frontend/src/components/Profile/ProfileManager.tsx | MODIFY | Trigger recalc on save       |        
     | packages/shared/src/types/job.ts                        | MODIFY | Add id, description          |        

     ---
     Match Score Formula

     cosine_similarity = 1 - cosine_distance
     match_score = ROUND(cosine_similarity * 100)

     - Score 0-100 (higher = better match)
     - Threshold: Only show jobs with score >= 30

     ---
     Risks & Mitigations

     | Risk               | Mitigation                                     |
     |--------------------|------------------------------------------------|
     | Gemini rate limits | Exponential backoff, batch processing          |
     | Cold start slow    | Pre-compute on profile save, loading indicator |
     | Stale embeddings   | Jobs refresh daily, old jobs auto-deleted      |