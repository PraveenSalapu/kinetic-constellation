import { useResume } from '../../context/ResumeContext';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { Layout, Type, Minus, FileText } from 'lucide-react';

export const PreviewPanel = () => {
    const { resume, dispatch } = useResume();
    const { selectedTemplate, selectedFont, pageSize } = resume;

    const templates = [
        { id: 'modern', name: 'Modern', icon: Layout },
        { id: 'classic', name: 'Classic', icon: Type },
        { id: 'minimalist', name: 'Minimalist', icon: Minus },
    ] as const;

    const fonts = [
        { id: 'professional', name: 'Professional', family: 'Times New Roman' },
        { id: 'modern', name: 'Modern', family: 'Inter' },
        { id: 'technical', name: 'Technical', family: 'Consolas' },
    ] as const;

    const pageSizes = [
        { id: 'A4', name: 'A4', desc: '210×297mm' },
        { id: 'LETTER', name: 'Letter', desc: '8.5×11"' },
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
        <div className="h-full flex flex-col bg-background border-l border-border">
            {/* Template & Font Selector Toolbar */}
            <div className="p-4 border-b border-border bg-surface shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {/* Template Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary">Template:</span>
                        <div className="flex bg-background border border-border rounded-lg p-1">
                            {templates.map((t) => {
                                const Icon = t.icon;
                                const isActive = selectedTemplate === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => dispatch({ type: 'SET_TEMPLATE', payload: t.id })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-text-secondary hover:text-text hover:bg-surface'
                                        }`}
                                    >
                                        <Icon size={14} />
                                        {t.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Font Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary">Font:</span>
                        <div className="flex bg-background border border-border rounded-lg p-1">
                            {fonts.map((f) => {
                                const isActive = (selectedFont || 'professional') === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        onClick={() => dispatch({ type: 'SET_FONT', payload: f.id })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-text-secondary hover:text-text hover:bg-surface'
                                        }`}
                                        style={{ fontFamily: f.family }}
                                    >
                                        <FileText size={14} />
                                        {f.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Page Size Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary">Size:</span>
                        <div className="flex bg-background border border-border rounded-lg p-1">
                            {pageSizes.map((ps) => {
                                const isActive = (pageSize || 'A4') === ps.id;
                                return (
                                    <button
                                        key={ps.id}
                                        onClick={() => dispatch({ type: 'SET_PAGE_SIZE', payload: ps.id })}
                                        className={`flex flex-col items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            isActive
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-text-secondary hover:text-text hover:bg-surface'
                                        }`}
                                    >
                                        <span>{ps.name}</span>
                                        <span className="text-xs opacity-75">{ps.desc}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center bg-background">
                <div className="relative">
                    {/* Page 1 */}
                    <div className="w-[210mm] min-h-[297mm] bg-white origin-top transform scale-90 sm:scale-100 transition-transform duration-300" style={{ boxShadow: 'var(--shadow-xl)' }}>
                        {renderTemplate()}
                    </div>

                    {/* Page Break Indicator - positioned at exactly 297mm */}
                    <div className="absolute left-0 right-0 transform scale-90 sm:scale-100" style={{ top: '297mm' }}>
                        <div className="flex items-center justify-center">
                            <div className="flex-1 border-t-2 border-dashed border-red-500"></div>
                            <span className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                ⚠ PAGE 2 STARTS HERE - REDUCE CONTENT
                            </span>
                            <div className="flex-1 border-t-2 border-dashed border-red-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
