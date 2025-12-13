// Background Service Worker
// Handles API communication, token management, and message routing

// API URL - injected at build time via Vite's define or falls back to localhost
declare const __API_BASE__: string | undefined;
const API_BASE = typeof __API_BASE__ !== 'undefined' ? __API_BASE__ : 'http://localhost:3001';

interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}

// Get stored authentication
async function getStoredAuth(): Promise<StoredAuth | null> {
  const result = await chrome.storage.sync.get(['authToken', 'refreshToken', 'expiresAt', 'user']);
  if (!result.authToken) return null;

  return {
    accessToken: result.authToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt || 0,
    user: result.user,
  };
}

// Store authentication
async function storeAuth(auth: StoredAuth): Promise<void> {
  await chrome.storage.sync.set({
    authToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: auth.expiresAt,
    user: auth.user,
  });
}

// Clear authentication
async function clearAuth(): Promise<void> {
  await chrome.storage.sync.remove(['authToken', 'refreshToken', 'expiresAt', 'user']);
}

// Check if token is expired
function isTokenExpired(expiresAt: number): boolean {
  // Add 60 second buffer
  return Date.now() >= (expiresAt - 60000);
}

// Get valid access token
// Note: Token refresh is handled by Supabase on the web app side.
// The extension syncs the session from the web app, which includes an already-valid token.
// If the token is expired, user needs to re-visit the web app to get a fresh session.
async function getValidToken(): Promise<string | null> {
  const auth = await getStoredAuth();
  if (!auth) {
    console.log('[CareerFlow] No auth stored');
    return null;
  }

  // For Supabase tokens synced from web app, we trust the token as long as it exists
  // The web app handles refresh automatically, and we sync on each visit
  // Only clear if significantly expired (more than 1 hour past expiry)
  if (auth.expiresAt && isTokenExpired(auth.expiresAt)) {
    const hoursPastExpiry = (Date.now() - auth.expiresAt) / (1000 * 60 * 60);
    if (hoursPastExpiry > 1) {
      console.log('[CareerFlow] Token expired over 1 hour ago, clearing auth');
      await clearAuth();
      return null;
    }
    // Token might still work, Supabase tokens have some grace period
    console.log('[CareerFlow] Token may be expired, but trying anyway');
  }

  return auth.accessToken;
}

// Make authenticated API request
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  // If unauthorized, clear auth and throw - user needs to re-sync from web app
  if (response.status === 401) {
    console.log('[CareerFlow] Got 401, clearing auth. User needs to re-login via web app.');
    await clearAuth();
    throw new Error('Session expired. Please log in again via the CareerFlow web app.');
  }

  return response;
}

// Message handlers
async function handleLogin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: unknown }> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    const auth: StoredAuth = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
      user: data.user,
    };

    await storeAuth(auth);
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

async function handleLogout(): Promise<{ success: boolean }> {
  const auth = await getStoredAuth();
  if (auth?.refreshToken) {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });
    } catch {
      // Ignore logout API errors
    }
  }
  await clearAuth();
  return { success: true };
}

async function handleGetProfiles(): Promise<{ profiles?: unknown[]; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/profiles');
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch profiles' };
    }

    return { profiles: data.profiles };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

async function handleGetProfile(profileId: string): Promise<{ profile?: unknown; error?: string }> {
  try {
    const response = await fetchWithAuth(`/api/profiles/${profileId}`);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to fetch profile' };
    }

    return { profile: data.profile };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

async function handleTailorResume(profileId: string, jobDescription: string): Promise<{ data?: unknown; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/tailor/analyze', {
      method: 'POST',
      body: JSON.stringify({ profileId, jobDescription }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Failed to tailor resume' };
    }

    return { data: data.data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Fetch resume PDF as base64
async function handleGetResumePDF(profileId: string): Promise<{ pdf?: string; filename?: string; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE}/api/profiles/${profileId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || 'Failed to generate PDF' };
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'Resume.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) filename = match[1];
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return { pdf: base64, filename };
  } catch (error) {
    console.error('[CareerFlow] PDF fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Fetch tailored resume PDF as base64 (from pending autofill record)
async function handleGetTailoredPDF(autofillId: string): Promise<{ pdf?: string; filename?: string; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE}/api/autofill/pending/${autofillId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || 'Failed to generate tailored PDF' };
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'Tailored_Resume.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) filename = match[1];
    }

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return { pdf: base64, filename };
  } catch (error) {
    console.error('[CareerFlow] Tailored PDF fetch error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Check for pending autofill for a URL
async function handleCheckPendingAutofill(url: string): Promise<{ found: boolean; autofill?: unknown; error?: string }> {
  try {
    const token = await getValidToken();
    if (!token) {
      return { found: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_BASE}/api/autofill/pending?url=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { found: false };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[CareerFlow] Check pending autofill error:', error);
    return { found: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Mark autofill as completed
async function handleCompleteAutofill(autofillId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetchWithAuth(`/api/autofill/pending/${autofillId}/complete`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to complete autofill' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Save a job from extension for tailoring
async function handleSaveJob(jobData: {
  jobUrl: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  platform?: string;
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/autofill/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save job' };
    }

    return { success: true, jobId: data.jobId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

async function handleCreateProfile(name: string, data: unknown): Promise<{ success: boolean; profile?: unknown; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({ name, data }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create profile' };
    }

    return { success: true, profile: result.profile };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

async function handleCheckAuth(): Promise<{ authenticated: boolean; user?: unknown }> {
  const auth = await getStoredAuth();
  if (!auth) return { authenticated: false };

  // Verify token is still valid
  const token = await getValidToken();
  if (!token) return { authenticated: false };

  return { authenticated: true, user: auth.user };
}

// AI-powered job extraction fallback
async function handleExtractJobAI(
  url: string,
  partialData?: { title?: string; company?: string }
): Promise<{ data?: unknown; method?: string; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/scrape/extract', {
      method: 'POST',
      body: JSON.stringify({ url, partialData }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to extract job data' };
    }

    return { data: result.data, method: result.method };
  } catch (error) {
    console.error('[CareerFlow] AI extraction error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Generate AI essay responses for job application questions
interface EssayQuestion {
  id: string;
  question: string;
  fieldSelector: string;
  maxLength?: number;
  required?: boolean;
}

interface EssayResponse {
  questionId: string;
  response: string;
  wordCount: number;
  category: string;
  confidence: number;
}

async function handleGenerateEssays(
  profileId: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  questions: EssayQuestion[]
): Promise<{ responses?: EssayResponse[]; error?: string }> {
  try {
    const response = await fetchWithAuth('/api/tailor/essays', {
      method: 'POST',
      body: JSON.stringify({
        profileId,
        jobDescription,
        jobTitle,
        company,
        questions,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Failed to generate essay responses' };
    }

    return { responses: result.responses };
  } catch (error) {
    console.error('[CareerFlow] Essay generation error:', error);
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handleMessage = async () => {
    switch (message.type) {
      case 'LOGIN':
        return handleLogin(message.email, message.password);

      case 'SYNC_SESSION':
        if (message.session && message.session.access_token) {
          const auth: StoredAuth = {
            accessToken: message.session.access_token,
            refreshToken: message.session.refresh_token,
            expiresAt: (message.session.expires_at || (Date.now() / 1000) + 3600) * 1000,
            user: message.session.user,
          };
          await storeAuth(auth);
          return { success: true };
        }
        return { success: false, error: 'Invalid session data' };

      case 'LOGOUT':
        return handleLogout();

      case 'CHECK_AUTH':
        return handleCheckAuth();

      case 'GET_PROFILES':
        return handleGetProfiles();

      case 'GET_PROFILE':
        return handleGetProfile(message.profileId);

      case 'CREATE_PROFILE':
        return handleCreateProfile(message.name, message.data);

      case 'TAILOR_RESUME':
        return handleTailorResume(message.profileId, message.jobDescription);

      case 'GET_RESUME_PDF':
        return handleGetResumePDF(message.profileId);

      case 'GET_TAILORED_PDF':
        return handleGetTailoredPDF(message.autofillId);

      case 'CHECK_PENDING_AUTOFILL':
        return handleCheckPendingAutofill(message.url);

      case 'COMPLETE_AUTOFILL':
        return handleCompleteAutofill(message.autofillId);

      case 'SAVE_JOB':
        return handleSaveJob(message.jobData);

      case 'EXTRACT_JOB_AI':
        return handleExtractJobAI(message.url, message.partialData);

      case 'GENERATE_ESSAYS':
        return handleGenerateEssays(
          message.profileId,
          message.jobDescription,
          message.jobTitle,
          message.company,
          message.questions
        );

      default:
        return { error: 'Unknown message type' };
    }
  };

  handleMessage().then(sendResponse);
  return true; // Keep channel open for async response
});

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[CareerFlow] Extension installed');
    // Could open onboarding page here
  }
});

console.log('[CareerFlow] Service worker started');
