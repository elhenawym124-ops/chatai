/**
 * Shared Database Service
 * 
 * This service provides a single, shared PrismaClient instance
 * to prevent connection pool exhaustion and improve performance.
 */

const { PrismaClient } = require('@prisma/client');

// Global shared instance
let sharedPrismaInstance = null;
let connectionCount = 0;
let isInitialized = false;

/**
 * Create optimized PrismaClient with connection pooling
 */
function createOptimizedPrismaClient() {
  console.log('🔧 [SharedDB] Creating optimized PrismaClient...');
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
    errorFormat: 'minimal',
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

/**
 * Get shared PrismaClient instance
 */
function getSharedPrismaClient() {
  if (!sharedPrismaInstance) {
    try {
      sharedPrismaInstance = createOptimizedPrismaClient();
      isInitialized = true;
      console.log('✅ [SharedDB] Shared PrismaClient created successfully');
      
      // Add connection event listeners
      sharedPrismaInstance.$on('query', () => {
        connectionCount++;
      });
      
    } catch (error) {
      console.error('❌ [SharedDB] Failed to create PrismaClient:', error);
      throw error;
    }
  }
  
  return sharedPrismaInstance;
}

/**
 * Initialize shared database connection
 */
async function initializeSharedDatabase() {
  try {
    const prisma = getSharedPrismaClient();
    
    // Test connection
    await prisma.$connect();
    console.log('✅ [SharedDB] Database connection established');
    
    // Test query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ [SharedDB] Database query test successful');
    
    return true;
  } catch (error) {
    console.error('❌ [SharedDB] Database initialization failed:', error);
    throw error;
  }
}

/**
 * Get connection statistics
 */
function getConnectionStats() {
  return {
    isInitialized,
    connectionCount,
    hasInstance: !!sharedPrismaInstance
  };
}

/**
 * Gracefully close database connection
 */
async function closeSharedDatabase() {
  if (sharedPrismaInstance) {
    try {
      await sharedPrismaInstance.$disconnect();
      console.log('✅ [SharedDB] Database connection closed gracefully');
      sharedPrismaInstance = null;
      isInitialized = false;
      connectionCount = 0;
    } catch (error) {
      console.error('❌ [SharedDB] Error closing database:', error);
    }
  }
}

/**
 * Health check for database connection
 */
async function healthCheck() {
  try {
    if (!sharedPrismaInstance) {
      return { status: 'disconnected', error: 'No instance' };
    }
    
    await sharedPrismaInstance.$queryRaw`SELECT 1 as health`;
    return { 
      status: 'healthy', 
      connectionCount,
      isInitialized 
    };
  } catch (error) {
    return { 
      status: 'error', 
      error: error.message,
      connectionCount,
      isInitialized 
    };
  }
}

// Handle process termination gracefully
process.on('beforeExit', async () => {
  console.log('🔄 [SharedDB] Process exiting, closing database...');
  await closeSharedDatabase();
});

process.on('SIGINT', async () => {
  console.log('🔄 [SharedDB] SIGINT received, closing database...');
  await closeSharedDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 [SharedDB] SIGTERM received, closing database...');
  await closeSharedDatabase();
  process.exit(0);
});

module.exports = {
  getSharedPrismaClient,
  initializeSharedDatabase,
  closeSharedDatabase,
  getConnectionStats,
  healthCheck
};
