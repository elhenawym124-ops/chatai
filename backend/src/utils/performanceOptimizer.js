/**
 * Performance Optimizer
 * 
 * Comprehensive performance optimization utilities
 * Includes caching, database optimization, and monitoring
 */

const Redis = require('redis');
const compression = require('compression');

class PerformanceOptimizer {
  constructor() {
    this.redis = null;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
    };
    this.queryStats = new Map();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      this.redis = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
      });

      await this.redis.connect();
      console.log('✅ Redis connected for performance optimization');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  /**
   * Cache middleware for Express
   */
  cacheMiddleware(duration = 300) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      const cacheKey = this.generateCacheKey(req);
      
      try {
        const cachedData = await this.getFromCache(cacheKey);
        
        if (cachedData) {
          this.cacheStats.hits++;
          res.set('X-Cache', 'HIT');
          return res.json(cachedData);
        }

        this.cacheStats.misses++;
        res.set('X-Cache', 'MISS');

        // Override res.json to cache the response
        const originalJson = res.json;
        res.json = (data) => {
          this.setCache(cacheKey, data, duration);
          return originalJson.call(res, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }

  /**
   * Database query optimizer
   */
  optimizeQuery(query, params = []) {
    const queryHash = this.hashQuery(query, params);
    const startTime = Date.now();

    return {
      execute: async (executeFunction) => {
        try {
          const result = await executeFunction();
          const executionTime = Date.now() - startTime;

          // Track query performance
          this.trackQueryPerformance(queryHash, query, executionTime);

          return result;
        } catch (error) {
          const executionTime = Date.now() - startTime;
          this.trackQueryPerformance(queryHash, query, executionTime, error);
          throw error;
        }
      }
    };
  }

  /**
   * Batch processing utility
   */
  async batchProcess(items, batchSize = 100, processor) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < items.length) {
        await this.delay(10);
      }
    }

    return results;
  }

  /**
   * Memory usage monitor
   */
  monitorMemoryUsage() {
    const usage = process.memoryUsage();
    
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024 * 100) / 100, // MB
    };
  }

  /**
   * Response compression middleware
   */
  compressionMiddleware() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    });
  }

  /**
   * Request rate limiter
   */
  rateLimiter(maxRequests = 100, windowMs = 60000) {
    const requests = new Map();

    return (req, res, next) => {
      const clientId = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean old requests
      if (requests.has(clientId)) {
        const clientRequests = requests.get(clientId);
        const validRequests = clientRequests.filter(time => time > windowStart);
        requests.set(clientId, validRequests);
      }

      // Check rate limit
      const clientRequests = requests.get(clientId) || [];
      
      if (clientRequests.length >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      // Add current request
      clientRequests.push(now);
      requests.set(clientId, clientRequests);

      next();
    };
  }

  /**
   * Database connection pooling optimizer
   */
  optimizeConnectionPool(pool) {
    return {
      getConnection: async () => {
        const startTime = Date.now();
        try {
          const connection = await pool.getConnection();
          const waitTime = Date.now() - startTime;
          
          if (waitTime > 1000) {
            console.warn(`⚠️ Long connection wait time: ${waitTime}ms`);
          }

          return connection;
        } catch (error) {
          console.error('❌ Connection pool error:', error);
          throw error;
        }
      },

      releaseConnection: (connection) => {
        try {
          pool.releaseConnection(connection);
        } catch (error) {
          console.error('❌ Connection release error:', error);
        }
      },

      getStats: () => {
        return {
          totalConnections: pool.config.connectionLimit,
          activeConnections: pool._allConnections.length,
          freeConnections: pool._freeConnections.length,
          queuedRequests: pool._connectionQueue.length,
        };
      }
    };
  }

  /**
   * Image optimization utility
   */
  async optimizeImage(imagePath, options = {}) {
    const sharp = require('sharp');
    
    const defaultOptions = {
      width: 800,
      height: 600,
      quality: 80,
      format: 'jpeg',
    };

    const config = { ...defaultOptions, ...options };

    try {
      const optimized = await sharp(imagePath)
        .resize(config.width, config.height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: config.quality })
        .toBuffer();

      return optimized;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw error;
    }
  }

  /**
   * API response optimizer
   */
  optimizeApiResponse(data, options = {}) {
    const {
      excludeFields = [],
      includeFields = null,
      maxDepth = 3,
      currentDepth = 0,
    } = options;

    if (currentDepth >= maxDepth) {
      return '[Max depth reached]';
    }

    if (Array.isArray(data)) {
      return data.map(item => 
        this.optimizeApiResponse(item, { ...options, currentDepth: currentDepth + 1 })
      );
    }

    if (data && typeof data === 'object') {
      const optimized = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip excluded fields
        if (excludeFields.includes(key)) {
          continue;
        }

        // Include only specified fields if provided
        if (includeFields && !includeFields.includes(key)) {
          continue;
        }

        // Recursively optimize nested objects
        optimized[key] = this.optimizeApiResponse(
          value, 
          { ...options, currentDepth: currentDepth + 1 }
        );
      }

      return optimized;
    }

    return data;
  }

  /**
   * Cache utilities
   */
  async getFromCache(key) {
    if (!this.redis) return null;

    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async setCache(key, data, duration = 300) {
    if (!this.redis) return;

    try {
      await this.redis.setEx(key, duration, JSON.stringify(data));
      this.cacheStats.sets++;
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidateCache(pattern) {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  /**
   * Performance monitoring
   */
  getPerformanceStats() {
    return {
      cache: {
        hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100 || 0,
        ...this.cacheStats,
      },
      memory: this.monitorMemoryUsage(),
      queries: this.getQueryStats(),
      uptime: process.uptime(),
    };
  }

  getQueryStats() {
    const stats = [];
    
    for (const [hash, data] of this.queryStats.entries()) {
      stats.push({
        query: data.query.substring(0, 100) + '...',
        executions: data.executions,
        averageTime: data.totalTime / data.executions,
        minTime: data.minTime,
        maxTime: data.maxTime,
        errors: data.errors,
      });
    }

    return stats.sort((a, b) => b.averageTime - a.averageTime);
  }

  /**
   * Helper methods
   */
  generateCacheKey(req) {
    const { method, originalUrl, query, user } = req;
    const keyData = {
      method,
      url: originalUrl,
      query,
      userId: user?.id,
    };
    
    return `cache:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  hashQuery(query, params) {
    const crypto = require('crypto');
    const data = query + JSON.stringify(params);
    return crypto.createHash('md5').update(data).digest('hex');
  }

  trackQueryPerformance(hash, query, executionTime, error = null) {
    if (!this.queryStats.has(hash)) {
      this.queryStats.set(hash, {
        query,
        executions: 0,
        totalTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errors: 0,
      });
    }

    const stats = this.queryStats.get(hash);
    stats.executions++;
    stats.totalTime += executionTime;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    
    if (error) {
      stats.errors++;
    }

    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`🐌 Slow query detected (${executionTime}ms):`, query.substring(0, 100));
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

module.exports = PerformanceOptimizer;
