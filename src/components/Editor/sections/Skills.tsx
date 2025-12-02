import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, X, Award, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Skills = () => {
    const { resume, dispatch } = useResume();

    const handleAddCategory = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId: 'skills',
                item: {
                    id: uuidv4(),
                    category: 'New Category',
                    items: [],
                },
            },
        });
    };

    const handleDeleteCategory = (id: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId: 'skills', itemId: id },
        });
    };

    const handleUpdateCategory = (id: string, category: string) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId: 'skills',
                itemId: id,
                item: { category },
            },
        });
    };

    const handleAddSkill = (categoryId: string, currentItems: string[], newItem: string) => {
        if (!newItem.trim()) return;
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId: 'skills',
                itemId: categoryId,
                item: { items: [...currentItems, newItem.trim()] },
            },
        });
    };

    const handleRemoveSkill = (categoryId: string, currentItems: string[], itemToRemove: string) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId: 'skills',
                itemId: categoryId,
                item: { items: currentItems.filter((i) => i !== itemToRemove) },
            },
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl space-y-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Award className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                        <p className="text-sm text-gray-500">Organize your skills by category</p>
                    </div>
                </div>
                <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all font-medium text-sm"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {resume.skills.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <Sparkles className="mx-auto text-gray-400 mb-3" size={40} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No skills added yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Start by adding a skill category</p>
                    <button
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        <Plus size={18} className="inline mr-2" />
                        Add Your First Category
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {resume.skills.map((skillGroup, index) => (
                        <div
                            key={skillGroup.id}
                            className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 space-y-4 relative group hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => handleDeleteCategory(skillGroup.id)}
                                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete category"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category Name</label>
                                <input
                                    type="text"
                                    value={skillGroup.category}
                                    onChange={(e) => handleUpdateCategory(skillGroup.id, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                    placeholder="e.g., Programming Languages, Frameworks, Tools"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    Skills {skillGroup.items.length > 0 && <span className="text-indigo-600">({skillGroup.items.length})</span>}
                                </label>
                                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-white border-2 border-gray-200 rounded-lg">
                                    {skillGroup.items.length === 0 ? (
                                        <span className="text-sm text-gray-400 italic">No skills added - type below and press Enter</span>
                                    ) : (
                                        skillGroup.items.map((item, idx) => (
                                            <span
                                                key={idx}
                                                className="group/tag px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                                            >
                                                {item}
                                                <button
                                                    onClick={() => handleRemoveSkill(skillGroup.id, skillGroup.items, item)}
                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
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
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm"
                                    placeholder="Type a skill and press Enter to add..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill(skillGroup.id, skillGroup.items, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                                <p className="text-xs text-gray-500 mt-1">💡 Tip: Press Enter to add each skill</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
