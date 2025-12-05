import { useResume } from '../../../context/ResumeContext';
import { Plus, Trash2, FolderKanban, Link2, Github } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CollapsibleSection } from '../CollapsibleSection';

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
        <CollapsibleSection
            title="Projects"
            icon={<FolderKanban className="text-primary" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-3">
                <div className="flex justify-end">
                    <button
                        onClick={handleAdd}
                        className="btn-primary btn-sm flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-background">
                        <FolderKanban size={48} className="mx-auto mb-3 text-text-muted" />
                        <p className="text-sm text-text-secondary mb-3">No projects added yet</p>
                        <button
                            onClick={handleAdd}
                            className="btn-secondary btn-sm"
                        >
                            <Plus size={16} className="inline mr-2" />
                            Add Your First Project
                        </button>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className="card p-4 space-y-3 group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    {/* Project Name */}
                                    <div>
                                        <label className="label-field">
                                            <FolderKanban size={14} className="inline mr-1" />
                                            Project Name <span className="text-error">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., E-Commerce Platform, Mobile App"
                                            value={project.name}
                                            onChange={(e) => handleChange(project.id, 'name', e.target.value)}
                                            className="input-field"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="label-field">
                                            Description <span className="text-error">*</span>
                                        </label>
                                        <textarea
                                            placeholder="Describe what this project does, its key features, and your role..."
                                            value={project.description}
                                            onChange={(e) => handleChange(project.id, 'description', e.target.value)}
                                            className="textarea-field min-h-[100px]"
                                        />
                                    </div>

                                    <div className="divider my-3"></div>

                                    {/* Technologies */}
                                    <div className="space-y-2">
                                        <label className="label-field">
                                            Technologies {project.technologies && project.technologies.length > 0 && (
                                                <span className="text-primary">({project.technologies.length})</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)"
                                            value={(project.technologies || []).join(', ')}
                                            onChange={(e) => handleChange(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                            className="input-field"
                                        />
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.technologies.map((tech, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-primary text-surface rounded-full text-xs font-medium"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Links */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label-field">
                                                <Link2 size={14} className="inline mr-1 text-primary" />
                                                Project Link
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://project-demo.com"
                                                value={project.link || ''}
                                                onChange={(e) => handleChange(project.id, 'link', e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="label-field">
                                                <Github size={14} className="inline mr-1" />
                                                GitHub Repository
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://github.com/username/repo"
                                                value={project.github || ''}
                                                onChange={(e) => handleChange(project.id, 'github', e.target.value)}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="btn-icon ml-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 hover:border-error hover:text-error"
                                    title="Delete project"
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
