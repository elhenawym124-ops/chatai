import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';

// Use the AuthenticatedRequest interface from Express global namespace

/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and adds user information to request object
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Get user from database to ensure they still exist and are active
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account is not active');
    }

    // Add user info to request
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    // Set correlation ID for logging
    enhancedLogger.setCorrelationId(`${user.id}-${Date.now()}`);

    next();
  } catch (error) {
    enhancedLogger.security('authentication_failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid access token'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Access token has expired'));
    }

    next(error);
  }
};

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!(req as any).user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes((req as any).user.role)) {
        enhancedLogger.security('authorization_failed', {
          userId: (req as any).user.id,
          userRole: (req as any).user.role,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Company ownership middleware
 * Ensures user can only access resources from their own company
 */
export const requireSameCompany = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!(req as any).user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Extract companyId from request params or body
    const requestCompanyId = req.params.companyId || req.body.companyId;

    if (requestCompanyId && requestCompanyId !== (req as any).user.companyId) {
      enhancedLogger.security('company_access_violation', {
        userId: (req as any).user.id,
        userCompanyId: (req as any).user.companyId,
        requestedCompanyId: requestCompanyId,
        path: req.path,
      });

      throw new ForbiddenError('Access denied to this company resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Adds user info if token is present but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user info
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      if (user && user.isActive) {
        (req as any).user = {
          id: user.id,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
        };
      }
    } catch (tokenError) {
      // Invalid token, but we don't throw error for optional auth
      enhancedLogger.debug('Optional auth token invalid', tokenError);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Export types for use in other files
