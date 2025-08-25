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
    },
    // تحسين إعدادات الاتصال
    __internal: {
      engine: {
        connectTimeout: 60000,
        queryTimeout: 60000,
        pool: {
          max: 10,        // حد أقصى 10 اتصالات
          min: 2,         // حد أدنى 2 اتصالات
          idle: 10000,    // إغلاق الاتصالات الخاملة بعد 10 ثوان
          acquire: 60000, // انتظار الحصول على اتصال لمدة 60 ثانية
          evict: 1000     // فحص الاتصالات الخاملة كل ثانية
        }
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
 * Execute database operation with retry logic
 */
async function executeWithRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error;

      // Check if it's a connection error
      const isConnectionError = error.message.includes('max_connections_per_hour') ||
                               error.message.includes('Connection') ||
                               error.message.includes('timeout') ||
                               error.code === 'P1001' ||
                               error.code === 'P1008';

      if (isConnectionError && attempt < maxRetries) {
        console.log(`⚠️ [SharedDB] Connection error on attempt ${attempt}/${maxRetries}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Health check for database connection
 */
async function healthCheck() {
  try {
    if (!sharedPrismaInstance) {
      return { status: 'disconnected', error: 'No instance' };
    }

    await executeWithRetry(async () => {
      await sharedPrismaInstance.$queryRaw`SELECT 1 as health`;
    });

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
  healthCheck,
  executeWithRetry
};
