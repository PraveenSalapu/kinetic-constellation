import React from 'react';
import { X, Trash2, Info, Github, Moon } from 'lucide-react';
import { resetApplication } from '../../services/storage';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleReset = () => {
        if (confirm('WARNING: This will delete ALL profiles, jobs, and settings. This action cannot be undone. Are you sure?')) {
            resetApplication();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#161616]">
                    <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                        <span className="text-indigo-500">●</span> Settings
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Theme (Mock) */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Appearance</h3>
                        <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-gray-800 opacity-50 cursor-not-allowed">
                            <div className="flex items-center gap-3">
                                <Moon size={18} className="text-indigo-400" />
                                <div>
                                    <p className="text-sm font-medium text-gray-200">Dark Mode</p>
                                    <p className="text-xs text-gray-500">Theme is currently locked</p>
                                </div>
                            </div>
                            <div className="w-8 h-4 bg-indigo-900 rounded-full relative">
                                <div className="absolute right-0 top-[-2px] w-5 h-5 bg-indigo-500 rounded-full border-2 border-[#1a1a1a]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Data Management</h3>
                        <button
                            onClick={handleReset}
                            className="w-full flex items-center justify-between p-3 bg-red-900/10 hover:bg-red-900/20 border border-red-900/30 hover:border-red-800 rounded-lg transition-all group text-left"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} className="text-red-400" />
                                <div>
                                    <p className="text-sm font-medium text-red-200 group-hover:text-red-100">Reset Application</p>
                                    <p className="text-xs text-red-400/60">Clear local storage & profiles</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">About</h3>
                        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-gray-800 text-center">
                            <h4 className="font-bold text-white mb-1">Kinetic Constellation</h4>
                            <p className="text-xs text-gray-500 mb-3">v0.1.0-alpha</p>
                            <div className="flex justify-center gap-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Github size={18} />
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <Info size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
