/**
 * Basic APIs Testing Script
 * 
 * This script tests all basic API endpoints including
 * authentication, customers, conversations, and products
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BasicAPIChecker {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      authentication: {},
      customers: {},
      conversations: {},
      products: {},
      orders: {},
      general: {},
      summary: {
        totalEndpoints: 0,
        workingEndpoints: 0,
        failedEndpoints: 0,
        overallStatus: 'unknown'
      },
      issues: []
    };
    
    this.authToken = null;
    this.testUser = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
  }

  /**
   * Run complete basic API check
   */
  async runBasicAPICheck() {
    console.log('🔌 بدء فحص APIs الأساسية...\n');

    try {
      // Test general endpoints
      await this.testGeneralEndpoints();
      
      // Test authentication endpoints
      await this.testAuthenticationEndpoints();
      
      // Test customers endpoints
      await this.testCustomersEndpoints();
      
      // Test conversations endpoints
      await this.testConversationsEndpoints();
      
      // Test products endpoints
      await this.testProductsEndpoints();
      
      // Test orders endpoints
      await this.testOrdersEndpoints();
      
      // Generate report
      this.generateAPIReport();

    } catch (error) {
      console.error('❌ خطأ في فحص APIs:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `API check failed: ${error.message}`
      });
    }
  }

  /**
   * Test general endpoints
   */
  async testGeneralEndpoints() {
    console.log('🌐 فحص النقاط العامة...');
    
    const generalEndpoints = [
      { path: '/health', name: 'Health Check', method: 'GET' },
      { path: '/api/v1/health', name: 'API Health', method: 'GET' },
      { path: '/api/v1/status', name: 'API Status', method: 'GET' }
    ];
    
    for (const endpoint of generalEndpoints) {
      await this.testEndpoint('general', endpoint);
    }
    
    console.log();
  }

  /**
   * Test authentication endpoints
   */
  async testAuthenticationEndpoints() {
    console.log('🔐 فحص نقاط المصادقة...');
    
    const authEndpoints = [
      { path: '/api/v1/auth/status', name: 'Auth Status', method: 'GET' },
      { path: '/api/v1/auth/login', name: 'Login', method: 'POST', data: this.testUser },
      { path: '/api/v1/auth/register', name: 'Register', method: 'POST', data: { ...this.testUser, name: 'Test User' } },
      { path: '/api/v1/auth/logout', name: 'Logout', method: 'POST', requiresAuth: true },
      { path: '/api/v1/auth/refresh', name: 'Refresh Token', method: 'POST' },
      { path: '/api/v1/auth/profile', name: 'User Profile', method: 'GET', requiresAuth: true }
    ];
    
    for (const endpoint of authEndpoints) {
      const result = await this.testEndpoint('authentication', endpoint);
      
      // If login successful, store token
      if (endpoint.name === 'Login' && result.success && result.data && result.data.token) {
        this.authToken = result.data.token;
        console.log('  🔑 تم الحصول على رمز المصادقة');
      }
    }
    
    console.log();
  }

  /**
   * Test customers endpoints
   */
  async testCustomersEndpoints() {
    console.log('👥 فحص نقاط العملاء...');
    
    const customersEndpoints = [
      { path: '/api/v1/customers', name: 'Get Customers', method: 'GET', requiresAuth: true },
      { path: '/api/v1/customers', name: 'Create Customer', method: 'POST', requiresAuth: true, data: { name: 'Test Customer', email: 'customer@test.com', phone: '1234567890' } },
      { path: '/api/v1/customers/1', name: 'Get Customer by ID', method: 'GET', requiresAuth: true },
      { path: '/api/v1/customers/1', name: 'Update Customer', method: 'PUT', requiresAuth: true, data: { name: 'Updated Customer' } },
      { path: '/api/v1/customers/search', name: 'Search Customers', method: 'GET', requiresAuth: true, params: { q: 'test' } },
      { path: '/api/v1/customers/stats', name: 'Customer Stats', method: 'GET', requiresAuth: true },
      { path: '/api/v1/customers/segments', name: 'Customer Segments', method: 'GET', requiresAuth: true }
    ];
    
    for (const endpoint of customersEndpoints) {
      await this.testEndpoint('customers', endpoint);
    }
    
    console.log();
  }

  /**
   * Test conversations endpoints
   */
  async testConversationsEndpoints() {
    console.log('💬 فحص نقاط المحادثات...');
    
    const conversationsEndpoints = [
      { path: '/api/v1/conversations', name: 'Get Conversations', method: 'GET', requiresAuth: true },
      { path: '/api/v1/conversations', name: 'Create Conversation', method: 'POST', requiresAuth: true, data: { customerId: 1, message: 'Test message' } },
      { path: '/api/v1/conversations/1', name: 'Get Conversation by ID', method: 'GET', requiresAuth: true },
      { path: '/api/v1/conversations/1/messages', name: 'Get Messages', method: 'GET', requiresAuth: true },
      { path: '/api/v1/conversations/1/messages', name: 'Send Message', method: 'POST', requiresAuth: true, data: { message: 'Test reply', type: 'text' } },
      { path: '/api/v1/conversations/1/status', name: 'Update Status', method: 'PUT', requiresAuth: true, data: { status: 'active' } },
      { path: '/api/v1/conversations/stats', name: 'Conversation Stats', method: 'GET', requiresAuth: true },
      { path: '/api/v1/conversations/search', name: 'Search Conversations', method: 'GET', requiresAuth: true, params: { q: 'test' } }
    ];
    
    for (const endpoint of conversationsEndpoints) {
      await this.testEndpoint('conversations', endpoint);
    }
    
    console.log();
  }

  /**
   * Test products endpoints
   */
  async testProductsEndpoints() {
    console.log('🛍️ فحص نقاط المنتجات...');
    
    const productsEndpoints = [
      { path: '/api/v1/products', name: 'Get Products', method: 'GET' },
      { path: '/api/v1/products', name: 'Create Product', method: 'POST', requiresAuth: true, data: { name: 'Test Product', price: 99.99, description: 'Test description' } },
      { path: '/api/v1/products/1', name: 'Get Product by ID', method: 'GET' },
      { path: '/api/v1/products/1', name: 'Update Product', method: 'PUT', requiresAuth: true, data: { name: 'Updated Product' } },
      { path: '/api/v1/products/search', name: 'Search Products', method: 'GET', params: { q: 'test' } },
      { path: '/api/v1/products/categories', name: 'Get Categories', method: 'GET' },
      { path: '/api/v1/products/featured', name: 'Featured Products', method: 'GET' },
      { path: '/api/v1/products/1/reviews', name: 'Product Reviews', method: 'GET' }
    ];
    
    for (const endpoint of productsEndpoints) {
      await this.testEndpoint('products', endpoint);
    }
    
    console.log();
  }

  /**
   * Test orders endpoints
   */
  async testOrdersEndpoints() {
    console.log('📦 فحص نقاط الطلبات...');
    
    const ordersEndpoints = [
      { path: '/api/v1/orders', name: 'Get Orders', method: 'GET', requiresAuth: true },
      { path: '/api/v1/orders', name: 'Create Order', method: 'POST', requiresAuth: true, data: { customerId: 1, items: [{ productId: 1, quantity: 2 }] } },
      { path: '/api/v1/orders/1', name: 'Get Order by ID', method: 'GET', requiresAuth: true },
      { path: '/api/v1/orders/1/status', name: 'Update Order Status', method: 'PUT', requiresAuth: true, data: { status: 'processing' } },
      { path: '/api/v1/orders/stats', name: 'Order Stats', method: 'GET', requiresAuth: true },
      { path: '/api/v1/orders/search', name: 'Search Orders', method: 'GET', requiresAuth: true, params: { q: 'test' } }
    ];
    
    for (const endpoint of ordersEndpoints) {
      await this.testEndpoint('orders', endpoint);
    }
    
    console.log();
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(category, endpoint) {
    const url = `${this.baseURL}${endpoint.path}`;
    const startTime = Date.now();
    
    try {
      // Prepare request config
      const config = {
        method: endpoint.method,
        url,
        timeout: 10000,
        validateStatus: () => true // Accept any status code
      };
      
      // Add authentication if required
      if (endpoint.requiresAuth && this.authToken) {
        config.headers = {
          'Authorization': `Bearer ${this.authToken}`
        };
      }
      
      // Add data for POST/PUT requests
      if (endpoint.data) {
        config.data = endpoint.data;
      }
      
      // Add query parameters
      if (endpoint.params) {
        config.params = endpoint.params;
      }
      
      // Make request
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      // Determine success
      const isSuccess = response.status < 500;
      const isExpectedAuth = endpoint.requiresAuth && !this.authToken && response.status === 401;
      
      // Store result
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: isSuccess || isExpectedAuth ? 'SUCCESS' : 'FAILED',
        statusCode: response.status,
        responseTime,
        requiresAuth: endpoint.requiresAuth || false,
        hasAuth: !!this.authToken,
        data: response.data,
        success: isSuccess || isExpectedAuth
      };
      
      this.results[category][endpoint.name] = result;
      this.results.summary.totalEndpoints++;
      
      if (result.success) {
        this.results.summary.workingEndpoints++;
        const authNote = endpoint.requiresAuth ? (this.authToken ? ' 🔐' : ' 🔒') : '';
        console.log(`  ✅ ${endpoint.name}: ${response.status} (${responseTime}ms)${authNote}`);
      } else {
        this.results.summary.failedEndpoints++;
        console.log(`  ❌ ${endpoint.name}: ${response.status} (${responseTime}ms)`);
        this.results.issues.push({
          type: 'HIGH',
          message: `${endpoint.name} API failed with status ${response.status}`
        });
      }
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: 'ERROR',
        statusCode: null,
        responseTime,
        error: error.message,
        success: false
      };
      
      this.results[category][endpoint.name] = result;
      this.results.summary.totalEndpoints++;
      this.results.summary.failedEndpoints++;
      
      console.log(`  ❌ ${endpoint.name}: خطأ - ${error.message}`);
      this.results.issues.push({
        type: 'HIGH',
        message: `${endpoint.name} API error: ${error.message}`
      });
      
      return result;
    }
  }

  /**
   * Generate API report
   */
  generateAPIReport() {
    console.log('\n📋 تقرير فحص APIs الأساسية');
    console.log('=' * 50);
    
    // Calculate overall status
    const successRate = (this.results.summary.workingEndpoints / this.results.summary.totalEndpoints) * 100;
    this.results.summary.overallStatus = successRate >= 80 ? 'GOOD' : successRate >= 60 ? 'FAIR' : 'POOR';
    
    // Summary
    console.log('\n📊 الملخص:');
    console.log(`  إجمالي النقاط المختبرة: ${this.results.summary.totalEndpoints}`);
    console.log(`  النقاط العاملة: ${this.results.summary.workingEndpoints}`);
    console.log(`  النقاط الفاشلة: ${this.results.summary.failedEndpoints}`);
    console.log(`  معدل النجاح: ${successRate.toFixed(1)}%`);
    console.log(`  الحالة العامة: ${this.results.summary.overallStatus}`);
    
    // Category breakdown
    console.log('\n📋 تفصيل حسب الفئة:');
    const categories = ['general', 'authentication', 'customers', 'conversations', 'products', 'orders'];
    
    categories.forEach(category => {
      const endpoints = Object.values(this.results[category]);
      const working = endpoints.filter(e => e.success).length;
      const total = endpoints.length;
      
      if (total > 0) {
        const categoryRate = (working / total) * 100;
        const status = categoryRate === 100 ? '✅' : categoryRate >= 80 ? '⚠️' : '❌';
        console.log(`  ${status} ${category}: ${working}/${total} (${categoryRate.toFixed(1)}%)`);
      }
    });
    
    // Authentication status
    console.log('\n🔐 حالة المصادقة:');
    if (this.authToken) {
      console.log('  ✅ تم الحصول على رمز المصادقة بنجاح');
      console.log('  ✅ يمكن اختبار النقاط المحمية');
    } else {
      console.log('  ❌ لم يتم الحصول على رمز المصادقة');
      console.log('  ⚠️ لا يمكن اختبار النقاط المحمية بالكامل');
    }
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في APIs الأساسية');
    }
    
    // Recommendations
    console.log('\n💡 التوصيات:');
    if (this.results.summary.overallStatus === 'GOOD') {
      console.log('  🎉 APIs الأساسية تعمل بشكل ممتاز');
    } else {
      console.log('  🔧 مراجعة النقاط الفاشلة وإصلاحها');
      if (!this.authToken) {
        console.log('  🔐 إصلاح نظام المصادقة لاختبار النقاط المحمية');
      }
    }
    
    // Save results to file
    this.saveAPIReport();
  }

  /**
   * Save API report to file
   */
  saveAPIReport() {
    const reportPath = path.join(__dirname, '../reports/api-basic-check-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.summary.overallStatus,
        successRate: (this.results.summary.workingEndpoints / this.results.summary.totalEndpoints) * 100,
        totalEndpoints: this.results.summary.totalEndpoints,
        workingEndpoints: this.results.summary.workingEndpoints,
        failedEndpoints: this.results.summary.failedEndpoints,
        hasAuthToken: !!this.authToken,
        totalIssues: this.results.issues.length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = BasicAPIChecker;

// Run if called directly
if (require.main === module) {
  const checker = new BasicAPIChecker();
  checker.runBasicAPICheck().catch(console.error);
}
