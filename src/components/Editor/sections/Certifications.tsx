import { Plus, Trash2, Award, Calendar, Building2 } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import { useSection } from '../../../hooks/useSection';
import type { CertificationItem } from '../../../types';

export const Certifications = () => {
    const { items: certifications, addItem, deleteItem, updateField } = useSection<CertificationItem>('certifications');

    const handleAdd = () => {
        addItem({
            name: '',
            issuer: '',
            date: ''
        });
    };

    return (
        <CollapsibleSection
            title="Certifications"
            icon={<Award className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-4 bg-[#111]">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                        <Plus size={14} />
                        Add Certification
                    </button>
                </div>

                {certifications.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-[#1a1a1a]">
                        <Award size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">No certifications added yet</p>
                        <button onClick={handleAdd} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1">
                            <Plus size={14} />
                            Add Your First Certification
                        </button>
                    </div>
                ) : (
                    certifications.map((cert) => (
                        <div key={cert.id} className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg space-y-4 group hover:border-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Certification Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">
                                            <Award size={12} className="inline mr-1" />
                                            Certification Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., AWS Certified Solutions Architect"
                                            value={cert.name}
                                            onChange={(e) => updateField(cert.id, 'name', e.target.value)}
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Issuer & Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Building2 size={12} className="inline mr-1" />
                                                Issuing Organization
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Amazon Web Services, Microsoft"
                                                value={cert.issuer}
                                                onChange={(e) => updateField(cert.id, 'issuer', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Calendar size={12} className="inline mr-1" />
                                                Date Obtained
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YYYY"
                                                value={cert.date}
                                                onChange={(e) => updateField(cert.id, 'date', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(cert.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 bg-transparent hover:bg-red-900/20 rounded-lg transition-all ml-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </CollapsibleSection>
    );
};
