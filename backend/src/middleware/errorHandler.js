/**
 * Error Handling Middleware
 * 
 * Comprehensive error handling for the application
 */

const logger = require('../utils/logger');

/**
 * JSON parsing error handler
 */
const jsonErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('Invalid JSON received:', err.message);
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'The request body contains invalid JSON syntax',
      code: 'INVALID_JSON',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

/**
 * Validation error handler
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    logger.warn('Validation error:', errors);
    return res.status(422).json({
      error: 'Validation failed',
      message: 'The provided data does not meet the required format',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

/**
 * Authentication error handler
 */
const authErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError' || err.message === 'Unauthorized') {
    logger.warn('Unauthorized access attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required to access this resource',
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'ForbiddenError' || err.message === 'Forbidden') {
    logger.warn('Forbidden access attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Insufficient permissions to access this resource',
      code: 'INSUFFICIENT_PERMISSIONS',
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

/**
 * Not found error handler
 */
const notFoundHandler = (req, res, next) => {
  logger.warn('Route not found:', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.method} ${req.path} was not found`,
    code: 'RESOURCE_NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

/**
 * General error handler
 */
const generalErrorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not in the correct format',
      code: 'INVALID_ID',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'A record with this information already exists',
      code: 'DUPLICATE_ENTRY',
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'PayloadTooLargeError') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'The request payload exceeds the maximum allowed size',
      code: 'PAYLOAD_TOO_LARGE',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Rate limiting error handler
 */
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded:', {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent')
  });
  
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 60, // seconds
    timestamp: new Date().toISOString()
  });
};

/**
 * Method not allowed handler
 */
const methodNotAllowedHandler = (req, res) => {
  logger.warn('Method not allowed:', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(405).json({
    error: 'Method Not Allowed',
    message: `The ${req.method} method is not allowed for this resource`,
    code: 'METHOD_NOT_ALLOWED',
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'], // This should be dynamic based on route
    timestamp: new Date().toISOString()
  });
};

/**
 * Security error handler for malicious requests
 */
const securityErrorHandler = (err, req, res, next) => {
  if (err.type === 'security') {
    logger.error('Security threat detected:', {
      type: err.subtype,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      body: req.body
    });
    
    return res.status(403).json({
      error: 'Security Violation',
      message: 'Request blocked due to security policy',
      code: 'SECURITY_VIOLATION',
      timestamp: new Date().toISOString()
    });
  }
  
  next(err);
};

/**
 * Create error with specific type
 */
const createError = (status, message, code = null, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  jsonErrorHandler,
  validationErrorHandler,
  authErrorHandler,
  notFoundHandler,
  generalErrorHandler,
  rateLimitHandler,
  methodNotAllowedHandler,
  securityErrorHandler,
  createError,
  asyncHandler
};
