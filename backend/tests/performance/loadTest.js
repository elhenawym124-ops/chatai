/**
 * Performance Load Testing Suite
 * 
 * Comprehensive performance testing for the communication platform
 * Tests API endpoints, database queries, and system responsiveness
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

class PerformanceTestSuite {
  constructor() {
    this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:3001';
    this.testResults = [];
    this.concurrentUsers = [1, 5, 10, 25, 50, 100];
    this.testDuration = 60000; // 1 minute per test
    this.endpoints = [
      { path: '/api/v1/auth/login', method: 'POST', data: { email: 'test@test.com', password: 'password' } },
      { path: '/api/v1/customers', method: 'GET' },
      { path: '/api/v1/conversations', method: 'GET' },
      { path: '/api/v1/products', method: 'GET' },
      { path: '/api/v1/orders', method: 'GET' },
      { path: '/api/v1/reports/dashboard', method: 'GET' },
    ];
  }

  /**
   * Run complete performance test suite
   */
  async runPerformanceTests() {
    console.log('🚀 Starting Performance Test Suite...\n');

    try {
      // Test individual endpoints
      await this.testEndpointPerformance();
      
      // Test concurrent load
      await this.testConcurrentLoad();
      
      // Test database performance
      await this.testDatabasePerformance();
      
      // Test memory usage
      await this.testMemoryUsage();
      
      // Generate performance report
      this.generatePerformanceReport();

    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
    }
  }

  /**
   * Test individual endpoint performance
   */
  async testEndpointPerformance() {
    console.log('📊 Testing Individual Endpoint Performance...\n');

    for (const endpoint of this.endpoints) {
      console.log(`Testing ${endpoint.method} ${endpoint.path}`);
      
      const results = {
        endpoint: `${endpoint.method} ${endpoint.path}`,
        requests: 100,
        responses: [],
        errors: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        throughput: 0,
      };

      // Run 100 requests to each endpoint
      for (let i = 0; i < 100; i++) {
        try {
          const startTime = performance.now();
          
          const response = await this.makeRequest(endpoint);
          
          const endTime = performance.now();
          const responseTime = endTime - startTime;

          results.responses.push({
            time: responseTime,
            status: response.status,
            size: JSON.stringify(response.data).length,
          });

          results.minTime = Math.min(results.minTime, responseTime);
          results.maxTime = Math.max(results.maxTime, responseTime);

        } catch (error) {
          results.errors++;
        }
      }

      // Calculate statistics
      if (results.responses.length > 0) {
        results.averageTime = results.responses.reduce((sum, r) => sum + r.time, 0) / results.responses.length;
        results.throughput = results.responses.length / (results.maxTime / 1000); // requests per second
      }

      this.testResults.push(results);
      
      console.log(`  ✅ Average Response Time: ${results.averageTime.toFixed(2)}ms`);
      console.log(`  ✅ Min/Max: ${results.minTime.toFixed(2)}ms / ${results.maxTime.toFixed(2)}ms`);
      console.log(`  ✅ Success Rate: ${((results.responses.length / results.requests) * 100).toFixed(2)}%`);
      console.log(`  ✅ Throughput: ${results.throughput.toFixed(2)} req/sec\n`);
    }
  }

  /**
   * Test concurrent load
   */
  async testConcurrentLoad() {
    console.log('🔄 Testing Concurrent Load Performance...\n');

    for (const userCount of this.concurrentUsers) {
      console.log(`Testing with ${userCount} concurrent users...`);
      
      const startTime = performance.now();
      const promises = [];

      // Create concurrent requests
      for (let i = 0; i < userCount; i++) {
        const promise = this.simulateUserSession();
        promises.push(promise);
      }

      try {
        const results = await Promise.allSettled(promises);
        const endTime = performance.now();
        const totalTime = endTime - startTime;

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`  ✅ ${userCount} users completed in ${totalTime.toFixed(2)}ms`);
        console.log(`  ✅ Success: ${successful}, Failed: ${failed}`);
        console.log(`  ✅ Success Rate: ${((successful / userCount) * 100).toFixed(2)}%\n`);

        this.testResults.push({
          test: 'concurrent_load',
          users: userCount,
          totalTime,
          successful,
          failed,
          successRate: (successful / userCount) * 100,
        });

      } catch (error) {
        console.error(`  ❌ Failed with ${userCount} users:`, error.message);
      }
    }
  }

  /**
   * Simulate user session
   */
  async simulateUserSession() {
    const session = [];
    
    try {
      // Login
      const loginResponse = await this.makeRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        data: { email: 'test@test.com', password: 'password' }
      });

      // Get dashboard data
      await this.makeRequest({ path: '/api/v1/reports/dashboard', method: 'GET' });
      
      // Get conversations
      await this.makeRequest({ path: '/api/v1/conversations', method: 'GET' });
      
      // Get customers
      await this.makeRequest({ path: '/api/v1/customers', method: 'GET' });

      return session;

    } catch (error) {
      throw new Error(`User session failed: ${error.message}`);
    }
  }

  /**
   * Test database performance
   */
  async testDatabasePerformance() {
    console.log('🗄️ Testing Database Performance...\n');

    const dbTests = [
      {
        name: 'Customer Query Performance',
        endpoint: { path: '/api/v1/customers?limit=1000', method: 'GET' },
      },
      {
        name: 'Conversation Query Performance',
        endpoint: { path: '/api/v1/conversations?limit=500', method: 'GET' },
      },
      {
        name: 'Product Search Performance',
        endpoint: { path: '/api/v1/products?search=test&limit=100', method: 'GET' },
      },
      {
        name: 'Order History Performance',
        endpoint: { path: '/api/v1/orders?limit=200', method: 'GET' },
      },
    ];

    for (const test of dbTests) {
      console.log(`Testing ${test.name}...`);
      
      const times = [];
      
      // Run test 10 times
      for (let i = 0; i < 10; i++) {
        try {
          const startTime = performance.now();
          await this.makeRequest(test.endpoint);
          const endTime = performance.now();
          
          times.push(endTime - startTime);
        } catch (error) {
          console.error(`  ❌ Database test failed:`, error.message);
        }
      }

      if (times.length > 0) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);

        console.log(`  ✅ Average Query Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  ✅ Min/Max: ${minTime.toFixed(2)}ms / ${maxTime.toFixed(2)}ms\n`);

        this.testResults.push({
          test: 'database_performance',
          name: test.name,
          averageTime: avgTime,
          minTime,
          maxTime,
          samples: times.length,
        });
      }
    }
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    console.log('💾 Testing Memory Usage...\n');

    const initialMemory = process.memoryUsage();
    console.log('Initial Memory Usage:');
    console.log(`  RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB\n`);

    // Simulate heavy load
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(this.simulateUserSession());
    }

    await Promise.allSettled(promises);

    const finalMemory = process.memoryUsage();
    console.log('Final Memory Usage:');
    console.log(`  RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)} MB\n`);

    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    };

    console.log('Memory Increase:');
    console.log(`  RSS: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Heap Total: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB\n`);

    this.testResults.push({
      test: 'memory_usage',
      initial: initialMemory,
      final: finalMemory,
      increase: memoryIncrease,
    });
  }

  /**
   * Make HTTP request
   */
  async makeRequest(endpoint) {
    const config = {
      method: endpoint.method,
      url: `${this.baseURL}${endpoint.path}`,
      timeout: 10000,
    };

    if (endpoint.data) {
      config.data = endpoint.data;
    }

    return await axios(config);
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    console.log('📋 Performance Test Report\n');
    console.log('=' * 50);

    // Endpoint performance summary
    console.log('\n🎯 Endpoint Performance Summary:');
    const endpointResults = this.testResults.filter(r => r.endpoint);
    endpointResults.forEach(result => {
      console.log(`\n${result.endpoint}:`);
      console.log(`  Average Response Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`  Success Rate: ${((result.responses.length / result.requests) * 100).toFixed(2)}%`);
      console.log(`  Throughput: ${result.throughput.toFixed(2)} req/sec`);
    });

    // Concurrent load summary
    console.log('\n🔄 Concurrent Load Summary:');
    const loadResults = this.testResults.filter(r => r.test === 'concurrent_load');
    loadResults.forEach(result => {
      console.log(`\n${result.users} concurrent users:`);
      console.log(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Success Rate: ${result.successRate.toFixed(2)}%`);
    });

    // Database performance summary
    console.log('\n🗄️ Database Performance Summary:');
    const dbResults = this.testResults.filter(r => r.test === 'database_performance');
    dbResults.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Average Query Time: ${result.averageTime.toFixed(2)}ms`);
      console.log(`  Min/Max: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
    });

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    this.generateRecommendations();

    console.log('\n✅ Performance testing completed successfully!');
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const endpointResults = this.testResults.filter(r => r.endpoint);
    
    endpointResults.forEach(result => {
      if (result.averageTime > 1000) {
        console.log(`  ⚠️  ${result.endpoint} is slow (${result.averageTime.toFixed(2)}ms) - Consider optimization`);
      }
      
      if (result.errors > 0) {
        console.log(`  ❌ ${result.endpoint} has errors (${result.errors}) - Investigate error handling`);
      }
      
      if (result.throughput < 10) {
        console.log(`  📉 ${result.endpoint} has low throughput (${result.throughput.toFixed(2)} req/sec) - Consider caching`);
      }
    });

    const memoryResult = this.testResults.find(r => r.test === 'memory_usage');
    if (memoryResult && memoryResult.increase.heapUsed > 100 * 1024 * 1024) { // 100MB
      console.log(`  💾 High memory usage increase detected - Check for memory leaks`);
    }
  }
}

// Export for use in other test files
module.exports = PerformanceTestSuite;

// Run tests if called directly
if (require.main === module) {
  const testSuite = new PerformanceTestSuite();
  testSuite.runPerformanceTests().catch(console.error);
}
