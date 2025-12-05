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
            icon={<FileText className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className={`btn-icon ${showInstructions ? 'bg-surface border-primary text-primary' : ''}`}
                        title={showInstructions ? 'Hide Options' : 'Customize'}
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="btn-primary btn-sm flex items-center gap-2"
                    >
                        {isOptimizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {isOptimizing ? 'Optimizing...' : 'AI Rewrite'}
                    </button>
                </div>

                {showInstructions && (
                    <div className="p-4 bg-primary-light border border-primary/20 rounded-lg animate-fade-in">
                        <label className="label-field">
                            Custom Instructions <span className="label-optional">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="E.g., Focus on leadership and cloud skills..."
                            className="input-field"
                        />
                    </div>
                )}

                <div>
                    <label className="label-field">Summary</label>
                    <textarea
                        value={resume.summary}
                        onChange={handleChange}
                        className="textarea-field min-h-[160px]"
                        placeholder="Write a compelling professional summary that highlights your expertise, key skills, and career achievements..."
                    />
                </div>
            </div>
        </CollapsibleSection>
    );
};
