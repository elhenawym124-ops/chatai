import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { config } from '@/config';

/**
 * Database Configuration and Connection Management
 * 
 * This module handles the Prisma database connection and provides
 * utilities for database operations and health checks.
 */

// Global Prisma client instance
let prisma: PrismaClient;

/**
 * Create and configure Prisma client
 */
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: config.env === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });
};

/**
 * Initialize database connection
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!prisma) {
      prisma = createPrismaClient();
    }

    // Test the connection
    await prisma.$connect();
    
    // SECURITY: Safe connection test query - no user data or company isolation needed
    // This is a simple database connectivity test that doesn't access any user tables
    await prisma.$queryRaw`SELECT 1 as connection_test`;
    
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
};

/**
 * Get Prisma client instance
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
};

/**
 * Close database connection
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database connection closed');
  }
};

/**
 * Database health check
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!prisma) {
      return false;
    }

    // SECURITY: Safe health check query - no user data or company isolation needed
    // This is a simple database health check that doesn't access any user tables
    await prisma.$queryRaw`SELECT 1 as health_check`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Database transaction wrapper
 */
export const withTransaction = async <T>(
  callback: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
): Promise<T> => {
  const client = getPrismaClient();
  return await client.$transaction(callback);
};

/**
 * Database middleware for logging and monitoring
 */
export const setupDatabaseMiddleware = (): void => {
  const client = getPrismaClient();

  // Query logging middleware
  client.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();

    const duration = after - before;

    if (config.env === 'development' || duration > 1000) {
      logger.info(`Query ${params.model}.${params.action} took ${duration}ms`);
    }

    return result;
  });

  // Error handling middleware
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      logger.error('Database query error:', {
        model: params.model,
        action: params.action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  });
};

/**
 * Database cleanup for testing
 */
export const cleanupDatabase = async (): Promise<void> => {
  if (config.env !== 'test') {
    throw new Error('Database cleanup is only allowed in test environment');
  }

  const client = getPrismaClient();
  
  // SECURITY: Safe admin operation for testing - queries system tables only
  // This queries information_schema which is safe and doesn't contain user data
  const tables = await client.$queryRaw<Array<{ TABLE_NAME: string }>>`
    SELECT TABLE_NAME FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'
  `;

  // SECURITY: Safe admin operations for testing environment only
  // These operations are safe as they're used for test database cleanup

  // Disable foreign key checks (MySQL) - Admin operation for testing
  await client.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

  // Truncate all tables - Admin operation for testing
  for (const table of tables) {
    if (table.TABLE_NAME !== '_prisma_migrations') {
      // SECURITY: Safe for testing - table names come from system catalog
      await client.$executeRawUnsafe(`TRUNCATE TABLE \`${table.TABLE_NAME}\``);
    }
  }

  // Re-enable foreign key checks (MySQL) - Admin operation
  await client.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

  logger.info('Database cleaned up for testing');
};

/**
 * Export the Prisma client for direct use
 */
export { prisma };

// Handle process termination
process.on('beforeExit', async () => {
  await closeDatabaseConnection();
});

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
