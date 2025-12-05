import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CollapsibleSection } from '../CollapsibleSection';

export const Education = () => {
    const { resume, dispatch } = useResume();

    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId: 'education',
                item: {
                    id: uuidv4(),
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startDate: '',
                    endDate: '',
                    grade: '',
                },
            },
        });
    };

    const handleDelete = (id: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId: 'education', itemId: id },
        });
    };

    const handleChange = (id: string, field: string, value: any) => {
        dispatch({
            type: 'UPDATE_ITEM',
            payload: {
                sectionId: 'education',
                itemId: id,
                item: { [field]: value },
            },
        });
    };

    return (
        <CollapsibleSection
            title="Education"
            icon={<GraduationCap className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="btn-primary btn-sm flex items-center gap-2">
                        <Plus size={16} />
                        Add Education
                    </button>
                </div>

                {resume.education.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                        <GraduationCap size={48} className="mx-auto mb-3 text-text-muted" />
                        <p className="text-sm text-text-secondary mb-3">No education added yet</p>
                        <button onClick={handleAdd} className="btn-secondary btn-sm">
                            <Plus size={16} className="inline mr-2" />
                            Add Your First Degree
                        </button>
                    </div>
                ) : (
                    resume.education.map((edu) => (
                        <div key={edu.id} className="card p-4 space-y-3 group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    {/* Institution & Degree */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <GraduationCap size={14} className="inline mr-1" />
                                                Institution
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.institution}
                                                onChange={(e) => handleChange(edu.id, 'institution', e.target.value)}
                                                className="input-field"
                                                placeholder="University Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">Degree</label>
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => handleChange(edu.id, 'degree', e.target.value)}
                                                className="input-field"
                                                placeholder="Bachelor's, Master's, etc."
                                            />
                                        </div>
                                    </div>

                                    {/* Field of Study & Grade */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">Field of Study</label>
                                            <input
                                                type="text"
                                                value={edu.fieldOfStudy}
                                                onChange={(e) => handleChange(edu.id, 'fieldOfStudy', e.target.value)}
                                                className="input-field"
                                                placeholder="Computer Science, Engineering, etc."
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">Grade / GPA</label>
                                            <input
                                                type="text"
                                                value={edu.grade || ''}
                                                onChange={(e) => handleChange(edu.id, 'grade', e.target.value)}
                                                className="input-field"
                                                placeholder="3.8/4.0"
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <Calendar size={14} className="inline mr-1" />
                                                Start Date
                                            </label>
                                            <input
                                                type="text"
                                                value={edu.startDate}
                                                onChange={(e) => handleChange(edu.id, 'startDate', e.target.value)}
                                                className="input-field"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">End Date</label>
                                            <input
                                                type="text"
                                                value={edu.endDate}
                                                onChange={(e) => handleChange(edu.id, 'endDate', e.target.value)}
                                                className="input-field"
                                                placeholder="MM/YYYY"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(edu.id)}
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
