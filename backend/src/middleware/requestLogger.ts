import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';
import { config } from '@/config';

/**
 * Request Logger Middleware
 * 
 * Logs incoming requests with detailed information for debugging
 * and monitoring purposes. Includes request ID for tracing.
 */

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Sanitize sensitive data from request body
 */
const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = [
    'password',
    'confirmPassword',
    'currentPassword',
    'newPassword',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'privateKey',
    'creditCard',
    'ssn',
    'socialSecurityNumber',
  ];

  const sanitized = { ...body };

  const sanitizeObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const result: any = {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    }

    return obj;
  };

  return sanitizeObject(sanitized);
};

/**
 * Sanitize sensitive headers
 */
const sanitizeHeaders = (headers: any): any => {
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'x-access-token',
  ];

  const sanitized = { ...headers };

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
};

/**
 * Get client IP address
 */
const getClientIP = (req: Request): string => {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

/**
 * Get user agent information
 */
const getUserAgent = (req: Request): string => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Determine if request should be logged
 */
const shouldLogRequest = (req: Request): boolean => {
  // Skip logging for health checks in production
  if (config.env === 'production' && req.path === '/health') {
    return false;
  }

  // Skip logging for static assets
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
  if (staticExtensions.some(ext => req.path.endsWith(ext))) {
    return false;
  }

  return true;
};

/**
 * Request logger middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  // Skip logging if not needed
  if (!shouldLogRequest(req)) {
    return next();
  }

  // Log request start
  const requestData = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    params: req.params,
    headers: config.env === 'development' ? sanitizeHeaders(req.headers) : undefined,
    body: config.env === 'development' ? sanitizeBody(req.body) : undefined,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    timestamp: new Date().toISOString(),
  };

  logger.info('Request started', requestData);

  // Capture original res.end to log response
  const originalEnd = res.end;
  const originalSend = res.send;

  let responseBody: any;

  // Override res.send to capture response body
  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  // Override res.end to log response
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - req.startTime;
    
    const responseData = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0,
      timestamp: new Date().toISOString(),
    };

    // Add response body in development (only for errors or if explicitly enabled)
    if (config.env === 'development' && (res.statusCode >= 400 || process.env.LOG_RESPONSE_BODY === 'true')) {
      try {
        if (responseBody) {
          const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
          (responseData as any).body = parsedBody;
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Log with appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request completed with server error', responseData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request completed with client error', responseData);
    } else {
      logger.info('Request completed successfully', responseData);
    }

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      });
    }

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error request logger - logs requests that resulted in errors
 */
export const errorRequestLogger = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorData = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: {
      name: error.name,
      message: error.message,
      stack: config.env === 'development' ? error.stack : undefined,
    },
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    timestamp: new Date().toISOString(),
  };

  logger.error('Request error', errorData);
  next(error);
};
