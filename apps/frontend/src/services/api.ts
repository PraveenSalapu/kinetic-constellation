// API Service for backend communication

const API_BASE = 'http://localhost:3001';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

interface ApiError {
  error: string;
}

// Store tokens in memory and localStorage
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export function getAccessToken(): string | null {
  return accessToken;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// Register a new user
export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Registration failed');
  }

  const authData = data as AuthResponse;
  setTokens(authData.accessToken, authData.refreshToken);
  localStorage.setItem('user', JSON.stringify(authData.user));

  return authData;
}

// Login user
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || 'Login failed');
  }

  const authData = data as AuthResponse;
  setTokens(authData.accessToken, authData.refreshToken);
  localStorage.setItem('user', JSON.stringify(authData.user));

  return authData;
}

// Logout user
export async function logout(): Promise<void> {
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore logout API errors
    }
  }
  clearTokens();
}

// Refresh access token
export async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json() as AuthResponse;
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// Make authenticated API request
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed && accessToken) {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers,
        },
      });
    } else {
      throw new Error('Session expired');
    }
  }

  return response;
}

// Profile API calls
export async function getProfiles(): Promise<unknown[]> {
  const response = await fetchWithAuth('/api/profiles');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profiles');
  return data.profiles;
}

export async function createProfile(name: string, resumeData: unknown): Promise<unknown> {
  const response = await fetchWithAuth('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ name, data: resumeData }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create profile');
  return data.profile;
}

export async function updateProfile(id: string, updates: { name?: string; data?: unknown; isActive?: boolean }): Promise<unknown> {
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
