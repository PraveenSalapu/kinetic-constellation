
import { useState, useEffect } from 'react';
import { Bot, BarChart3, Briefcase, FileText, CheckSquare, LayoutDashboard, Settings, User } from 'lucide-react';
import { EditorPanel } from './Editor/EditorPanel';
import { PreviewPanel } from './Preview/PreviewPanel';
import { AgentWorkspace } from './Agent/AgentWorkspace';
import { AnalyticsDashboard } from './Analytics/AnalyticsDashboard';
import { ApplicationTracker } from './Analytics/ApplicationTracker';
import { JobTable } from './Jobs/JobTable';
import { ProfilePage } from './Profile/ProfilePage';
import { useResume } from '../context/ResumeContext';
import { SettingsModal } from './Settings/SettingsModal';
import { useSearchParams } from 'react-router-dom';

type ViewMode = 'editor' | 'agents' | 'analytics' | 'tracker' | 'jobs' | 'profile';

export const Layout = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('editor');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { resume, dispatch } = useResume();
    const [searchParams, setSearchParams] = useSearchParams();

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

    // Only switch to editor once when tailoring STARTS
    useEffect(() => {
        if (resume.isTailoring && viewMode !== 'editor') {
            setViewMode('editor');
        }
    }, [resume.isTailoring]); // Removed viewMode from deps to avoid constant locking

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

    const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
        <button
            onClick={() => setViewMode(mode)}
            className={`w-full p-3 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 ${viewMode === mode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={24} />
            <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </button>
    );

    return (
        <div className={`flex h-screen w-full ${isDarkMode ? 'bg-[#0F0F0F] text-gray-200' : 'bg-gray-50 text-gray-900'} overflow-hidden font-sans`}>
            {/* TECHNICAL SIDEBAR */}
            <div className="w-20 flex-shrink-0 border-r border-gray-800 bg-[#111] flex flex-col items-center py-6 gap-6 z-50">
                <div className="mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        KC
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full px-2">
                    <NavItem mode="editor" icon={FileText} label="Editor" />
                    <NavItem mode="jobs" icon={Briefcase} label="Jobs" />
                    <NavItem mode="tracker" icon={CheckSquare} label="Track" />
                    <NavItem mode="analytics" icon={BarChart3} label="Data" />
                    <NavItem mode="agents" icon={Bot} label="AI Agent" />
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
                        onClick={() => setViewMode('profile')}
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
        </div>
    );
};
