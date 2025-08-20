/**
 * Custom Application Error Class
 * 
 * Provides structured error handling with:
 * - Error codes for easy identification
 * - HTTP status codes
 * - Detailed error information
 * - Stack trace preservation
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  /**
   * Check if error is operational (expected) or programming error
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }
}

/**
 * Predefined Error Types for Common Scenarios
 */

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} service error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, details);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'FILE_UPLOAD_ERROR', 400, details);
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'PAYMENT_ERROR', 402, details);
  }
}

/**
 * Error Factory for creating specific errors
 */
export class ErrorFactory {
  static validation(field: string, value: any, rule: string): ValidationError {
    return new ValidationError(
      `Validation failed for field '${field}'`,
      { field, value, rule }
    );
  }

  static notFound(resource: string, criteria?: Record<string, any>): NotFoundError {
    const message = criteria 
      ? `${resource} not found with criteria: ${JSON.stringify(criteria)}`
      : `${resource} not found`;
    return new NotFoundError(message);
  }

  static duplicate(resource: string, field: string, value: any): ConflictError {
    return new ConflictError(
      `${resource} with ${field} '${value}' already exists`,
      { resource, field, value }
    );
  }

  static invalidCredentials(): UnauthorizedError {
    return new UnauthorizedError('Invalid email or password');
  }

  static tokenExpired(): UnauthorizedError {
    return new UnauthorizedError('Token has expired');
  }

  static insufficientPermissions(action: string): ForbiddenError {
    return new ForbiddenError(`Insufficient permissions to ${action}`);
  }

  static databaseConnection(): DatabaseError {
    return new DatabaseError('Database connection failed');
  }

  static externalAPI(service: string, statusCode: number): ExternalServiceError {
    return new ExternalServiceError(
      service,
      `API returned status ${statusCode}`,
      { statusCode }
    );
  }
}

/**
 * Error Code Constants
 */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',

  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // System Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',

  // Business Logic
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_ALREADY_PROCESSED: 'ORDER_ALREADY_PROCESSED',
  PRODUCT_OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // File Operations
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',

  // Payment
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
