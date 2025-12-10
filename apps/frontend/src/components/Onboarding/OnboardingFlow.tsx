import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { parseResumeWithAI } from '../../services/parser';
import { tailorResume } from '../../services/gemini';
import { ArrowRight, FileText, Loader2, Target, Wand2, Sparkles, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface OnboardingFlowProps {
    onComplete: () => void;
}

type Step = 'resume-input' | 'parsing' | 'job-input' | 'tailoring' | 'complete';

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
    const { resume, dispatch } = useResume();
    const [step, setStep] = useState<Step>('resume-input');
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleParseResume = async () => {
        if (!resumeText.trim()) return;
        setStep('parsing');
        setError(null);

        try {
            const parsedResume = await parseResumeWithAI(resumeText);
            dispatch({ type: 'SET_RESUME', payload: parsedResume });
            setStep('job-input');
        } catch (err) {
            console.error('Parsing Error:', err);
            setError('Failed to parse resume. Please try again or check your internet connection.');
            setStep('resume-input');
        }
    };

    const handleTailorResume = async () => {
        if (!jobDescription.trim()) {
            // If no JD provided, just finish
            onComplete();
            return;
        }
        setStep('tailoring');
        setError(null);

        try {
            // Convert the current resume state to JSON string for the AI
            const resumeContent = JSON.stringify(resume, (key, value) => {
                if (key === 'id' || key === 'isVisible' || key === 'order') return undefined;
                return value;
            }, 2);

            const { tailoredSummary, missingHardSkills } = await tailorResume(resumeContent, jobDescription);

            // Update resume with tailored content
            dispatch({ type: 'UPDATE_SUMMARY', payload: tailoredSummary });

            if (missingHardSkills.length > 0) {
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

            onComplete();
        } catch (err) {
            console.error('Tailoring Error:', err);
            setError('Failed to tailor resume. You can try again or skip this step.');
            setStep('job-input');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYtMTJIM36TM2IDEzNGgxMnYtMTJIMzZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
                    <div className="relative">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <Sparkles className="text-yellow-300" size={24} />
                            </div>
                            <h1 className="text-3xl font-bold text-white">Resume AI Wizard</h1>
                        </div>
                        <p className="text-indigo-100 text-lg">Build a tailored, ATS-optimized resume in seconds</p>

                        {/* Progress Indicator */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className={`h-2 w-16 rounded-full transition-all ${step === 'resume-input' || step === 'parsing' ? 'bg-yellow-300' : 'bg-white/30'}`}></div>
                            <div className={`h-2 w-16 rounded-full transition-all ${step === 'job-input' || step === 'tailoring' ? 'bg-yellow-300' : 'bg-white/30'}`}></div>
                            <div className={`h-2 w-16 rounded-full transition-all ${step === 'complete' ? 'bg-yellow-300' : 'bg-white/30'}`}></div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'resume-input' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <FileText size={32} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Step 1: Your Resume</h2>
                                    <p className="text-gray-600 mt-2">Paste your current resume text below. Our AI will analyze and extract key information.</p>
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={resumeText}
                                    onChange={(e) => setResumeText(e.target.value)}
                                    className="w-full h-72 p-5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-all shadow-sm"
                                    placeholder="Paste your resume content here...

Example format:
John Doe
john@email.com | (555) 123-4567

Professional Summary
Experienced software engineer with 5+ years...

Experience
Senior Developer at Tech Corp (2020-Present)
- Led team of 5 engineers...
- Increased performance by 40%...
"
                                />
                                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                                    {resumeText.length} characters
                                </div>
                            </div>
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleParseResume}
                                    disabled={!resumeText.trim()}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analyze Resume <ArrowRight size={20} />
                                </button>
                                <button
                                    onClick={onComplete}
                                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                                >
                                    Skip to Editor
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'parsing' && (
                        <div className="py-12 text-center space-y-4">
                            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto" />
                            <h2 className="text-xl font-semibold text-slate-800">Analyzing your resume...</h2>
                            <p className="text-slate-500">Extracting skills, experience, and education</p>
                        </div>
                    )}

                    {step === 'job-input' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                                    <Target size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800">Step 2: Target Job</h2>
                                <p className="text-slate-600">Paste the job description to tailor your resume (optional).</p>
                            </div>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                                placeholder="Paste job description here..."
                            />
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => onComplete()}
                                    className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
                                >
                                    Skip Tailoring
                                </button>
                                <button
                                    onClick={handleTailorResume}
                                    disabled={!jobDescription.trim()}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Wand2 size={20} /> Tailor & Finish
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'tailoring' && (
                        <div className="py-12 text-center space-y-4">
                            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto" />
                            <h2 className="text-xl font-semibold text-slate-800">Tailoring your resume...</h2>
                            <p className="text-slate-500">Optimizing summary and identifying key skills</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
