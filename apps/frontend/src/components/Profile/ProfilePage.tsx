import { useState } from 'react';
import { User, FileText, Settings, LogOut } from 'lucide-react';
import { ProfileManager } from './ProfileManager';
import { DemographicsForm } from '../Onboarding/DemographicsForm';
import { useResume } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import { resetApplication } from '../../services/storage';

export const ProfilePage = () => {
    const { resume, dispatch } = useResume();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'resumes' | 'info' | 'settings'>('resumes');

    const handleDemographicsSubmit = (data: any) => {
        dispatch({ type: 'UPDATE_DEMOGRAPHICS', payload: data });
        alert('Profile information updated successfully.');
    };

    const handleReset = () => {
        if (confirm('WARNING: This will delete ALL profiles, jobs, and settings. This action cannot be undone. Are you sure?')) {
            resetApplication();
            window.location.reload();
        }
    };

    return (
        <div className="h-full w-full bg-[#0F0F0F] text-white flex flex-col items-center p-8 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                            KC
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Agent Profile</h1>
                            <p className="text-gray-400">Manage your identity, resumes, and system preferences.</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/10 text-red-500 hover:bg-red-900/20 transition-colors border border-red-900/20"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('resumes')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'resumes'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                            }`}
                    >
                        <FileText size={18} />
                        My Resumes
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'info'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                            }`}
                    >
                        <User size={18} />
                        Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'settings'
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                            }`}
                    >
                        <Settings size={18} />
                        Settings
                    </button>
                </div>

                {/* Content */}
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-8 min-h-[500px]">
                    {activeTab === 'resumes' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-xl font-bold mb-6">Resume Management</h2>
                            {/* Reusing ProfileManager but passing isOpen=true constantly inside this container 
                                 Wait, ProfileManager is a modal. I should wrap it or modify it. 
                                 Actually, it's easier to just invoke the modal from here or copy the logic.
                                 Refactoring ProfileManager to be a non-modal component is cleaner.
                                 For now, let's just make a simple list view here similar to ProfileManager's inner content.
                                 Or, even better, I can just render ProfileManager WITHOUT the modal wrapper if I refactor it.
                                 
                                 Let's actually just USE the ProfileManager as a "Modal Invoker" or create a new "ResumeList" component.
                                 Given the time, I'll basically implement a simplified version of ProfileManager here directly.
                             */}
                            <ProfileManager isOpen={true} onClose={() => { }} isEmbedded={true} />
                            {/* 
                                Wait, ProfileManager has a fixed position overlay. That won't work embedded.
                                I need to fix ProfileManager or create a new component.
                                Let's quickly create a "ProfileList" component by stripping the modal parts from ProfileManager
                                OR I can just modify ProfileManager to accept a prop "embed" which disables the modal overlay.
                             */}
                        </div>
                    )}

                    {activeTab === 'info' && (
                        <div className="animate-in fade-in duration-300 max-w-2xl">
                            <h2 className="text-xl font-bold mb-6">Demographics & Security</h2>
                            <DemographicsForm
                                initialData={resume.demographics || {}}
                                onSubmit={handleDemographicsSubmit}
                                submitLabel="Update Profile"
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-in fade-in duration-300 max-w-xl">
                            <h2 className="text-xl font-bold mb-6">System Settings</h2>

                            <div className="space-y-6">
                                <div className="p-4 border border-gray-700 rounded-lg bg-[#111]">
                                    <h3 className="font-bold text-red-400 mb-2">Danger Zone</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Resetting the application will clear all local data, including profiles and settings.
                                    </p>
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Reset Application Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
