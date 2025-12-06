import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import { useSection } from '../../../hooks/useSection';
import type { EducationItem } from '../../../types';

export const Education = () => {
    const { items: education, addItem, deleteItem, updateField } = useSection<EducationItem>('education');

    const handleAdd = () => {
        addItem({
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            grade: '',
        });
    };

    return (
        <CollapsibleSection
            title="Education"
            icon={<GraduationCap className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3 bg-[#111]">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                        <Plus size={14} />
                        Add Education
                    </button>
                </div>

                {education.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-[#1a1a1a]">
                        <GraduationCap size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">No education added yet</p>
                        <button onClick={handleAdd} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1">
                            <Plus size={14} />
                            Add Your First Degree
                        </button>
                    </div>
                ) : (
                    education.map((edu) => (
                        <div key={edu.id} className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg space-y-4 group hover:border-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Institution & Degree */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <GraduationCap size={12} className="inline mr-1" />
                                                Institution
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => updateField(edu.id, 'institution', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="University Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Degree</label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => updateField(edu.id, 'degree', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Bachelor's, Master's, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Field of Study & Grade */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Field of Study</label>
                                            <input
                                                type="text"
                                                value={edu.fieldOfStudy}
                                                onChange={(e) => updateField(edu.id, 'fieldOfStudy', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Computer Science, Engineering, etc."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Grade / GPA</label>
                                            <input
                                                type="text"
                                                value={edu.grade || ''}
                                                onChange={(e) => updateField(edu.id, 'grade', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="3.8/4.0"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Calendar size={12} className="inline mr-1" />
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.startDate}
                                                onChange={(e) => updateField(edu.id, 'startDate', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
                                            <input
                                                type="text"
                                                value={edu.endDate}
                                                onChange={(e) => updateField(edu.id, 'endDate', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(edu.id)}
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
