// API request/response types

import type { Resume } from './resume';
import type { TailorResponse, MatchScoreResponse } from './job';

// Auth types
export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// Profile types
export interface ProfileResponse {
  id: string;
  userId: string;
  name: string;
  data: Resume;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileRequest {
  name: string;
  data: Resume;
}

export interface UpdateProfileRequest {
  name?: string;
  data?: Resume;
  isActive?: boolean;
}

// Tailor types
export interface TailorRequest {
  profileId: string;
  jobDescription: string;
}

export interface TailorApiResponse {
  success: boolean;
  data: TailorResponse;
}

export interface ATSScoreRequest {
  profileId: string;
  jobDescription: string;
}

export interface ATSScoreResponse {
  success: boolean;
  data: MatchScoreResponse;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Toast types (UI)
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
