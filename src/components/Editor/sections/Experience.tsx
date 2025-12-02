import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, Sparkles, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { optimizeBulletPoint } from '../../../services/gemini';

export const Experience = () => {
    const { resume, dispatch } = useResume();
    const [optimizing, setOptimizing] = useState<{ id: string; index: number } | null>(null);
    const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId: 'experience',
                item: {
                    id: uuidv4(),
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    current: false,
                    description: [''],
                    location: '',
                },
            },
        });
    };

    const handleDelete = (id: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId: 'experience', itemId: id },
        });
    };

    const handleChange = (id: string, field: string, value: any) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId: 'experience',
                itemId: id,
                item: { [field]: value },
            },
        });
    };

    const handleAddBullet = (expId: string, currentBullets: string[]) => {
        handleChange(expId, 'description', [...currentBullets, '']);
    };

    const handleRemoveBullet = (expId: string, currentBullets: string[], index: number) => {
        const newBullets = currentBullets.filter((_, i) => i !== index);
        handleChange(expId, 'description', newBullets);
        // Clear suggestions for this index if any
        const key = `${expId}-${index}`;
        const newSuggestions = { ...suggestions };
        delete newSuggestions[key];
        setSuggestions(newSuggestions);
    };

    const handleUpdateBullet = (expId: string, currentBullets: string[], index: number, value: string) => {
        const newBullets = [...currentBullets];
        newBullets[index] = value;
        handleChange(expId, 'description', newBullets);
    };

    const handleOptimizeBullet = async (expId: string, currentBullets: string[], index: number) => {
        const bullet = currentBullets[index];
        if (!bullet.trim()) return;

        setOptimizing({ id: expId, index });
        // Clear previous suggestions
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

    const applySuggestion = (expId: string, currentBullets: string[], index: number, suggestion: string) => {
        handleUpdateBullet(expId, currentBullets, index, suggestion);
        // Clear suggestions after applying
        const key = `${expId}-${index}`;
        setSuggestions(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    return (
        <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Experience</h2>
                <button
                    onClick={handleAdd}
                    className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-6">
                {resume.experience.map((exp) => (
                    <div key={exp.id} className="p-4 bg-slate-800/50 rounded-lg space-y-4 relative group">
                        <button
                            onClick={() => handleDelete(exp.id)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Company</label>
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => handleChange(exp.id, 'company', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Company Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Position</label>
                                <input
                                    type="text"
                                    value={exp.position}
                                    onChange={(e) => handleChange(exp.id, 'position', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Job Title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Start Date</label>
                                <input
                                    type="text"
                                    value={exp.startDate}
                                    onChange={(e) => handleChange(exp.id, 'startDate', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="MM/YYYY"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">End Date</label>
                                <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) => handleChange(exp.id, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                    className="input-field w-full disabled:opacity-50"
                                    placeholder={exp.current ? 'Present' : 'MM/YYYY'}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => handleChange(exp.id, 'current', e.target.checked)}
                                className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary"
                            />
                            <label className="text-sm text-slate-400">I currently work here</label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Description</label>
                            {exp.description.map((bullet, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex gap-2 items-start">
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={bullet}
                                                onChange={(e) => handleUpdateBullet(exp.id, exp.description, idx, e.target.value)}
                                                className="input-field w-full min-h-[60px] resize-y pr-10"
                                                placeholder="Describe your responsibilities and achievements..."
                                            />
                                            <button
                                                onClick={() => handleOptimizeBullet(exp.id, exp.description, idx)}
                                                disabled={optimizing?.id === exp.id && optimizing?.index === idx}
                                                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-accent disabled:opacity-50 transition-colors"
                                                title="Optimize with AI"
                                            >
                                                <Sparkles size={16} className={optimizing?.id === exp.id && optimizing?.index === idx ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBullet(exp.id, exp.description, idx)}
                                            className="p-2 text-slate-500 hover:text-red-400 transition-colors mt-1"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* Suggestions UI */}
                                    {suggestions[`${exp.id}-${idx}`] && (
                                        <div className="ml-4 p-3 bg-slate-900/80 border border-accent/20 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1">
                                                <Sparkles size={12} /> AI Suggestions
                                            </p>
                                            <div className="space-y-2">
                                                {suggestions[`${exp.id}-${idx}`].map((suggestion, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        onClick={() => applySuggestion(exp.id, exp.description, idx, suggestion)}
                                                        className="w-full text-left p-2 text-sm text-slate-300 hover:bg-white/5 rounded transition-colors border border-transparent hover:border-white/10"
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
                                onClick={() => handleAddBullet(exp.id, exp.description)}
                                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Bullet Point
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
