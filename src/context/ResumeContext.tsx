import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Resume, SectionConfig } from '../types';
import { initialResume } from '../data/initialState';

type ResumeState = Resume & {
    selectedTemplate?: 'modern' | 'classic' | 'minimalist';
    isTailoring?: boolean;
    originalResume?: Resume | null;
};

type ResumeAction =
    | { type: 'SET_RESUME'; payload: Resume }
    | { type: 'UPDATE_PERSONAL_INFO'; payload: Partial<Resume['personalInfo']> }
    | { type: 'UPDATE_SUMMARY'; payload: string }
    | { type: 'ADD_ITEM'; payload: { sectionId: keyof Resume; item: any } }
    | { type: 'DELETE_ITEM'; payload: { sectionId: keyof Resume; itemId: string } }
    | { type: 'UPDATE_ITEM'; payload: { sectionId: keyof Resume; itemId: string; item: any } }
    | { type: 'REORDER_SECTIONS'; payload: SectionConfig[] }
    | { type: 'RESET_RESUME' }
    | { type: 'SET_TEMPLATE'; payload: 'modern' | 'classic' | 'minimalist' }
    | { type: 'START_TAILORING' }
    | { type: 'DISCARD_TAILORING' }
    | { type: 'APPLY_LAYOUT'; payload: Resume['layout'] };

const ResumeContext = createContext<{
    resume: ResumeState;
    dispatch: React.Dispatch<ResumeAction>;
} | undefined>(undefined);

const resumeReducer = (state: ResumeState, action: ResumeAction): ResumeState => {
    switch (action.type) {
        case 'SET_RESUME':
            return { ...state, ...action.payload };
        case 'UPDATE_PERSONAL_INFO':
            return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
        case 'UPDATE_SUMMARY':
            return { ...state, summary: action.payload };
        case 'ADD_ITEM':
            return {
                ...state,
                [action.payload.sectionId]: [
                    ...(state[action.payload.sectionId as keyof ResumeState] as any[]),
                    action.payload.item,
                ],
            };
        case 'DELETE_ITEM':
            return {
                ...state,
                [action.payload.sectionId]: (state[action.payload.sectionId as keyof ResumeState] as any[]).filter(
                    (item) => item.id !== action.payload.itemId
                ),
            };
        case 'UPDATE_ITEM':
            return {
                ...state,
                [action.payload.sectionId]: (state[action.payload.sectionId as keyof ResumeState] as any[]).map((item) =>
                    item.id === action.payload.itemId ? { ...item, ...action.payload.item } : item
                ),
            };
        case 'REORDER_SECTIONS':
            return { ...state, sections: action.payload };
        case 'RESET_RESUME':
            return { ...initialResume, selectedTemplate: 'modern' };
        case 'SET_TEMPLATE':
            return { ...state, selectedTemplate: action.payload };
        case 'START_TAILORING':
            return {
                ...state,
                isTailoring: true,
                originalResume: JSON.parse(JSON.stringify(state)) // Deep copy
            };
        case 'DISCARD_TAILORING':
            if (!state.originalResume) return state;
            return {
                ...state.originalResume,
                isTailoring: false,
                originalResume: null
            } as ResumeState;
        case 'APPLY_LAYOUT':
            return {
                ...state,
                layout: action.payload
            };
        default:
            return state;
    }
};

import { getActiveProfile, updateActiveProfileData } from '../services/storage';

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state from the active profile in storage
    const [resume, dispatch] = useReducer(resumeReducer, initialResume, () => {
        try {
            const activeProfile = getActiveProfile();
            return { ...activeProfile.data, selectedTemplate: (activeProfile.data as any).selectedTemplate || 'modern' } as ResumeState;
        } catch (error) {
            console.error('Failed to load resume from storage:', error);
            return { ...initialResume, selectedTemplate: 'modern' } as ResumeState;
        }
    });

    // Save changes to the active profile whenever resume state changes
    // BUT ONLY if we are NOT in tailoring mode
    useEffect(() => {
        if (resume.isTailoring) return;

        try {
            updateActiveProfileData(resume);
        } catch (error) {
            console.error('Failed to save resume to storage:', error);
        }
    }, [resume]);

    return (
        <ResumeContext.Provider value={{ resume, dispatch }}>
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error('useResume must be used within a ResumeProvider');
    }
    return context;
};
