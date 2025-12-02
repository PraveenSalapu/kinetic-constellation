import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-700">Certifications</h3>
                <button onClick={handleAdd} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-sm font-medium">
                    <Plus size={16} /> Add Certification
                </button>
            </div>
            <div className="space-y-3">
                {certifications.map((cert) => (
                    <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                            type="text"
                            placeholder="Certification Name"
                            value={cert.name}
                            onChange={(e) => handleChange(cert.id, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Issuer"
                            value={cert.issuer}
                            onChange={(e) => handleChange(cert.id, 'issuer', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Date"
                            value={cert.date}
                            onChange={(e) => handleChange(cert.id, 'date', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button onClick={() => handleDelete(cert.id)} className="text-gray-400 hover:text-red-500 p-1">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
