import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection = ({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-sm transition-all hover:border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-900/20 rounded-lg text-indigo-400">
                        {icon}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200 tracking-wide">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUp size={16} className="text-gray-500" />
                ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="border-t border-gray-800">
                    {children}
                </div>
            )}
        </div>
    );
};
