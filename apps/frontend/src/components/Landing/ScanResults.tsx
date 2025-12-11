import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { AlertTriangle, CheckCircle, ArrowRight, XCircle } from 'lucide-react';

interface ScanResultsProps {
    onComplete: () => void;
}

export const ScanResults: React.FC<ScanResultsProps> = ({ onComplete }) => {
    const { resume } = useResume();
    const { atsScan } = resume;
    const score = atsScan?.score || 0;
    const issues = atsScan?.issues || [];

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-green-500 border-green-500';
        if (s >= 50) return 'text-yellow-500 border-yellow-500';
        return 'text-red-500 border-red-500';
    };

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#0F0F0F] text-white p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-500">

                {/* Left Panel: The Problem (Resume Preview) */}
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-6 h-[600px] overflow-hidden relative shadow-2xl flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-transparent opacity-50" />
                    <h3 className="text-gray-400 font-mono text-sm mb-4 flex items-center gap-2">
                        <XCircle size={14} className="text-red-500" />
                        RESUME_PREVIEW.PDF [READ_ONLY]
                    </h3>

                    {/* Mock PDF View - in reality we would use react-pdf here */}
                    <div className="flex-1 bg-white/5 rounded-lg p-8 font-serif text-gray-500 text-[10px] leading-relaxed overflow-hidden select-none opacity-50 relative">
                        <div className="w-1/3 h-4 bg-gray-600 mb-6 rounded" />
                        <div className="w-full h-2 bg-gray-700 mb-2 rounded" />
                        <div className="w-full h-2 bg-gray-700 mb-2 rounded" />
                        <div className="w-2/3 h-2 bg-gray-700 mb-8 rounded" />

                        <div className="w-1/4 h-3 bg-gray-600 mb-4 rounded" />
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex gap-2 mb-2 opacity-30">
                                <div className="w-2 h-2 rounded-full bg-gray-700 mt-1" />
                                <div className="flex-1 space-y-1">
                                    <div className="w-full h-2 bg-gray-700 rounded" />
                                    <div className="w-5/6 h-2 bg-gray-700 rounded" />
                                </div>
                            </div>
                        ))}

                        {/* Error Overlay */}
                        <div className="absolute top-1/3 left-10 right-10 p-4 bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg text-red-200 transform -rotate-2">
                            <p className="font-mono text-xs font-bold mb-1">⚠ PARSING ERROR</p>
                            <p className="text-xs">Complex columns detected. Header text unreadable.</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: The Analysis */}
                <div className="space-y-6">
                    <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Analysis Complete</h1>
                                <p className="text-gray-400">Your resume is invisible to 40% of ATS algorithms.</p>
                            </div>
                            <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center bg-black ${getScoreColor(score)}`}>
                                <span className="text-4xl font-mono font-bold">{score}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-mono text-sm text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Critical Issues Detected</h3>

                            {issues.length === 0 ? (
                                <p className="text-gray-500 italic">No critical issues found (Mock).</p>
                            ) : (
                                issues.map((issue, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-black/40 rounded-lg border border-gray-800 animate-in slide-in-from-right-4 fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                        {issue.type === 'error' ? (
                                            <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                        ) : issue.type === 'warning' ? (
                                            <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                                        ) : (
                                            <CheckCircle className="text-green-500 shrink-0" size={20} />
                                        )}
                                        <div>
                                            <p className={`font-medium text-sm ${issue.type === 'error' ? 'text-red-400' : 'text-gray-300'}`}>
                                                {issue.message}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,148,0.4)] hover:shadow-[0_0_30px_rgba(0,255,148,0.6)] flex items-center justify-center gap-2 group"
                    >
                        Fix All Issues & Optimize
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-xs text-gray-600">
                        Proceeding involves reformatting your resume with the "Forensic Minimalist" template.
                    </p>
                </div>
            </div>
        </div>
    );
};
