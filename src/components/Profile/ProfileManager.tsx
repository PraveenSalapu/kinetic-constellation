import React, { useState, useEffect } from 'react';
import { getAllProfiles, createProfile, deleteProfile, setActiveProfileId } from '../../services/storage';
import type { UserProfile } from '../../services/storage';
import { parseResumeWithAI } from '../../services/parser';
import { useResume } from '../../context/ResumeContext';
import { Loader2, Plus, Trash2, Check, X, FileText, Upload, AlertCircle } from 'lucide-react';

interface ProfileManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ isOpen, onClose }) => {
    const { dispatch } = useResume();
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadProfiles();
        }
    }, [isOpen]);

    const loadProfiles = () => {
        setProfiles(getAllProfiles());
    };

    const handleSetActive = (id: string) => {
        const active = setActiveProfileId(id);
        if (active) {
            dispatch({ type: 'SET_RESUME', payload: active.data });
            loadProfiles();
            onClose();
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this profile?')) {
            try {
                deleteProfile(id);
                loadProfiles();
            } catch (e: any) {
                setError(e.message);
            }
        }
    };

    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) {
            setError('Please enter a profile name');
            return;
        }

        setIsParsing(true);
        setError(null);

        try {
            let initialData = undefined;
            if (resumeText.trim()) {
                initialData = await parseResumeWithAI(resumeText);
            }

            const newProfile = createProfile(newProfileName, initialData);

            // Automatically switch to the new profile
            setActiveProfileId(newProfile.id);
            dispatch({ type: 'SET_RESUME', payload: newProfile.data });

            loadProfiles();
            setShowAddForm(false);
            setNewProfileName('');
            setResumeText('');
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to create profile');
        } finally {
            setIsParsing(false);
        }
    };

    const handleReset = () => {
        if (confirm('WARNING: This will delete ALL profiles and reset the application to its initial state. This action cannot be undone. Are you sure?')) {
            import('../../services/storage').then(m => m.resetApplication());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div>
                        <h2 className="text-2xl font-bold">Manage Profiles</h2>
                        <p className="text-indigo-100 text-sm">Switch between different resume versions</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!showAddForm ? (
                        <div className="space-y-4">
                            <div className="grid gap-4">
                                {profiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${profile.isActive
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                            : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${profile.isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${profile.isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {profile.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {profile.isActive ? (
                                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                        <Check size={12} /> Active
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSetActive(profile.id)}
                                                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        Switch
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(profile.id)}
                                                    disabled={profiles.length <= 1}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {profiles.length < 4 && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 font-medium"
                                >
                                    <Plus size={20} />
                                    Create New Profile
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Profile</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name</label>
                                    <input
                                        type="text"
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        placeholder="e.g. Senior Frontend Dev, Product Manager"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Import from Resume (Optional)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="Paste your existing resume text here to auto-populate..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[150px] text-sm"
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
                                            {resumeText.length > 0 ? `${resumeText.length} chars` : 'Paste text'}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Upload size={12} />
                                        AI will parse this text into your new profile structure.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                        disabled={isParsing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateProfile}
                                        disabled={isParsing || !newProfileName.trim()}
                                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isParsing ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Parsing...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={18} />
                                                Create Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <button
                        onClick={handleReset}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
                    >
                        <Trash2 size={12} />
                        Reset Application & Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};
