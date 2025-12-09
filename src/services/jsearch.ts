import type { Job } from '../components/Jobs/JobTable';

const JSEARCH_API_URL = 'https://jsearch.p.rapidapi.com/search';
const JSEARCH_API_KEY = 'a813af95c9msh83b8f9b7cd4a46cp156515jsn2b8fedfbe4b9'; // Ideally use env var, but using per user request
const JSEARCH_HOST = 'jsearch.p.rapidapi.com';

interface JSearchJob {
    job_id: string;
    employer_name: string;
    job_title: string;
    job_apply_link: string;
    job_description: string;
    job_posted_at_datetime_utc: string; // ISO timestamp
    // Other fields we might ignore for now
}

interface JSearchResponse {
    status: string;
    request_id: string;
    data: JSearchJob[];
}

export const fetchDailyJobs = async (query: string = 'developer jobs in chicago'): Promise<Job[]> => {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': JSEARCH_API_KEY,
            'x-rapidapi-host': JSEARCH_HOST
        }
    };

    // Construct URL with params manually since we are using fetch
    const params = new URLSearchParams({
        query: query,
        page: '1',
        num_pages: '1',
        country: 'us',
        date_posted: 'today' // Native filter for 24h
    });

    try {
        const response = await fetch(`${JSEARCH_API_URL}?${params.toString()}`, options);

        if (!response.ok) {
            throw new Error(`JSearch API Error: ${response.statusText}`);
        }

        const data: JSearchResponse = await response.json();

        // Map to our Job interface
        const mappedJobs: Job[] = (data.data || []).map(jJob => ({
            company: jJob.employer_name,
            title: jJob.job_title,
            link: jJob.job_apply_link,
            match_score: 0, // No AI analysis yet
            missing_skills: [],
            summary: jJob.job_description ? jJob.job_description.substring(0, 300) + "..." : "No description available."
        }));

        return mappedJobs;

    } catch (error) {
        console.error("Failed to fetch daily jobs from JSearch:", error);
        throw error; // Re-throw to let caller handle fallback
    }
};
