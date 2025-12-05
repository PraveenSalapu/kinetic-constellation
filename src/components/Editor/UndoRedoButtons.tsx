import { Undo, Redo } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import { useEffect } from 'react';

/**
 * Undo/Redo buttons with keyboard shortcuts
 */
export const UndoRedoButtons = () => {
    const { canUndo, canRedo, undo, redo } = useResume();

    // Keyboard shortcuts: Ctrl+Z for undo, Ctrl+Y or Ctrl+Shift+Z for redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+Z or Cmd+Z (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
            }
            // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z (Mac)
            else if (
                ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
            ) {
                e.preventDefault();
                if (canRedo) redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo]);

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={undo}
                disabled={!canUndo}
                className="btn-icon"
                title="Undo (Ctrl+Z)"
            >
                <Undo size={18} />
            </button>
            <button
                onClick={redo}
                disabled={!canRedo}
                className="btn-icon"
                title="Redo (Ctrl+Y)"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};
