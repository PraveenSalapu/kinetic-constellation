
import { createClient } from '@supabase/supabase-js';
import type { Job } from '../../types';
import { getMatchedJobs } from '../api';

// Access environment variables using Vite's syntax
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key missing. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Fetch jobs from backend API with match scores (for authenticated users)
 * Falls back to direct Supabase query for unauthenticated users
 */
export const fetchJobsFromDB = async (): Promise<Job[]> => {
    if (!supabaseUrl || !supabaseAnonKey) return [];

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        // Authenticated: use backend API for personalized match scores
        try {
            const jobs = await getMatchedJobs();
            return jobs.map(record => ({
                id: record.id,
                title: record.title,
                company: record.company,
                link: record.link,
                summary: record.description || '',
                description: record.description,
                match_score: Number(record.match_score) || 0,
                missing_skills: record.missing_skills || [],
                location: record.location,
                created_at: record.created_at
            })) as Job[];
        } catch (error) {
            console.error('Error fetching matched jobs from API, falling back to Supabase:', error);
            // Fall through to direct Supabase query
        }
    }

    // Unauthenticated or API failed: direct Supabase query
    const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, link, description, location, created_at, match_score, missing_skills, experience_level, job_type, category')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs from Supabase:', error);
        throw error;
    }

    return (data || []).map(record => ({
        id: record.id,
        title: record.title,
        company: record.company,
        link: record.link,
        summary: record.description || '',
        description: record.description,
        match_score: Number(record.match_score) || 0,
        missing_skills: record.missing_skills || [],
        location: record.location,
        created_at: record.created_at,
        experienceLevel: record.experience_level,
        jobType: record.job_type,
        category: record.category
    })) as Job[];
};
