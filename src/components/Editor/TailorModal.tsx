import { useState, useEffect } from 'react';
import { X, Wand2, Loader2, Lightbulb, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { tailorResume } from '../../services/gemini';
import type { TailorResponse } from '../../types';

interface TailorModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobDescription?: string;
}

export const TailorModal = ({ isOpen, onClose, jobDescription: initialJD = '' }: TailorModalProps) => {
    const { resume, dispatch } = useResume();
    const [jobDescription, setJobDescription] = useState(initialJD);
    const [isTailoring, setIsTailoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);
    const [showReasoning, setShowReasoning] = useState(true);

    // Update local state if prop changes or resume context has tailoring job
    useEffect(() => {
        if (resume.tailoringJob) {
            const { title, company, description, link } = resume.tailoringJob;
            const composedDescription = `Role: ${title}\nCompany: ${company}\nLink: ${link || 'N/A'}\n\nJob Description:\n${description || ''}`;
            setJobDescription(composedDescription.trim());
        } else if (initialJD) {
            setJobDescription(initialJD);
        }
    }, [initialJD, resume.tailoringJob]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTailorResult(null);
            setError(null);
            setShowReasoning(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;

        setIsTailoring(true);
        setError(null);
        setTailorResult(null);

        try {
            // Remove ID and other non-content fields to save tokens and avoid confusion
            const resumeContent = JSON.stringify(resume, (key, value) => {
                if (key === 'id' || key === 'isVisible' || key === 'order') return undefined;
                return value;
            }, 2);

            const result = await tailorResume(resumeContent, jobDescription);
            setTailorResult(result);
        } catch (err) {
            console.error(err);
            setError('Failed to tailor resume. Please try again.');
        } finally {
            setIsTailoring(false);
        }
    };

    const handleApplyChanges = () => {
        if (!tailorResult) return;

        const { tailoredSummary, missingHardSkills } = tailorResult;

        // Create a new skills section for missing skills if there are any
        let newSkills = [...resume.skills];
        if (missingHardSkills && missingHardSkills.length > 0) {
            const existingCategoryIndex = newSkills.findIndex(s => s.category === 'Tailored Skills');
            if (existingCategoryIndex >= 0) {
                // Append to existing
                newSkills[existingCategoryIndex] = {
                    ...newSkills[existingCategoryIndex],
                    items: [...new Set([...newSkills[existingCategoryIndex].items, ...missingHardSkills])]
                };
            } else {
                // Create new
                newSkills.push({
                    id: crypto.randomUUID(),
                    category: 'Tailored Skills',
                    items: missingHardSkills
                });
            }
        }

        // Update resume state
        dispatch({
            type: 'SET_RESUME',
            payload: {
                ...resume,
                summary: tailoredSummary,
                skills: newSkills
            }
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                        <Wand2 className="text-indigo-400" /> Tailor Resume to Job
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                    {!tailorResult ? (
                        <>
                            <p className="text-gray-400">
                                Paste the job description below. Gemini AI will analyze it and suggest improvements to your summary and identify missing skills.
                            </p>

                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-64 bg-[#1a1a1a] border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none placeholder-gray-600"
                                placeholder="Paste Job Description here..."
                            />

                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* AI Reasoning Section */}
                            <div className="bg-indigo-900/10 border border-indigo-500/30 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-indigo-900/20 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="text-indigo-400" size={20} />
                                        <span className="font-semibold text-indigo-300">Why these changes?</span>
                                    </div>
                                    {showReasoning ? <ChevronUp className="text-indigo-400" size={20} /> : <ChevronDown className="text-indigo-400" size={20} />}
                                </button>
                                {showReasoning && (
                                    <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                                        {tailorResult.reasoning}
                                    </div>
                                )}
                            </div>

                            {/* Tailored Summary */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    New Summary
                                </h3>
                                <div className="bg-[#1a1a1a] border border-green-800/50 rounded-lg p-4">
                                    <p className="text-gray-300 leading-relaxed">{tailorResult.tailoredSummary}</p>
                                </div>
                            </div>

                            {/* Missing Skills */}
                            {tailorResult.missingHardSkills.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        Skills to Add ({tailorResult.missingHardSkills.length})
                                    </h3>
                                    <div className="bg-[#1a1a1a] border border-green-800/50 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {tailorResult.missingHardSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-300 text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        disabled={isTailoring}
                    >
                        Cancel
                    </button>
                    {!tailorResult ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isTailoring || !jobDescription.trim()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        >
                            {isTailoring ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Wand2 size={18} /> Analyze & Tailor
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleApplyChanges}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                        >
                            <CheckCircle2 size={18} /> Apply Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
