import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { generateCoverLetter } from '../../services/gemini';
import { X, FileText, Copy, Check, Loader2, PenTool } from 'lucide-react';

interface CoverLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CoverLetterModal = ({ isOpen, onClose }: CoverLetterModalProps) => {
    const { resume } = useResume();
    const [jobDescription, setJobDescription] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!jobDescription.trim()) return;
        setLoading(true);
        try {
            const letter = await generateCoverLetter(resume, jobDescription);
            setGeneratedLetter(letter);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <PenTool className="text-accent" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Cover Letter Generator</h2>
                            <p className="text-sm text-slate-400">AI-crafted cover letters tailored to the job.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {!generatedLetter ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Job Description</label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="input-field w-full h-64 resize-none"
                                    placeholder="Paste the full job description here..."
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !jobDescription.trim()}
                                className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Crafting your letter...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileText size={20} />
                                        <span>Generate Cover Letter</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-slate-300">Generated Letter</h3>
                                <button
                                    onClick={() => setGeneratedLetter('')}
                                    className="text-xs text-accent hover:underline"
                                >
                                    Create New
                                </button>
                            </div>
                            <div className="flex-1 bg-white text-slate-800 p-6 rounded-lg shadow-inner overflow-y-auto whitespace-pre-wrap font-serif text-sm leading-relaxed">
                                {generatedLetter}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {generatedLetter && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
