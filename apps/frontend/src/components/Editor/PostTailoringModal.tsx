import { Wand2, Home, Briefcase } from 'lucide-react';

interface PostTailoringModalProps {
    isOpen: boolean;
    onTailorAnother: () => void;
    onGoHome: () => void;
    onViewJobs: () => void;
}

export const PostTailoringModal = ({
    isOpen,
    onTailorAnother,
    onGoHome,
    onViewJobs
}: PostTailoringModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#111] border border-gray-800 rounded-xl w-full max-w-2xl shadow-2xl">
                <div className="p-6 border-b border-gray-800 text-center">
                    <h2 className="text-2xl font-semibold text-gray-200 mb-2">
                        ✅ All Set!
                    </h2>
                    <p className="text-gray-400">
                        Your PDF has been downloaded and your master resume is safe. What would you like to do next?
                    </p>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tailor Another */}
                    <button
                        onClick={onTailorAnother}
                        className="group bg-[#1a1a1a] border border-indigo-700/50 hover:border-indigo-500 hover:bg-indigo-900/20 rounded-lg p-6 transition-all text-left hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-indigo-900/30 rounded-full group-hover:bg-indigo-600/30 transition-colors">
                                <Wand2 size={32} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-1">Tailor Another Job</h3>
                                <p className="text-sm text-gray-400">
                                    Analyze and tailor for a different position
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Go Home */}
                    <button
                        onClick={onGoHome}
                        className="group bg-[#1a1a1a] border border-green-700/50 hover:border-green-500 hover:bg-green-900/20 rounded-lg p-6 transition-all text-left hover:shadow-[0_0_20px_rgba(5,150,105,0.3)]"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-green-900/30 rounded-full group-hover:bg-green-600/30 transition-colors">
                                <Home size={32} className="text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-1">Go to Home</h3>
                                <p className="text-sm text-gray-400">
                                    Return to editor with master resume
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* View Jobs */}
                    <button
                        onClick={onViewJobs}
                        className="group bg-[#1a1a1a] border border-purple-700/50 hover:border-purple-500 hover:bg-purple-900/20 rounded-lg p-6 transition-all text-left hover:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <div className="p-3 bg-purple-900/30 rounded-full group-hover:bg-purple-600/30 transition-colors">
                                <Briefcase size={32} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-1">View Jobs Tracker</h3>
                                <p className="text-sm text-gray-400">
                                    See all tracked applications
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-b-xl text-center text-xs text-gray-500">
                    Your temporary tailoring profile will be discarded
                </div>
            </div>
        </div>
    );
};
