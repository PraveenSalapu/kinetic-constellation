import type { Resume } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { initialResume } from '../data/initialState';

export interface UserProfile {
    id: string;
    name: string;
    data: Resume;
    updatedAt: number;
    isActive: boolean;
}

const STORAGE_KEY_PROFILES = 'kinetic_profiles_v1';
const MAX_PROFILES = 4;

export const getAllProfiles = (): UserProfile[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
        if (!stored) {
            // Initialize with default profile if none exists
            const defaultProfile: UserProfile = {
                id: uuidv4(),
                name: 'Default Profile',
                data: initialResume,
                updatedAt: Date.now(),
                isActive: true
            };
            localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify([defaultProfile]));
            return [defaultProfile];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load profiles:', error);
        return [];
    }
};

export const saveProfile = (profile: UserProfile): void => {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);

    if (index >= 0) {
        profiles[index] = { ...profile, updatedAt: Date.now() };
    } else {
        if (profiles.length >= MAX_PROFILES) {
            throw new Error(`Maximum of ${MAX_PROFILES} profiles reached.`);
        }
        profiles.push({ ...profile, updatedAt: Date.now() });
    }

    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
};

export const createProfile = (name: string, data: Resume = initialResume): UserProfile => {
    // Deep clone data to ensure no shared references
    const clonedData = JSON.parse(JSON.stringify(data));
    const newProfile: UserProfile = {
        id: uuidv4(),
        name,
        data: { ...clonedData, id: uuidv4() }, // Ensure new resume has unique ID
        updatedAt: Date.now(),
        isActive: false
    };
    saveProfile(newProfile);
    return newProfile;
};

export const deleteProfile = (id: string): void => {
    const profiles = getAllProfiles();
    if (profiles.length <= 1) {
        throw new Error('Cannot delete the last profile.');
    }

    const filtered = profiles.filter(p => p.id !== id);

    // If we deleted the active profile, make the first one active
    const wasActive = profiles.find(p => p.id === id)?.isActive;
    if (wasActive && filtered.length > 0) {
        filtered[0].isActive = true;
    }

    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(filtered));
};

export const setActiveProfileId = (id: string): UserProfile | null => {
    const profiles = getAllProfiles();
    let activeProfile: UserProfile | null = null;

    const updated = profiles.map(p => {
        if (p.id === id) {
            activeProfile = { ...p, isActive: true };
            return activeProfile;
        }
        return { ...p, isActive: false };
    });

    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
    return activeProfile;
};

export const getActiveProfile = (): UserProfile => {
    const profiles = getAllProfiles();
    const active = profiles.find(p => p.isActive);
    if (active) return active;

    // Fallback if no active profile found (shouldn't happen)
    if (profiles.length > 0) {
        profiles[0].isActive = true;
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
        return profiles[0];
    }

    // Fallback if no profiles exist at all
    const defaultProfile = createProfile('Default Profile');
    setActiveProfileId(defaultProfile.id);
    return defaultProfile;
};

export const updateActiveProfileData = (data: Resume): void => {
    const active = getActiveProfile();
    saveProfile({ ...active, data });
};

export const resetApplication = (): void => {
    localStorage.clear();
    window.location.reload();
};
