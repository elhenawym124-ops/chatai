import { config } from 'dotenv';
import { logger } from '@/utils/logger';

/**
 * Test Setup Configuration
 * 
 * Global setup for Jest tests including environment configuration,
 * database setup, and common test utilities.
 */

// Load test environment variables
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Disable logging during tests (unless explicitly enabled)
if (!process.env.ENABLE_TEST_LOGS) {
  logger.silent = true;
}

// Global test timeout
jest.setTimeout(30000);

// Mock external services by default
jest.mock('@/config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue({}),
  getRedisClient: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    keys: jest.fn(),
  }),
  RedisCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    keys: jest.fn(),
    incr: jest.fn(),
    decr: jest.fn(),
  })),
  RedisPubSub: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  })),
}));

// Mock Socket.IO
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    use: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
  })),
}));

// Mock external APIs
jest.mock('axios');

// Mock file system operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Mock email service
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock SMS service
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test-sms-sid' }),
    },
  }));
});

// Mock payment services
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidDate(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: string | Date) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});

// Global test helpers
export const testHelpers = {
  /**
   * Create a mock request object
   */
  createMockRequest: (overrides: any = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ip: '127.0.0.1',
    method: 'GET',
    path: '/test',
    ...overrides,
  }),

  /**
   * Create a mock response object
   */
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Create a mock next function
   */
  createMockNext: () => jest.fn(),

  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate test data
   */
  generateTestUser: () => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'AGENT',
    companyId: 'test-company-id',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  generateTestCompany: () => ({
    id: 'test-company-id',
    name: 'Test Company',
    email: 'company@example.com',
    plan: 'basic',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  generateTestCustomer: () => ({
    id: 'test-customer-id',
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@example.com',
    phone: '+1234567890',
    status: 'CUSTOMER',
    companyId: 'test-company-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  /**
   * Clean up test data
   */
  cleanup: async () => {
    // This would typically clean up test database
    // Implementation depends on your database setup
  },
};

// Setup and teardown hooks
beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
  await testHelpers.cleanup();
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});
