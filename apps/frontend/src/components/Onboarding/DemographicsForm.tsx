import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Demographics } from '../../types';

interface DemographicsFormProps {
    initialData: Demographics;
    onSubmit: (data: Demographics) => void;
    submitLabel?: React.ReactNode;
    onCancel?: () => void;
    cancelLabel?: string;
    className?: string;
}

export const DemographicsForm: React.FC<DemographicsFormProps> = ({
    initialData,
    onSubmit,
    submitLabel = "Save Changes",
    onCancel,
    cancelLabel = "Cancel",
    className = ""
}) => {
    const [formData, setFormData] = useState<Demographics>(initialData || {});

    const updateField = (field: keyof Demographics, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {/* Section 1: Identity */}
            <div className="space-y-4">
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Identity Protocols</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Gender</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.gender || ''}
                            onChange={(e) => updateField('gender', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Race / Ethnicity</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.race || ''}
                            onChange={(e) => updateField('race', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Asian">Asian</option>
                            <option value="Black or African American">Black or African American</option>
                            <option value="Hispanic or Latino">Hispanic or Latino</option>
                            <option value="White">White</option>
                            <option value="Two or More Races">Two or More Races</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Veteran Status</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.veteranStatus || ''}
                            onChange={(e) => updateField('veteranStatus', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Disability Status</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.disabilityStatus || ''}
                            onChange={(e) => updateField('disabilityStatus', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 2: Authorization */}
            <div className="space-y-4 pt-2">
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Authorization Clearance</h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Work Authorization</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.workAuthorization || ''}
                            onChange={(e) => updateField('workAuthorization', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Citizen">Details: US Citizen / Permanent Resident</option>
                            <option value="Visa">Visa Holder (Select status below)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[#111] border border-gray-700 rounded-lg">
                        <input
                            type="checkbox"
                            id="sponsorship"
                            checked={formData.requiresSponsorship || false}
                            onChange={(e) => updateField('requiresSponsorship', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700"
                        />
                        <label htmlFor="sponsorship" className="text-sm text-gray-300 cursor-pointer">
                            I will require visa sponsorship now or in the future (H1-B, etc)
                        </label>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex justify-end gap-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        {cancelLabel}
                    </button>
                )}
                <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                    <ShieldCheck size={18} />
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};
