// Environment Configuration
// Centralized configuration for environment-specific URLs and settings

export const config = {
  // API Backend URL
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',

  // Frontend App URL (used by extension)
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',

  // Environment mode
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Feature flags
  enableDebugLogs: import.meta.env.DEV,
};

// Validate required environment variables in production
if (config.isProduction) {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_GEMINI_API_KEY'];
  const missing = requiredVars.filter(v => !import.meta.env[v]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
