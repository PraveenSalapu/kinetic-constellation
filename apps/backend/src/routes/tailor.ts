import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth.js';
import { tailorResume, calculateATSScore, optimizeBulletPoint } from '../services/gemini.js';
import type { Resume } from '@careerflow/shared';

const router: Router = Router();

// Lazy-initialized Supabase client
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }
  return _supabase;
}

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const tailorSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  jobDescription: z.string().min(10, 'Job description too short'),
});

const atsScoreSchema = z.object({
  profileId: z.string().uuid().optional(),
  jobDescription: z.string().min(10, 'Job description too short'),
  resumeData: z.any().optional(), // Allow passing raw resume data
});

// ...

// POST /api/tailor/score - Calculate ATS score
router.post('/score', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const validation = atsScoreSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors[0].message });
      return;
    }

    const { profileId, jobDescription, resumeData } = validation.data;
    let resume: Resume;

    if (resumeData) {
      // Use provided resume data (for real-time tailoring)
      resume = resumeData;
    } else if (profileId) {
      // Fetch profile from DB
      const { data: profile, error } = await getSupabase()
        .from('profiles')
        .select('data')
        .eq('id', profileId)
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      resume = profile.data as Resume;
    } else {
      res.status(400).json({ error: 'Must provide either profileId or resumeData' });
      return;
    }

    // Call AI service
    const scoreResponse = await calculateATSScore(resume, jobDescription);

    res.json({
      success: true,
      data: scoreResponse,
    });
  } catch (error) {
    console.error('ATS score error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate ATS score'
    });
  }
});

// POST /api/tailor/optimize-bullet - Optimize a single bullet point
router.post('/optimize-bullet', async (req: Request, res: Response) => {
  try {
    const optimizeSchema = z.object({
      bullet: z.string().min(5, 'Bullet too short'),
    });

    const validation = optimizeSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors[0].message });
      return;
    }

    const { bullet } = validation.data;

    // Call AI service
    const suggestions = await optimizeBulletPoint(bullet);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Optimize bullet error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to optimize bullet point'
    });
  }
});

import { generateEmbedding, cosineSimilarity, similarityToScore } from '../services/embedding.js';

// POST /api/tailor/vector-match - Calculate semantic match score using Vectors
router.post('/vector-match', async (req: Request, res: Response) => {
  try {
    const vectorMatchSchema = z.object({
      resumeText: z.string().min(50, 'Resume text too short'),
      jobDescription: z.string().min(50, 'Job Description too short'),
    });

    const validation = vectorMatchSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({ error: validation.error.errors[0].message });
      return;
    }

    const { resumeText, jobDescription } = validation.data;

    // Generate Embeddings Parallelly
    const [resumeVector, jobVector] = await Promise.all([
      generateEmbedding(resumeText),
      generateEmbedding(jobDescription)
    ]);

    const similarity = cosineSimilarity(resumeVector, jobVector);
    const score = similarityToScore(similarity);

    // console.log('Vector Match:', { similarity, score });

    res.json({
      success: true,
      score,
      similarity
    });

  } catch (error) {
    console.error('Vector match error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate vector match'
    });
  }
});

export default router;
