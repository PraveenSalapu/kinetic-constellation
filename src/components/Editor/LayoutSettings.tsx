import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown, RotateCcw, Maximize } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';

export const LayoutSettings = () => {
    const { resume, dispatch } = useResume();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Default values if layout is missing or legacy
    const defaultLayout = {
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 5,
        margin: { top: 15, right: 15, bottom: 15, left: 15 }
    };

    const layout = resume.layout && typeof resume.layout.fontSize === 'number'
        ? resume.layout
        : defaultLayout;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const updateLayout = (updates: Partial<typeof layout> | Partial<typeof layout.margin>) => {
        // Check if we are updating margins specifically
        if ('top' in updates || 'right' in updates || 'bottom' in updates || 'left' in updates) {
            dispatch({
                type: 'APPLY_LAYOUT',
                payload: {
                    ...layout,
                    margin: {
                        ...layout.margin,
                        ...updates
                    }
                }
            });
        } else {
            dispatch({
                type: 'APPLY_LAYOUT',
                payload: {
                    ...layout,
                    ...updates
                }
            });
        }
    };

    const handleAutoFit = () => {
        dispatch({
            type: 'APPLY_LAYOUT',
            payload: {
                fontSize: 9,
                lineHeight: 1.2,
                sectionSpacing: 3,
                margin: { top: 10, right: 10, bottom: 10, left: 10 }
            }
        });
    };

    const handleReset = () => {
        dispatch({
            type: 'APPLY_LAYOUT',
            payload: defaultLayout
        });
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-lg transition-all flex items-center gap-1 ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="Layout Settings"
            >
                <Settings size={20} />
                <span className="text-sm font-medium hidden md:inline">Layout</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-4">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">PDF Layout Settings</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Typography Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Typography</h4>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-700">Body Font Size</label>
                                    <span className="text-xs text-gray-500">{layout.fontSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="14"
                                    step="0.5"
                                    value={layout.fontSize}
                                    onChange={(e) => updateLayout({ fontSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-700">Name Size</label>
                                    <span className="text-xs text-gray-500">{layout.nameSize || (layout.fontSize + 10)}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="12"
                                    max="32"
                                    step="1"
                                    value={layout.nameSize || (layout.fontSize + 10)}
                                    onChange={(e) => updateLayout({ nameSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-700">Contact Info Size</label>
                                    <span className="text-xs text-gray-500">{layout.contactSize || (layout.fontSize * 0.9)}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="7"
                                    max="12"
                                    step="0.5"
                                    value={layout.contactSize || (layout.fontSize * 0.9)}
                                    onChange={(e) => updateLayout({ contactSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-700">Line Height</label>
                                    <span className="text-xs text-gray-500">{layout.lineHeight}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.1"
                                    value={layout.lineHeight}
                                    onChange={(e) => updateLayout({ lineHeight: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        {/* Spacing Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Spacing</h4>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-700">Section Gap</label>
                                    <span className="text-xs text-gray-500">{layout.sectionSpacing}mm</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="15"
                                    step="0.5"
                                    value={layout.sectionSpacing}
                                    onChange={(e) => updateLayout({ sectionSpacing: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>
                        </div>

                        {/* Margins Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Page Margins (mm)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Top</label>
                                    <input
                                        type="number"
                                        value={layout.margin.top}
                                        onChange={(e) => updateLayout({ top: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Bottom</label>
                                    <input
                                        type="number"
                                        value={layout.margin.bottom}
                                        onChange={(e) => updateLayout({ bottom: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Left</label>
                                    <input
                                        type="number"
                                        value={layout.margin.left}
                                        onChange={(e) => updateLayout({ left: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Right</label>
                                    <input
                                        type="number"
                                        value={layout.margin.right}
                                        onChange={(e) => updateLayout({ right: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                            <button
                                onClick={handleAutoFit}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Maximize size={16} />
                                Auto Fit to 1 Page
                            </button>
                            <button
                                onClick={handleReset}
                                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} />
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
