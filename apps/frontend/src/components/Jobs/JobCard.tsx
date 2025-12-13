import React from 'react';
import { MapPin, Clock, DollarSign, Briefcase, ExternalLink, Wand2, Star, Building2, Globe } from 'lucide-react';
import type { Job } from '../../types';

interface JobCardProps {
    job: Job;
    onTailor: (job: Job) => void;
    onApply?: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onTailor }) => {
    // Calculate color based on match score
    const score = job.match_score || 0;
    const scoreColor = score >= 90 ? 'text-green-400' : score >= 70 ? 'text-yellow-400' : 'text-gray-400';
    const strokeColor = score >= 90 ? '#4ade80' : score >= 70 ? '#facc15' : '#4b5563';

    // Circle match calculation
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="group relative bg-[#151518] hover:bg-[#1a1a1d] border border-gray-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)] hover:-translate-y-1">
            <div className="flex flex-col md:flex-row gap-6">

                {/* 1. Left: Icon & Info */}
                <div className="flex-1 flex gap-4">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 shadow-inner shrink-0">
                        <Building2 className="text-gray-400 group-hover:text-indigo-400 transition-colors" size={32} />
                    </div>

                    <div className="flex-1 space-y-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-indigo-400 font-medium">
                                <span>{job.company}</span>
                                {job.link && (
                                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300">
                                        <ExternalLink size={12} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700/50">
                                <MapPin size={12} /> {job.location || 'Remote'}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700/50">
                                <Briefcase size={12} /> {job.jobType || 'Full-time'}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-md border border-gray-700/50">
                                <Clock size={12} /> {job.experienceLevel || 'Mid Level'}
                            </span>
                            {job.salary && (
                                <span className="flex items-center gap-1 bg-green-900/10 text-green-400 px-2 py-1 rounded-md border border-green-900/20">
                                    <DollarSign size={12} /> {job.salary}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 pt-1 border-t border-gray-800/50 mt-2">
                            {job.summary || "No description available. Click to analyze."}
                        </p>
                    </div>
                </div>

                {/* 2. Right: Match Score & Actions */}
                <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">

                    {/* Match Score Circle */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Ring */}
                            <circle cx="32" cy="32" r={radius} stroke="#374151" strokeWidth="4" fill="transparent" />
                            {/* Progress Ring */}
                            <circle
                                cx="32" cy="32" r={radius}
                                stroke={strokeColor}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`text-sm font-bold ${scoreColor}`}>{score}%</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 w-full">
                        <button
                            onClick={() => onTailor(job)}
                            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            <Wand2 size={14} /> Tailor Resume
                        </button>

                        {job.link && (
                            <a
                                href={job.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-gray-700"
                            >
                                <Globe size={14} /> Apply Now
                            </a>
                        )}
                    </div>
                </div>

            </div>

            {/* Top Right "Missing Skills" Quick view (Optional, only if low match) */}
            {score < 100 && job.missing_skills && job.missing_skills.length > 0 && (
                <div className="hidden group-hover:flex absolute top-4 right-4 md:static md:mt-4 items-center gap-2 text-xs text-red-400/80 bg-red-900/10 px-3 py-1 rounded-full border border-red-900/20">
                    <span>Missing:</span>
                    <span className="text-gray-400 max-w-[200px] truncate">{job.missing_skills.join(', ')}</span>
                </div>
            )}
        </div>
    );
};
