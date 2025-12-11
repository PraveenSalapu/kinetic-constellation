import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { User } from 'lucide-react';
import { DemographicsForm } from './DemographicsForm';
import type { Demographics } from '../../types';

interface DemographicsStepProps {
    onComplete: () => void;
}

export const DemographicsStep: React.FC<DemographicsStepProps> = ({ onComplete }) => {
    const { resume, dispatch } = useResume();

    const handleSubmit = (data: Demographics) => {
        dispatch({ type: 'UPDATE_DEMOGRAPHICS', payload: data });
        onComplete();
    };

    return (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#0F0F0F] text-white p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl bg-[#1A1A1A] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-900/20 rounded-lg text-indigo-400">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Security Clearance: Demographics</h2>
                        <p className="text-gray-400 text-sm">Required for automated EEO compliance and application autofill.</p>
                    </div>
                </div>

                <DemographicsForm
                    initialData={resume.demographics || {}}
                    onSubmit={handleSubmit}
                    submitLabel="Save & Initialize Dashboard"
                    onCancel={onComplete}
                    cancelLabel="Skip for Now"
                />
            </div>
        </div>
    );
};

