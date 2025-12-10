import type { Resume } from '../types';

export const getResumeStructureHash = (resume: Resume): string => {
    if (!resume) return '';

    const {
        selectedTemplate,
        sections = [],
        experience = [],
        education = [],
        projects = [],
        skills = [],
        layout
    } = resume;

    // 1. Template
    const templatePart = selectedTemplate || 'modern';

    // 2. Section Visibility
    // Create a string like "id:true|id:false"
    const visibilityPart = sections
        .map(s => `${s.id}:${s.isVisible}`)
        .join('|');

    // 3. Item Counts
    const workCount = experience.length;
    const eduCount = education.length;
    const projectCount = projects.length;
    const skillCount = skills.length;

    // 4. Total Bullets
    // Sum bullets from experience and projects
    const expBullets = experience.reduce((acc, exp) => acc + (exp.description?.length || 0), 0);
    const projBullets = projects.reduce((acc, proj) => acc + (proj.bullets?.length || 0), 0);
    const totalBullets = expBullets + projBullets;

    // 5. Layout (Important! If layout changes, PDF must rebuild)
    const layoutPart = JSON.stringify(layout || {});

    return `${templatePart}-${visibilityPart}-${workCount}-${eduCount}-${projectCount}-${skillCount}-${totalBullets}-${layoutPart}`;
};
