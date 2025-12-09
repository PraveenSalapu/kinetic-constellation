import { GoogleGenAI } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import type { Resume, ExperienceItem, EducationItem, SkillGroup, ProjectItem, CertificationItem } from '../types';
import { initialResume } from '../data/initialState';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.0-flash';

const cleanJsonOutput = (text: string): string => {
    let cleaned = text.trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
};

export const parseResumeWithAI = async (resumeText: string): Promise<Resume> => {
    if (!API_KEY) throw new Error('API Key missing');

    const prompt = `
    You are an expert Resume Parser. Extract structured data from the resume text below to populate a JSON Resume profile.
    
    RESUME TEXT:
    ${resumeText}
    
    CRITICAL INSTRUCTIONS:
    1. Return ONLY valid JSON.
    2. Follow this exact schema structure (matching the Resume interface):
    {
        "personalInfo": {
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "website": "string",
            "linkedin": "string"
        },
        "title": "string (Professional Title)",
        "summary": "string",
        "experience": [
            {
                "id": "uuid",
                "company": "string",
                "position": "string",
                "startDate": "YYYY-MM",
                "endDate": "YYYY-MM or Present",
                "current": boolean,
                "description": ["bullet 1", "bullet 2"],
                "location": "string"
            }
        ],
        "education": [
            {
                "id": "uuid",
                "institution": "string",
                "degree": "string",
                "fieldOfStudy": "string",
                "startDate": "YYYY-MM",
                "endDate": "YYYY-MM"
            }
        ],
        "skills": [
            {
                "id": "uuid",
                "category": "string",
                "items": ["skill1", "skill2"]
            }
        ],
        "projects": [
            {
                "id": "uuid",
                "name": "string",
                "description": "string",
                "technologies": ["tech1", "tech2"],
                "link": "string",
                "github": "string"
            }
        ],
        "certifications": [
            {
                "id": "uuid",
                "name": "string",
                "issuer": "string",
                "date": "YYYY-MM"
            }
        ]
    }
    
    3. If a field is missing, omit it or use empty strings/arrays.
    4. Ensure dates are in YYYY-MM format.
    `;

    try {
        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");

        const parsed = JSON.parse(cleanJsonOutput(text));

        // Merge with initialResume to ensure all required fields and IDs exist
        // We regenerate IDs for all list items to ensure uniqueness and prevent key collisions
        return {
            ...initialResume,
            ...parsed,
            id: initialResume.id, // Keep original ID or generate new? createProfile handles ID.
            experience: Array.isArray(parsed.experience) ? parsed.experience.map((e: Partial<ExperienceItem>) => ({ ...e, id: uuidv4() } as ExperienceItem)) : [],
            education: Array.isArray(parsed.education) ? parsed.education.map((e: Partial<EducationItem>) => ({ ...e, id: uuidv4() } as EducationItem)) : [],
            skills: Array.isArray(parsed.skills) ? parsed.skills.map((s: Partial<SkillGroup>) => ({ ...s, id: uuidv4() } as SkillGroup)) : [],
            projects: Array.isArray(parsed.projects) ? parsed.projects.map((p: Partial<ProjectItem>) => ({
                ...p,
                id: uuidv4(),
                technologies: Array.isArray(p.technologies) ? p.technologies : []
            } as ProjectItem)) : [],
            certifications: Array.isArray(parsed.certifications) ? parsed.certifications.map((c: Partial<CertificationItem>) => ({ ...c, id: uuidv4() } as CertificationItem)) : [],
        };
    } catch (error) {
        console.error('AI Parsing failed:', error);
        throw new Error('Failed to parse resume');
    }
};
