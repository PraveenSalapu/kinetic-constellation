import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, Sparkles, X, Briefcase, Calendar, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { optimizeBulletPoint } from '../../../services/gemini';
import { CollapsibleSection } from '../CollapsibleSection';

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
            icon={<Briefcase className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="btn-primary btn-sm flex items-center gap-2">
                        <Plus size={16} />
                        Add Experience
                    </button>
                </div>
                {resume.experience.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                        <Briefcase size={48} className="mx-auto mb-3 text-text-muted" />
                        <p className="text-sm text-text-secondary mb-3">No experience added yet</p>
                        <button onClick={handleAdd} className="btn-secondary btn-sm">
                            <Plus size={16} className="inline mr-2" />
                            Add Your First Role
                        </button>
                    </div>
                ) : (
                    resume.experience.map((exp) => (
                        <div key={exp.id} className="card p-4 space-y-3 group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    {/* Company & Position */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <Briefcase size={14} className="inline mr-1" />
                                                Company
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.company}
                                                onChange={(e) => handleChange(exp.id, 'company', e.target.value)}
                                                className="input-field"
                                                placeholder="Company Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">Job Title</label>
                                            <input
                                                type="text"
                                                value={exp.position}
                                                onChange={(e) => handleChange(exp.id, 'position', e.target.value)}
                                                className="input-field"
                                                placeholder="Your Position"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates & Location */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <Calendar size={14} className="inline mr-1" />
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.startDate}
                                                onChange={(e) => handleChange(exp.id, 'startDate', e.target.value)}
                                                className="input-field"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">End Date</label>
                                            <input
                                                type="text"
                                                value={exp.endDate}
                                                onChange={(e) => handleChange(exp.id, 'endDate', e.target.value)}
                                                disabled={exp.current}
                                                className="input-field disabled:bg-background disabled:opacity-60"
                                                placeholder={exp.current ? 'Present' : 'MM/YYYY'}
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">
                                                <MapPin size={14} className="inline mr-1" />
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={exp.location || ''}
                                                onChange={(e) => handleChange(exp.id, 'location', e.target.value)}
                                                className="input-field"
                                                placeholder="City, State"
                                            />
                                        </div>
                                    </div>

                                    {/* Current Work Checkbox */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => handleChange(exp.id, 'current', e.target.checked)}
                                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="text-sm text-text">I currently work here</span>
                                    </label>

                                    <div className="divider my-3"></div>

                                    {/* Achievements */}
                                    <div className="space-y-3">
                                        <label className="label-field">Key Achievements & Responsibilities</label>
                                        {exp.description.map((bullet, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex gap-2">
                                                    <textarea
                                                        value={bullet}
                                                        onChange={(e) => handleUpdateBullet(exp.id, exp.description, idx, e.target.value)}
                                                        className="textarea-field"
                                                        placeholder="Describe your impact and achievements..."
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => handleOptimizeBullet(exp.id, exp.description, idx)}
                                                            disabled={optimizing?.id === exp.id && optimizing?.index === idx}
                                                            className="btn-icon"
                                                            title="Optimize with AI"
                                                        >
                                                            <Sparkles
                                                                size={16}
                                                                className={optimizing?.id === exp.id && optimizing?.index === idx ? 'animate-spin' : ''}
                                                            />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveBullet(exp.id, exp.description, idx)}
                                                            className="btn-icon hover:bg-error/10 hover:border-error hover:text-error"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* AI Suggestions */}
                                                {suggestions[`${exp.id}-${idx}`] && (
                                                    <div className="ml-2 p-4 bg-primary-light border border-primary/20 rounded-lg space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                                            <Sparkles size={14} />
                                                            <span>AI Suggestions</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {suggestions[`${exp.id}-${idx}`].map((suggestion, sIdx) => (
                                                                <button
                                                                    key={sIdx}
                                                                    onClick={() => applySuggestion(exp.id, exp.description, idx, suggestion)}
                                                                    className="w-full text-left p-3 bg-surface border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm"
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
                                            className="btn-secondary btn-sm flex items-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Add Achievement
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="btn-icon ml-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 hover:border-error hover:text-error"
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
