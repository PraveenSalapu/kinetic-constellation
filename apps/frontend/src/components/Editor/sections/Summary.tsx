import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Sparkles, Loader2, Settings2, FileText } from 'lucide-react';
import { rewriteSummary } from '../../../services/gemini';
import { CollapsibleSection } from '../CollapsibleSection';

export const Summary = () => {
    const { resume, dispatch } = useResume();
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [customInstructions, setCustomInstructions] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'UPDATE_SUMMARY', payload: e.target.value });
    };

    const handleOptimize = async () => {
        setIsOptimizing(true);
        try {
            const result = await rewriteSummary(resume.summary, customInstructions || "Optimize the summary to be more impactful and professional.");

            if (result) {
                dispatch({ type: 'UPDATE_SUMMARY', payload: result });
            }
        } catch (error) {
            console.error("Summary optimization failed", error);
        } finally {
            setIsOptimizing(false);
            setShowInstructions(false);
        }
    };

    return (
        <CollapsibleSection
            title="Professional Summary"
            icon={<FileText className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-4 bg-[#111]">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className={`p-2 rounded-lg transition-all ${showInstructions
                                ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/50'
                                : 'text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/10'
                            }`}
                        title={showInstructions ? 'Hide Options' : 'Customize AI'}
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                    >
                        {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isOptimizing ? 'Optimizing...' : 'AI Rewrite'}
                    </button>
                </div>

                {showInstructions && (
                    <div className="p-4 bg-indigo-900/10 border border-indigo-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-medium text-indigo-300 mb-1">
                            Custom Instructions <span className="text-indigo-400/50 font-normal ml-1">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="E.g., Focus on leadership and cloud skills..."
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Summary</label>
                    <textarea
                        value={resume.summary}
                        onChange={handleChange}
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-3 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[160px] resize-y font-light leading-relaxed"
                        placeholder="Write a compelling professional summary that highlights your expertise, key skills, and career achievements..."
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
};
