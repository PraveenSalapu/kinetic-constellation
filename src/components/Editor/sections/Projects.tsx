import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, FolderKanban, Link2, Github, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const Projects = () => {
    const { resume, dispatch } = useResume();
    const { projects } = resume;

    const handleAdd = () => {
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                sectionId: 'projects',
                item: {
                    id: uuidv4(),
                    name: '',
                    description: '',
                    technologies: [],
                    link: '',
                    github: '',
                    bullets: []
                }
            }
        });
    };

    const handleDelete = (id: string) => {
        dispatch({
            type: 'DELETE_ITEM',
            payload: { sectionId: 'projects', itemId: id }
        });
    };

    const handleChange = (id: string, field: string, value: any) => {
        const item = projects.find(p => p.id === id);
        if (item) {
            dispatch({
                type: 'UPDATE_ITEM',
                payload: {
                    sectionId: 'projects',
                    itemId: id,
                    item: { ...item, [field]: value }
                }
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl space-y-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <FolderKanban className="text-white" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                        <p className="text-sm text-gray-500">Showcase your work and achievements</p>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all font-medium text-sm"
                >
                    <Plus size={18} />
                    Add Project
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <FolderKanban className="mx-auto text-gray-400 mb-3" size={40} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No projects yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Add projects to showcase your portfolio</p>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        <Plus size={18} className="inline mr-2" />
                        Add Your First Project
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project, index) => (
                        <div
                            key={project.id}
                            className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 space-y-4 relative group hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => handleDelete(project.id)}
                                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete project"
                            >
                                <Trash2 size={16} />
                            </button>

                            {/* Project Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., E-Commerce Platform, Mobile App"
                                    value={project.name}
                                    onChange={(e) => handleChange(project.id, 'name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    placeholder="Describe what this project does, its key features, and your role..."
                                    value={project.description}
                                    onChange={(e) => handleChange(project.id, 'description', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none transition-all text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-y"
                                />
                            </div>

                            {/* Technologies */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                    Technologies {project.technologies && project.technologies.length > 0 && (
                                        <span className="text-green-600">({project.technologies.length})</span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)"
                                    value={(project.technologies || []).join(', ')}
                                    onChange={(e) => handleChange(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                    className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-400 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                />
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {project.technologies.map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-medium"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        <Link2 size={12} className="text-blue-600" />
                                        Project Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://project-demo.com"
                                        value={project.link || ''}
                                        onChange={(e) => handleChange(project.id, 'link', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        <Github size={12} className="text-gray-900" />
                                        GitHub Repository
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/username/repo"
                                        value={project.github || ''}
                                        onChange={(e) => handleChange(project.id, 'github', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-400 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
