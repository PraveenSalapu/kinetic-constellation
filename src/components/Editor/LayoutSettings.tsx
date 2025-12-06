import { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown, RotateCcw } from 'lucide-react';
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
        nameSize: 20,
        contactSize: 9,
        margin: { top: 15, right: 15, bottom: 15, left: 15 },
        fontFamily: 'Inter' // Default
    };

    const layout = resume.layout && typeof resume.layout.fontSize === 'number'
        ? { ...defaultLayout, ...resume.layout }
        : defaultLayout;

    const availableFonts = [
        { label: 'Times New Roman (Serif)', value: 'Times-Roman' },
        { label: 'Arial (Sans)', value: 'Helvetica' },
        { label: 'Courier (Mono)', value: 'Courier' },
        { label: 'Inter (Modern)', value: 'Inter' }
    ];

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
                className={`p-2 rounded-lg transition-all flex items-center gap-1 ${isOpen ? 'bg-indigo-900/20 text-indigo-400' : 'text-gray-400 hover:text-indigo-400 hover:bg-indigo-900/20'}`}
                title="Layout Settings"
            >
                <Settings size={20} />
                <span className="text-sm font-medium hidden md:inline">Layout</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-700 z-50 p-4 text-gray-300">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                        <h3 className="font-semibold text-white">PDF Layout Settings</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Font Selection */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Font Family</h4>
                            <select
                                value={layout.fontFamily || 'Times-Roman'}
                                onChange={(e) => updateLayout({ fontFamily: e.target.value })}
                                className="w-full bg-gray-800 border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                            >
                                {availableFonts.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Typography Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Typography</h4>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-400">Body Font Size</label>
                                    <span className="text-xs text-gray-500">{layout.fontSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="8"
                                    max="14"
                                    step="0.5"
                                    value={layout.fontSize}
                                    onChange={(e) => updateLayout({ fontSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-400">Name Size</label>
                                    <span className="text-xs text-gray-500">{layout.nameSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="12"
                                    max="32"
                                    step="1"
                                    value={layout.nameSize}
                                    onChange={(e) => updateLayout({ nameSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-400">Contact Info Size</label>
                                    <span className="text-xs text-gray-500">{layout.contactSize}pt</span>
                                </div>
                                <input
                                    type="range"
                                    min="7"
                                    max="12"
                                    step="0.5"
                                    value={layout.contactSize}
                                    onChange={(e) => updateLayout({ contactSize: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-400">Line Height</label>
                                    <span className="text-xs text-gray-500">{layout.lineHeight}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1.0"
                                    max="2.0"
                                    step="0.1"
                                    value={layout.lineHeight}
                                    onChange={(e) => updateLayout({ lineHeight: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Spacing Section */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Spacing</h4>

                            <div className="mb-4">
                                <div className="flex justify-between mb-1">
                                    <label className="text-sm text-gray-400">Section Gap</label>
                                    <span className="text-xs text-gray-500">{layout.sectionSpacing}mm</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="15"
                                    step="0.5"
                                    value={layout.sectionSpacing}
                                    onChange={(e) => updateLayout({ sectionSpacing: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
                                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Bottom</label>
                                    <input
                                        type="number"
                                        value={layout.margin.bottom}
                                        onChange={(e) => updateLayout({ bottom: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Left</label>
                                    <input
                                        type="number"
                                        value={layout.margin.left}
                                        onChange={(e) => updateLayout({ left: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Right</label>
                                    <input
                                        type="number"
                                        value={layout.margin.right}
                                        onChange={(e) => updateLayout({ right: parseFloat(e.target.value) })}
                                        className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-700 text-white rounded focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-gray-700 flex flex-col gap-2">
                            <button
                                onClick={handleReset}
                                className="w-full py-2 bg-gray-800 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
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