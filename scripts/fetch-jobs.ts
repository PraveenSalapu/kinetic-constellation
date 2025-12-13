
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv to read from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JSEARCH_API_KEY = process.env.VITE_RAPIDAPI_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Validate required environment variables
const missingVars = [];
if (!SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
if (!SUPABASE_SERVICE_KEY) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
if (!JSEARCH_API_KEY) missingVars.push('VITE_RAPIDAPI_KEY');

if (missingVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingVars.join(', ')}`);
    console.error('Please ensure these are set in your .env file');
    process.exit(1);
}

// Initialize Supabase with Service Role (Admin Access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Initialize Gemini for embeddings
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * Generate embedding for a job description using Gemini
 */
const generateJobEmbedding = async (description: string): Promise<number[] | null> => {
    if (!genAI || !description || description.trim().length === 0) {
        return null;
    }

    try {
        const result = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: description.slice(0, 10000), // Limit text length
            config: { taskType: 'RETRIEVAL_DOCUMENT' },
        });

        if (!result.embeddings || result.embeddings.length === 0) {
            return null;
        }

        return result.embeddings[0].values;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
};

// Metadata Interface
interface JobMetadata {
    experience_level: string; // "Entry", "Mid", "Senior", "Lead"
    job_type: string;        // "Full-time", "Contract", "Part-time"
    category: string;        // "Frontend", "Backend", "Full Stack", "DevOps", "AI/ML", "Mobile"
}

/**
 * Analyze job description to extract metadata using Gemini
 */
const analyzeJobMetadata = async (description: string, title: string): Promise<JobMetadata | null> => {
    if (!genAI || !description) return null;

    try {
        const prompt = `
        Analyze this job listing and extract the following metadata in strict JSON format:
        1. experience_level: One of "Entry", "Mid", "Senior", "Lead"
        2. job_type: One of "Full-time", "Contract", "Part-time", "Internship"
        3. category: One of "Frontend", "Backend", "Full Stack", "DevOps", "AI/ML", "Mobile", "Data", "Other"

        Job Title: ${title}
        Description: ${description.slice(0, 1000)}

        Return ONLY the JSON object.
        `;

        // Use "gemini-2.0-flash-exp" as requested
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // DEBUG: Inspect structure
        console.log('DEBUG GEMINI RESULT KEYS:', Object.keys(result));
        try {
            console.log('DEBUG GEMINI RESULT:', JSON.stringify(result).slice(0, 500));
        } catch (e) { console.log('Result not stringifiable'); }

        // Attempt safe extraction
        let jsonString = '';
        if (result && typeof (result as any).text === 'function') {
            jsonString = (result as any).text();
        } else if (result && (result as any).response && typeof (result as any).response.text === 'function') {
            jsonString = (result as any).response.text();
        } else {
            // throw new Error('Unknown response structure'); 
            return null; // Just skip for now to let loop continue
        }

        // Simple cleanup to ensure JSON
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString) as JobMetadata;
    } catch (error) {
        console.error('Error analyzing job metadata:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return null;
    }
};

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
    let embeddingCount = 0;
    let analyzedCount = 0;

    console.log('Processing and inserting jobs...');

    for (const job of allJobs) {
        // Filter out LinkedIn jobs (often "Easy Apply" spam or require external login)
        if (job.job_apply_link && job.job_apply_link.includes('linkedin.com')) {
            continue;
        }

        const description = job.job_description || 'No description';

        // Analyze metadata (AI) FIRST so it's available for updates
        const metadata = await analyzeJobMetadata(description, job.job_title);
        if (metadata) analyzedCount++;

        // Check if job exists first (since no unique constraint on link in DB yet)
        const { data: existing } = await supabase
            .from('jobs')
            .select('id')
            .eq('link', job.job_apply_link)
            .maybeSingle();

        if (existing) {
            console.log(`Updating existing job: ${job.job_title}`);
            const { error: updateError } = await supabase
                .from('jobs')
                .update({
                    experience_level: metadata?.experience_level || 'Mid',
                    job_type: metadata?.job_type || 'Full-time',
                    category: metadata?.category || 'Other'
                })
                .eq('id', existing.id);

            if (updateError) {
                console.error('Update Error:', updateError.message);
            } else {
                authorizedCount++;
            }
            continue;
        }

        // Generate embedding for this job
        const embedding = await generateJobEmbedding(description);

        const dbRecord: Record<string, unknown> = {
            title: job.job_title,
            company: job.employer_name,
            link: job.job_apply_link,
            description: description,
            location: 'Remote/US',
            // Add metadata fields if analysis succeeded, otherwise default or null
            experience_level: metadata?.experience_level || 'Mid',
            job_type: metadata?.job_type || 'Full-time',
            category: metadata?.category || 'Other'
        };

        // Add embedding if generated successfully
        if (embedding) {
            dbRecord.embedding = embedding;
            embeddingCount++;
        }

        const { error } = await supabase
            .from('jobs')
            .insert(dbRecord);

        if (error) {
            console.error('Insert Error:', error.message);
        } else {
            authorizedCount++;
        }

        // Small delay between jobs to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Upserted ${authorizedCount} jobs with ${embeddingCount} embeddings and ${analyzedCount} classifications.`);
    console.log('Match scores will be calculated on-demand when users view jobs.');

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
