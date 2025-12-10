
import { createClient } from '@supabase/supabase-js';
import type { Job } from '../../types';

// Access environment variables using Vite's syntax
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Key missing. Database features will be disabled.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Fetch jobs from Supabase "jobs" table
 * Ordered by Match Score and creation date
 */
export const fetchJobsFromDB = async (): Promise<Job[]> => {
    if (!supabaseUrl || !supabaseAnonKey) return [];

    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching jobs from Supabase:', error);
        throw error;
    }

    // Map DB fields to our Job interface if needed (though they should align closely)
    return (data || []).map(record => ({
        title: record.title,
        company: record.company,
        link: record.link,
        summary: record.description || '', // Mapping description to summary
        match_score: Number(record.match_score) || 0,
        missing_skills: record.missing_skills || [],
        posted_at: record.created_at
    })) as Job[];
};
