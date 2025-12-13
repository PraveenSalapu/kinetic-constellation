
import { useState, useEffect, useCallback } from 'react';
import { Bot, BarChart3, Briefcase, FileText, CheckSquare, LayoutDashboard, Settings, User, AlertTriangle, X } from 'lucide-react';
import { EditorPanel } from './Editor/EditorPanel';
import { PreviewPanel } from './Preview/PreviewPanel';
import { AgentWorkspace } from './Agent/AgentWorkspace';
import { AnalyticsDashboard } from './Analytics/AnalyticsDashboard';
import { ApplicationTracker } from './Analytics/ApplicationTracker';
import { JobTable } from './Jobs/JobTable';
import { ProfilePage } from './Profile/ProfilePage';
import { useResume } from '../context/ResumeContext';
import { useAuth } from '../context/AuthContext';
import { SettingsModal } from './Settings/SettingsModal';
import { useSearchParams } from 'react-router-dom';
import { ProductTour } from './Onboarding/ProductTour';

type ViewMode = 'editor' | 'agents' | 'analytics' | 'tracker' | 'jobs' | 'profile';

// Warning Modal for leaving tailoring mode
const TailoringWarningModal = ({
    isOpen,
    onConfirm,
    onCancel,
}: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-full">
                        <AlertTriangle className="text-amber-500" size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">Discard Tailored Changes?</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            You have unsaved tailoring changes. If you leave, your changes will be discarded and your resume will revert to the original version.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                Stay
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Discard & Leave
                            </button>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Key for storing tour completion in localStorage
const TOUR_COMPLETED_KEY = 'careerflow_tour_completed';

export const Layout = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('profile'); // Default to Profile/Home
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { resume, dispatch } = useResume();
    const { credits, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Navigation warning state for tailoring mode
    const [showTailoringWarning, setShowTailoringWarning] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<ViewMode | null>(null);

    // Handle navigation with tailoring check
    const handleNavigation = useCallback((targetMode: ViewMode) => {
        // If we're in tailoring mode and trying to leave editor, show warning
        if (resume.isTailoring && viewMode === 'editor' && targetMode !== 'editor') {
            setPendingNavigation(targetMode);
            setShowTailoringWarning(true);
            return;
        }
        setViewMode(targetMode);
    }, [resume.isTailoring, viewMode]);

    // Confirm leaving tailoring mode
    const handleConfirmLeave = useCallback(() => {
        // Discard tailoring changes
        dispatch({ type: 'DISCARD_TAILORING' });
        setShowTailoringWarning(false);
        if (pendingNavigation) {
            setViewMode(pendingNavigation);
            setPendingNavigation(null);
        }
    }, [dispatch, pendingNavigation]);

    // Cancel leaving tailoring mode
    const handleCancelLeave = useCallback(() => {
        setShowTailoringWarning(false);
        setPendingNavigation(null);
    }, []);

    // Product tour state
    const [showTour, setShowTour] = useState(false);
    const [tourCompleted, setTourCompleted] = useState(() => {
        return localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    });

    // Check if we should show the tour (authenticated, has resume, hasn't completed tour)
    useEffect(() => {
        if (isAuthenticated && !tourCompleted && resume.personalInfo?.fullName) {
            // Small delay to let the UI settle
            const timer = setTimeout(() => setShowTour(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, tourCompleted, resume.personalInfo?.fullName]);

    const handleTourComplete = useCallback(() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setTourCompleted(true);
        setShowTour(false);
    }, []);

    const handleTourSkip = useCallback(() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setTourCompleted(true);
        setShowTour(false);
    }, []);

    // Check for tailor URL parameter from extension
    useEffect(() => {
        const tailorParam = searchParams.get('tailor');
        const jobDataParam = searchParams.get('jobData');

        if (tailorParam === 'true' && jobDataParam) {
            try {
                const jobData = JSON.parse(decodeURIComponent(jobDataParam));
                console.log('[CareerFlow] Received job data from extension:', jobData);

                // Set tailoring job in resume context - this will trigger TailorModal
                dispatch({
                    type: 'START_TAILORING',
                    payload: {
                        job: {
                            title: jobData.title || '',
                            company: jobData.company || '',
                            description: jobData.description || '',
                            link: jobData.link || '',
                        },
                    },
                });

                // Clear URL params
                setSearchParams({});
                setViewMode('editor');
            } catch (error) {
                console.error('[CareerFlow] Error parsing job data:', error);
            }
        }
    }, [searchParams, dispatch, setSearchParams]);

    // Only switch to editor once when tailoring STARTS or JOB CHANGES
    useEffect(() => {
        if (resume.isTailoring && viewMode !== 'editor') {
            setViewMode('editor');
        }
    }, [resume.isTailoring, resume.tailoringJob]); // Added tailoringJob to detect job switch

    // Defaulting to "Dark Mode" / Technical Theme to match HeroRoaster
    const isDarkMode = true;

    // Temporary user ID
    const userId = 'user123';

    const renderContent = () => {
        switch (viewMode) {
            case 'analytics':
                return <AnalyticsDashboard userId={userId} />;
            case 'tracker':
                return <ApplicationTracker userId={userId} />;
            case 'jobs':
                return <JobTable />;
            case 'profile':
                return <ProfilePage />;
            case 'agents':
                return (
                    <div className="flex h-full w-full">
                        <div className="w-1/2 h-full border-r border-gray-800">
                            <EditorPanel />
                        </div>
                        <div className="w-1/2 h-full">
                            <AgentWorkspace resumeContext={resume} />
                        </div>
                    </div>
                );
            default: // editor
                return (
                    <div className="flex h-full w-full">
                        {/* EDITOR PANEL (45%) */}
                        <div className="w-[45%] h-full border-r border-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                            <EditorPanel />
                        </div>
                        {/* PREVIEW PANEL (55%) */}
                        <div className="w-[55%] h-full bg-[#1e1e1e] flex justify-center items-start p-8 overflow-y-auto">
                            <PreviewPanel />
                        </div>
                    </div>
                );
        }
    };

    const NavItem = ({ mode, icon: Icon, label, tourId, comingSoon }: { mode: ViewMode, icon: any, label: string, tourId?: string, comingSoon?: boolean }) => (
        <div className="relative w-full">
            <button
                onClick={() => handleNavigation(mode)}
                data-tour={tourId}
                className={`w-full p-3 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 ${viewMode === mode
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                <Icon size={24} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
            </button>
            {comingSoon && (
                <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[7px] font-bold bg-amber-500 text-black rounded-full">
                    SOON
                </span>
            )}
        </div>
    );

    return (
        <div className={`flex h-screen w-full ${isDarkMode ? 'bg-[#0F0F0F] text-gray-200' : 'bg-gray-50 text-gray-900'} overflow-hidden font-sans`}>
            {/* TECHNICAL SIDEBAR */}
            <div data-tour="sidebar" className="w-20 flex-shrink-0 border-r border-gray-800 bg-[#111] flex flex-col items-center py-6 gap-6 z-50">
                <div className="mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        KC
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full px-2">
                    <NavItem mode="profile" icon={LayoutDashboard} label="Home" tourId="nav-home" />
                    <NavItem mode="editor" icon={FileText} label="Editor" tourId="nav-editor" />
                    <NavItem mode="jobs" icon={Briefcase} label="Jobs" tourId="nav-jobs" />
                    <NavItem mode="tracker" icon={CheckSquare} label="Track" tourId="nav-track" />
                    <NavItem mode="analytics" icon={BarChart3} label="Data" tourId="nav-analytics" />
                    <NavItem mode="agents" icon={Bot} label="AI Agent" comingSoon />
                </div>

                <div className="mt-auto flex flex-col gap-4">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                    {/* User Profile Button */}
                    <button
                        onClick={() => handleNavigation('profile')}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-200 ${viewMode === 'profile'
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white'
                            }`}
                        title="Profile"
                    >
                        <User size={16} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Bar (Optional, breadcrumbs or context) */}
                <header className="h-14 border-b border-gray-800 bg-[#111]/50 backdrop-blur-sm flex items-center px-6 justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <LayoutDashboard size={14} />
                        <span>/</span>
                        <span className="text-white font-medium capitalize">{viewMode}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Credit Badge */}
                        {credits !== null && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${credits < 30 ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                }`}>
                                <span className="text-sm font-bold">⚡ {credits}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-400 font-mono">SYSTEM ONLINE</span>
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <div className="flex-1 overflow-hidden relative bg-[#0F0F0F]">
                    {renderContent()}
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Product Tour for first-time users */}
            <ProductTour
                run={showTour}
                onComplete={handleTourComplete}
                onSkip={handleTourSkip}
                onNavigateToEditor={() => setViewMode('editor')}
            />

            {/* Warning modal when leaving tailoring mode */}
            <TailoringWarningModal
                isOpen={showTailoringWarning}
                onConfirm={handleConfirmLeave}
                onCancel={handleCancelLeave}
            />
        </div>
    );
};
