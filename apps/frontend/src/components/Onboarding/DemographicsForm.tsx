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
            {/* Section 1: Equal Employment (Reference Style) */}
            <div className="space-y-4">
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Equal Employment</h3>

                <div className="space-y-4">
                    {/* Gender */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">What is your gender?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
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

                    {/* Pronouns */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">What are your pronouns?</label>
                        <input
                            type="text"
                            placeholder="e.g. He/Him"
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.pronouns || ''}
                            onChange={(e) => updateField('pronouns', e.target.value)}
                        />
                    </div>

                    {/* Hispanic/Latino */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">Are you Hispanic or Latino?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.isHispanic || ''}
                            onChange={(e) => updateField('isHispanic', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Race */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">How would you identify your race?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.race || ''}
                            onChange={(e) => updateField('race', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Asian">Asian</option>
                            <option value="Black or African American">Black or African American</option>
                            <option value="White">White</option>
                            <option value="Native American">Native American</option>
                            <option value="Pacific Islander">Pacific Islander</option>
                            <option value="Two or More Races">Two or More Races</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* LGBTQ+ */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">Do you identify as LGBTQ+?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.isLGBTQ || ''}
                            onChange={(e) => updateField('isLGBTQ', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Sexual Orientation */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">Sexual Orientation?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.sexualOrientation || ''}
                            onChange={(e) => updateField('sexualOrientation', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Heterosexual">Heterosexual</option>
                            <option value="Gay">Gay</option>
                            <option value="Lesbian">Lesbian</option>
                            <option value="Bisexual">Bisexual</option>
                            <option value="Queer">Queer</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Veteran */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">Are you a veteran?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
                            value={formData.veteranStatus || ''}
                            onChange={(e) => updateField('veteranStatus', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Disability */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-gray-800/50">
                        <label className="text-sm font-medium text-gray-300 mb-2 md:mb-0">Do you have a disability?</label>
                        <select
                            className="bg-[#111] border border-gray-700 rounded-lg p-2 text-gray-200 focus:border-indigo-500 outline-none w-full md:w-64"
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

            {/* Section 2: Application Logistics */}
            <div className="space-y-4 pt-2">
                <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">Application Logistics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Availability</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.availability || ''}
                            onChange={(e) => updateField('availability', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Immediate">Immediate</option>
                            <option value="2 Weeks Notice">2 Weeks Notice</option>
                            <option value="1 Month Notice">1 Month Notice</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Salary Expectation</label>
                        <input
                            type="text"
                            placeholder="e.g. $120,000+"
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.salaryExpectation || ''}
                            onChange={(e) => updateField('salaryExpectation', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Willing to Relocate?</label>
                        <select
                            className="w-full bg-[#111] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.relocation || ''}
                            onChange={(e) => updateField('relocation', e.target.value)}
                        >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Remote Only">Remote Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section 3: Authorization */}
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
