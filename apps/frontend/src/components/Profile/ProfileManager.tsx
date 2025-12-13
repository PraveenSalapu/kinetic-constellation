import React, { useState, useEffect } from 'react';
import { getAllProfiles, createProfile, deleteProfile, setActiveProfileId } from '../../services/storage';
import type { UserProfile } from '../../services/storage';
import { parseResumeWithAI } from '../../services/parser';
import { useResume } from '../../context/ResumeContext';
import { Loader2, Plus, Trash2, Check, X, FileText, Upload, AlertCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface ProfileManagerProps {
    isOpen: boolean;
    onClose: () => void;
    isEmbedded?: boolean;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ isOpen, onClose, isEmbedded = false }) => {
    const { dispatch } = useResume();
    const { isAuthenticated } = useAuth(); // Use proper auth context
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
    }, [isOpen, isAuthenticated]); // Reload when auth state changes

    const loadProfiles = async () => {
        try {
            // Load profiles from API (DB-only storage) - pass userId for scoped caching
            const user = (await import('../../services/supabase')).supabase.auth.getUser();
            const userId = (await user).data.user?.id;
            const profiles = await getAllProfiles(userId);
            setProfiles(profiles);
        } catch (e) {
            console.error('Error loading profiles:', e);
            setError('Failed to load profiles');
        }
    };

    const handleSetActive = async (id: string) => {
        // If using API, we should update the active status on the server
        if (isAuthenticated) {
            try {
                await import('../../services/api').then(m => m.updateProfile(id, { isActive: true }));

                const updated = profiles.map(p => ({
                    ...p,
                    isActive: p.id === id
                }));
                // Manually update local state to reflect change immediately
                setProfiles(updated);

                const active = updated.find(p => p.isActive);
                if (active) {
                    dispatch({ type: 'SET_RESUME', payload: active.data });
                    if (!isEmbedded) onClose();
                }
                return;
            } catch (e) {
                console.error('Failed to set active profile on API:', e);
            }
        }

        const active = await setActiveProfileId(id);
        if (active) {
            dispatch({ type: 'SET_RESUME', payload: active.data });
            await loadProfiles();
            if (!isEmbedded) onClose();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this profile?')) {
            try {
                if (isAuthenticated) {
                    await import('../../services/api').then(m => m.deleteProfile(id));
                    await loadProfiles();
                    return;
                }

                await deleteProfile(id);
                await loadProfiles();
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
            const initialData = resumeText.trim() ? await parseResumeWithAI(resumeText) : undefined;

            // Create via API if authenticated
            if (isAuthenticated) {
                try {
                    await import('../../services/api').then(m => m.createProfile(newProfileName, initialData || {}));
                    await loadProfiles();
                    setShowAddForm(false);
                    setNewProfileName('');
                    setResumeText('');
                    if (!isEmbedded) onClose();
                    return;
                } catch (e: any) {
                    console.error('Failed to create profile via API:', e);
                    setError(e.message || 'Failed to create profile on server');
                    return;
                }
            }

            const newProfile = await createProfile(newProfileName, initialData);

            // Automatically switch to the new profile
            await setActiveProfileId(newProfile.id);
            dispatch({ type: 'SET_RESUME', payload: newProfile.data });

            await loadProfiles();
            setShowAddForm(false);
            setNewProfileName('');
            setResumeText('');
            if (!isEmbedded) onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to create profile');
        } finally {
            setIsParsing(false);
        }
    };

    if (!isOpen) return null;

    const content = (
        <div className={`flex flex-col ${isEmbedded ? 'w-full h-full' : 'bg-[#111] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden'}`}>
            {!isEmbedded && (
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black text-white">
                    <div>
                        <h2 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-2">
                            <span className="text-green-500">●</span> Manage Profiles
                        </h2>
                        <p className="text-gray-400 text-sm font-light">Switch between different resume versions</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className={`overflow-y-auto flex-1 ${isEmbedded ? '' : 'p-6 bg-[#111]'}`}>
                {error && (
                    <div className="mb-4 p-4 bg-red-900/20 text-red-400 rounded-lg flex items-center gap-2 border border-red-800">
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
                                    className={`p-4 rounded-xl border transition-all ${profile.isActive
                                        ? 'border-green-500/50 bg-green-900/10 shadow-[0_0_15px_rgba(0,255,100,0.1)]'
                                        : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-600'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${profile.isActive ? 'bg-green-900/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold font-mono ${profile.isActive ? 'text-green-400' : 'text-gray-300'}`}>
                                                    {profile.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {profile.isActive ? (
                                                <span className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold flex items-center gap-1 font-mono">
                                                    <Check size={12} /> Active
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSetActive(profile.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
                                                >
                                                    Switch
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(profile.id)}
                                                disabled={profiles.length <= 1}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
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
                                className="w-full py-4 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-green-500/50 hover:text-green-400 hover:bg-green-900/10 transition-all flex items-center justify-center gap-2 font-medium font-mono"
                            >
                                <Plus size={20} />
                                CREATE_NEW_PROFILE
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-lg font-bold text-white mb-4 font-mono">:: Create New Profile</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Profile Name</label>
                                <input
                                    type="text"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    placeholder="e.g. Senior Frontend Dev, Product Manager"
                                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-white placeholder-gray-600"
                                    autoFocus
                                />
                            </div>

                            {/* Import Method Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Import Method</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setResumeText('')} // Clear text implies intended "file" mode visual or just use logic
                                        // Actually let's use a local state for mode if we want tabs, but for simplicity:
                                        // We'll show File Upload OR Text Paste.
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        setError('File size must be less than 5MB');
                                                        return;
                                                    }

                                                    setIsParsing(true);
                                                    setError(null);

                                                    try {
                                                        const reader = new FileReader();
                                                        reader.onload = async () => {
                                                            const base64 = (reader.result as string).split(',')[1];
                                                            try {
                                                                // Dynamically import parsing logic to avoid bundle issues
                                                                const { parseResumeFromPdf } = await import('../../services/parser');
                                                                const parsedData = await parseResumeFromPdf(base64);

                                                                // Auto-create
                                                                if (localStorage.getItem('accessToken')) {
                                                                    await import('../../services/api').then(m => m.createProfile(newProfileName || 'New Uploaded Profile', parsedData));
                                                                } else {
                                                                    const newProfile = await createProfile(newProfileName || 'New Uploaded Profile', parsedData);
                                                                    await setActiveProfileId(newProfile.id);
                                                                }

                                                                await loadProfiles();
                                                                setShowAddForm(false);
                                                                if (!isEmbedded) onClose();
                                                            } catch (err: any) {
                                                                setError(err.message || 'Failed to parse PDF');
                                                            } finally {
                                                                setIsParsing(false);
                                                            }
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } catch (err) {
                                                        setIsParsing(false);
                                                        setError('Failed to read file');
                                                    }
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isParsing}
                                        />
                                        <div className="w-full p-4 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:border-green-500/50 group-hover:text-green-400 transition-colors bg-[#1a1a1a]">
                                            <Upload size={20} />
                                            <span className="text-sm font-medium">Upload PDF</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            // Start Blank Logic
                                            handleCreateProfile(); // Calling create with empty text creates blank
                                        }}
                                        disabled={isParsing || !newProfileName.trim()}
                                        className="w-full p-4 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-colors bg-[#1a1a1a]"
                                    >
                                        <FileText size={20} />
                                        <span className="text-sm font-medium">Start Blank</span>
                                    </button>
                                </div>

                                <div className="text-center text-gray-600 text-xs my-2">- OR -</div>

                                <div className="relative">
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Paste your existing resume text here..."
                                        className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all min-h-[100px] text-sm text-gray-300 placeholder-gray-600 font-mono"
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-600 pointer-events-none">
                                        {resumeText.length > 0 ? `${resumeText.length} chars` : 'Paste text'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2 text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                                    disabled={isParsing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateProfile}
                                    disabled={isParsing || !newProfileName.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600/30 hover:border-green-500 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,255,100,0.1)]"
                                >
                                    {isParsing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Parsing...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            {resumeText.trim() ? 'Create from Text' : 'Create Profile'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }
            </div >

            {!isEmbedded && (
                <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-center">
                    <button
                        onClick={() => {
                            if (confirm('WARNING: This will delete ALL profiles and reset the application to its initial state. This action cannot be undone. Are you sure?')) {
                                import('../../services/storage').then(m => m.resetApplication());
                            }
                        }}
                        className="text-xs text-red-900/50 hover:text-red-400 hover:underline flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={12} />
                        Reset Application & Clear All Data
                    </button>
                </div>
            )}
        </div >
    );

    if (isEmbedded) return content;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-gray-200">
            {content}
        </div>
    );
};

