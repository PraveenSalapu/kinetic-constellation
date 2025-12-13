
// API Service for backend communication
import { supabase } from './supabase';
import config from '../config/environment';

const API_BASE = config.apiUrl;

// Make authenticated API request
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Handle specific error cases if needed
  }

  return response;
}

// Profile API calls
export async function getProfiles(): Promise<any[]> {
  const response = await fetchWithAuth('/api/profiles');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profiles');
  return data.profiles;
}

export async function createProfile(name: string, resumeData: any): Promise<any> {
  const response = await fetchWithAuth('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ name, data: resumeData }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create profile');
  return data.profile;
}

export async function updateProfile(id: string, updates: { name?: string; data?: any; isActive?: boolean; hasCompletedOnboarding?: boolean }): Promise<any> {
  const response = await fetchWithAuth(`/api/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update profile');
  return data.profile;
}

export async function deleteProfile(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete profile');
  }
}

// Jobs API calls

/**
 * Get jobs with match scores for the current user's active profile
 */
export async function getMatchedJobs(): Promise<any[]> {
  const response = await fetchWithAuth('/api/jobs/matched');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch matched jobs');
  return data.jobs;
}

/**
 * Force refresh match scores for the current user
 */
export async function refreshMatchScores(): Promise<{ scoresComputed: number }> {
  const response = await fetchWithAuth('/api/jobs/refresh-scores', {
    method: 'POST',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to refresh scores');
  return data;
}

/**
 * Calculate ATS score for a specific job using current resume data (Draft Mode)
 */
export async function calculateDeepMatchScore(resumeData: any, jobDescription: string): Promise<{ score: number, missingKeywords: string[], criticalFeedback: string }> {
  try {
    const response = await fetchWithAuth('/api/tailor/score', {
      method: 'POST',
      body: JSON.stringify({
        resumeData,
        jobDescription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to calculate deep match score');
    }

    const data = await response.json();
    return data.data; // { score, missingKeywords, criticalFeedback }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Get match score for a specific job (Stored/Pre-calc)
 */
export async function getJobScore(jobId: string): Promise<number> {
  const response = await fetchWithAuth(`/api/jobs/${jobId}/score`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch job score');
  return data.match_score;
}

/**
 * Get semantic match score using Server-Side Vector Embeddings
 * High quality, but slower than client-side heuristic.
 */
export async function getVectorMatchScore(resumeText: string, jobDescription: string): Promise<number> {
  const response = await fetchWithAuth('/api/tailor/vector-match', {
    method: 'POST',
    body: JSON.stringify({ resumeText, jobDescription })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to calculate vector score');

  return data.score;
}

// Credits API
export async function getCredits(): Promise<number> {
  const response = await fetchWithAuth('/api/credits/balance');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch credits');
  return data.credits;
}
