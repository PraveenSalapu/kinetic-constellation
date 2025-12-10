import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '../../types';
import { useEffect } from 'react';

interface ToastProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
};

const styles = {
    success: 'bg-[#0f1f10] border-green-800 text-green-400 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)]',
    error: 'bg-[#2a0e0e] border-red-800 text-red-400 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.3)]',
    info: 'bg-[#0f1120] border-indigo-800 text-indigo-400 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.3)]',
    warning: 'bg-[#2a1c00] border-yellow-800 text-yellow-400 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.3)]'
};

export const ToastItem = ({ toast, onDismiss }: ToastProps) => {
    const Icon = icons[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000); // Auto remove after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);
    
    return (
        <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md animate-slide-in-right min-w-[320px] max-w-md ${styles[toast.type]}`}>
            <Icon size={20} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm font-medium leading-relaxed">
                {toast.message}
            </div>
            <button 
                onClick={() => onDismiss(toast.id)}
                className="text-current opacity-60 hover:opacity-100 transition-opacity p-0.5 hover:bg-white/5 rounded"
            >
                <X size={16} />
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: string) => void }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onDismiss={onDismiss} />
                </div>
            ))}
        </div>
    );
};
