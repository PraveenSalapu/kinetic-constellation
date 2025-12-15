// Backend Environment Configuration
// Centralized configuration for environment-specific settings

const isDevelopment = process.env.NODE_ENV !== 'production';

export const config = {
  // Server port
  port: process.env.PORT || 3001,

  // Environment mode
  isDevelopment,
  isProduction: !isDevelopment,

  // CORS allowed origins
  corsOrigins: getCorsOrigins(),

  // Feature flags
  enableDebugLogs: isDevelopment,
};

const origins: (string | RegExp)[] = [
  /^chrome-extension:\/\/.*/, // Chrome extension always allowed
  /\.vercel\.app$/,            // Allow all Vercel preview/production URLs
];

if (isDevelopment) {
  // Development origins
  origins.push(
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:4173',
  );
}

// Production origins from environment
const productionOrigins = process.env.CORS_ORIGINS;
if (productionOrigins) {
  productionOrigins.split(',').forEach(origin => {
    origins.push(origin.trim());
  });
}

// Always include the app URL if set
const appUrl = process.env.APP_URL;
if (appUrl && !origins.includes(appUrl)) {
  origins.push(appUrl);
}

return origins;
}

// Validate required environment variables at startup
export function validateEnvironment(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ];

  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    if (config.isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
}

export default config;
