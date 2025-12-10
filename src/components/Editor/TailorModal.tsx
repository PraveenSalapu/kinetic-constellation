import { useState, useEffect } from 'react';
import { X, Wand2, Loader2, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { tailorResume } from '../../services/gemini';
import type { TailorResponse } from '../../types';
import { getDatabase } from '../../services/database/mongodb';
import { v4 } from 'uuid';
import { useToast } from '../../context/ToastContext';
import ErrorBoundary from '../ErrorBoundary';
import { useActiveTab } from '../../hooks/useActiveTab';

interface TailorModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobDescription?: string;
}

export const TailorModal = ({ isOpen, onClose, jobDescription: initialJD = '' }: TailorModalProps) => {
    const { resume, dispatch } = useResume();
    const { addToast } = useToast();
    const { extractJobDescription, loading: loadingJob } = useActiveTab();
    const [jobDescription, setJobDescription] = useState(initialJD);
    const [isTailoring, setIsTailoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);
    const [showReasoning, setShowReasoning] = useState(true);
    const [selectedImprovements, setSelectedImprovements] = useState<{
        experience: { [key: string]: { revised: number[], recommended: number[] } },
        projects: number[]
    }>({ experience: {}, projects: [] });
    const [isSavingApp, setIsSavingApp] = useState(false);
    const [appSaved, setAppSaved] = useState(false);

    // ... (useEffect hooks remain unchanged) ...
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

    // Initialize selection state when results come in
    useEffect(() => {
        if (tailorResult) {
            const initialSelection: typeof selectedImprovements = { experience: {}, projects: [] };

            // Select all experience improvements by default
            tailorResult.improvedExperience?.forEach(exp => {
                initialSelection.experience[exp.experienceId] = {
                    revised: exp.revisedBullets?.map((_, i) => i) || [],
                    recommended: exp.recommendedBullets?.map((_, i) => i) || []
                };
            });

            // Select all projects by default
            initialSelection.projects = tailorResult.projectSuggestions?.map((_, i) => i) || [];

            setSelectedImprovements(initialSelection);
        }
    }, [tailorResult]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTailorResult(null);
            setError(null);
            setShowReasoning(true);
            setSelectedImprovements({ experience: {}, projects: [] });
        }
    }, [isOpen]);

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) return;

        setIsTailoring(true);
        setError(null);
        setTailorResult(null);

        try {
            // Keep IDs so the AI can map experience items back to their source
            // Filter out UI-only fields like isVisible and order
            const resumeContent = JSON.stringify(resume, (key, value) => {
                if (key === 'isVisible' || key === 'order') return undefined;
                return value;
            }, 2);

            const result = await tailorResume(resumeContent, jobDescription);
            setTailorResult(result);
            addToast('success', 'Resume analyzed successfully');
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Failed to tailor resume. Please try again.';
            setError(msg);
            addToast('error', msg);
        } finally {
            setIsTailoring(false);
        }
    };

    const toggleExperienceSelection = (expId: string, type: 'revised' | 'recommended', index: number) => {
        setSelectedImprovements(prev => {
            const current = prev.experience[expId] || { revised: [], recommended: [] };
            const list = current[type];
            const newList = list.includes(index)
                ? list.filter(i => i !== index)
                : [...list, index];

            return {
                ...prev,
                experience: {
                    ...prev.experience,
                    [expId]: { ...current, [type]: newList }
                }
            };
        });
    };

    const toggleProjectSelection = (index: number) => {
        setSelectedImprovements(prev => {
            const newList = prev.projects.includes(index)
                ? prev.projects.filter(i => i !== index)
                : [...prev.projects, index];
            return { ...prev, projects: newList };
        });
    };

    const handleTrackApplication = async () => {
        setIsSavingApp(true);
        try {
            const db = getDatabase();

            // Use AI-extracted details if available, otherwise fallback to defaults
            const company = tailorResult?.company || 'Target Company';
            const title = tailorResult?.jobTitle || 'Tailored Role';

            // Create application record
            await db.createApplication({
                id: v4(),
                userId: 'user123', // Matching Layout.tsx userId
                company,
                jobTitle: title,
                jobDescription: jobDescription,
                status: 'applied',
                appliedDate: new Date(),
                lastUpdated: new Date(),
                source: 'AI Tailor',
                timeline: [{ date: new Date(), status: 'applied', notes: 'Application created via AI Tailor' }],
                resumeSnapshot: resume,
                tags: ['Tailored', 'AI Generated'],
                notes: `Auto-tracked after AI tailoring for ${tailorResult?.jobTitle || 'job'}`
            });

            setAppSaved(true);
            addToast('success', 'Application tracked successfully');
        } catch (error) {
            console.error('Error saving application:', error);
            setError('Failed to save application');
            addToast('error', 'Failed to save application');
        } finally {
            setIsSavingApp(false);
        }
    };

    const handleApplyChanges = () => {
        if (!tailorResult) return;

        const { tailoredSummary, missingHardSkills, improvedExperience, projectSuggestions } = tailorResult;

        // 1. Update Skills
        let newSkills = [...resume.skills];
        if (missingHardSkills && missingHardSkills.length > 0) {
            missingHardSkills.forEach(skill => {
                // Find matching category (case-insensitive)
                const existingCategoryIndex = newSkills.findIndex(s =>
                    (s.category || '').toLowerCase().trim() === (skill.category || '').toLowerCase().trim()
                );

                if (existingCategoryIndex >= 0) {
                    // Add to existing category if not already present
                    if (!newSkills[existingCategoryIndex].items.includes(skill.name)) {
                        newSkills[existingCategoryIndex] = {
                            ...newSkills[existingCategoryIndex],
                            items: [...newSkills[existingCategoryIndex].items, skill.name]
                        };
                    }
                } else {
                    // Create new category
                    newSkills.push({
                        id: crypto.randomUUID(),
                        category: skill.category,
                        items: [skill.name]
                    });
                }
            });
        }

        // 2. Update Experience
        let newExperience = [...resume.experience];
        if (improvedExperience && Array.isArray(improvedExperience)) {
            improvedExperience.forEach(update => {
                const index = newExperience.findIndex(e => e.id === update.experienceId);
                if (index !== -1) {
                    let currentBullets = [...newExperience[index].description];
                    const selections = selectedImprovements.experience[update.experienceId];

                    // Apply revisions (if selected)
                    if (update.revisedBullets && selections?.revised) {
                        update.revisedBullets.forEach((revised, i) => {
                            if (selections.revised.includes(i)) {
                                // Robust Matching Logic
                                const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;]$/, '');
                                const target = normalize(revised.original);

                                let bulletIndex = currentBullets.findIndex(b => normalize(b) === target);

                                // Fallback: Fuzzy search
                                if (bulletIndex === -1) {
                                    bulletIndex = currentBullets.findIndex(b => {
                                        const normB = normalize(b);
                                        return normB.includes(target) || target.includes(normB) || (target.length > 10 && normB.startsWith(target.substring(0, 10)));
                                    });
                                }

                                if (bulletIndex !== -1) {
                                    currentBullets[bulletIndex] = revised.new;
                                } else {
                                    console.warn(`Could not find original bullet to replace: "${revised.original}"`);
                                }
                            }
                        });
                    }

                    // Append recommendations (if selected)
                    if (update.recommendedBullets && selections?.recommended) {
                        update.recommendedBullets.forEach((rec, i) => {
                            if (selections.recommended.includes(i)) {
                                currentBullets.push(rec.bullet);
                            }
                        });
                    }

                    newExperience[index] = {
                        ...newExperience[index],
                        description: currentBullets
                    };
                }
            });
        }

        // 3. Add Projects
        let newProjects = [...resume.projects];
        if (projectSuggestions && selectedImprovements.projects.length > 0) {
            selectedImprovements.projects.forEach(index => {
                const proj = projectSuggestions[index];
                newProjects.push({
                    id: crypto.randomUUID(),
                    name: proj.title,
                    description: proj.description,
                    technologies: proj.technologies,
                    bullets: [] // Ensure bullets array is always present, even if empty
                });
            });
        }

        // Update resume state
        try {
            dispatch({
                type: 'SET_RESUME',
                payload: {
                    ...resume,
                    summary: tailoredSummary,
                    skills: newSkills,
                    experience: newExperience,
                    projects: newProjects,
                    // CRITICAL: Preserve tailoring state so master resume stays unchanged
                    isTailoring: true,
                    originalResume: resume.originalResume,
                    tailoringJob: {
                        company: tailorResult.company || 'Unknown Company',
                        title: tailorResult.jobTitle || 'Unknown Position',
                        description: jobDescription,
                        link: '' // Could add a field for this later
                    }
                }
            });

            addToast('success', '✅ Changes applied! Your master resume stays unchanged.');
            onClose();
        } catch (error) {
            console.error('Error applying changes:', error);
            addToast('error', 'Failed to apply changes');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                        <Wand2 className="text-indigo-400" /> Tailor Resume to Job
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <ErrorBoundary>
                    <div className="p-6 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                        {!tailorResult ? (
                            <>
                                <p className="text-gray-400">
                                    Paste the job description below or import from the active tab.
                                </p>

                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={async () => {
                                            const data = await extractJobDescription();
                                            if (data) {
                                                const formatted = `Role: ${data.title}\nCompany: ${data.company}\nLink: ${data.link}\n\nJob Description:\n${data.description}`;
                                                setJobDescription(formatted);
                                                // Optional: Update resume context if needed, but local state is fine for analysis
                                            }
                                        }}
                                        disabled={loadingJob}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-900/40 text-indigo-300 rounded-lg hover:bg-indigo-900/60 transition-colors text-sm font-medium border border-indigo-500/30"
                                    >
                                        {loadingJob ? <Loader2 size={16} className="animate-spin" /> : <Briefcase size={16} />}
                                        Import from Active Tab
                                    </button>
                                </div>

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
                                                        className="px-4 py-2 bg-green-950/60 border border-green-500/50 rounded-full text-green-100 text-base font-medium flex items-center gap-2 shadow-sm transition-transform hover:scale-105 whitespace-nowrap"
                                                    >
                                                        {skill.name}
                                                        <span className="text-xs text-green-400 font-bold pl-2 border-l border-green-500/50 uppercase tracking-wider">{skill.category}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Experience Improvements */}
                                {tailorResult.improvedExperience && tailorResult.improvedExperience.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            Experience Improvements
                                        </h3>
                                        <div className="space-y-3">
                                            {tailorResult.improvedExperience.map((exp, idx) => (
                                                <div key={idx} className="bg-[#1a1a1a] border border-green-800/50 rounded-lg p-4">
                                                    {/* Revisions */}
                                                    {exp.revisedBullets && exp.revisedBullets.length > 0 && (
                                                        <div className="mb-3">
                                                            <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Revised Bullets</h4>
                                                            <div className="space-y-2">
                                                                {exp.revisedBullets.map((rev, rIdx) => (
                                                                    <div key={rIdx} className="flex items-start gap-3 text-sm group">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedImprovements.experience[exp.experienceId]?.revised.includes(rIdx) ?? false}
                                                                            onChange={() => toggleExperienceSelection(exp.experienceId, 'revised', rIdx)}
                                                                            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-red-400/70 line-through mb-1 text-xs">{rev.original}</div>
                                                                            <div className="text-green-300">{rev.new}</div>
                                                                            <div className="text-xs text-gray-500 mt-1 italic">Reason: {rev.reason}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Recommendations */}
                                                    {exp.recommendedBullets && exp.recommendedBullets.length > 0 && (
                                                        <div>
                                                            <h4 className="text-xs font-bold text-green-400 uppercase mb-2">New Bullet Suggestions</h4>
                                                            <div className="space-y-2">
                                                                {exp.recommendedBullets.map((rec, recIdx) => (
                                                                    <div key={recIdx} className="flex items-start gap-3 text-sm group">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedImprovements.experience[exp.experienceId]?.recommended.includes(recIdx) ?? false}
                                                                            onChange={() => toggleExperienceSelection(exp.experienceId, 'recommended', recIdx)}
                                                                            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-900"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="text-green-300 flex gap-2">
                                                                                <span>+</span>
                                                                                {rec.bullet}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1 italic ml-4">Reason: {rec.reason}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Project Suggestions */}
                                {tailorResult.projectSuggestions && tailorResult.projectSuggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <Lightbulb size={16} className="text-yellow-500" />
                                            Recommended Projects
                                        </h3>
                                        <div className="grid gap-3">
                                            {tailorResult.projectSuggestions.map((proj, idx) => (
                                                <div key={idx} className={`bg-[#1a1a1a] border rounded-lg p-4 transition-colors ${selectedImprovements.projects.includes(idx) ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-yellow-800/30'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedImprovements.projects.includes(idx)}
                                                            onChange={() => toggleProjectSelection(idx)}
                                                            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-gray-900"
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-yellow-200 mb-1">{proj.title}</h4>
                                                            <p className="text-sm text-gray-300 mb-2">{proj.description}</p>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {proj.technologies.map((tech, tIdx) => (
                                                                    <span key={tIdx} className="text-xs px-2 py-0.5 bg-yellow-900/20 text-yellow-400 rounded">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500 italic">Why: {proj.reason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ErrorBoundary>

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
                        <>
                            {!appSaved ? (
                                <button
                                    onClick={handleTrackApplication}
                                    disabled={isSavingApp}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                                >
                                    {isSavingApp ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Briefcase size={18} /> Track Application
                                        </>
                                    )}
                                </button>
                            ) : (
                                <span className="px-6 py-2 text-green-400 font-medium flex items-center gap-2 bg-green-900/20 rounded-lg border border-green-900/50">
                                    <CheckCircle2 size={18} /> Saved to Tracker
                                </span>
                            )}
                            <button
                                onClick={handleApplyChanges}
                                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(5,150,105,0.3)]"
                            >
                                <CheckCircle2 size={18} /> Apply Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
