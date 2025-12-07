import { useState } from 'react';
import { X, Briefcase, Loader2 } from 'lucide-react';

interface TrackApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTrack: () => Promise<void>;
    jobTitle?: string;
    company?: string;
}

export const TrackApplicationModal = ({
    isOpen,
    onClose,
    onTrack,
    jobTitle = 'Unknown Position',
    company = 'Unknown Company'
}: TrackApplicationModalProps) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleTrack = async () => {
        console.log('Track button clicked!');
        setIsSaving(true);
        try {
            await onTrack();
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                        <Briefcase className="text-purple-400" size={24} />
                        Track Application?
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={isSaving}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-gray-400">
                        Save this tailored resume to your jobs tracker?
                    </p>

                    <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-1">Position</div>
                        <div className="text-lg font-semibold text-purple-200">{jobTitle}</div>
                        <div className="text-sm text-gray-400 mt-2">Company</div>
                        <div className="text-base text-gray-200">{company}</div>
                    </div>

                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 text-blue-300 text-sm">
                        💡 This will save your tailored resume snapshot for future reference
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleTrack}
                        disabled={isSaving}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Briefcase size={18} />
                                Yes, Track
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
