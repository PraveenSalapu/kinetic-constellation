
import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = Router();

// Lazy-initialized Supabase client (reusing pattern from profiles.ts)
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
const createApplicationSchema = z.object({
    company: z.string().min(1, 'Company is required'),
    jobTitle: z.string().min(1, 'Job Title is required'),
    jobUrl: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'accepted', 'withdrawn']).optional(),
    appliedDate: z.string().optional(), // ISO date string
    source: z.string().optional(),
    notes: z.string().optional(),
    salaryText: z.string().optional(),
});

const updateApplicationSchema = z.object({
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    jobUrl: z.string().optional(),
    location: z.string().optional(),
    status: z.enum(['saved', 'applied', 'screening', 'interviewing', 'offer', 'rejected', 'accepted', 'withdrawn']).optional(),
    appliedDate: z.string().optional(),
    source: z.string().optional(),
    notes: z.string().optional(),
    salaryText: z.string().optional(),
    timeline: z.array(z.object({
        date: z.string(),
        status: z.string(),
        notes: z.string().optional()
    })).optional(),
});

// GET /api/applications - Get all applications for current user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        const { data: applications, error } = await getSupabase()
            .from('applications')
            .select('*')
            .eq('user_id', userId)
            .order('applied_date', { ascending: false });

        if (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
            return;
        }

        // Transform snake_case DB to camelCase API
        const transformed = applications.map(app => ({
            id: app.id,
            userId: app.user_id,
            company: app.company,
            jobTitle: app.job_title,
            jobUrl: app.job_url,
            location: app.location,
            status: app.status,
            appliedDate: app.applied_date,
            source: app.source,
            notes: app.notes,
            salaryText: app.salary_text,
            timeline: app.timeline,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
        }));

        res.json({
            success: true,
            applications: transformed,
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/applications/:id - Get specific application
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const { data: app, error } = await getSupabase()
            .from('applications')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !app) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }

        res.json({
            success: true,
            application: {
                id: app.id,
                userId: app.user_id,
                company: app.company,
                jobTitle: app.job_title,
                jobUrl: app.job_url,
                location: app.location,
                status: app.status,
                appliedDate: app.applied_date,
                source: app.source,
                notes: app.notes,
                salaryText: app.salary_text,
                timeline: app.timeline,
                createdAt: app.created_at,
                updatedAt: app.updated_at,
            },
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// POST /api/applications - Create new application
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const validation = createApplicationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        const {
            company, jobTitle, jobUrl, location, status,
            appliedDate, source, notes, salaryText
        } = validation.data;

        const appId = uuidv4();
        const now = new Date().toISOString();

        const { error } = await getSupabase().from('applications').insert({
            id: appId,
            user_id: userId,
            company,
            job_title: jobTitle,
            job_url: jobUrl,
            location,
            status: status || 'saved',
            applied_date: appliedDate || now,
            source: source || 'Manual Entry',
            notes,
            salary_text: salaryText,
            timeline: [{ date: now, status: status || 'saved', notes: 'Application created' }],
            created_at: now,
            updated_at: now,
        });

        if (error) {
            console.error('Error creating application:', error);
            res.status(500).json({ error: 'Failed to create application' });
            return;
        }

        res.status(201).json({
            success: true,
            application: {
                id: appId,
                userId,
                // ... return other fields as needed, mostly for confirmation
            }
        });

    } catch (error) {
        console.error('Create application error:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// PUT /api/applications/:id - Update application
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const validation = updateApplicationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({ error: validation.error.errors[0].message });
            return;
        }

        // Verify ownership
        const { data: existing } = await getSupabase()
            .from('applications')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existing) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }

        const updates: any = {
            updated_at: new Date().toISOString(),
        };

        // Map camelCase to snake_case
        const v = validation.data;
        if (v.company) updates.company = v.company;
        if (v.jobTitle) updates.job_title = v.jobTitle;
        if (v.jobUrl) updates.job_url = v.jobUrl;
        if (v.location) updates.location = v.location;
        if (v.status) updates.status = v.status;
        if (v.appliedDate) updates.applied_date = v.appliedDate;
        if (v.source) updates.source = v.source;
        if (v.notes) updates.notes = v.notes;
        if (v.salaryText) updates.salary_text = v.salaryText;
        if (v.timeline) updates.timeline = v.timeline;

        const { error } = await getSupabase()
            .from('applications')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating application:', error);
            res.status(500).json({ error: 'Failed to update application' });
            return;
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// DELETE /api/applications/:id - Delete application
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const { error } = await getSupabase()
            .from('applications')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Ensure ownership

        if (error) {
            console.error('Error deleting application:', error);
            res.status(500).json({ error: 'Failed to delete application' });
            return;
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

export default router;
