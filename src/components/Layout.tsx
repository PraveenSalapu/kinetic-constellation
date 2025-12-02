
import { EditorPanel } from './Editor/EditorPanel';
import { PreviewPanel } from './Preview/PreviewPanel';

export const Layout = () => {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            {/* Left Panel - Editor */}
            <div className="w-1/2 h-full border-r border-white/10 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <EditorPanel />
            </div>

            {/* Right Panel - Preview */}
            <div className="w-1/2 h-full bg-surface/50 overflow-y-auto p-8 flex justify-center items-start">
                <PreviewPanel />
            </div>
        </div>
    );
};
