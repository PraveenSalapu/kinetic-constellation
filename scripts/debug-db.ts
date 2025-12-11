
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkDB() {
    console.log('--- DB CHECK ---');

    // Check Jobs
    const { count: jobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

    console.log(`TOTAL JOBS: ${jobCount}`);

    // Check Profiles
    const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    console.log(`TOTAL PROFILES: ${profileCount}`);
    console.log('----------------');
}

checkDB();
