/**
 * Redis Service
 * 
 * Handles Redis connections, caching, sessions, and queues
 */

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.cache = new Map(); // Mock cache for development
    this.sessions = new Map(); // Mock sessions
    this.queues = new Map(); // Mock queues
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    try {
      // In production, use actual Redis client
      // const redis = require('redis');
      // this.client = redis.createClient({
      //   url: process.env.REDIS_URL || 'redis://localhost:6379'
      // });
      // await this.client.connect();
      
      console.log('✅ Redis connected (Mock mode)');
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
      }
      this.isConnected = false;
      console.log('Redis disconnected');
    } catch (error) {
      console.error('Error disconnecting Redis:', error);
    }
  }

  /**
   * Set cache value with TTL
   */
  async set(key, value, ttl = 3600) {
    try {
      const data = {
        value: JSON.stringify(value),
        expires: Date.now() + (ttl * 1000)
      };
      
      this.cache.set(key, data);
      
      // Auto-expire
      setTimeout(() => {
        this.cache.delete(key);
      }, ttl * 1000);
      
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async get(key) {
    try {
      const data = this.cache.get(key);
      
      if (!data) {
        return null;
      }
      
      // Check if expired
      if (Date.now() > data.expires) {
        this.cache.delete(key);
        return null;
      }
      
      return JSON.parse(data.value);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete cache key
   */
  async del(key) {
    try {
      return this.cache.delete(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    try {
      const data = this.cache.get(key);
      if (!data) return false;
      
      // Check if expired
      if (Date.now() > data.expires) {
        this.cache.delete(key);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Set with expiration time
   */
  async setex(key, seconds, value) {
    return this.set(key, value, seconds);
  }

  /**
   * Increment value
   */
  async incr(key) {
    try {
      const current = await this.get(key) || 0;
      const newValue = parseInt(current) + 1;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  /**
   * Decrement value
   */
  async decr(key) {
    try {
      const current = await this.get(key) || 0;
      const newValue = parseInt(current) - 1;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      console.error('Redis DECR error:', error);
      return null;
    }
  }

  /**
   * Get multiple keys
   */
  async mget(keys) {
    try {
      const results = [];
      for (const key of keys) {
        results.push(await this.get(key));
      }
      return results;
    } catch (error) {
      console.error('Redis MGET error:', error);
      return [];
    }
  }

  /**
   * Set multiple key-value pairs
   */
  async mset(keyValuePairs) {
    try {
      for (let i = 0; i < keyValuePairs.length; i += 2) {
        const key = keyValuePairs[i];
        const value = keyValuePairs[i + 1];
        await this.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  /**
   * Session Management
   */
  async setSession(sessionId, data, ttl = 86400) {
    const key = `session:${sessionId}`;
    return this.set(key, data, ttl);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.del(key);
  }

  /**
   * User Cache Management
   */
  async cacheUser(userId, userData, ttl = 3600) {
    const key = `user:${userId}`;
    return this.set(key, userData, ttl);
  }

  async getCachedUser(userId) {
    const key = `user:${userId}`;
    return this.get(key);
  }

  async invalidateUser(userId) {
    const key = `user:${userId}`;
    return this.del(key);
  }

  /**
   * API Response Caching
   */
  async cacheApiResponse(endpoint, params, response, ttl = 300) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.set(key, response, ttl);
  }

  async getCachedApiResponse(endpoint, params) {
    const key = `api:${endpoint}:${JSON.stringify(params)}`;
    return this.get(key);
  }

  /**
   * Rate Limiting
   */
  async checkRateLimit(identifier, limit, window) {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await this.get(key) || 0;
      
      if (current >= limit) {
        return {
          allowed: false,
          current,
          limit,
          resetTime: Date.now() + (window * 1000)
        };
      }
      
      await this.incr(key);
      
      // Set expiration on first request
      if (current === 0) {
        await this.setex(key, window, 1);
      }
      
      return {
        allowed: true,
        current: current + 1,
        limit,
        resetTime: Date.now() + (window * 1000)
      };
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, current: 0, limit };
    }
  }

  /**
   * Queue Management (Simple implementation)
   */
  async addToQueue(queueName, job) {
    try {
      if (!this.queues.has(queueName)) {
        this.queues.set(queueName, []);
      }
      
      const queue = this.queues.get(queueName);
      queue.push({
        id: Date.now().toString(),
        data: job,
        timestamp: Date.now(),
        attempts: 0,
        status: 'pending'
      });
      
      return true;
    } catch (error) {
      console.error('Queue add error:', error);
      return false;
    }
  }

  async processQueue(queueName, processor) {
    try {
      const queue = this.queues.get(queueName);
      if (!queue || queue.length === 0) {
        return;
      }
      
      const job = queue.shift();
      if (job) {
        job.status = 'processing';
        try {
          await processor(job.data);
          job.status = 'completed';
        } catch (error) {
          job.status = 'failed';
          job.attempts++;
          
          // Retry logic
          if (job.attempts < 3) {
            job.status = 'pending';
            queue.push(job);
          }
        }
      }
    } catch (error) {
      console.error('Queue process error:', error);
    }
  }

  /**
   * Health Check
   */
  async healthCheck() {
    try {
      const testKey = 'health_check';
      const testValue = Date.now().toString();
      
      await this.set(testKey, testValue, 10);
      const retrieved = await this.get(testKey);
      await this.del(testKey);
      
      return {
        status: 'healthy',
        connected: this.isConnected,
        test: retrieved === testValue
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      connected: this.isConnected,
      cacheSize: this.cache.size,
      sessionCount: this.sessions.size,
      queueCount: Array.from(this.queues.values()).reduce((total, queue) => total + queue.length, 0),
      uptime: process.uptime()
    };
  }

  /**
   * Clear all cache
   */
  async flushAll() {
    try {
      this.cache.clear();
      this.sessions.clear();
      this.queues.clear();
      return true;
    } catch (error) {
      console.error('Flush all error:', error);
      return false;
    }
  }
}

module.exports = new RedisService();
