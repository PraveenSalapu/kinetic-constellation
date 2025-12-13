import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Ensure env vars are loaded if not already
dotenv.config({ path: path.join(process.cwd(), '../../.env') });

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]?.trim();

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const jwtSecret = process.env.SUPABASE_JWT_SECRET;
  if (!jwtSecret) {
    console.error('CRITICAL: SUPABASE_JWT_SECRET is missing from backend environment.');
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  try {
    // Verify token offline (faster, more reliable)
    // Supabase standard JWT secret is used to sign access tokens
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token claims');
    }

    // Attach user ID from 'sub' claim
    req.userId = decoded.sub;
    next();

  } catch (err) {
    // Token is invalid or expired
    if (err instanceof jwt.JsonWebTokenError) {
      // Quietly fail for expired/invalid tokens (client will refresh)
      res.status(403).json({ error: 'Invalid or expired token' });
    } else {
      console.error('Auth Middleware Exception:', err);
      res.status(403).json({ error: 'Authentication failed' });
    }
  }
}
