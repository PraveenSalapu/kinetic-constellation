// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Import routes after env is loaded
// Authorization routes removed (Supabase Native Auth)
import profileRoutes from './routes/profiles.js';
import tailorRoutes from './routes/tailor.js';
import autofillRoutes from './routes/autofill.js';
import scrapeRoutes from './routes/scrape.js';
import applicationRoutes from './routes/applications.js';

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:5174',  // Vite dev server (alt port)
    'http://localhost:5175',  // Vite dev server (alt port 2)
    'http://localhost:4173',  // Vite preview
    /^chrome-extension:\/\/.*/,  // Chrome extension
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// app.use('/api/auth', authRoutes); // Handled by Supabase
app.use('/api/profiles', profileRoutes);
app.use('/api/tailor', tailorRoutes);
app.use('/api/autofill', autofillRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/applications', applicationRoutes);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;
