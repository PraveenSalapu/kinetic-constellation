import type { Resume } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { initialResume } from '../data/initialState';
import * as api from './api';

export interface UserProfile {
    id: string;
    name: string;
    data: Resume;
    updatedAt: number;
    isActive: boolean;
}

const STORAGE_KEY_PROFILES = 'kinetic_profiles_v1';
const MAX_PROFILES = 4;

// Check if user is authenticated
import { supabase } from './supabase';

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
};

// ============ LOCAL STORAGE OPERATIONS (fallback when not authenticated) ============

const getLocalProfiles = (): UserProfile[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
        if (!stored) {
            return [];
        }
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load local profiles:', error);
        return [];
    }
};

const saveLocalProfiles = (profiles: UserProfile[]): void => {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
};

// ============ API OPERATIONS (when authenticated) ============

// Convert API profile to UserProfile format
const apiToUserProfile = (apiProfile: any): UserProfile => ({
    id: apiProfile.id,
    name: apiProfile.name,
    data: apiProfile.data,
    updatedAt: apiProfile.updatedAt ? new Date(apiProfile.updatedAt).getTime() : Date.now(),
    isActive: apiProfile.isActive || false,
});

// ============ UNIFIED PROFILE OPERATIONS ============

export const getAllProfiles = async (): Promise<UserProfile[]> => {
    if (await isAuthenticated()) {
        try {
            const apiProfiles = await api.getProfiles();
            const profiles = (apiProfiles as any[]).map(apiToUserProfile);
            // Update local cache
            saveLocalProfiles(profiles);
            return profiles;
        } catch (error) {
            console.warn('Failed to fetch profiles from API, falling back to local:', error);
            // Fallback to local
            return getLocalProfiles();
        }
    }
    return getLocalProfiles();
};

// Sync version for backwards compatibility (uses cached/local data)
export const getAllProfilesSync = (): UserProfile[] => {
    return getLocalProfiles();
};

export const createProfile = async (name: string, data: Resume = initialResume): Promise<UserProfile> => {
    const clonedData = JSON.parse(JSON.stringify(data));
    const resumeData = { ...clonedData, id: uuidv4() };

    if (await isAuthenticated()) {
        try {
            const apiProfile = await api.createProfile(name, resumeData);
            const profile = apiToUserProfile(apiProfile);

            // Also save locally as cache
            const localProfiles = getLocalProfiles();
            localProfiles.push(profile);
            saveLocalProfiles(localProfiles);

            return profile;
        } catch (error) {
            console.error('Failed to create profile via API:', error);
            throw error;
        }
    }

    // Local only
    const localProfiles = getLocalProfiles();
    if (localProfiles.length >= MAX_PROFILES) {
        throw new Error(`Maximum of ${MAX_PROFILES} profiles reached.`);
    }

    const newProfile: UserProfile = {
        id: uuidv4(),
        name,
        data: resumeData,
        updatedAt: Date.now(),
        isActive: localProfiles.length === 0, // First profile is active
    };

    localProfiles.push(newProfile);
    saveLocalProfiles(localProfiles);
    return newProfile;
};

export const saveProfile = async (profile: UserProfile): Promise<void> => {
    if (await isAuthenticated()) {
        try {
            await api.updateProfile(profile.id, {
                name: profile.name,
                data: profile.data,
                isActive: profile.isActive,
            });
        } catch (error) {
            console.error('Failed to save profile via API:', error);
        }
    }

    // Always update local cache
    const profiles = getLocalProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);

    if (index >= 0) {
        profiles[index] = { ...profile, updatedAt: Date.now() };
    } else {
        if (profiles.length >= MAX_PROFILES) {
            // If it's a new profile being saved (unlikely via this method but possible)
            if (index === -1) profiles.push({ ...profile, updatedAt: Date.now() });
        }
    }

    saveLocalProfiles(profiles);
};

export const deleteProfile = async (id: string): Promise<void> => {
    // If authenticated, we rely on API mostly, but check local for "last profile" rule locally for speed or rely on API error
    const authenticated = await isAuthenticated();
    const profiles = authenticated ? await getAllProfiles() : getLocalProfiles();

    if (profiles.length <= 1) {
        throw new Error('Cannot delete the last profile.');
    }

    if (authenticated) {
        try {
            await api.deleteProfile(id);
        } catch (error) {
            console.error('Failed to delete profile via API:', error);
            throw error;
        }
    }

    // Update local cache
    const localProfiles = getLocalProfiles();
    const filtered = localProfiles.filter(p => p.id !== id);

    // If we deleted the active profile, make the first one active
    const wasActive = localProfiles.find(p => p.id === id)?.isActive;
    if (wasActive && filtered.length > 0) {
        filtered[0].isActive = true;
        if (await isAuthenticated()) {
            try {
                await api.updateProfile(filtered[0].id, { isActive: true });
            } catch (error) {
                console.error('Failed to update active profile via API:', error);
            }
        }
    }

    saveLocalProfiles(filtered);
};

export const setActiveProfileId = async (id: string): Promise<UserProfile | null> => {
    // const profiles = isAuthenticated() ? await getAllProfiles() : getLocalProfiles(); // Unused
    let activeProfile: UserProfile | null = null;

    if (await isAuthenticated()) {
        try {
            await api.updateProfile(id, { isActive: true });
        } catch (e) {
            console.error('Failed to set active profile via API', e);
        }
    }

    // Update local cache
    const localProfiles = getLocalProfiles();
    const updated = localProfiles.map(p => {
        const isActive = p.id === id;
        if (isActive) activeProfile = { ...p, isActive: true };
        return {
            ...p,
            isActive
        };
    });

    saveLocalProfiles(updated);
    return activeProfile;
};

export const getActiveProfile = async (): Promise<UserProfile> => {
    const profiles = await getAllProfiles();
    const active = profiles.find(p => p.isActive);

    if (active) return active;

    // Fallback if no active profile found
    if (profiles.length > 0) {
        await setActiveProfileId(profiles[0].id);
        return { ...profiles[0], isActive: true };
    }

    // No profiles exist - create default
    const defaultProfile = await createProfile('Default Profile');
    await setActiveProfileId(defaultProfile.id);
    return { ...defaultProfile, isActive: true };
};

// Sync version for backwards compatibility
export const getActiveProfileSync = (): UserProfile => {
    const profiles = getLocalProfiles();
    const active = profiles.find(p => p.isActive);

    if (active) return active;

    if (profiles.length > 0) {
        profiles[0].isActive = true;
        saveLocalProfiles(profiles);
        return profiles[0];
    }

    // Create default locally
    const defaultProfile: UserProfile = {
        id: uuidv4(),
        name: 'Default Profile',
        data: initialResume,
        updatedAt: Date.now(),
        isActive: true,
    };
    saveLocalProfiles([defaultProfile]);
    return defaultProfile;
};

// Sync profiles from API to local storage (call after login)
export const syncProfilesFromApi = async (): Promise<void> => {
    if (!(await isAuthenticated())) return;

    try {
        const apiProfiles = await api.getProfiles();
        const profiles = (apiProfiles as any[]).map(apiToUserProfile);
        saveLocalProfiles(profiles);
    } catch (error) {
        console.error('Failed to sync profiles from API:', error);
    }
};

export const updateActiveProfileData = async (data: Resume): Promise<void> => {
    const active = getActiveProfileSync();
    const updatedProfile = { ...active, data, updatedAt: Date.now() };

    // Update local storage manually
    const profiles = getLocalProfiles();
    const index = profiles.findIndex(p => p.id === active.id);
    if (index >= 0) {
        profiles[index] = updatedProfile;
        saveLocalProfiles(profiles);
    }

    // Sync to API
    if (await isAuthenticated()) {
        try {
            await api.updateProfile(active.id, { data });
        } catch (e) {
            console.error('Failed to sync profile update to API:', e);
        }
    }
};

export const resetApplication = (): void => {
    localStorage.clear();
    window.location.reload();
};

export const getProfileFromApi = async (): Promise<UserProfile | null> => {
    if (!(await isAuthenticated())) return null;
    try {
        const profiles = await api.getProfiles();
        const active = (profiles as any[]).find((p: any) => p.isActive);
        const target = active || profiles[0];

        if (target) {
            return apiToUserProfile(target);
        }
        return null;
    } catch (e) {
        console.error('Failed to get profile from API:', e);
        return null;
    }
};