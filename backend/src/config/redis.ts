import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';
import { config } from '@/config';

/**
 * Redis Configuration and Connection Management
 * 
 * This module handles Redis connection for caching, sessions,
 * and real-time features like pub/sub.
 */

let redisClient: RedisClientType;
let redisSubscriber: RedisClientType;
let redisPublisher: RedisClientType;

/**
 * Create Redis client with configuration
 */
const createRedisClient = (purpose: string = 'main'): RedisClientType => {
  const client = createClient({
    url: config.redis.url,
    socket: {
      connectTimeout: 10000,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error(`Redis ${purpose} client: Too many reconnection attempts`);
          return new Error('Too many reconnection attempts');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  // Event handlers
  client.on('connect', () => {
    logger.info(`Redis ${purpose} client: Connected`);
  });

  client.on('ready', () => {
    logger.info(`Redis ${purpose} client: Ready`);
  });

  client.on('error', (error) => {
    logger.error(`Redis ${purpose} client error:`, error);
  });

  client.on('end', () => {
    logger.info(`Redis ${purpose} client: Connection ended`);
  });

  client.on('reconnecting', () => {
    logger.info(`Redis ${purpose} client: Reconnecting...`);
  });

  return client as any;
};

/**
 * Initialize Redis connections
 */
export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (!redisClient) {
      redisClient = createRedisClient('main');
      await redisClient.connect();
    }

    // Test the connection
    await redisClient.ping();
    
    logger.info('Redis main client connected successfully');
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw new Error('Redis connection failed');
  }
};

/**
 * Initialize Redis pub/sub clients
 */
export const initializePubSub = async (): Promise<void> => {
  try {
    // Publisher client
    if (!redisPublisher) {
      redisPublisher = createRedisClient('publisher');
      await redisPublisher.connect();
    }

    // Subscriber client
    if (!redisSubscriber) {
      redisSubscriber = createRedisClient('subscriber');
      await redisSubscriber.connect();
    }

    logger.info('Redis pub/sub clients initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Redis pub/sub:', error);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

/**
 * Get Redis publisher client
 */
export const getRedisPublisher = (): RedisClientType => {
  if (!redisPublisher) {
    throw new Error('Redis publisher not initialized. Call initializePubSub() first.');
  }
  return redisPublisher;
};

/**
 * Get Redis subscriber client
 */
export const getRedisSubscriber = (): RedisClientType => {
  if (!redisSubscriber) {
    throw new Error('Redis subscriber not initialized. Call initializePubSub() first.');
  }
  return redisSubscriber;
};

/**
 * Redis health check
 */
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    if (!redisClient) {
      return false;
    }

    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

/**
 * Cache utilities
 */
export class RedisCache {
  private client: RedisClientType;

  constructor() {
    this.client = getRedisClient();
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: string | object, ttlSeconds?: number): Promise<void> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  /**
   * Get a value from cache
   */
  async get<T = string>(key: string, parseJson = false): Promise<T | null> {
    const value = await this.client.get(key);
    
    if (!value) {
      return null;
    }

    if (parseJson) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    }

    return value as T;
  }

  /**
   * Delete a key from cache
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set TTL for existing key
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Decrement a numeric value
   */
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }
}

/**
 * Pub/Sub utilities
 */
export class RedisPubSub {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor() {
    this.publisher = getRedisPublisher();
    this.subscriber = getRedisSubscriber();
  }

  /**
   * Publish a message to a channel
   */
  async publish(channel: string, message: string | object): Promise<void> {
    const serializedMessage = typeof message === 'string' ? message : JSON.stringify(message);
    await this.publisher.publish(channel, serializedMessage);
  }

  /**
   * Subscribe to a channel
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel, callback);
  }

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  /**
   * Pattern subscribe
   */
  async pSubscribe(pattern: string, callback: (message: string, channel: string) => void): Promise<void> {
    await this.subscriber.pSubscribe(pattern, callback);
  }
}

/**
 * Close Redis connections
 */
export const closeRedisConnections = async (): Promise<void> => {
  const promises: Promise<void>[] = [];

  if (redisClient) {
    promises.push(redisClient.quit() as Promise<void>);
  }

  if (redisPublisher) {
    promises.push(redisPublisher.quit() as Promise<void>);
  }

  if (redisSubscriber) {
    promises.push(redisSubscriber.quit() as Promise<void>);
  }

  await Promise.all(promises);
  logger.info('All Redis connections closed');
};

// Handle process termination
process.on('beforeExit', async () => {
  await closeRedisConnections();
});

process.on('SIGINT', async () => {
  await closeRedisConnections();
});

process.on('SIGTERM', async () => {
  await closeRedisConnections();
});
