import { useState, ReactNode } from 'react';
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
        <div className="card">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-background/50 transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        {icon}
                    </div>
                    <h3 className="text-base font-semibold text-text">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUp size={20} className="text-text-secondary" />
                ) : (
                    <ChevronDown size={20} className="text-text-secondary" />
                )}
            </button>
            {isOpen && (
                <div className="border-t border-border">
                    {children}
                </div>
            )}
        </div>
    );
};
