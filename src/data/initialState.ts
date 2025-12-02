import type { Resume } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const initialResume: Resume = {
    id: uuidv4(),
    title: 'Untitled Resume',
    sections: [
        { id: 'personal', type: 'personal', title: 'Personal Information', isVisible: true, order: 0 },
        { id: 'summary', type: 'summary', title: 'Professional Summary', isVisible: true, order: 1 },
        { id: 'experience', type: 'experience', title: 'Experience', isVisible: true, order: 2 },
        { id: 'education', type: 'education', title: 'Education', isVisible: true, order: 3 },
        { id: 'skills', type: 'skills', title: 'Skills', isVisible: true, order: 4 },
        { id: 'projects', type: 'projects', title: 'Projects', isVisible: true, order: 5 },
        { id: 'certifications', type: 'certifications', title: 'Certifications', isVisible: true, order: 6 },
    ],
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    selectedTemplate: 'modern',
    layout: {
        fontSize: 10,
        lineHeight: 1.4,
        sectionSpacing: 5,
        margin: {
            top: 15,
            right: 15,
            bottom: 15,
            left: 15
        }
    }
};
