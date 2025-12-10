
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JSEARCH_API_KEY = process.env.VITE_RAPIDAPI_KEY || 'a813af95c9msh83b8f9b7cd4a46cp156515jsn2b8fedfbe4b9'; // Fallback to hardcoded if env missing for now

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing Supabase Credentials in .env');
    process.exit(1);
}

// Initialize Supabase with Service Role (Admin Access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface JSearchJob {
    job_id: string;
    job_title: string;
    employer_name: string;
    job_apply_link: string;
    job_description: string;
    job_posted_at_datetime_utc: string;
}

const fetchJobsFromRapidAPI = async (query: string) => {
    const url = 'https://jsearch.p.rapidapi.com/search';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': JSEARCH_API_KEY,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
    };

    try {
        const fetchUrl = `${url}?query=${encodeURIComponent(query)}&page=1&num_pages=1&date_posted=today&country=us`;
        console.log(`Fetching jobs for: "${query}"...`);
        const response = await fetch(fetchUrl, options);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('RapidAPI Fetch Error:', error);
        return [];
    }
};

const runCrawler = async () => {
    console.log('--- Starting Job Crawler ---');

    // 1. Fetch relevant jobs
    // Searching for multiple variations to get a good mix
    // 1. Fetch relevant jobs using Advanced Queries (Boolean Search / "Dorking")
    // Searching for multiple variations to get a good mix
    const queries = [
        // 1. Broad Tech Terms (OR) + Location
        '("Software Engineer" OR "Full Stack Developer" OR "Backend Developer" OR "Frontend Developer") in "United States"',

        // 2. Specific Stacks (AND/OR) excluding Senior/Lead roles for broader mid-level focus
        '("React" OR "Node.js" OR "TypeScript" OR "Python") AND "Developer" in "United States" -"Senior" -"Lead" -"Manager"',

        // 3. Remote specific (using query keywords often found in remote listings)
        '("Remote" AND "Software Engineer")'
    ];

    let allJobs: JSearchJob[] = [];

    for (const query of queries) {
        const jobs = await fetchJobsFromRapidAPI(query);
        allJobs = [...allJobs, ...jobs];
        // Brief pause to avoid rate limits if any
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Fetched ${allJobs.length} raw jobs.`);

    // 2. Process and Insert into Supabase
    let authorizedCount = 0;
    let duplicateCount = 0;

    for (const job of allJobs) {
        // Filter out LinkedIn jobs (often "Easy Apply" spam or require external login)
        if (job.job_apply_link && job.job_apply_link.includes('linkedin.com')) {
            continue;
        }

        const dbRecord = {
            title: job.job_title,
            company: job.employer_name,
            link: job.job_apply_link,
            description: job.job_description || 'No description', // Store full description for AI tailoring
            location: 'Remote/US', // Simplified
            match_score: 0, // Default until AI analyzes it
            missing_skills: [],
            source: 'jsearch'
        };

        const { error } = await supabase
            .from('jobs')
            .upsert(dbRecord, { onConflict: 'link', ignoreDuplicates: true }); // Use link as unique ID

        if (error) {
            console.error('Insert Error:', error.message);
        } else {
            authorizedCount++;
        }
    }

    console.log(`Upserted ${authorizedCount} jobs.`);

    // 3. Cleanup Old Jobs (> 32 hours)
    const thirtyTwoHoursAgo = new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString();

    const { error: deleteError, count } = await supabase
        .from('jobs')
        .delete({ count: 'exact' })
        .lt('created_at', thirtyTwoHoursAgo);

    if (deleteError) {
        console.error('Cleanup Error:', deleteError.message);
    } else {
        console.log(`Cleaned up ${count} old jobs.`);
    }

    console.log('--- Crawler Finished ---');
};

runCrawler();
