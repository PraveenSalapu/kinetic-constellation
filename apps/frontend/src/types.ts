export type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'custom';

export interface Section {
    id: string;
    type: SectionType;
    title: string;
    isVisible: boolean;
    order: number;
}

export type SectionConfig = Section;

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
    customFields?: { label: string; value: string }[];
}

export interface ExperienceItem {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
    location?: string;
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade?: string;
}

export interface SkillGroup {
    id: string;
    category: string;
    items: string[];
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
    bullets?: string[];
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
}

export interface LayoutSettings {
    fontFamily?: string;
    fontSize: number;
    lineHeight: number;
    sectionSpacing: number;
    nameSize?: number;
    contactSize?: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export interface TailoringJob {
    company: string;
    title: string;
    description: string;
    link?: string;
}

// Demographics data for EEO and application logistics
export interface Demographics {
    // EEO Fields
    gender?: string;
    pronouns?: string;
    isHispanic?: string;
    race?: string;
    isLGBTQ?: string;
    sexualOrientation?: string;
    veteranStatus?: string;
    disabilityStatus?: string;
    // Application Logistics
    availability?: string;
    salaryExpectation?: string;
    relocation?: string;
    // Authorization
    workAuthorization?: string;
    requiresSponsorship?: boolean;
}

// ATS Scan results
export interface AtsScan {
    score: number;
    issues: {
        type: 'error' | 'warning' | 'info' | 'success';
        message: string;
        field?: string;
    }[];
    keywords?: string[];
    suggestions?: string[];
    missingKeywords?: string[];
}

export interface Resume {
    id: string;
    title: string;
    sections: Section[];
    personalInfo: PersonalInfo;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: SkillGroup[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    selectedTemplate?: 'modern' | 'classic' | 'minimalist';
    selectedFont?: 'professional' | 'modern' | 'technical';
    pageSize?: 'A4' | 'LETTER';
    layout?: LayoutSettings;
    // Tailoring State
    isTailoring?: boolean;
    tailoringJob?: TailoringJob;
    originalResume?: Resume;
    // Generated cover letter for autofill
    generatedCoverLetter?: string;
    // User data
    demographics?: Demographics;
    atsScan?: AtsScan;
}

export type SkillGroupType = SkillGroup;

export interface UserProfile {
    id: string;
    name: string;
    masterResume: Resume;
    tailoredResumes: Resume[];
}

export interface TailorResponse {
    tailoredSummary: string;
    missingHardSkills: { name: string; category: string }[];
    reasoning: string;
    jobTitle?: string;
    company?: string;
    improvedExperience?: {
        experienceId: string;
        revisedBullets: {
            original: string;
            new: string;
            reason: string;
        }[];
        suggestedAdditions: {
            bullet: string;
            reason: string;
        }[];
        bulletsToDrop: {
            original: string;
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

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

export interface Job {
    id?: string;
    company: string;
    title: string;
    link: string;
    match_score: number;
    // Application Logistics
    availability?: string;
    salaryExpectation?: string;
    relocation?: string;
    pronouns?: string;
    // Detailed EEO (Reference)
    isLGBTQ?: string;
    sexualOrientation?: string;
    isHispanic?: string;
    missing_skills: string[];
    summary: string;
    description?: string;
    location?: string;
    created_at?: string;
    // Job metadata
    experienceLevel?: string;
    jobType?: string;
    category?: string;
    salary?: string;
}
