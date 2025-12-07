import { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { Layout, Type } from 'lucide-react';

export const PreviewPanel = () => {
    const { resume, dispatch } = useResume();
    const { selectedTemplate, pageSize } = resume;
    const [debouncedResume, setDebouncedResume] = useState(resume);

    // Debounce the resume update to prevent flickering/lag on every keystroke
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedResume(resume);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(handler);
        };
    }, [resume]);

    const templates = [
        { id: 'modern', name: 'Modern', icon: Layout },
        { id: 'classic', name: 'Classic', icon: Type },
    ] as const;

    const renderTemplate = () => {
        switch (selectedTemplate) {
            case 'classic':
                return <ClassicTemplate resume={debouncedResume} />;
            case 'minimalist':
                // Minimalist is currently broken, fallback to Modern for now or implement if fixed
                return <ModernTemplate resume={debouncedResume} />;
            case 'modern':
            default:
                return <ModernTemplate resume={debouncedResume} />;
        }
    };

    // Calculate width based on page size
    const pageWidth = pageSize === 'LETTER' ? '216mm' : '210mm';
    const pageHeight = pageSize === 'LETTER' ? '279mm' : '297mm';

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] border-l border-gray-800">
            {/* Template Selector Toolbar */}
            <div className="p-4 border-b border-gray-800 bg-[#111] shadow-sm z-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {/* Template Selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">Template:</span>
                        <div className="flex bg-[#1a1a1a] border border-gray-700 rounded-lg p-1">
                            {templates.map((t) => {
                                const Icon = t.icon;
                                const isActive = selectedTemplate === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => dispatch({ type: 'SET_TEMPLATE', payload: t.id })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${isActive
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {t.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex justify-center bg-[#1e1e1e]">
                <div className="relative">
                    {/* Page 1 */}
                    <div
                        className="bg-white origin-top transform scale-90 sm:scale-100 transition-transform duration-300 shadow-2xl"
                        style={{
                            width: pageWidth,
                            minHeight: pageHeight
                        }}
                    >
                        {renderTemplate()}
                    </div>

                    {/* Page Break Indicator */}
                    <div className="absolute left-0 right-0 transform scale-90 sm:scale-100 pointer-events-none" style={{ top: pageHeight }}>
                        <div className="flex items-center justify-center">
                            <div className="flex-1 border-t-2 border-dashed border-red-500/50"></div>
                            <span className="px-4 py-1.5 bg-red-900/80 backdrop-blur-sm text-red-200 text-xs font-bold rounded-full shadow-lg border border-red-500/50">
                                ⚠ PAGE 2 STARTS HERE
                            </span>
                            <div className="flex-1 border-t-2 border-dashed border-red-500/50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
