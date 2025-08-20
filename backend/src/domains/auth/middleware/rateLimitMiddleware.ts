import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';

/**
 * Rate Limiting Middleware for Authentication Routes
 * 
 * Provides different rate limits for different authentication operations
 * to prevent brute force attacks and abuse
 */

// Base rate limit configuration
const createRateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message,
      error: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
    },
    handler: (req, res) => {
      enhancedLogger.security('rate_limit_exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        success: false,
        message: options.message,
        error: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
    },
    keyGenerator: (req) => {
      // Use IP address as the key
      return req.ip || req.socket.remoteAddress || 'unknown';
    },
  });
};

/**
 * Rate limit for login attempts
 * 5 attempts per 15 minutes per IP
 */
export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limit for registration
 * 3 registrations per hour per IP
 */
export const registerRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration attempts, please try again later',
});

/**
 * Rate limit for password reset requests
 * 3 requests per hour per IP
 */
export const forgotPasswordRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests, please try again later',
});

/**
 * Rate limit for password reset completion
 * 5 attempts per hour per IP
 */
export const resetPasswordRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset attempts, please try again later',
});

/**
 * Rate limit for token refresh
 * 20 requests per 15 minutes per IP
 */
export const refreshTokenRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many token refresh requests, please try again later',
});

/**
 * Rate limit for email verification resend
 * 3 requests per hour per IP
 */
export const resendVerificationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many verification email requests, please try again later',
});

/**
 * General API rate limit
 * 1000 requests per 15 minutes per IP (زيادة للتطوير)
 */
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // زيادة من 100 إلى 1000
  message: 'Too many requests, please try again later',
});

/**
 * Strict rate limit for sensitive operations
 * 10 requests per hour per IP
 */
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many requests for this operation, please try again later',
});

// Export all rate limiters as an object for easier import
export const rateLimitMiddleware = {
  login: loginRateLimit,
  register: registerRateLimit,
  forgotPassword: forgotPasswordRateLimit,
  resetPassword: resetPasswordRateLimit,
  refresh: refreshTokenRateLimit,
  resendVerification: resendVerificationRateLimit,
  general: generalRateLimit,
  strict: strictRateLimit,
};
