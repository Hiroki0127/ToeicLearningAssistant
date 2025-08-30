import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorizedResponse } from '@/utils/response';
import type { JWTPayload } from '@/types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    unauthorizedResponse(res, 'Access token required');
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      unauthorizedResponse(res, 'Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      unauthorizedResponse(res, 'Token expired');
    } else {
      unauthorizedResponse(res, 'Token verification failed');
    }
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // For optional auth, we just continue without setting user
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorizedResponse(res, 'Authentication required');
      return;
    }

    // For now, we'll use a simple role check
    // In a real app, you'd check against user roles from database
    if (!roles.includes('user')) {
      unauthorizedResponse(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    unauthorizedResponse(res, 'Authentication required');
    return;
  }

  // Check if user is admin (you'd implement this based on your user model)
  // For now, we'll use a simple check
  if (req.user.email !== 'admin@example.com') {
    unauthorizedResponse(res, 'Admin access required');
    return;
  }

  next();
};

export const validateUserAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    unauthorizedResponse(res, 'Authentication required');
    return;
  }

  const userId = req.params.userId || req.body.userId;
  
  // Users can only access their own data (unless admin)
  if (userId && req.user.userId !== userId && req.user.email !== 'admin@example.com') {
    unauthorizedResponse(res, 'Access denied to this resource');
    return;
  }

  next();
};
