import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { calculateATSScore, tailorResume } from '../../services/gemini';
import { Target, AlertCircle, RefreshCw, Wand2, Loader2, Lightbulb, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { MatchScoreResponse, TailorResponse } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface UnifiedAnalysisState {
    scoreData: MatchScoreResponse | null;
    tailorData: TailorResponse | null;
}

export const ATSScore = () => {
    const { resume, dispatch } = useResume();
    const [jobDescription, setJobDescription] = useState('');
    const [analysisState, setAnalysisState] = useState<UnifiedAnalysisState>({
        scoreData: null,
        tailorData: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showReasoning, setShowReasoning] = useState(true);
    const [activeView, setActiveView] = useState<'input' | 'results' | 'success'>('input');
    const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
    const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
    const [isApplying, setIsApplying] = useState(false);

    const handleMasterAudit = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        setError(null);

        try {
            // Remove ID and other non-content fields
            const resumeContent = JSON.stringify(resume, (key, value) => {
                if (key === 'id' || key === 'isVisible' || key === 'order') return undefined;
                return value;
            }, 2);

            // Run both analyses in parallel
            const [scoreResult, tailorResult] = await Promise.all([
                calculateATSScore(resume, jobDescription),
                tailorResume(resumeContent, jobDescription)
            ]);

            // Validate we got valid responses
            if (!scoreResult || !tailorResult) {
                throw new Error("Failed to get complete analysis from AI");
            }

            setAnalysisState({
                scoreData: scoreResult,
                tailorData: tailorResult
            });

            // Pre-select all recommendations and projects by default
            const initialRecs = new Set<string>();
            if (tailorResult.improvedExperience) {
                tailorResult.improvedExperience.forEach(exp => {
                    exp.recommendedBullets.forEach((_, idx) => {
                        initialRecs.add(`${exp.experienceId}-rec-${idx}`);
                    });
                });
            }
            setSelectedRecommendations(initialRecs);

            const initialProjects = new Set<number>();
            if (tailorResult.projectSuggestions) {
                tailorResult.projectSuggestions.forEach((_, idx) => initialProjects.add(idx));
            }
            setSelectedProjects(initialProjects);

            setActiveView('results');
        } catch (err) {
            console.error('Master Audit Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyChanges = async () => {
        if (!analysisState.tailorData) return;
        setIsApplying(true);

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const { tailoredSummary, missingHardSkills, improvedExperience, projectSuggestions } = analysisState.tailorData;

            // Update summary
            dispatch({
                type: 'UPDATE_SUMMARY',
                payload: tailoredSummary
            });

            // Update skills
            if (missingHardSkills && missingHardSkills.length > 0) {
                const existingTailoredSkills = resume.skills.find(s => s.category === 'Tailored Skills');

                if (existingTailoredSkills) {
                    dispatch({
                        type: 'UPDATE_ITEM',
                        payload: {
                            sectionId: 'skills',
                            itemId: existingTailoredSkills.id,
                            item: {
                                category: 'Tailored Skills',
                                items: [...new Set([...existingTailoredSkills.items, ...missingHardSkills])]
                            }
                        }
                    });
                } else {
                    dispatch({
                        type: 'ADD_ITEM',
                        payload: {
                            sectionId: 'skills',
                            item: {
                                id: uuidv4(),
                                category: 'Tailored Skills',
                                items: missingHardSkills
                            }
                        }
                    });
                }
            }

            // Update experience bullet points
            if (improvedExperience && improvedExperience.length > 0) {
                improvedExperience.forEach(({ experienceId, revisedBullets, recommendedBullets }) => {
                    const existingExperience = resume.experience.find(e => e.id === experienceId);
                    if (!existingExperience) return;

                    let newBullets = [...existingExperience.description];

                    // Apply revisions (Robust Matching)
                    revisedBullets.forEach(revision => {
                        // Normalize strings for comparison (trim, lowercase, remove extra spaces)
                        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
                        const target = normalize(revision.original);

                        const index = newBullets.findIndex(b => normalize(b) === target);
                        if (index !== -1) {
                            newBullets[index] = revision.new;
                        } else {
                            // Fallback: Try fuzzy match or just look for substring
                            const fuzzyIndex = newBullets.findIndex(b => normalize(b).includes(target) || target.includes(normalize(b)));
                            if (fuzzyIndex !== -1) {
                                newBullets[fuzzyIndex] = revision.new;
                            }
                        }
                    });

                    // Add recommendations (only selected ones)
                    recommendedBullets.forEach((rec, idx) => {
                        if (selectedRecommendations.has(`${experienceId}-rec-${idx}`)) {
                            newBullets.push(rec.bullet);
                        }
                    });

                    dispatch({
                        type: 'UPDATE_ITEM',
                        payload: {
                            sectionId: 'experience',
                            itemId: experienceId,
                            item: {
                                description: newBullets
                            }
                        }
                    });
                });
            }

            // Add Selected Projects
            if (projectSuggestions && projectSuggestions.length > 0) {
                projectSuggestions.forEach((proj, idx) => {
                    if (selectedProjects.has(idx)) {
                        dispatch({
                            type: 'ADD_ITEM',
                            payload: {
                                sectionId: 'projects',
                                item: {
                                    id: uuidv4(),
                                    name: proj.title,
                                    description: proj.description,
                                    technologies: proj.technologies,
                                    link: '',
                                    isVisible: true
                                }
                            }
                        });
                    }
                });
            }

            // Show Success View
            setActiveView('success');
        } catch (err) {
            console.error('Apply Changes Error:', err);
            setError('Failed to apply changes. Please try again.');
        } finally {
            setIsApplying(false);
        }
    };

    const handleReset = () => {
        setActiveView('input');
        setAnalysisState({ scoreData: null, tailorData: null });
        setSelectedRecommendations(new Set());
        setSelectedProjects(new Set());
        setJobDescription('');
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <div className="bg-white p-6 rounded-xl space-y-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-900">
                    <Target className="text-indigo-600" size={24} />
                    <h2 className="text-xl font-bold">Resume Health Report</h2>
                </div>
                {activeView === 'results' && (
                    <button
                        onClick={handleReset}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                        <RefreshCw size={16} /> New Analysis
                    </button>
                )}
            </div>

            {activeView === 'success' ? (
                <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="text-green-600" size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Improvements Applied!</h3>
                        <p className="text-gray-600 mt-1">Your resume has been updated with the selected changes.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Start New Audit
                    </button>
                </div>
            ) : activeView === 'input' ? (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Get a comprehensive analysis: ATS compatibility score + tailored improvements for this specific job.
                    </p>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full h-32 p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-gray-800 placeholder:text-gray-400"
                        placeholder="Paste Job Description here..."
                    />
                    <button
                        onClick={handleMasterAudit}
                        disabled={loading || !jobDescription.trim()}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Analyzing Resume...
                            </>
                        ) : (
                            <>
                                <Target size={18} /> Run Master Audit
                            </>
                        )}
                    </button>
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* ATS Score Section */}
                    {analysisState.scoreData && (
                        <div className="space-y-4">
                            <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(analysisState.scoreData.score)}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">ATS Match Score</h3>
                                    <div className={`text-4xl font-bold ${getScoreColor(analysisState.scoreData.score)}`}>
                                        {analysisState.scoreData.score}%
                                    </div>
                                </div>

                                {/* Critical Feedback */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <AlertCircle size={16} className="text-gray-600" />
                                        Critical Feedback
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {analysisState.scoreData.criticalFeedback}
                                    </p>
                                </div>

                                {/* Missing Keywords */}
                                {analysisState.scoreData.missingKeywords.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                            Missing Keywords ({analysisState.scoreData.missingKeywords.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisState.scoreData.missingKeywords.map((keyword, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                                                >
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tailoring Recommendations */}
                    {analysisState.tailorData && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Wand2 className="text-indigo-600" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">Recommended Improvements</h3>
                            </div>

                            {/* AI Reasoning */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="text-blue-600" size={18} />
                                        <span className="font-semibold text-blue-900 text-sm">Why these changes?</span>
                                    </div>
                                    {showReasoning ? <ChevronUp className="text-blue-600" size={18} /> : <ChevronDown className="text-blue-600" size={18} />}
                                </button>
                                {showReasoning && (
                                    <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed">
                                        {analysisState.tailorData.reasoning}
                                    </div>
                                )}
                            </div>

                            {/* Tailored Summary */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                    Optimized Summary
                                </h4>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {analysisState.tailorData.tailoredSummary}
                                    </p>
                                </div>
                            </div>

                            {/* Missing Skills */}
                            {analysisState.tailorData.missingHardSkills.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        Skills to Add ({analysisState.tailorData.missingHardSkills.length})
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {analysisState.tailorData.missingHardSkills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-green-800 text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Improved Experience Bullets */}
                            {analysisState.tailorData.improvedExperience && analysisState.tailorData.improvedExperience.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-600" />
                                        Experience Improvements
                                    </h4>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                                        {analysisState.tailorData.improvedExperience.map((exp, idx) => {
                                            const experienceItem = resume.experience.find(e => e.id === exp.experienceId);
                                            return (
                                                <div key={idx} className="space-y-3">
                                                    <h5 className="font-semibold text-gray-800 text-sm border-b border-green-200 pb-1">
                                                        {experienceItem?.position || 'Experience'} @ {experienceItem?.company || 'Company'}
                                                    </h5>

                                                    {/* Revised Bullets */}
                                                    {exp.revisedBullets.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Revised Bullets</p>
                                                            <ul className="space-y-2 text-sm text-gray-700">
                                                                {exp.revisedBullets.map((rev, revIdx) => (
                                                                    <li key={revIdx} className="bg-white p-2 rounded border border-green-100">
                                                                        <div className="text-red-400 line-through text-xs mb-1">{rev.original}</div>
                                                                        <div className="flex gap-2">
                                                                            <span className="text-green-600 mt-0.5">•</span>
                                                                            <span>{rev.new}</span>
                                                                        </div>
                                                                        <div className="text-xs text-green-600 mt-1 italic">Why: {rev.reason}</div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Recommended Bullets */}
                                                    {exp.recommendedBullets.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Recommended Additions</p>
                                                            <div className="space-y-2">
                                                                {exp.recommendedBullets.map((rec, recIdx) => {
                                                                    const recId = `${exp.experienceId}-rec-${recIdx}`;
                                                                    const isSelected = selectedRecommendations.has(recId);
                                                                    return (
                                                                        <div key={recIdx}
                                                                            className={`p-2 rounded border transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}
                                                                            onClick={() => {
                                                                                const newSet = new Set(selectedRecommendations);
                                                                                if (newSet.has(recId)) {
                                                                                    newSet.delete(recId);
                                                                                } else {
                                                                                    newSet.add(recId);
                                                                                }
                                                                                setSelectedRecommendations(newSet);
                                                                            }}
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                                                                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="text-sm text-gray-800 font-medium">{rec.bullet}</div>
                                                                                    <div className="text-xs text-blue-600 mt-1 italic">Why: {rec.reason}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Project Suggestions */}
                            {analysisState.tailorData.projectSuggestions && analysisState.tailorData.projectSuggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-purple-600" />
                                        Project Suggestions
                                    </h4>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                                        {analysisState.tailorData.projectSuggestions.map((project, idx) => {
                                            const isSelected = selectedProjects.has(idx);
                                            return (
                                                <div key={idx}
                                                    className={`p-4 rounded-lg border shadow-sm transition-all cursor-pointer ${isSelected ? 'bg-white border-purple-400 ring-1 ring-purple-400' : 'bg-white border-purple-100 hover:border-purple-300'}`}
                                                    onClick={() => {
                                                        const newSet = new Set(selectedProjects);
                                                        if (newSet.has(idx)) {
                                                            newSet.delete(idx);
                                                        } else {
                                                            newSet.add(idx);
                                                        }
                                                        setSelectedProjects(newSet);
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'}`}>
                                                            {isSelected && <CheckCircle2 size={14} className="text-white" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-bold text-gray-900 text-sm mb-1">{project.title}</h5>
                                                            <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {project.technologies.map((tech, tIdx) => (
                                                                    <span key={tIdx} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-purple-600 italic">Why: {project.reason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Apply Button */}
                            <button
                                onClick={handleApplyChanges}
                                disabled={isApplying}
                                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> Applying Changes...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} /> Apply Selected Improvements
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
