import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Resume, SectionConfig } from '../types';
import { initialResume } from '../data/initialState';

type ResumeState = Resume & {
    selectedTemplate?: 'modern' | 'classic' | 'minimalist';
    isTailoring?: boolean;
    originalResume?: Resume | null;
    history?: ResumeState[];
    historyIndex?: number;
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
    | { type: 'SET_FONT'; payload: 'professional' | 'modern' | 'technical' }
    | { type: 'SET_PAGE_SIZE'; payload: 'A4' | 'LETTER' }
    | { type: 'START_TAILORING' }
    | { type: 'DISCARD_TAILORING' }
    | { type: 'APPLY_LAYOUT'; payload: Resume['layout'] }
    | { type: 'UNDO' }
    | { type: 'REDO' };

const ResumeContext = createContext<{
    resume: ResumeState;
    dispatch: React.Dispatch<ResumeAction>;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
} | undefined>(undefined);

// Helper to save state to history
const saveToHistory = (state: ResumeState): ResumeState => {
    const history = state.history || [];
    const historyIndex = state.historyIndex ?? -1;

    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);

    // Add current state to history (excluding history and historyIndex)
    const { history: _, historyIndex: __, ...stateToSave } = state;
    newHistory.push(stateToSave as ResumeState);

    // Keep only last 50 states to avoid memory issues
    const limitedHistory = newHistory.slice(-50);

    return {
        ...state,
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1,
    };
};

const resumeReducer = (state: ResumeState, action: ResumeAction): ResumeState => {
    // Actions that should be tracked in history
    const trackableActions = [
        'UPDATE_PERSONAL_INFO',
        'UPDATE_SUMMARY',
        'ADD_ITEM',
        'DELETE_ITEM',
        'UPDATE_ITEM',
        'REORDER_SECTIONS',
        'APPLY_LAYOUT',
    ];

    let newState: ResumeState;

    switch (action.type) {
        case 'SET_RESUME':
            return { ...state, ...action.payload };

        case 'UPDATE_PERSONAL_INFO':
            newState = { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
            return saveToHistory(newState);

        case 'UPDATE_SUMMARY':
            newState = { ...state, summary: action.payload };
            return saveToHistory(newState);

        case 'ADD_ITEM':
            newState = {
                ...state,
                [action.payload.sectionId]: [
                    ...(state[action.payload.sectionId as keyof ResumeState] as any[]),
                    action.payload.item,
                ],
            };
            return saveToHistory(newState);

        case 'DELETE_ITEM':
            newState = {
                ...state,
                [action.payload.sectionId]: (state[action.payload.sectionId as keyof ResumeState] as any[]).filter(
                    (item) => item.id !== action.payload.itemId
                ),
            };
            return saveToHistory(newState);

        case 'UPDATE_ITEM':
            newState = {
                ...state,
                [action.payload.sectionId]: (state[action.payload.sectionId as keyof ResumeState] as any[]).map((item) =>
                    item.id === action.payload.itemId ? { ...item, ...action.payload.item } : item
                ),
            };
            return saveToHistory(newState);

        case 'REORDER_SECTIONS':
            newState = { ...state, sections: action.payload };
            return saveToHistory(newState);

        case 'RESET_RESUME':
            return { ...initialResume, selectedTemplate: 'modern', history: [], historyIndex: -1 };

        case 'SET_TEMPLATE':
            return { ...state, selectedTemplate: action.payload };

        case 'SET_FONT':
            return { ...state, selectedFont: action.payload };

        case 'SET_PAGE_SIZE':
            return { ...state, pageSize: action.payload };

        case 'START_TAILORING':
            return {
                ...state,
                isTailoring: true,
                originalResume: JSON.parse(JSON.stringify(state))
            };

        case 'DISCARD_TAILORING':
            if (!state.originalResume) return state;
            return {
                ...state.originalResume,
                isTailoring: false,
                originalResume: null
            } as ResumeState;

        case 'APPLY_LAYOUT':
            console.log('APPLY_LAYOUT action triggered with:', action.payload);
            newState = { ...state, layout: action.payload };
            return saveToHistory(newState);

        case 'UNDO':
            const history = state.history || [];
            const historyIndex = state.historyIndex ?? -1;

            if (historyIndex > 0) {
                const previousState = history[historyIndex - 1];
                return {
                    ...previousState,
                    history: state.history,
                    historyIndex: historyIndex - 1,
                };
            }
            return state;

        case 'REDO':
            const historyRedo = state.history || [];
            const historyIndexRedo = state.historyIndex ?? -1;

            if (historyIndexRedo < historyRedo.length - 1) {
                const nextState = historyRedo[historyIndexRedo + 1];
                return {
                    ...nextState,
                    history: state.history,
                    historyIndex: historyIndexRedo + 1,
                };
            }
            return state;

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
            const profileData = activeProfile.data;

            // Migration: Ensure layout exists and has correct structure
            const migratedLayout = profileData.layout && typeof profileData.layout.fontSize === 'number'
                ? profileData.layout
                : initialResume.layout;

            // Migration: Ensure selectedTemplate exists
            const migratedTemplate = (profileData as any).selectedTemplate || 'modern';

            console.log('Loading profile with layout:', migratedLayout);

            return {
                ...profileData,
                selectedTemplate: migratedTemplate,
                layout: migratedLayout
            } as ResumeState;
        } catch (error) {
            console.error('Failed to load resume from storage:', error);
            return { ...initialResume, selectedTemplate: 'modern' } as ResumeState;
        }
    });

    // Save changes to the active profile whenever resume state changes
    // BUT ONLY if we are NOT in tailoring mode
    useEffect(() => {
        if (resume.isTailoring) {
            console.log('Skipping save - in tailoring mode');
            return;
        }

        try {
            console.log('Saving resume to storage with layout:', resume.layout);
            updateActiveProfileData(resume);
        } catch (error) {
            console.error('Failed to save resume to storage:', error);
        }
    }, [resume]);

    // Undo/Redo helpers
    const canUndo = (resume.historyIndex ?? -1) > 0;
    const canRedo = (resume.historyIndex ?? -1) < (resume.history?.length ?? 0) - 1;

    const undo = () => dispatch({ type: 'UNDO' });
    const redo = () => dispatch({ type: 'REDO' });

    return (
        <ResumeContext.Provider value={{ resume, dispatch, canUndo, canRedo, undo, redo }}>
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
