import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ControllerResponse, PaginationParams, FilterParams } from '../types/common';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

/**
 * Base Controller Class
 * 
 * Provides common functionality for all controllers including:
 * - Standardized response formatting
 * - Error handling
 * - Pagination helpers
 * - Request validation
 */
export abstract class BaseController {
  /**
   * Send successful response
   */
  protected success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  protected successWithPagination<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Success'
  ): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    const response = {
      success: true,
      message,
      data,
      pagination: {
        ...pagination,
        totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  }

  /**
   * Send error response
   */
  protected error(
    res: Response,
    error: string | AppError,
    statusCode: number = 500
  ): void {
    const errorMessage = error instanceof AppError ? error.message : error;
    const errorCode = error instanceof AppError ? error.code : 'INTERNAL_ERROR';

    const response: ApiResponse = {
      success: false,
      message: errorMessage,
      error: errorCode,
      timestamp: new Date().toISOString(),
    };

    // Log error for debugging
    logger.error('Controller Error:', {
      error: errorMessage,
      code: errorCode,
      statusCode,
      stack: error instanceof Error ? error.stack : undefined,
    });

    res.status(statusCode).json(response);
  }

  /**
   * Extract pagination parameters from request
   */
  protected getPaginationParams(req: Request): PaginationParams {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    return {
      page: Math.max(1, page),
      limit,
      sortBy,
      sortOrder,
    };
  }

  /**
   * Extract filter parameters from request
   */
  protected getFilterParams(req: Request): FilterParams {
    return {
      search: req.query.search as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
    };
  }

  /**
   * Async handler wrapper to catch errors
   */
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validate required fields in request body
   */
  protected validateRequiredFields(
    body: Record<string, any>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter(field => 
      body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missingFields.length > 0) {
      throw new AppError(
        `Missing required fields: ${missingFields.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
    }
  }

  /**
   * Validate email format
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic)
   */
  protected validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitize input to prevent XSS
   */
  protected sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }

  /**
   * Extract user info from authenticated request
   */
  protected getAuthenticatedUser(req: any): {
    id: string;
    email: string;
    role: string;
    companyId: string;
  } {
    if (!req.user) {
      throw new AppError('User not authenticated', 'UNAUTHORIZED', 401);
    }
    return req.user;
  }

  /**
   * Check if user has required role
   */
  protected requireRole(req: any, allowedRoles: string[]): void {
    const user = this.getAuthenticatedUser(req);
    
    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        'Insufficient permissions',
        'FORBIDDEN',
        403
      );
    }
  }

  /**
   * Parse JSON safely
   */
  protected parseJSON<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * Format date for response
   */
  protected formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Generate cache key
   */
  protected generateCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
  }
}
