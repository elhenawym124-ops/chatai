/**
 * Security Enhancements Middleware
 * تحسينات أمنية إضافية للنظام
 */

const rateLimit = require('express-rate-limit');
// Note: helmet package might not be installed, using manual headers instead

/**
 * Rate Limiting Configuration
 */
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.log(`🚨 [RATE-LIMIT] ${req.ip} exceeded limit for ${req.path}`);
      res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

/**
 * Dynamic Rate Limits based on environment
 */
const getAuthRateLimit = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment) {
    return createRateLimit(
      1 * 60 * 1000, // 1 minute (أقصر)
      50, // 50 attempts (أكثر مرونة)
      'تم تجاوز الحد المسموح (بيئة التطوير). حاول مرة أخرى بعد دقيقة'
    );
  } else if (isProduction) {
    return createRateLimit(
      30 * 60 * 1000, // 30 minutes
      3, // 3 attempts only
      'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 30 دقيقة'
    );
  } else {
    return createRateLimit(
      5 * 60 * 1000, // 5 minutes
      15, // 15 attempts
      'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. حاول مرة أخرى بعد 5 دقائق'
    );
  }
};

/**
 * Rate Limits for different endpoints
 */
const rateLimits = {
  // Authentication endpoints - dynamic based on environment
  auth: getAuthRateLimit(),

  // General API endpoints - more flexible for development
  api: createRateLimit(
    2 * 60 * 1000, // 2 minutes (أقصر)
    1000, // 1000 requests (أكثر مرونة)
    'تم تجاوز الحد المسموح للطلبات. حاول مرة أخرى بعد دقيقتين'
  ),

  // Admin endpoints - very strict
  admin: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    20, // 20 requests
    'تم تجاوز الحد المسموح للطلبات الإدارية. حاول مرة أخرى بعد 15 دقيقة'
  ),

  // File upload endpoints
  upload: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // 10 uploads
    'تم تجاوز الحد المسموح لرفع الملفات. حاول مرة أخرى بعد 15 دقيقة'
  )
};

/**
 * Security Headers Middleware
 */
const securityHeaders = (req, res, next) => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Powered-By', 'Secure-API');

  // Content Security Policy
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "script-src 'self'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );

  next();
};

/**
 * Request Sanitization Middleware
 */
const sanitizeRequest = (req, res, next) => {
  try {
    // Remove potentially dangerous characters from query parameters
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    console.error('❌ [SANITIZE] Error sanitizing request:', error);
    next();
  }
};

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Security Monitoring Middleware
 */
const securityMonitoring = (req, res, next) => {
  const startTime = Date.now();
  
  // Log security-relevant requests
  const securityLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    companyId: req.user?.companyId,
    role: req.user?.role
  };

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /javascript:/gi, // JavaScript injection
    /eval\(/gi, // Code injection
    /exec\(/gi, // Command injection
  ];

  const fullUrl = req.originalUrl || req.url;
  const requestBody = JSON.stringify(req.body || {});
  
  let suspiciousActivity = false;
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(fullUrl) || pattern.test(requestBody)) {
      suspiciousActivity = true;
      console.log(`🚨 [SECURITY] Suspicious activity detected:`, {
        ...securityLog,
        pattern: pattern.toString(),
        url: fullUrl,
        body: requestBody.substring(0, 200)
      });
    }
  });

  // Log response time and status
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (suspiciousActivity || res.statusCode >= 400 || duration > 5000) {
      console.log(`📊 [SECURITY] Request completed:`, {
        ...securityLog,
        status: res.statusCode,
        duration: `${duration}ms`,
        suspicious: suspiciousActivity
      });
    }
  });

  next();
};

/**
 * IP Whitelist Middleware (for admin routes)
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // In development, allow all IPs
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      next();
    } else {
      console.log(`🚨 [IP-WHITELIST] Blocked IP: ${clientIP} for ${req.path}`);
      res.status(403).json({
        success: false,
        message: 'الوصول مرفوض من هذا العنوان',
        code: 'IP_NOT_ALLOWED'
      });
    }
  };
};

/**
 * Request Size Limiter
 */
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSizeBytes = parseSize(maxSize);
    
    if (contentLength > maxSizeBytes) {
      console.log(`🚨 [SIZE-LIMIT] Request too large: ${contentLength} bytes from ${req.ip}`);
      return res.status(413).json({
        success: false,
        message: 'حجم الطلب كبير جداً',
        code: 'REQUEST_TOO_LARGE'
      });
    }
    
    next();
  };
};

function parseSize(size) {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  return parseInt(match[1]) * units[match[2]];
}

/**
 * CORS Security Enhancement
 */
const enhancedCORS = (req, res, next) => {
  const origin = req.get('Origin');
  
  // Log cross-origin requests
  if (origin && !origin.includes('localhost')) {
    console.log(`🌐 [CORS] Cross-origin request from: ${origin} to ${req.path}`);
  }
  
  // Add additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

module.exports = {
  rateLimits,
  securityHeaders,
  sanitizeRequest,
  securityMonitoring,
  ipWhitelist,
  requestSizeLimiter,
  enhancedCORS
};
