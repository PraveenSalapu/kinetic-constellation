import { useResume } from '../../context/ResumeContext';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { Layout, Type, Minus } from 'lucide-react';

export const PreviewPanel = () => {
    const { resume, dispatch } = useResume();
    const { selectedTemplate } = resume;

    const templates = [
        { id: 'modern', name: 'Modern', icon: Layout },
        { id: 'classic', name: 'Classic', icon: Type },
        { id: 'minimalist', name: 'Minimalist', icon: Minus },
    ] as const;

    const renderTemplate = () => {
        switch (selectedTemplate) {
            case 'classic':
                return <ClassicTemplate />;
            case 'minimalist':
                return <MinimalistTemplate />;
            case 'modern':
            default:
                return <ModernTemplate />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900/50 border-l border-slate-800">
            {/* Template Selector Toolbar */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-center gap-4 bg-slate-900">
                <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Template:</span>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    {templates.map((t) => {
                        const Icon = t.icon;
                        const isActive = selectedTemplate === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => dispatch({ type: 'SET_TEMPLATE', payload: t.id })}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                                    }`}
                            >
                                <Icon size={14} />
                                {t.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center bg-slate-900/50">
                <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl origin-top transform scale-90 sm:scale-100 transition-transform duration-300">
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
};
