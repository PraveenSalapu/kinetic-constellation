import { Plus, Trash2, X, Award } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import { useSection } from '../../../hooks/useSection';
import type { Resume } from '../../../types';

type SkillCategory = Resume['skills'][number];

export const Skills = () => {
    const { items: skills, addItem, deleteItem, updateField } = useSection<SkillCategory>('skills');

    const handleAddCategory = () => {
        addItem({
            category: 'New Category',
            items: [],
        });
    };

    const handleAddSkill = (categoryId: string, currentItems: string[], newItem: string) => {
        if (!newItem.trim()) return;
        updateField(categoryId, 'items', [...currentItems, newItem.trim()]);
    };

    const handleRemoveSkill = (categoryId: string, currentItems: string[], itemToRemove: string) => {
        updateField(categoryId, 'items', currentItems.filter((i) => i !== itemToRemove));
    };

    return (
        <CollapsibleSection
            title="Skills"
            icon={<Award className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-4 bg-[#111]">
                <div className="flex justify-end">
                    <button
                        onClick={handleAddCategory}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={14} />
                        Add Category
                    </button>
                </div>

                {skills.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-[#1a1a1a]">
                        <Award size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">No skills added yet</p>
                        <button
                            onClick={handleAddCategory}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <Plus size={14} />
                            Add Your First Category
                        </button>
                    </div>
                ) : (
                    skills.map((skillGroup) => (
                        <div
                            key={skillGroup.id}
                            className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg space-y-4 group hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Category Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Category Name</label>
                                        <input
                                            type="text"
                                            value={skillGroup.category}
                                            onChange={(e) => updateField(skillGroup.id, 'category', e.target.value)}
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="e.g., Programming Languages, Frameworks, Tools"
                                        />
                                    </div>

                                    <div className="border-t border-gray-800 my-3"></div>

                                    {/* Skills */}
                                    <div className="space-y-3">
                                        <label className="block text-xs font-medium text-gray-400">
                                            Skills {skillGroup.items.length > 0 && <span className="text-indigo-400">({skillGroup.items.length})</span>}
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-[#111] border border-gray-800 rounded-lg">
                                            {skillGroup.items.length === 0 ? (
                                                <span className="text-sm text-gray-500 italic">No skills added - type below and press Enter</span>
                                            ) : (
                                                skillGroup.items.map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="group/tag px-3 py-1 bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 rounded-full text-xs font-medium flex items-center gap-2 animate-in fade-in zoom-in-95"
                                                    >
                                                        {item}
                                                        <button
                                                            onClick={() => handleRemoveSkill(skillGroup.id, skillGroup.items, item)}
                                                            className="hover:text-white transition-colors p-0.5"
                                                            title="Remove skill"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Type a skill and press Enter to add..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSkill(skillGroup.id, skillGroup.items, e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Press Enter to add each skill</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(skillGroup.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 bg-transparent hover:bg-red-900/20 rounded-lg transition-all ml-2"
                                    title="Delete category"
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
