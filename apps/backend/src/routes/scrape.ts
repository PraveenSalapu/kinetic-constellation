// AI-Powered Job Scrape Route
// Fallback extraction when extension's DOM scraper fails

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/auth.js';
import { extractJobFromUrl } from '../services/scraper.js';

const router: Router = Router();

// Stricter rate limit for scrape endpoint (more expensive operation)
const scrapeRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per user
  message: { error: 'Too many extraction requests, please wait a minute' },
  keyGenerator: (req) => req.userId || req.ip || 'unknown',
});

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schema
const extractSchema = z.object({
  url: z.string().url('Invalid URL format'),
  partialData: z.object({
    title: z.string().optional(),
    company: z.string().optional(),
  }).optional(),
});

// POST /api/scrape/extract - AI-powered job extraction fallback
router.post('/extract', scrapeRateLimit, async (req: Request, res: Response) => {
  try {
    const validation = extractSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors[0].message });
      return;
    }

    const { url, partialData } = validation.data;

    console.log(`[Scrape] Extracting job data from: ${url}`);

    // Extract job data using AI
    const result = await extractJobFromUrl(url, partialData);

    console.log(`[Scrape] Extraction successful via method: ${result.method}`);

    res.json({
      success: true,
      data: result.data,
      method: result.method,
    });

  } catch (error) {
    console.error('Scrape extraction error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to extract job data',
    });
  }
});

export default router;
