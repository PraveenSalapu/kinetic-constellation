import React, { useEffect, useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { WifiOff, Calendar } from 'lucide-react';
import { fetchDailyJobs } from '../../services/jsearch';

// 1. CONFIGURATION
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/live-jobs"; // <--- Direct URL (Ensure CORS is enabled in n8n)

// 2. TYPES
export interface Job {
    company: string;
    title: string;
    link: string;
    match_score: number;
    missing_skills: string[];
    summary: string;
}

interface ApiResponse {
    count: number;
    results: Job[];
}

// MOCK DATA FOR FALLBACK
const MOCK_JOBS: Job[] = [
    {
        company: "Nebula AI Systems",
        title: "Senior Full Stack Engineer",
        link: "https://example.com/job/1",
        match_score: 92,
        missing_skills: [],
        summary: "Leading the development of our core AI infrastructure. Looking for strong React and Node.js experience. Great fit for your background in full-stack development."
    },
    {
        company: "TechFlow Corp",
        title: "Backend Developer",
        link: "https://example.com/job/2",
        match_score: 78,
        missing_skills: ["Kubernetes", "Go"],
        summary: "Building high-scale distributed systems. Requires strong knowledge of microservices architecture. You match 80% of the requirements but missing Go experience."
    },
    {
        company: "Creative Solutions Inc",
        title: "Frontend Architect",
        link: "https://example.com/job/3",
        match_score: 65,
        missing_skills: ["GraphQL", "Webpack", "Figma"],
        summary: "We need a design-minded engineer to overhaul our UI library. Your profile lacks specific design tool experience mentioned in the JD."
    }
];

export const JobTable: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState<boolean>(false);
    const { resume, dispatch } = useResume();

    const handleTailor = (job: Job) => {
        dispatch({
            type: 'START_TAILORING',
            payload: {
                job: {
                    title: job.title,
                    company: job.company,
                    description: job.summary || '', // AI Summary serves as JD context
                    link: job.link
                }
            }
        });
    };

    const handleFetchDailyJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            setUsingMockData(false);

            // Use the query from user request or default
            const jobs = await fetchDailyJobs("developer jobs in chicago");
            setJobs(jobs);

        } catch (err: any) {
            console.error("Daily fetch failed:", err);
            setError(`Daily fetch failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);

                // Construct the payload based on current resume data
                // We map frontend state to clean n8n payload
                const payload = {
                    // 1. Send generic job title with OR logic to broaden search
                    role: "Software Engineer OR Backend Developer",

                    // 2. Broaden location search to US (Specific cities limit results too much)
                    location: "United States",

                    // 3. Send cleaned resume object (stripping UI state like history/layout) for AI efficiency
                    resume: {
                        personalInfo: resume.personalInfo,
                        summary: resume.summary,
                        skills: resume.skills,
                        experience: resume.experience,
                        education: resume.education,
                        projects: resume.projects
                    }
                };

                // Add a timeout because the parallel search and AI scoring can take 10-20 seconds
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // Short timeout to fail fast to mock

                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    console.warn("N8N failed, trying fallback to Daily Jobs (JSearch)...");
                    const dailyJobs = await fetchDailyJobs();
                    setJobs(dailyJobs);
                    return; // Success with fallback
                }

                const data: ApiResponse = await response.json();
                console.log("Raw API Response:", data);

                let jobsToSet: Job[] = [];

                if (data.results && Array.isArray(data.results)) {
                    // Check if it's a nested batch structure (array of objects executing in parallel)
                    // Sometimes n8n returns [{ results: [...] }] structure if multiple items end up in Format node
                    if (data.results.length > 0 && (data.results[0] as any).results) {
                        console.log("Detected nested structure, flattening...");
                        // It's nested! Flatten it.
                        // @ts-ignore
                        jobsToSet = data.results.flatMap((batch: any) => batch.results || []);
                    } else {
                        // Standard flat structure
                        jobsToSet = data.results;
                    }
                }

                // Sort by match_score descending (High to Low)
                const sortedJobs = (jobsToSet || []).sort((a, b) => b.match_score - a.match_score);

                setJobs(sortedJobs);
            } catch (err: any) {
                console.warn("n8n Fetch failed, trying fallback to Daily Jobs:", err);
                try {
                    const dailyJobs = await fetchDailyJobs();
                    setJobs(dailyJobs);
                } catch (fallbackErr) {
                    console.error("Both N8N and JSearch failed, using mock data");
                    setUsingMockData(true);
                    setJobs(MOCK_JOBS);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [resume]);

    // 4. RENDERING HELPERS
    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-900/20 text-green-400 border-green-800";
        if (score >= 50) return "bg-yellow-900/20 text-yellow-400 border-yellow-800";
        return "bg-red-900/20 text-red-400 border-red-800";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Scanning live jobs...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 max-w-lg text-center">
                    <h3 className="font-bold mb-2">Connection Error</h3>
                    <p>{error}</p>
                    <p className="text-sm mt-2 text-red-500">Make sure your local n8n instance is running and the webhook URL is correct.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#111] min-h-screen w-full font-mono text-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <span className="text-3xl">🚀</span> Live Job Board
                        </h1>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                            Matches for: <span className="font-semibold text-green-400 bg-green-900/20 border border-green-800 px-2 py-0.5 rounded">{resume.personalInfo.fullName || "Current Profile"}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleFetchDailyJobs}
                        className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Fetch Daily Jobs</span>
                    </button>
                </div>

                {usingMockData && (
                    <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg flex items-center gap-3 text-yellow-200 animate-in fade-in slide-in-from-top-2">
                        <WifiOff size={20} />
                        <div>
                            <p className="text-sm font-bold">Demo Mode Active</p>
                            <p className="text-xs text-yellow-400/80">Live n8n connection unavailable. Showing sample data for demonstration.</p>
                        </div>
                    </div>
                )}

                {/* AIRTABLE-STYLE CONTAINER */}
                <div className="bg-[#1a1a1a] border border-gray-800 shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">

                            {/* TABLE HEADER */}
                            <thead className="bg-[#222]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-800">
                                        Match
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-800">
                                        Role & Company
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-800">
                                        Missing Skills
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-r border-gray-800">
                                        AI Summary
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}
                            <tbody className="bg-[#1a1a1a] divide-y divide-gray-800">
                                {jobs.map((job, index) => (
                                    <tr key={index} className="hover:bg-[#252525] transition-colors duration-150 ease-in-out group">

                                        {/* SCORE COLUMN */}
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-800">
                                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full border ${getScoreColor(job.match_score)}`}>
                                                {job.match_score}%
                                            </span>
                                        </td>

                                        {/* ROLE COLUMN */}
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-800">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-200">{job.title}</span>
                                                <span className="text-sm text-gray-500">{job.company}</span>
                                            </div>
                                        </td>

                                        {/* SKILLS COLUMN (TAGS) */}
                                        <td className="px-6 py-4 border-r border-gray-800 max-w-xs">
                                            <div className="flex flex-wrap gap-2">
                                                {job.missing_skills.length > 0 ? (
                                                    job.missing_skills.map((skill, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-900/20 text-red-400 border border-red-800">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-900/20 text-green-400 border border-green-800">
                                                        Perfect Match
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* SUMMARY COLUMN */}
                                        <td className="px-6 py-4 text-sm text-gray-500 border-r border-gray-800 max-w-xs relative group">
                                            <div className="line-clamp-2">{job.summary}</div>
                                            {/* Hover Tooltip */}
                                            <div className="hidden group-hover:block absolute z-10 left-0 top-full mt-1 p-3 bg-gray-900 border border-gray-700 shadow-xl rounded-lg w-72 text-sm text-gray-300 whitespace-normal">
                                                {job.summary}
                                            </div>
                                        </td>

                                        {/* APPLY BUTTON */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                                            <a
                                                href={job.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm text-xs uppercase font-bold tracking-wide"
                                            >
                                                Apply
                                            </a>
                                            <button
                                                onClick={() => handleTailor(job)}
                                                className="text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-800 px-3 py-1.5 rounded-md transition-colors text-xs font-bold tracking-wide flex items-center gap-1"
                                                title="Tailor Resume for this Job"
                                            >
                                                <span className="mr-1">✨</span> Tailor
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* EMPTY STATE */}
                        {jobs.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <div className="mx-auto h-12 w-12 text-gray-600 mb-4">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-300">No jobs found</h3>
                                <p className="mt-1 text-sm text-gray-600">We couldn't find any new listings in the last 24 hours.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
