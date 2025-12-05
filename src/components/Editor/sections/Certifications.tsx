import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, Award, Calendar, Building2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CollapsibleSection } from '../CollapsibleSection';

export const Certifications = () => {
    const { resume, dispatch } = useResume();
    const { certifications } = resume;

    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId: 'certifications',
                item: {
                    id: uuidv4(),
                    name: '',
                    issuer: '',
                    date: ''
                }
            }
        });
    };

    const handleDelete = (id: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId: 'certifications', itemId: id }
        });
    };

    const handleChange = (id: string, field: string, value: string) => {
        const item = certifications.find(c => c.id === id);
        if (item) {
            dispatch({
                type: 'UPDATE_ITEM',
                payload: {
                    sectionId: 'certifications',
                    itemId: id,
                    item: { ...item, [field]: value }
                }
            });
        }
    };

    return (
        <CollapsibleSection
            title="Certifications"
            icon={<Award className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button onClick={handleAdd} className="btn-primary btn-sm flex items-center gap-2">
                        <Plus size={16} />
                        Add Certification
                    </button>
                </div>

                {certifications.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                        <Award size={48} className="mx-auto mb-3 text-text-muted" />
                        <p className="text-sm text-text-secondary mb-3">No certifications added yet</p>
                        <button onClick={handleAdd} className="btn-secondary btn-sm">
                            <Plus size={16} className="inline mr-2" />
                            Add Your First Certification
                        </button>
                    </div>
                ) : (
                    certifications.map((cert) => (
                        <div key={cert.id} className="card p-4 space-y-3 group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    {/* Certification Name */}
                                    <div>
                                        <label className="label-field">
                                            <Award size={14} className="inline mr-1" />
                                            Certification Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., AWS Certified Solutions Architect"
                                            value={cert.name}
                                            onChange={(e) => handleChange(cert.id, 'name', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>

                                    {/* Issuer & Date */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <Building2 size={14} className="inline mr-1" />
                                                Issuing Organization
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g., Amazon Web Services, Microsoft"
                                                value={cert.issuer}
                                                onChange={(e) => handleChange(cert.id, 'issuer', e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">
                                                <Calendar size={14} className="inline mr-1" />
                                                Date Obtained
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YYYY"
                                                value={cert.date}
                                                onChange={(e) => handleChange(cert.id, 'date', e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(cert.id)}
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
