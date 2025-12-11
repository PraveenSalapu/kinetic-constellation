
import { fetchWithAuth } from './api';
// import { ApplicationRecord } from './database/mongodb'; // decoupling

export interface ApplicationRecord {
    id: string;
    userId: string;
    jobTitle: string;
    company: string;
    location?: string;
    salary?: {
        min?: number;
        max?: number;
        currency: string;
    };
    jobDescription?: string;
    jobUrl?: string;
    status: 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'withdrawn';
    appliedDate?: Date;
    lastUpdated: Date;
    source: string;
    resumeVersion?: string;
    resumeSnapshot?: any; // Simplified for now
    coverLetter?: string;
    timeline: {
        date: Date;
        status: string;
        notes?: string;
    }[];
    atsScore?: number;
    matchScore?: number;
    skillGaps?: string[];
    contacts?: any[];
    interviewNotes?: string[];
    questionsAsked?: string[];
    outcome?: any;
    tags: string[];
    notes: string;
}

// Map API response to ApplicationRecord
// Note: Backend returns camelCase keys as transformed, so we might not need heavy mapping
// But we should ensure dates are Date objects

function mapResponseToRecord(apiApp: any): ApplicationRecord {
    return {
        ...apiApp,
        appliedDate: apiApp.appliedDate ? new Date(apiApp.appliedDate) : undefined,
        lastUpdated: apiApp.updatedAt ? new Date(apiApp.updatedAt) : new Date(),
        // Ensure arrays are initialized
        tags: apiApp.tags || [],
        timeline: apiApp.timeline || [],
    };
}

export async function getApplications(): Promise<ApplicationRecord[]> {
    const response = await fetchWithAuth('/api/applications');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch applications');

    return data.applications.map(mapResponseToRecord);
}

export async function createApplication(appData: Partial<ApplicationRecord>): Promise<ApplicationRecord> {
    const response = await fetchWithAuth('/api/applications', {
        method: 'POST',
        body: JSON.stringify(appData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create application');

    // The API returns limited data on create (optimization), but let's assume success
    // or fetch fresh if needed. For now, return a basic record.
    return { ...appData, id: data.application.id } as ApplicationRecord;
}

export async function updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<void> {
    const response = await fetchWithAuth(`/api/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update application');
}

export async function deleteApplication(id: string): Promise<void> {
    const response = await fetchWithAuth(`/api/applications/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete application');
    }
}
