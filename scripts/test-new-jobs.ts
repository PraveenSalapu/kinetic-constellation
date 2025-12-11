
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Error: Missing Supabase Credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const EMBEDDING_MODEL = 'text-embedding-004';

const MOCK_JOBS = [
    {
        title: "Senior React Developer - AI Platform",
        company: "NeuroTech Stream",
        description: "We are looking for a Senior React Developer to join our AI platform team. You will be building real-time interfaces for brain-computer interfaces. Must have deep experience with React, TypeScript, and WebSockets. Optimization and performance are key. Experience with Python/Flask backend is a plus. Remote role.",
        link: `https://neurotech.example.com/jobs/${uuidv4()}`
    },
    {
        title: "Backend Engineer (Node.js/Postgres)",
        company: "FlowScale Systems",
        description: "FlowScale is scaling its data ingestion pipeline. We need a strong Backend Engineer with Node.js and PostgreSQL expertise. You will work on optimizing high-throughput APIs and managing distributed systems using Redis and BullMQ. Ideal candidate has 5+ years of experience. Hybrid in NYC.",
        link: `https://flowscale.example.com/jobs/${uuidv4()}`
    },
    {
        title: "Full Stack Engineer - Early Stage Startup",
        company: "Stealth Mode",
        description: "Join our founding team as a Full Stack Engineer. We are building the next generation of social commerce. Stack: Next.js, tailwind, Supabase. You need to be a generalist who can move fast. Equity heavy compensation. Remote worldwide.",
        link: `https://stealth.example.com/jobs/${uuidv4()}`
    }
];

const generateJobEmbedding = async (description: string): Promise<number[] | null> => {
    if (!genAI || !description) return null;
    try {
        const result = await genAI.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: description.slice(0, 10000),
            config: { taskType: 'RETRIEVAL_DOCUMENT' },
        });
        return result.embeddings?.[0]?.values || null;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
};

const runTest = async () => {
    console.log('--- Starting Test: Inserting New Mock Jobs ---');

    for (const job of MOCK_JOBS) {
        console.log(`Processing: ${job.title} at ${job.company}...`);

        let embedding = null;
        if (genAI) {
            process.stdout.write('  Generating embedding... ');
            embedding = await generateJobEmbedding(job.description);
            console.log(embedding ? 'Success' : 'Failed');
        } else {
            console.log('Skipping embedding (No Gemini Key)');
        }

        const { error } = await supabase.from('jobs').upsert({
            title: job.title,
            company: job.company,
            link: job.link,
            description: job.description,
            location: 'Remote Test',
            match_score: 0,
            source: 'manual_test',
            embedding: embedding
        }, { onConflict: 'link', ignoreDuplicates: true });

        if (error) {
            console.error('  Insert Failed:', error.message);
        } else {
            console.log('  Insert Success');
        }
    }

    console.log('--- Test Complete ---');
    console.log('Check your "Jobs" page in the app to see if they appear with Match Scores!');
};

runTest();
