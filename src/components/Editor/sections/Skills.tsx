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
            icon={<Award className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button
                        onClick={handleAddCategory}
                        className="btn-primary btn-sm flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Category
                    </button>
                </div>

                {skills.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                        <Award size={48} className="mx-auto mb-3 text-text-muted" />
                        <p className="text-sm text-text-secondary mb-3">No skills added yet</p>
                        <button
                            onClick={handleAddCategory}
                            className="btn-secondary btn-sm"
                        >
                            <Plus size={16} className="inline mr-2" />
                            Add Your First Category
                        </button>
                    </div>
                ) : (
                    skills.map((skillGroup) => (
                        <div
                            key={skillGroup.id}
                            className="card p-4 space-y-3 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    {/* Category Name */}
                                    <div>
                                        <label className="label-field">Category Name</label>
                                        <input
                                            type="text"
                                            value={skillGroup.category}
                                            onChange={(e) => updateField(skillGroup.id, 'category', e.target.value)}
                                            className="input-field"
                                            placeholder="e.g., Programming Languages, Frameworks, Tools"
                                        />
                                    </div>

                                    <div className="divider my-3"></div>

                                    {/* Skills */}
                                    <div className="space-y-3">
                                        <label className="label-field">
                                            Skills {skillGroup.items.length > 0 && <span className="text-primary">({skillGroup.items.length})</span>}
                                        </label>
                                        <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-surface border border-border rounded-lg">
                                            {skillGroup.items.length === 0 ? (
                                                <span className="text-sm text-text-secondary">No skills added - type below and press Enter</span>
                                            ) : (
                                                skillGroup.items.map((item, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="group/tag px-3 py-1.5 bg-primary text-surface rounded-full text-sm font-medium flex items-center gap-2"
                                                    >
                                                        {item}
                                                        <button
                                                            onClick={() => handleRemoveSkill(skillGroup.id, skillGroup.items, item)}
                                                            className="hover:bg-surface/20 rounded-full p-0.5 transition-colors"
                                                            title="Remove skill"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Type a skill and press Enter to add..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddSkill(skillGroup.id, skillGroup.items, e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <p className="text-xs text-text-secondary mt-1">Press Enter to add each skill</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(skillGroup.id)}
                                    className="btn-icon ml-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 hover:border-error hover:text-error"
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
