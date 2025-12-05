import React, { useEffect, useState } from 'react';
import { useResume } from '../../context/ResumeContext';

// 1. CONFIGURATION
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/live-jobs"; // <--- Direct URL (Ensure CORS is enabled in n8n)

// 2. TYPES
interface Job {
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

export const JobTable: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { resume } = useResume();

    // 3. FETCH DATA
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);

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
                const timeoutId = setTimeout(() => controller.abort(), 120000); // 60 second timeout

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
                    throw new Error(`Error: ${response.statusText}`);
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
                console.error("Fetch failed:", err);
                setError("Failed to load jobs. Is n8n active?");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [resume]);

    // 4. RENDERING HELPERS
    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
        if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500">Scanning live jobs...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-lg text-center">
                    <h3 className="font-bold mb-2">Connection Error</h3>
                    <p>{error}</p>
                    <p className="text-sm mt-2 text-red-500">Make sure your local n8n instance is running and the webhook URL is correct.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-3xl">🚀</span> Live Job Board
                </h1>
                <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    Matches for: <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{resume.personalInfo.fullName || "Current Profile"}</span>
                </p>

                {/* AIRTABLE-STYLE CONTAINER */}
                <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">

                            {/* TABLE HEADER */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
                                        Match
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
                                        Role & Company
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
                                        Missing Skills
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
                                        AI Summary
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}
                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs.map((job, index) => (
                                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150 ease-in-out group">

                                        {/* SCORE COLUMN */}
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-full border ${getScoreColor(job.match_score)}`}>
                                                {job.match_score}%
                                            </span>
                                        </td>

                                        {/* ROLE COLUMN */}
                                        <td className="px-6 py-4 whitespace-nowrap border-r border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{job.title}</span>
                                                <span className="text-sm text-gray-500">{job.company}</span>
                                            </div>
                                        </td>

                                        {/* SKILLS COLUMN (TAGS) */}
                                        <td className="px-6 py-4 border-r border-gray-100 max-w-xs">
                                            <div className="flex flex-wrap gap-2">
                                                {job.missing_skills.length > 0 ? (
                                                    job.missing_skills.map((skill, i) => (
                                                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                        Perfect Match
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* SUMMARY COLUMN */}
                                        <td className="px-6 py-4 text-sm text-gray-500 border-r border-gray-100 max-w-xs relative group">
                                            <div className="line-clamp-2">{job.summary}</div>
                                            {/* Hover Tooltip */}
                                            <div className="hidden group-hover:block absolute z-10 left-0 top-full mt-1 p-3 bg-white border border-gray-200 shadow-xl rounded-lg w-72 text-sm text-gray-700 whitespace-normal">
                                                {job.summary}
                                            </div>
                                        </td>

                                        {/* APPLY BUTTON */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <a
                                                href={job.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors shadow-sm text-xs uppercase font-bold tracking-wide"
                                            >
                                                Apply
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* EMPTY STATE */}
                        {jobs.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                                <p className="mt-1 text-sm text-gray-500">We couldn't find any new listings in the last 24 hours.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
