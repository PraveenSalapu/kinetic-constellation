
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSlowPath() {
    console.log('1. Signing in as test user...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'ssalapu@asu.edu',
        password: 'testuser123'
    });

    if (authError || !user) {
        console.error('Auth failed:', authError);
        return;
    }

    const token = (await supabase.auth.getSession()).data.session?.access_token;

    // Get a profile ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (!profile) {
        console.error('No profile found for user');
        return;
    }

    console.log(`2. Testing Deep Analysis for Profile ${profile.id}...`);

    const response = await fetch('http://localhost:3001/api/tailor/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            profileId: profile.id,
            jobDescription: "We are looking for a Senior React Developer with experience in TypeScript, Node.js, and AWS. Must have 5+ years of experience."
        })
    });

    const result = await response.json();
    console.log('3. Result:', JSON.stringify(result, null, 2));

    if (result.success && typeof result.data.score === 'number') {
        console.log('✅ SUCCESS: Slow Path (Gemini) returned a score!');
    } else {
        console.error('❌ FAILURE: Invalid response');
    }
}

testSlowPath();
