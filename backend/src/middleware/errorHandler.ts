import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { config } from '@/config';

/**
 * Error Handler Middleware
 * 
 * Global error handling middleware that catches all errors
 * and returns appropriate responses to clients.
 */

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  details?: any;
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  statusCode = 400;
  isOperational = true;
  code = 'VALIDATION_ERROR';

  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  isOperational = true;
  code = 'AUTHENTICATION_ERROR';

  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  isOperational = true;
  code = 'AUTHORIZATION_ERROR';

  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  isOperational = true;
  code = 'NOT_FOUND_ERROR';

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  isOperational = true;
  code = 'CONFLICT_ERROR';

  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  isOperational = true;
  code = 'RATE_LIMIT_ERROR';

  constructor(message = 'Too many requests') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends Error {
  statusCode = 500;
  isOperational = false;
  code = 'INTERNAL_SERVER_ERROR';

  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
    timestamp: string;
    path: string;
    method: string;
  };
}

/**
 * Handle Prisma errors
 */
const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2002':
      return new ConflictError('Unique constraint violation');
    case 'P2025':
      return new NotFoundError('Record not found');
    case 'P2003':
      return new ValidationError('Foreign key constraint violation');
    case 'P2014':
      return new ValidationError('Invalid relation');
    default:
      logger.error('Unhandled Prisma error:', error);
      return new InternalServerError('Database operation failed');
  }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error: any): AppError => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new AuthenticationError('Invalid token');
    case 'TokenExpiredError':
      return new AuthenticationError('Token expired');
    case 'NotBeforeError':
      return new AuthenticationError('Token not active');
    default:
      return new AuthenticationError('Token validation failed');
  }
};

/**
 * Handle validation errors
 */
const handleValidationError = (error: any): AppError => {
  if (error.details) {
    const details = error.details.map((detail: any) => ({
      field: detail.path?.join('.') || 'unknown',
      message: detail.message,
    }));
    return new ValidationError('Validation failed', details);
  }
  return new ValidationError(error.message);
};

/**
 * Determine if error is operational
 */
const isOperationalError = (error: AppError): boolean => {
  return error.isOperational === true;
};

/**
 * Create error response
 */
const createErrorResponse = (
  error: AppError,
  req: Request
): ErrorResponse => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    },
  };

  // Add details for validation errors
  if (error instanceof ValidationError && error.details) {
    response.error.details = error.details;
  }

  // Add stack trace in development
  if (config.env === 'development') {
    response.error.stack = error.stack;
  }

  return response;
};

/**
 * Log error with appropriate level
 */
const logError = (error: AppError, req: Request): void => {
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    timestamp: new Date().toISOString(),
  };

  if (isOperationalError(error)) {
    if (error.statusCode && error.statusCode >= 500) {
      logger.error('Operational error (5xx):', logData);
    } else {
      logger.warn('Operational error (4xx):', logData);
    }
  } else {
    logger.error('Programming error:', logData);
  }
};

/**
 * Main error handler middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Convert known error types to AppError
  if (error.name?.startsWith('Prisma')) {
    appError = handlePrismaError(error);
  } else if (error.name?.includes('JsonWebToken') || error.name?.includes('Token')) {
    appError = handleJWTError(error);
  } else if (error.isJoi || error.name === 'ValidationError') {
    appError = handleValidationError(error);
  } else if (error.isAppError || error.statusCode) {
    appError = error;
  } else {
    // Unknown error - treat as internal server error
    appError = new InternalServerError(
      config.env === 'production' ? 'Something went wrong' : error.message
    );
    appError.stack = error.stack;
  }

  // Set status code if not already set
  if (!appError.statusCode) {
    appError.statusCode = 500;
  }

  // Log the error
  logError(appError, req);

  // Create and send error response
  const errorResponse = createErrorResponse(appError, req);
  res.status(appError.statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Close server gracefully
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  
  // Close server gracefully
  process.exit(1);
});
