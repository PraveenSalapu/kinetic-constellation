import { Plus, Trash2, Sparkles, X, Briefcase, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
import { optimizeBulletPoint } from '../../../services/gemini';
import { CollapsibleSection } from '../CollapsibleSection';
import { useBulletSection } from '../../../hooks/useSection';
import type { ExperienceItem } from '../../../types';

export const Experience = () => {
    const { items: experience, addItem, deleteItem, updateField, addBullet, removeBullet, updateBullet } = useBulletSection<ExperienceItem>('experience');
    const [optimizing, setOptimizing] = useState<{ id: string; index: number } | null>(null);
    const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

    const handleAdd = () => {
        addItem({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: [''],
            location: '',
        });
    };

    const handleRemoveBulletSafe = (expId: string, index: number) => {
        removeBullet(expId, index);
        const key = `${expId}-${index}`;
        const newSuggestions = { ...suggestions };
        delete newSuggestions[key];
        setSuggestions(newSuggestions);
    };

    const handleOptimizeBullet = async (expId: string, currentBullets: string[], index: number) => {
        const bullet = currentBullets[index];
        if (!bullet.trim()) return;

        setOptimizing({ id: expId, index });
        const key = `${expId}-${index}`;
        setSuggestions(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

        try {
            const options = await optimizeBulletPoint(bullet);
            setSuggestions(prev => ({
                ...prev,
                [key]: options
            }));
        } catch (error) {
            console.error('Optimization failed', error);
        } finally {
            setOptimizing(null);
        }
    };

    const applySuggestion = (expId: string, index: number, suggestion: string) => {
        updateBullet(expId, index, suggestion);
        const key = `${expId}-${index}`;
        setSuggestions(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };





    return (
        <CollapsibleSection
            title="Work Experience"
            icon={<Briefcase className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3 bg-[#111]">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                        <Plus size={14} />
                        Add Experience
                    </button>
                </div>
                {experience.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-[#1a1a1a]">
                        <Briefcase size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">No experience added yet</p>
                        <button onClick={handleAdd} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1">
                            <Plus size={14} />
                            Add Your First Role
                        </button>
                    </div>
                ) : (
                    experience.map((exp) => (
                        <div key={exp.id} className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg space-y-4 group hover:border-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Company & Position */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Briefcase size={12} className="inline mr-1" />
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => updateField(exp.id, 'company', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Company Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.position}
                                                onChange={(e) => updateField(exp.id, 'position', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Your Position"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates & Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Calendar size={12} className="inline mr-1" />
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.startDate}
                                                onChange={(e) => updateField(exp.id, 'startDate', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
                                            <input
                                                type="text"
                                                value={exp.endDate}
                                                onChange={(e) => updateField(exp.id, 'endDate', e.target.value)}
                                                disabled={exp.current}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                placeholder={exp.current ? 'Present' : 'MM/YYYY'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <MapPin size={12} className="inline mr-1" />
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.location || ''}
                                                onChange={(e) => updateField(exp.id, 'location', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="City, State"
                                            />
                                        </div>
                                    </div>

                                    {/* Current Work Checkbox */}
                                    <label className="flex items-center gap-2 cursor-pointer group/check">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => updateField(exp.id, 'current', e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-600 bg-[#111] text-indigo-500 focus:ring-offset-0 focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs text-gray-400 group-hover/check:text-gray-300 transition-colors">I currently work here</span>
                                    </label>

                                    <div className="border-t border-gray-800 my-3"></div>

                                    {/* Achievements */}
                                    <div className="space-y-3">
                                        <label className="block text-xs font-medium text-gray-400">Key Achievements & Responsibilities</label>
                                        {exp.description.map((bullet, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex gap-2">
                                                    <textarea
                                                        value={bullet}
                                                        onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                                                        onInput={(e) => {
                                                            const target = e.target as HTMLTextAreaElement;
                                                            target.style.height = 'auto';
                                                            target.style.height = target.scrollHeight + 'px';
                                                        }}
                                                        className="flex-1 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[40px] resize-none overflow-hidden"
                                                        placeholder="Describe your impact and achievements..."
                                                        rows={1}
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleOptimizeBullet(exp.id, exp.description, idx)}
                                                            disabled={optimizing?.id === exp.id && optimizing?.index === idx}
                                                            className="p-2 text-gray-500 hover:text-indigo-400 hover:bg-indigo-900/20 rounded-lg transition-colors border border-transparent hover:border-indigo-500/30"
                                                            title="Optimize with AI"
                                                        >
                                                            <Sparkles
                                                                size={16}
                                                                className={optimizing?.id === exp.id && optimizing?.index === idx ? 'animate-spin' : ''}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveBulletSafe(exp.id, idx)}
                                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* AI Suggestions */}
                                                {suggestions[`${exp.id}-${idx}`] && (
                                                    <div className="ml-2 p-3 bg-indigo-900/10 border border-indigo-500/30 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
                                                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-400">
                                                            <Sparkles size={12} />
                                                            <span>AI Suggestions</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {suggestions[`${exp.id}-${idx}`].map((suggestion, sIdx) => (
                                                                <button
                                                                    key={sIdx}
                                                                    onClick={() => applySuggestion(exp.id, idx, suggestion)}
                                                                    className="w-full text-left p-2.5 bg-[#111] border border-gray-700 rounded text-sm text-gray-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all font-light"
                                                                >
                                                                    {suggestion}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addBullet(exp.id)}
                                            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 px-1"
                                        >
                                            <Plus size={12} />
                                            Add Achievement
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(exp.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 bg-transparent hover:bg-red-900/20 rounded-lg transition-all ml-2"
                                    title="Delete Experience"
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
