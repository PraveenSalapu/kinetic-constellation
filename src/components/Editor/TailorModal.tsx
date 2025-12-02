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

    // Update local state if prop changes
    useEffect(() => {
        if (initialJD) setJobDescription(initialJD);
    }, [initialJD]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Wand2 className="text-accent" /> Tailor Resume to Job
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {!tailorResult ? (
                        <>
                            <p className="text-slate-300">
                                Paste the job description below. Gemini AI will analyze it and suggest improvements to your summary and identify missing skills.
                            </p>

                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-accent focus:outline-none resize-none"
                                placeholder="Paste Job Description here..."
                            />

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* AI Reasoning Section */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-500/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="text-blue-400" size={20} />
                                        <span className="font-semibold text-blue-300">Why these changes?</span>
                                    </div>
                                    {showReasoning ? <ChevronUp className="text-blue-400" size={20} /> : <ChevronDown className="text-blue-400" size={20} />}
                                </button>
                                {showReasoning && (
                                    <div className="px-4 pb-4 text-slate-300 text-sm leading-relaxed">
                                        {tailorResult.reasoning}
                                    </div>
                                )}
                            </div>

                            {/* Tailored Summary */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-400" />
                                    New Summary
                                </h3>
                                <div className="bg-slate-950 border border-green-500/20 rounded-lg p-4">
                                    <p className="text-slate-200 leading-relaxed">{tailorResult.tailoredSummary}</p>
                                </div>
                            </div>

                            {/* Missing Skills */}
                            {tailorResult.missingHardSkills.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-400" />
                                        Skills to Add ({tailorResult.missingHardSkills.length})
                                    </h3>
                                    <div className="bg-slate-950 border border-green-500/20 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {tailorResult.missingHardSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-300 text-sm"
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

                <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                        disabled={isTailoring}
                    >
                        Cancel
                    </button>
                    {!tailorResult ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={isTailoring || !jobDescription.trim()}
                            className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 size={18} /> Apply Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
