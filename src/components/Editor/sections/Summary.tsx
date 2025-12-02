import { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Sparkles, Loader2, Settings2 } from 'lucide-react';
import { rewriteSummary } from '../../../services/gemini';

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
        <div className="bg-white p-6 rounded-xl space-y-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Professional Summary</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showInstructions
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <Settings2 size={14} />
                        {showInstructions ? 'Hide Options' : 'Customize'}
                    </button>
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isOptimizing ? 'Optimizing...' : 'AI Rewrite'}
                    </button>
                </div>
            </div>

            {showInstructions && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Custom Instructions (Optional)
                    </label>
                    <input
                        type="text"
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="E.g., Focus on leadership and cloud skills..."
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
            )}

            <textarea
                value={resume.summary}
                onChange={handleChange}
                className="w-full h-40 p-4 text-sm leading-relaxed bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y text-gray-800 placeholder:text-gray-400"
                placeholder="Write a compelling summary..."
            />
        </div>
    );
};
