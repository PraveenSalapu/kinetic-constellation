import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ReactNode } from 'react';

interface SortableSectionProps {
    id: string;
    children: ReactNode;
}

export const SortableSection = ({ id, children }: SortableSectionProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative">
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-6 p-2 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
                <GripVertical size={20} />
            </div>
            <div className="pl-8">
                {children}
            </div>
        </div>
    );
};
