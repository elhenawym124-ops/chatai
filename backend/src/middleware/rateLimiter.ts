import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { getRedisClient } from '@/config/redis';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { RateLimitError } from '@/middleware/errorHandler';

/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting using Redis for distributed applications
 * and in-memory for single instance applications.
 */

/**
 * Custom rate limit store using Redis
 */
class RedisStore {
  private client = getRedisClient();
  private prefix = 'rate_limit:';

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    const redisKey = this.prefix + key;
    
    try {
      const current = await this.client.incr(redisKey);
      
      if (current === 1) {
        // First request, set expiration
        await this.client.expire(redisKey, config.rateLimit.windowMs / 1000);
      }
      
      const ttl = await this.client.ttl(redisKey);
      
      return {
        totalHits: current,
        timeToExpire: ttl > 0 ? ttl * 1000 : undefined,
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      // Fallback to allowing the request if Redis fails
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    
    try {
      await this.client.decr(redisKey);
    } catch (error) {
      logger.error('Redis rate limit decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    
    try {
      await this.client.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit reset error:', error);
    }
  }
}

/**
 * Generate rate limit key based on IP and user
 */
const generateKey = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  const userId = (req as any).user?.id;
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  return userId ? `user:${userId}` : `ip:${ip}`;
};

/**
 * Custom rate limit handler
 */
const rateLimitHandler = (req: Request, res: Response): void => {
  const error = new RateLimitError('Too many requests, please try again later');
  
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: error.message,
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Skip rate limiting for certain conditions
 */
const skipRateLimit = (req: Request): boolean => {
  // Skip for health checks
  if (req.path === '/health') {
    return true;
  }
  
  // Skip for webhooks (they have their own validation)
  if (req.path.startsWith('/webhooks/')) {
    return true;
  }
  
  // Skip for internal requests (if you have internal API calls)
  const userAgent = req.get('User-Agent');
  if (userAgent?.includes('internal-service')) {
    return true;
  }
  
  return false;
};

/**
 * Main rate limiter middleware
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  
  // Use Redis store for distributed rate limiting
  store: new RedisStore() as any,
  
  // Generate key based on user or IP
  keyGenerator: generateKey,
  
  // Custom handler for rate limit exceeded
  handler: rateLimitHandler,
  
  // Skip certain requests
  skip: skipRateLimit,
  
  // Headers to include in response
  standardHeaders: true,
  legacyHeaders: false,
  
  // Message for rate limit exceeded (not used with custom handler)
  message: 'Too many requests',
});

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn(`Authentication rate limit exceeded for IP: ${req.ip}`);
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
        retryAfter: 900, // 15 minutes
        timestamp: new Date().toISOString(),
      },
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for password reset endpoints
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    const email = req.body.email || 'unknown';
    return `password_reset:${email}`;
  },
  
  handler: (req: Request, res: Response) => {
    logger.warn(`Password reset rate limit exceeded for email: ${req.body.email}`);
    
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset attempts, please try again later',
        retryAfter: 3600, // 1 hour
        timestamp: new Date().toISOString(),
      },
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  
  store: new RedisStore() as any,
  keyGenerator: generateKey,
  
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many file uploads, please try again later',
        retryAfter: 60,
        timestamp: new Date().toISOString(),
      },
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for API endpoints that trigger external services
 */
export const externalServiceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  
  store: new RedisStore() as any,
  keyGenerator: generateKey,
  
  handler: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
