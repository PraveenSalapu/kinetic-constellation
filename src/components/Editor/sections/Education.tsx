import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
        <div className="glass-panel p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Education</h2>
                <button
                    onClick={handleAdd}
                    className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-full transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-6">
                {resume.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-slate-800/50 rounded-lg space-y-4 relative group">
                        <button
                            onClick={() => handleDelete(edu.id)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Institution</label>
                                <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) => handleChange(edu.id, 'institution', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="University Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Degree</label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => handleChange(edu.id, 'degree', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Bachelor's, Master's"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Field of Study</label>
                                <input
                                    type="text"
                                    value={edu.fieldOfStudy}
                                    onChange={(e) => handleChange(edu.id, 'fieldOfStudy', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Computer Science"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Grade / GPA</label>
                                <input
                                    type="text"
                                    value={edu.grade || ''}
                                    onChange={(e) => handleChange(edu.id, 'grade', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="3.8/4.0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Start Date</label>
                                <input
                                    type="text"
                                    value={edu.startDate}
                                    onChange={(e) => handleChange(edu.id, 'startDate', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="MM/YYYY"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">End Date</label>
                                <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) => handleChange(edu.id, 'endDate', e.target.value)}
                                    className="input-field w-full"
                                    placeholder="MM/YYYY"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
