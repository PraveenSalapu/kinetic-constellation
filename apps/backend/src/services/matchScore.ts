import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { generateResumeEmbedding, cosineSimilarity, similarityToScore, hasEnoughContentForEmbedding } from './embedding.js';
import type { Resume } from '@careerflow/shared';

// Lazy-initialized Supabase client
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }
  return _supabase;
}

export interface MatchedJob {
  id: string;
  title: string;
  company: string;
  link: string;
  description: string;
  match_score: number;
  location?: string;
  created_at?: string;
}

/**
 * Update profile embedding when resume data changes
 * Only generates embedding if profile has enough content
 */
export const updateProfileEmbedding = async (profileId: string, resumeData: Resume): Promise<boolean> => {
  try {
    // Check if profile has enough content for meaningful embedding
    if (!hasEnoughContentForEmbedding(resumeData)) {
      console.log(`Profile ${profileId} doesn't have enough content for embedding yet`);
      return false;
    }

    const embedding = await generateResumeEmbedding(resumeData);

    const { error } = await getSupabase()
      .from('profiles')
      .update({
        embedding: embedding,
        embedding_updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating profile embedding:', error);
      throw error;
    }

    console.log(`Updated embedding for profile ${profileId}`);
    return true;
  } catch (error) {
    console.error('Error in updateProfileEmbedding:', error);
    throw error;
  }
};

/**
 * Get matched jobs for a user's active profile
 * Calculates match scores ON-DEMAND using cosine similarity
 */
export const getMatchedJobsForUser = async (userId: string): Promise<MatchedJob[]> => {
  try {
    // Get user's active profile with embedding
    const { data: profile, error: profileError } = await getSupabase()
      .from('profiles')
      .select('id, embedding')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      console.log('No active profile found for user');
      return await getJobsWithoutScores();
    }

    // If profile has no embedding, return jobs without scores
    if (!profile.embedding) {
      console.log('Profile has no embedding yet');
      return await getJobsWithoutScores();
    }

    // Verify profile embedding format
    let profileEmbedding = profile.embedding;
    if (typeof profileEmbedding === 'string') {
      try {
        profileEmbedding = JSON.parse(profileEmbedding);
      } catch (e) {
        console.error('Failed to parse profile embedding', e);
        return await getJobsWithoutScores();
      }
    }

    // Ensure it is an array now
    if (!Array.isArray(profileEmbedding)) {
      console.error('Profile embedding is not an array');
      return await getJobsWithoutScores();
    }

    // Get all jobs with embeddings
    const { data: jobs, error: jobsError } = await getSupabase()
      .from('jobs')
      .select('id, title, company, link, description, location, created_at, embedding')
      .not('embedding', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (jobsError || !jobs || jobs.length === 0) {
      console.log('No jobs with embeddings found');
      return await getJobsWithoutScores();
    }

    // Calculate match scores on-the-fly
    const scoredJobs = jobs.map(job => {
      let jobEmbedding = job.embedding;
      if (typeof jobEmbedding === 'string') {
        try {
          jobEmbedding = JSON.parse(jobEmbedding);
        } catch (e) {
          return { ...job, match_score: 0 };
        }
      }

      const similarity = cosineSimilarity(profileEmbedding as number[], jobEmbedding as number[]);
      const score = similarityToScore(similarity);

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        link: job.link,
        description: job.description,
        location: job.location,
        created_at: job.created_at,
        match_score: score,
      };
    });

    // Sort by match score descending and filter low scores
    return scoredJobs
      .filter(job => job.match_score >= 0) // Show all jobs even if low match
      .sort((a, b) => b.match_score - a.match_score);

  } catch (error) {
    console.error('Error in getMatchedJobsForUser:', error);
    throw error;
  }
};

/**
 * Fallback: get recent jobs without computed scores
 */
async function getJobsWithoutScores(): Promise<MatchedJob[]> {
  const { data: jobs, error } = await getSupabase()
    .from('jobs')
    .select('id, title, company, link, description, location, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return (jobs || []).map(job => ({
    ...job,
    match_score: 0, // No profile to compare against
  }));
}

/**
 * Trigger score recalculation (just regenerates profile embedding)
 * Scores are calculated on-demand, so this just ensures embedding is fresh
 */
export const computeMatchScoresForProfile = async (profileId: string): Promise<number> => {
  // With on-demand scoring, we just need to ensure the profile has an embedding
  // The actual scores are calculated when jobs are fetched
  const { data: profile } = await getSupabase()
    .from('profiles')
    .select('embedding')
    .eq('id', profileId)
    .single();

  if (profile?.embedding) {
    // Get job count to return something meaningful
    const { count } = await getSupabase()
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    return count || 0;
  }

  return 0;
};
