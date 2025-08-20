import { config } from 'dotenv';
import request from 'supertest';
import { Application } from 'express';

/**
 * End-to-End Test Setup
 * 
 * Setup configuration for E2E tests including test database,
 * test server, and integration test utilities.
 */

// Load test environment
config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Test database configuration
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 
  process.env.DATABASE_URL?.replace(/\/[^\/]+$/, '/test_communication_platform');

if (TEST_DATABASE_URL) {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
}

// Global test utilities for E2E tests
export const e2eHelpers = {
  /**
   * Create authenticated request
   */
  createAuthenticatedRequest: async (app: Application, userCredentials?: any) => {
    const credentials = userCredentials || {
      email: 'test@example.com',
      password: 'testpassword123',
    };

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send(credentials)
      .expect(200);

    const { accessToken } = loginResponse.body.data;

    // Return request with authorization header
    return {
      get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${accessToken}`),
      post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${accessToken}`),
      put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${accessToken}`),
      patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${accessToken}`),
      delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${accessToken}`),
      token: accessToken,
    };
  },

  /**
   * Create test user
   */
  createTestUser: async (app: Application, userData?: any) => {
    const defaultUserData = {
      email: `test-${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      companyName: 'Test Company',
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...defaultUserData, ...userData })
      .expect(201);

    return response.body.data;
  },

  /**
   * Create test company
   */
  createTestCompany: async (app: Application, companyData?: any) => {
    const defaultCompanyData = {
      name: `Test Company ${Date.now()}`,
      email: `company-${Date.now()}@example.com`,
      plan: 'basic',
    };

    const authRequest = await e2eHelpers.createAuthenticatedRequest(app);
    
    const response = await authRequest
      .post('/api/v1/companies')
      .send({ ...defaultCompanyData, ...companyData })
      .expect(201);

    return response.body.data;
  },

  /**
   * Create test customer
   */
  createTestCustomer: async (app: Application, customerData?: any) => {
    const defaultCustomerData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `customer-${Date.now()}@example.com`,
      phone: '+1234567890',
      status: 'CUSTOMER',
    };

    const authRequest = await e2eHelpers.createAuthenticatedRequest(app);
    
    const response = await authRequest
      .post('/api/v1/customers')
      .send({ ...defaultCustomerData, ...customerData })
      .expect(201);

    return response.body.data;
  },

  /**
   * Create test product
   */
  createTestProduct: async (app: Application, productData?: any) => {
    const defaultProductData = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product description',
      price: 99.99,
      sku: `TEST-${Date.now()}`,
      stock: 100,
      isActive: true,
    };

    const authRequest = await e2eHelpers.createAuthenticatedRequest(app);
    
    const response = await authRequest
      .post('/api/v1/products')
      .send({ ...defaultProductData, ...productData })
      .expect(201);

    return response.body.data;
  },

  /**
   * Create test conversation
   */
  createTestConversation: async (app: Application, conversationData?: any) => {
    // First create a customer
    const customer = await e2eHelpers.createTestCustomer(app);

    const defaultConversationData = {
      customerId: customer.id,
      channel: 'FACEBOOK',
      status: 'ACTIVE',
    };

    const authRequest = await e2eHelpers.createAuthenticatedRequest(app);
    
    const response = await authRequest
      .post('/api/v1/conversations')
      .send({ ...defaultConversationData, ...conversationData })
      .expect(201);

    return response.body.data;
  },

  /**
   * Wait for async operations
   */
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Cleanup test data
   */
  cleanupTestData: async (app: Application) => {
    // This would clean up test data from database
    // Implementation depends on your database setup
    
    const authRequest = await e2eHelpers.createAuthenticatedRequest(app);
    
    try {
      // Clean up in reverse order of dependencies
      await authRequest.delete('/api/v1/test/cleanup').expect(200);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  },

  /**
   * Assert API response structure
   */
  assertApiResponse: (response: any, expectedData?: any) => {
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('data');
    
    if (expectedData) {
      expect(response.body.data).toMatchObject(expectedData);
    }
  },

  /**
   * Assert error response structure
   */
  assertErrorResponse: (response: any, expectedCode?: string) => {
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code');
    expect(response.body.error).toHaveProperty('message');
    
    if (expectedCode) {
      expect(response.body.error.code).toBe(expectedCode);
    }
  },

  /**
   * Assert pagination response
   */
  assertPaginationResponse: (response: any) => {
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  },
};

// Global setup and teardown for E2E tests
beforeAll(async () => {
  // Setup test database
  // This would typically run database migrations for test environment
});

afterAll(async () => {
  // Cleanup after all E2E tests
  // This would typically clean up test database
});

beforeEach(async () => {
  // Setup before each test
  // This might seed test data
});

afterEach(async () => {
  // Cleanup after each test
  // This might clean up test data
});
