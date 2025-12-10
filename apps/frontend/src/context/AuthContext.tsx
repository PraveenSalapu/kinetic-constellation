import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '../services/api';
import { syncProfilesFromApi } from '../services/storage';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = api.getAccessToken();

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Sync profiles from API on app load if authenticated
        syncProfilesFromApi().catch(console.error);
      } catch {
        api.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.user);
    // Sync profiles after login
    await syncProfilesFromApi();
  };

  const register = async (email: string, password: string) => {
    const response = await api.register(email, password);
    setUser(response.user);
    // New user - no profiles to sync yet
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
