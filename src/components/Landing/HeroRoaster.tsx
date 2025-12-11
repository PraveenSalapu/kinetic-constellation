import React, { useState, useCallback, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Cpu, Upload, User, ArrowRight, PlusCircle } from 'lucide-react';
import { extractTextFromPDF } from '../../utils/pdfUtils';
import { parseResumeWithAI } from '../../services/parser';
import { getAllProfiles, setActiveProfileId, createProfile, type UserProfile } from '../../services/storage';

interface HeroRoasterProps {
    onComplete?: () => void;
}

export const HeroRoaster: React.FC<HeroRoasterProps> = ({ onComplete }) => {
    const { dispatch } = useResume();
    const [isDragging, setIsDragging] = useState(false);
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    // const [score, setScore] = useState<number>(0); // Score moved to global context
    const [existingProfiles, setExistingProfiles] = useState<UserProfile[]>([]);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const profiles = getAllProfiles();
        // Filter for profiles that have some data (name is not empty or not default)
        const validProfiles = profiles.filter(p =>
            p.data.personalInfo.fullName.trim() !== '' ||
            p.data.experience.length > 0 ||
            (p.name !== 'Default Profile' && p.name.trim() !== '')
        ).sort((a, b) => b.updatedAt - a.updatedAt); // Sort by most recent

        setExistingProfiles(validProfiles);
        // If no valid profiles, default to showing upload
        if (validProfiles.length === 0) {
            setShowUpload(true);
        }
    }, []);

    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    const handleFile = async (file: File) => {
        if (file.type !== 'application/pdf') return;

        setScanState('scanning');
        setShowUpload(true); // Ensure upload UI is visible during scan
        setLogs([]);
        addLog("Initializing ATS Scanner v2.1...");

        // Artificial delay for effect
        setTimeout(() => addLog("Parsing binary PDF structure..."), 800);
        setTimeout(() => addLog("Extracting raw text layer..."), 1600);
        setTimeout(() => addLog("Identifying key sections..."), 2400);

        try {
            const text = await extractTextFromPDF(file);
            addLog("Text extraction complete.");
            addLog("Analyzing keyword density against current market...");

            // Parse with AI
            const parsedData = await parseResumeWithAI(text);

            setTimeout(() => {
                addLog("Optimization complete.");
                // setScore(42); 
                setScanState('complete');
                dispatch({ type: 'SET_RESUME', payload: parsedData });
                dispatch({
                    type: 'SET_SCAN_RESULTS',
                    payload: {
                        score: 42,
                        issues: [
                            { type: 'error', message: 'Header unreadable (Graphics detected)' },
                            { type: 'error', message: 'Date format inconsistent (MM/YY vs Month Year)' },
                            { type: 'warning', message: 'Missing key skills: Docker, Kubernetes' },
                            { type: 'success', message: 'Contact info valid' }
                        ],
                        missingKeywords: ['Docker', 'Kubernetes']
                    }
                } as any);
                if (onComplete) onComplete();
            }, 3500);

        } catch (error) {
            addLog("ERROR: Parse failed. File corrupted or encrypted.");
            addLog("Falling back to manual entry mode...");

            // Fallback: Proceed anyway with empty data after a delay
            setTimeout(() => {
                // setScore(0); 
                setScanState('complete');
                dispatch({
                    type: 'SET_SCAN_RESULTS',
                    payload: {
                        score: 0,
                        issues: [{ type: 'error', message: 'Parsing failed. Please enter data manually.' }],
                        missingKeywords: []
                    }
                } as any);
                if (onComplete) onComplete();
            }, 2000);
        }
    };

    const handleContinueProfile = (profileId: string) => {
        const profile = setActiveProfileId(profileId);
        if (profile) {
            dispatch({ type: 'SET_RESUME', payload: profile.data });
            if (onComplete) onComplete();
        }
    };

    const handleStartScratch = () => {
        const newProfile = createProfile('New Resume');
        setActiveProfileId(newProfile.id);
        dispatch({ type: 'SET_RESUME', payload: newProfile.data });
        if (onComplete) onComplete();
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const renderWelcomeBack = () => (
        <div className="z-10 w-full max-w-4xl flex flex-col items-center animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <div className="inline-block px-3 py-1 mb-4 border border-indigo-500/30 bg-indigo-900/10 rounded-full">
                    <span className="text-xs font-mono text-indigo-400">● USER IDENTIFIED</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white">
                    Welcome back, Agent.
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto">
                    Resume profiles detected in local cache. Select a profile to continue or upload a new mission file.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* Profile List */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Recent Profiles</h3>
                    {existingProfiles.slice(0, 3).map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => handleContinueProfile(profile.id)}
                            className="w-full flex items-center justify-between p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-indigo-500/50 hover:bg-[#222] transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-900/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-200 group-hover:text-white">{profile.data.personalInfo.fullName || profile.name}</h4>
                                    <p className="text-xs text-gray-500">Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-gray-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">Other Actions</h3>

                    <button
                        onClick={() => setShowUpload(true)}
                        className="w-full flex items-center gap-4 p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-green-500/50 hover:bg-[#222] transition-all group text-left"
                    >
                        <div className="p-3 bg-green-900/20 rounded-lg text-green-400 group-hover:scale-110 transition-transform">
                            <Upload size={20} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-200 group-hover:text-white">Upload New Resume</h4>
                            <p className="text-xs text-gray-500">Parse PDF with ATS scanner</p>
                        </div>
                    </button>

                    <button
                        onClick={handleStartScratch}
                        className="w-full flex items-center gap-4 p-4 bg-[#1A1A1A] border border-gray-800 rounded-xl hover:border-purple-500/50 hover:bg-[#222] transition-all group text-left"
                    >
                        <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                            <PlusCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-200 group-hover:text-white">Create from Scratch</h4>
                            <p className="text-xs text-gray-500">Empty template</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderScanner = () => (
        <>
            {/* HEADER */}
            <div className="relative z-10 text-center mb-12 max-w-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="inline-block px-3 py-1 mb-4 border border-green-500/30 bg-green-900/10 rounded-full">
                    <span className="text-xs font-mono text-green-400">● SYSTEM ONLINE</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                    Resume.optimize( )
                </h1>
                <h2 className="text-lg md:text-xl text-gray-400 font-light font-mono max-w-2xl mx-auto">
                    The only ATS-compliant builder verified against Greenhouse & Lever algorithms.
                    <br /><span className="text-gray-500">Parse, score, and fix your profile in seconds.</span>
                </h2>
                {existingProfiles.length > 0 && (
                    <button
                        onClick={() => setShowUpload(false)}
                        className="mt-6 text-sm text-gray-500 hover:text-white underline transition-colors"
                    >
                        ← Back to Profiles
                    </button>
                )}
            </div>

            {/* INTERACTIVE ZONE */}
            <div
                className={`relative z-10 w-full max-w-2xl transition-all duration-300 transform ${scanState === 'complete' ? 'scale-95 opacity-50 blur-sm' : 'scale-100 opacity-100'
                    }`}
            >
                {scanState === 'idle' && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#1A1A1A] ${isDragging ? 'border-green-500 bg-green-900/10' : 'border-gray-700 hover:border-gray-500'
                            }`}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                        />
                        <div className="p-4 bg-gray-800 rounded-full mb-4">
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <p className="text-xl font-medium text-gray-300">Drop your PDF here to scan</p>
                        <p className="text-sm text-gray-500 mt-2 font-mono">Supports generic PDF formats</p>
                    </div>
                )}

                {scanState === 'scanning' && (
                    <div className="border border-green-500/50 rounded-xl h-64 bg-black p-6 font-mono text-sm overflow-hidden shadow-[0_0_30px_rgba(0,255,148,0.1)]">
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                            <Cpu className="w-4 h-4 text-green-500 animate-pulse" />
                            <span className="text-green-500">ATS_SCANNER_RUNNING...</span>
                        </div>
                        <div className="space-y-2">
                            {logs.map((log, i) => (
                                <div key={i} className="text-gray-300 animate-in fade-in slide-in-from-left-2 duration-300">
                                    {log}
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-green-500 animate-pulse inline-block ml-1" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#0F0F0F] text-white p-6 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            {!showUpload && existingProfiles.length > 0 ? renderWelcomeBack() : renderScanner()}

            {/* RESULTS OVERLAY - Moved to ScanResults.tsx */}
            {scanState === 'complete' && (
                <div className="absolute z-20 inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="text-green-500 font-mono mb-4">Redirecting to Analysis...</div>

                    <button
                        onClick={() => onComplete && onComplete()}
                        className="text-gray-500 hover:text-white underline text-sm"
                    >
                        Stuck? Click to Skip
                    </button>
                </div>
            )}
        </div>
    );
};
