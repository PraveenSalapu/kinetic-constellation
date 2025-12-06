import { Plus, Trash2, FolderKanban, Link2, Github } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection';
import { useSection } from '../../../hooks/useSection';
import type { ProjectItem } from '../../../types';

export const Projects = () => {
    const { items: projects, addItem, deleteItem, updateField } = useSection<ProjectItem>('projects');

    const handleAdd = () => {
        addItem({
            name: '',
            description: '',
            technologies: [],
            link: '',
            github: '',
            bullets: []
        });
    };

    return (
        <CollapsibleSection
            title="Projects"
            icon={<FolderKanban className="text-indigo-400" size={18} />}
            defaultOpen={false}
        >
            <div className="p-4 space-y-4 bg-[#111]">
                <div className="flex justify-end">
                    <button
                        onClick={handleAdd}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
                    >
                        <Plus size={14} />
                        Add Project
                    </button>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg bg-[#1a1a1a]">
                        <FolderKanban size={32} className="mx-auto mb-3 text-gray-600" />
                        <p className="text-sm text-gray-400 mb-3">No projects added yet</p>
                        <button
                            onClick={handleAdd}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1"
                        >
                            <Plus size={14} />
                            Add Your First Project
                        </button>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg space-y-4 group hover:border-gray-700 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-4">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">
                                            <FolderKanban size={12} className="inline mr-1" />
                                            Project Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., E-Commerce Platform, Mobile App"
                                            value={project.name}
                                            onChange={(e) => updateField(project.id, 'name', e.target.value)}
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">
                                            Description <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            placeholder="Describe what this project does, its key features, and your role..."
                                            value={project.description}
                                            onChange={(e) => updateField(project.id, 'description', e.target.value)}
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[100px] resize-y"
                                        />
                                    </div>

                                    <div className="border-t border-gray-800 my-3"></div>

                                    {/* Technologies */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-400">
                                            Technologies {project.technologies && project.technologies.length > 0 && (
                                                <span className="text-indigo-400">({project.technologies.length})</span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., React, Node.js, MongoDB, AWS (comma separated)"
                                            value={(project.technologies || []).join(', ')}
                                            onChange={(e) => updateField(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                                            className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                        {project.technologies && project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.technologies.map((tech, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 bg-indigo-900/30 text-indigo-300 border border-indigo-500/30 rounded text-xs font-medium"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Links */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Link2 size={12} className="inline mr-1 text-indigo-400" />
                                                Project Link
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://project-demo.com"
                                                value={project.link || ''}
                                                onChange={(e) => updateField(project.id, 'link', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">
                                                <Github size={12} className="inline mr-1" />
                                                GitHub Repository
                                            </label>
                                            <input
                                                type="url"
                                                placeholder="https://github.com/username/repo"
                                                value={project.github || ''}
                                                onChange={(e) => updateField(project.id, 'github', e.target.value)}
                                                className="w-full bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteItem(project.id)}
                                    className="p-2 text-gray-600 hover:text-red-400 bg-transparent hover:bg-red-900/20 rounded-lg transition-all ml-2"
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
