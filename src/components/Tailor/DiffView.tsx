import { Check, X } from 'lucide-react';
import { useState } from 'react';

interface Change {
    field: string;
    original: string;
    tailored: string;
    reason?: string;
}

interface DiffViewProps {
    changes: Change[];
    onAccept: (fieldIndex: number) => void;
    onReject: (fieldIndex: number) => void;
    onAcceptAll: () => void;
    onRejectAll: () => void;
}

/**
 * Side-by-side diff view for comparing original vs tailored content
 * Shows changes with accept/reject options
 */
export const DiffView = ({ changes, onAccept, onReject, onAcceptAll, onRejectAll }: DiffViewProps) => {
    const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());

    const toggleExpanded = (index: number) => {
        const newExpanded = new Set(expandedIndexes);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedIndexes(newExpanded);
    };

    if (changes.length === 0) {
        return (
            <div className="text-center py-8 text-text-secondary">
                No changes to review
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with bulk actions */}
            <div className="flex justify-between items-center pb-3 border-b border-border">
                <h3 className="text-lg font-semibold text-text">
                    Review Changes ({changes.length})
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={onRejectAll}
                        className="btn-secondary btn-sm flex items-center gap-1"
                    >
                        <X size={14} />
                        Reject All
                    </button>
                    <button
                        onClick={onAcceptAll}
                        className="btn-primary btn-sm flex items-center gap-1"
                    >
                        <Check size={14} />
                        Accept All
                    </button>
                </div>
            </div>

            {/* Changes list */}
            <div className="space-y-3">
                {changes.map((change, index) => {
                    const isExpanded = expandedIndexes.has(index);

                    return (
                        <div
                            key={index}
                            className="card p-4 space-y-3"
                        >
                            {/* Field name */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => toggleExpanded(index)}
                                    className="text-sm font-medium text-text hover:text-primary transition-colors"
                                >
                                    {change.field}
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onReject(index)}
                                        className="btn-icon hover:bg-error/10 hover:border-error hover:text-error"
                                        title="Reject"
                                    >
                                        <X size={16} />
                                    </button>
                                    <button
                                        onClick={() => onAccept(index)}
                                        className="btn-icon hover:bg-success/10 hover:border-success hover:text-success"
                                        title="Accept"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Original */}
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                                        Original
                                    </div>
                                    <div className={`p-3 bg-red-50 border border-red-200 rounded-lg text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
                                        {change.original || <span className="text-text-muted italic">Empty</span>}
                                    </div>
                                </div>

                                {/* Tailored */}
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                                        Tailored
                                    </div>
                                    <div className={`p-3 bg-green-50 border border-green-200 rounded-lg text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
                                        {change.tailored}
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            {change.reason && (
                                <div className="p-2 bg-primary-light border-l-4 border-primary rounded text-xs text-text-secondary">
                                    <span className="font-medium">Why: </span>
                                    {change.reason}
                                </div>
                            )}

                            {/* Toggle expand */}
                            {(change.original.length > 150 || change.tailored.length > 150) && (
                                <button
                                    onClick={() => toggleExpanded(index)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
