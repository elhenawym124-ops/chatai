/**
 * Security Middleware
 * 
 * Comprehensive security measures for the application
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const logger = require('../utils/logger');

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potential XSS attacks
      value = validator.escape(value);

      // Check for SQL injection patterns (more lenient for chat messages)
      const sqlInjectionPatterns = [
        // Only block if SQL keywords are combined with dangerous patterns
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b).*?(\b(FROM|WHERE|INTO|VALUES|SET|TABLE)\b)/gi,
        // Block SQL comments but allow normal punctuation
        /(--|\/\*.*?\*\/)/g,
        // Block complex SQL injection patterns but allow normal text
        /(\bOR\b|\bAND\b)\s*['"]?\s*[=<>]/gi
      ];

      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          logger.error('Security threat detected:', {
            type: 'sql_injection',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            value: value
          });

          return res.status(403).json({
            error: 'Security Violation',
            message: 'Request blocked due to security policy',
            code: 'SECURITY_VIOLATION',
            timestamp: new Date().toISOString()
          });
        }
      }

      // Check for XSS patterns
      const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi
      ];

      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          logger.error('Security threat detected:', {
            type: 'xss_attempt',
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            value: value
          });

          return res.status(403).json({
            error: 'Security Violation',
            message: 'Request blocked due to security policy',
            code: 'SECURITY_VIOLATION',
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = sanitizeObject(obj[key]);
            if (result && result.error) return result;
          } else {
            const result = sanitizeValue(obj[key]);
            if (result && result.error) return result;
            obj[key] = result;
          }
        }
      }
    }
    return null; // No error
  };

  try {
    // Sanitize request body
    if (req.body) {
      const result = sanitizeObject(req.body);
      if (result && result.error) return result;
    }

    // Sanitize query parameters
    if (req.query) {
      const result = sanitizeObject(req.query);
      if (result && result.error) return result;
    }

    // Sanitize URL parameters
    if (req.params) {
      const result = sanitizeObject(req.params);
      if (result && result.error) return result;
    }

    next();
  } catch (error) {
    logger.error('Security middleware error:', error);
    return res.status(403).json({
      error: 'Security Violation',
      message: 'Request blocked due to security policy',
      code: 'SECURITY_VIOLATION',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Rate limiting configuration
 */
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too Many Requests',
      message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        error: 'Too Many Requests',
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * Different rate limits for different endpoints
 */
const rateLimits = {
  // General API rate limit (زيادة للتطوير)
  general: createRateLimit(15 * 60 * 1000, 2000, 'Too many requests from this IP'),

  // Authentication rate limit (أكثر مرونة للتطوير)
  auth: createRateLimit(15 * 60 * 1000, 50, 'Too many authentication attempts'),

  // File upload rate limit
  upload: createRateLimit(60 * 60 * 1000, 100, 'Too many file uploads'),

  // Search rate limit (أكثر مرونة)
  search: createRateLimit(1 * 60 * 1000, 100, 'Too many search requests')
};

/**
 * JWT token validation middleware
 */
const validateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    logger.warn('Unauthorized access attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      reason: 'No token provided'
    });

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required to access this resource',
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token validation failed:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      error: error.name
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString()
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Optional token validation (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Log but don't fail
      logger.warn('Invalid optional token:', error.message);
    }
  }
  
  next();
};

/**
 * Permission check middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = createError(401, 'Authentication required', 'AUTH_REQUIRED');
      error.name = 'UnauthorizedError';
      return next(error);
    }
    
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      const error = createError(403, 'Insufficient permissions', 'INSUFFICIENT_PERMISSIONS');
      error.name = 'ForbiddenError';
      return next(error);
    }
    
    next();
  };
};

/**
 * Role check middleware
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = createError(401, 'Authentication required', 'AUTH_REQUIRED');
      error.name = 'UnauthorizedError';
      return next(error);
    }
    
    if (req.user.role !== role) {
      const error = createError(403, 'Insufficient role privileges', 'INSUFFICIENT_ROLE');
      error.name = 'ForbiddenError';
      return next(error);
    }
    
    next();
  };
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Helmet security configuration
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
});

/**
 * Request size limits
 */
const requestSizeLimits = {
  json: { limit: '10mb' },
  urlencoded: { limit: '10mb', extended: true },
  raw: { limit: '10mb' },
  text: { limit: '10mb' }
};

/**
 * IP whitelist middleware (for admin endpoints)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      logger.warn('IP not whitelisted:', {
        ip: clientIP,
        path: req.path
      });
      
      const error = createError(403, 'IP address not allowed', 'IP_NOT_ALLOWED');
      error.name = 'ForbiddenError';
      return next(error);
    }
    
    next();
  };
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed:', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = {
  sanitizeInput,
  rateLimits,
  validateToken,
  optionalAuth,
  requirePermission,
  requireRole,
  corsOptions,
  helmetConfig,
  requestSizeLimits,
  ipWhitelist,
  requestLogger
};
