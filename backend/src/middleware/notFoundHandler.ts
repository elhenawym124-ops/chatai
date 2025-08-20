import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@/middleware/errorHandler';

/**
 * 404 Not Found Handler Middleware
 * 
 * This middleware handles requests to non-existent routes
 * and returns a consistent 404 error response.
 */

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
  next(error);
};
