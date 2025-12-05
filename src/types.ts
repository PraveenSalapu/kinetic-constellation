export type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom';

export interface Section {
    id: string;
    type: SectionType;
    title: string;
    isVisible: boolean;
    order: number;
}

export type SectionConfig = Section;
export type SkillGroup = Resume['skills'][number];
export type ExperienceItem = Resume['experience'][number];
export type EducationItem = Resume['education'][number];

export interface Resume {
    id: string;
    title: string;
    sections: Section[];
    personalInfo: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        website?: string;
        linkedin?: string;
        github?: string;
        customFields?: { label: string; value: string }[];
    };
    summary: string;
    experience: {
        id: string;
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        current: boolean;
        description: string[]; // Bullet points
        location?: string;
    }[];
    education: {
        id: string;
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startDate: string;
        endDate: string;
        grade?: string;
    }[];
    skills: {
        id: string;
        category: string;
        items: string[];
    }[];
    projects: {
        id: string;
        name: string;
        description: string;
        technologies: string[];
        link?: string;
        github?: string;
        bullets?: string[];
    }[];
    certifications: {
        id: string;
        name: string;
        issuer: string;
        date: string;
        link?: string;
    }[];
    selectedTemplate?: 'modern' | 'classic' | 'minimalist';
    selectedFont?: 'professional' | 'modern' | 'technical';
    pageSize?: 'A4' | 'LETTER';
    layout?: {
        fontSize: number; // pt
        lineHeight: number; // unitless multiplier
        sectionSpacing: number; // mm
        nameSize?: number; // pt (font size for name header)
        contactSize?: number; // pt (font size for contact info)
        margin: {
            top: number; // mm
            right: number; // mm
            bottom: number; // mm
            left: number; // mm
        };
    };
}

export interface UserProfile {
    id: string;
    name: string;
    masterResume: Resume;
    tailoredResumes: Resume[];
}

export interface TailorResponse {
    tailoredSummary: string;
    missingHardSkills: string[];
    reasoning: string;
    improvedExperience?: {
        experienceId: string;
        revisedBullets: {
            original: string;
            new: string;
            reason: string;
        }[];
        recommendedBullets: {
            bullet: string;
            reason: string;
        }[];
    }[];
    projectSuggestions: {
        title: string;
        description: string;
        technologies: string[];
        reason: string;
    }[];
}

export interface MatchScoreResponse {
    score: number;
    missingKeywords: string[];
    criticalFeedback: string;
}

export interface BulletPointResponse {
    original: string;
    improved: string;
    explanation: string;
}
