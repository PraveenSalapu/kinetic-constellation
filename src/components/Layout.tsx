import { useState } from 'react';
import { Bot, BarChart3, Briefcase } from 'lucide-react';
import { EditorPanel } from './Editor/EditorPanel';
import { PreviewPanel } from './Preview/PreviewPanel';
import { AgentWorkspace } from './Agent/AgentWorkspace';
import { AnalyticsDashboard } from './Analytics/AnalyticsDashboard';
import { ApplicationTracker } from './Analytics/ApplicationTracker';
import { JobTable } from './Jobs/JobTable';
import { useResume } from '../context/ResumeContext';

type ViewMode = 'editor' | 'agents' | 'analytics' | 'tracker' | 'jobs';

export const Layout = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('editor');
    const { resume } = useResume();

    // Temporary user ID - in production, this would come from auth
    const userId = 'user123';

    const renderContent = () => {
        if (viewMode === 'analytics') {
            return (
                <div className="w-full h-full overflow-y-auto">
                    <AnalyticsDashboard userId={userId} />
                </div>
            );
        }

        if (viewMode === 'tracker') {
            return (
                <div className="w-full h-full overflow-y-auto bg-gray-50">
                    <ApplicationTracker userId={userId} />
                </div>
            );
        }

        if (viewMode === 'jobs') {
            return (
                <div className="w-full h-full overflow-y-auto bg-gray-50">
                    <JobTable />
                </div>
            );
        }

        const showAgentWorkspace = viewMode === 'agents';

        return (
            <>
                {/* Left Panel - Editor */}
                <div className={`${showAgentWorkspace ? 'w-1/3' : 'w-1/2'} h-full border-r border-white/10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all duration-300`}>
                    <EditorPanel />
                </div>

                {/* Middle Panel - Preview */}
                <div className={`${showAgentWorkspace ? 'w-1/3' : 'w-1/2'} h-full bg-surface/50 overflow-y-auto p-8 flex justify-center items-start transition-all duration-300`}>
                    <PreviewPanel />
                </div>

                {/* Right Panel - AI Agent Workspace */}
                {showAgentWorkspace && (
                    <div className="w-1/3 h-full border-l border-white/10">
                        <AgentWorkspace resumeContext={resume} />
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {renderContent()}

            {/* Navigation Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
                {/* Agent Toggle Button */}
                <button
                    onClick={() => setViewMode(viewMode === 'agents' ? 'editor' : 'agents')}
                    className={`p-4 ${viewMode === 'agents' ? 'bg-purple-700' : 'bg-purple-600'} text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2`}
                    title={viewMode === 'agents' ? 'Hide AI Agents' : 'Show AI Agents'}
                >
                    <Bot className="w-6 h-6" />
                    {viewMode !== 'agents' && <span className="text-sm font-semibold">AI Agents</span>}
                </button>

                {/* Analytics Toggle Button */}
                <button
                    onClick={() => setViewMode(viewMode === 'analytics' ? 'editor' : 'analytics')}
                    className={`p-4 ${viewMode === 'analytics' ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2`}
                    title={viewMode === 'analytics' ? 'Hide Analytics' : 'Show Analytics'}
                >
                    <BarChart3 className="w-6 h-6" />
                    {viewMode !== 'analytics' && <span className="text-sm font-semibold">Analytics</span>}
                </button>

                {/* Jobs Toggle Button */}
                <button
                    onClick={() => setViewMode(viewMode === 'jobs' ? 'editor' : 'jobs')}
                    className={`p-4 ${viewMode === 'jobs' ? 'bg-orange-700' : 'bg-orange-600'} text-white rounded-full shadow-lg hover:bg-orange-700 transition-all duration-200 flex items-center gap-2`}
                    title={viewMode === 'jobs' ? 'Hide Jobs' : 'Show Jobs'}
                >
                    <Briefcase className="w-6 h-6" />
                    {viewMode !== 'jobs' && <span className="text-sm font-semibold">Live Jobs</span>}
                </button>

                {/* Tracker Toggle Button */}
                <button
                    onClick={() => setViewMode(viewMode === 'tracker' ? 'editor' : 'tracker')}
                    className={`p-4 ${viewMode === 'tracker' ? 'bg-green-700' : 'bg-green-600'} text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 flex items-center gap-2`}
                    title={viewMode === 'tracker' ? 'Hide Tracker' : 'Show Tracker'}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {viewMode !== 'tracker' && <span className="text-sm font-semibold">Tracker</span>}
                </button>
            </div>
        </div>
    );
};
