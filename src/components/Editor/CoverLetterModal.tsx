import { useState, useEffect } from 'react';
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

    // Auto-fill JD from tailoring context if available
    useEffect(() => {
        if (isOpen && resume.tailoringJob) {
            const { title, company, description, link } = resume.tailoringJob;
            const composedDescription = `Role: ${title}\nCompany: ${company}\nLink: ${link || 'N/A'}\n\nJob Description:\n${description || ''}`;
            setJobDescription(composedDescription.trim());
        }
    }, [isOpen, resume.tailoringJob]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        const jdToUse = resume.tailoringJob ?
            `Role: ${resume.tailoringJob.title}\nCompany: ${resume.tailoringJob.company}\nDescription: ${resume.tailoringJob.description || jobDescription}`
            : jobDescription;

        if (!jdToUse.trim()) return;
        setLoading(true);
        try {
            const letter = await generateCoverLetter(resume, jdToUse);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#111] border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
                            <PenTool className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-200">Cover Letter Generator</h2>
                            <p className="text-sm text-gray-400">AI-crafted cover letters tailored to the job.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    {!generatedLetter ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Job Description</label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="input-field w-full h-64 resize-none bg-[#1a1a1a] border-gray-700 text-gray-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-600"
                                    placeholder="Paste the full job description here..."
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !jobDescription.trim()}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(79,70,229,0.3)]"
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
                                <h3 className="text-sm font-medium text-gray-300">Generated Letter</h3>
                                <button
                                    onClick={() => setGeneratedLetter('')}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                                >
                                    Create New
                                </button>
                            </div>
                            <div className="flex-1 bg-[#1a1a1a] border border-gray-800 text-gray-300 p-6 rounded-lg shadow-inner overflow-y-auto whitespace-pre-wrap font-serif text-sm leading-relaxed custom-scrollbar">
                                {generatedLetter}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {generatedLetter && (
                    <div className="p-4 border-t border-gray-800 bg-[#111] rounded-b-2xl flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleCopy}
                            className="px-4 py-2 bg-gray-200 hover:bg-white text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
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
