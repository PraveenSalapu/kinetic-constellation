
// API Service for backend communication
import { supabase } from './supabase';

const API_BASE = 'http://localhost:3001';

// Make authenticated API request
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Handle specific error cases if needed
  }

  return response;
}

// Profile API calls
export async function getProfiles(): Promise<any[]> {
  const response = await fetchWithAuth('/api/profiles');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profiles');
  return data.profiles;
}

export async function createProfile(name: string, resumeData: any): Promise<any> {
  const response = await fetchWithAuth('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ name, data: resumeData }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create profile');
  return data.profile;
}

export async function updateProfile(id: string, updates: { name?: string; data?: any; isActive?: boolean }): Promise<any> {
  const response = await fetchWithAuth(`/api/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update profile');
  return data.profile;
}

export async function deleteProfile(id: string): Promise<void> {
  const response = await fetchWithAuth(`/api/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete profile');
  }
}
