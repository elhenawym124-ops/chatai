const axios = require('axios');

class ComprehensiveSecurityTest {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFunction) {
    this.results.total++;
    try {
      const result = await testFunction();
      if (result.success) {
        this.results.passed++;
        console.log(`✅ ${name}: ${result.message}`);
      } else {
        this.results.failed++;
        console.log(`❌ ${name}: ${result.message}`);
      }
      this.results.tests.push({ name, ...result });
      return result;
    } catch (error) {
      this.results.failed++;
      const errorResult = {
        success: false,
        message: error.response?.data?.message || error.message,
        details: error.response?.data
      };
      console.log(`❌ ${name}: ${errorResult.message}`);
      this.results.tests.push({ name, ...errorResult });
      return errorResult;
    }
  }

  async testPublicRoutes() {
    console.log('\n🌐 اختبار Routes العامة:');
    console.log('═══════════════════════════════════════');

    // Health check
    await this.runTest('Health Check', async () => {
      const response = await axios.get(`${this.baseURL}/health`);
      return {
        success: response.status === 200,
        message: 'Health endpoint accessible',
        details: response.data
      };
    });

    // Registration
    await this.runTest('User Registration', async () => {
      const userData = {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        companyName: 'Test Company',
        phone: '01234567890'
      };

      const response = await axios.post(`${this.baseURL}/api/v1/auth/register`, userData);
      return {
        success: response.status === 201,
        message: 'Registration successful',
        details: { hasToken: !!response.data.data?.token }
      };
    });
  }

  async testAuthenticationRequired() {
    console.log('\n🔐 اختبار المصادقة المطلوبة:');
    console.log('═══════════════════════════════════════');

    const protectedEndpoints = [
      'GET /api/v1/products',
      'GET /api/v1/customers',
      'GET /api/v1/conversations',
      'GET /api/v1/companies/current',
      'GET /api/v1/ai/settings'
    ];

    for (const endpoint of protectedEndpoints) {
      const [method, path] = endpoint.split(' ');
      
      await this.runTest(`Authentication Required: ${endpoint}`, async () => {
        try {
          const response = await axios({
            method: method.toLowerCase(),
            url: `${this.baseURL}${path}`
          });
          
          return {
            success: false,
            message: 'Endpoint accessible without authentication',
            details: { status: response.status }
          };
        } catch (error) {
          if (error.response?.status === 401) {
            return {
              success: true,
              message: 'Authentication properly required',
              details: { status: 401 }
            };
          }
          throw error;
        }
      });
    }
  }

  async testCompanyIsolation() {
    console.log('\n🏢 اختبار عزل الشركات:');
    console.log('═══════════════════════════════════════');

    // إنشاء شركتين
    const company1Data = {
      email: `company1_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Manager',
      lastName: 'One',
      companyName: 'Company One',
      phone: '01111111111'
    };

    const company2Data = {
      email: `company2_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Manager',
      lastName: 'Two',
      companyName: 'Company Two',
      phone: '02222222222'
    };

    const company1Response = await axios.post(`${this.baseURL}/api/v1/auth/register`, company1Data);
    const company2Response = await axios.post(`${this.baseURL}/api/v1/auth/register`, company2Data);

    const token1 = company1Response.data.data.token;
    const token2 = company2Response.data.data.token;
    const companyId1 = company1Response.data.data.company.id;
    const companyId2 = company2Response.data.data.company.id;

    // اختبار عزل البيانات
    const isolationEndpoints = [
      'GET /api/v1/products',
      'GET /api/v1/customers',
      'GET /api/v1/conversations'
    ];

    for (const endpoint of isolationEndpoints) {
      const [method, path] = endpoint.split(' ');
      
      await this.runTest(`Company Isolation: ${endpoint}`, async () => {
        const response1 = await axios({
          method: method.toLowerCase(),
          url: `${this.baseURL}${path}`,
          headers: { Authorization: `Bearer ${token1}` }
        });

        const response2 = await axios({
          method: method.toLowerCase(),
          url: `${this.baseURL}${path}`,
          headers: { Authorization: `Bearer ${token2}` }
        });

        // البيانات يجب أن تكون مختلفة أو فارغة لكل شركة
        const data1 = JSON.stringify(response1.data);
        const data2 = JSON.stringify(response2.data);

        if (data1 === data2 && response1.data.data?.length > 0) {
          return {
            success: false,
            message: 'Companies see same data',
            details: { company1Count: response1.data.data?.length, company2Count: response2.data.data?.length }
          };
        }

        return {
          success: true,
          message: 'Companies properly isolated',
          details: { company1Count: response1.data.data?.length, company2Count: response2.data.data?.length }
        };
      });
    }

    // اختبار منع الوصول لشركة أخرى
    await this.runTest('Cross-Company Access Prevention', async () => {
      try {
        const response = await axios.get(`${this.baseURL}/api/v1/companies/${companyId2}`, {
          headers: { Authorization: `Bearer ${token1}` }
        });
        
        return {
          success: false,
          message: 'Cross-company access allowed',
          details: { status: response.status }
        };
      } catch (error) {
        if (error.response?.status === 403) {
          return {
            success: true,
            message: 'Cross-company access properly blocked',
            details: { status: 403 }
          };
        }
        throw error;
      }
    });

    return { token1, token2, companyId1, companyId2 };
  }

  async testAdminRoutes() {
    console.log('\n👑 اختبار Routes الإدارية:');
    console.log('═══════════════════════════════════════');

    // إنشاء مستخدم عادي
    const userData = {
      email: `regular_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Regular',
      lastName: 'User',
      companyName: 'Regular Company',
      phone: '01234567890'
    };

    const userResponse = await axios.post(`${this.baseURL}/api/v1/auth/register`, userData);
    const userToken = userResponse.data.data.token;

    const adminEndpoints = [
      'GET /api/v1/admin/companies',
      'GET /api/v1/admin/statistics'
    ];

    for (const endpoint of adminEndpoints) {
      const [method, path] = endpoint.split(' ');
      
      await this.runTest(`Admin Access Control: ${endpoint}`, async () => {
        try {
          const response = await axios({
            method: method.toLowerCase(),
            url: `${this.baseURL}${path}`,
            headers: { Authorization: `Bearer ${userToken}` }
          });
          
          return {
            success: false,
            message: 'Regular user accessed admin endpoint',
            details: { status: response.status }
          };
        } catch (error) {
          if (error.response?.status === 403) {
            return {
              success: true,
              message: 'Admin access properly restricted',
              details: { status: 403 }
            };
          }
          throw error;
        }
      });
    }
  }

  async testDataManipulation() {
    console.log('\n📝 اختبار تعديل البيانات:');
    console.log('═══════════════════════════════════════');

    // إنشاء مستخدم للاختبار
    const userData = {
      email: `data_test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Data',
      lastName: 'Tester',
      companyName: 'Data Test Company',
      phone: '01234567890'
    };

    const userResponse = await axios.post(`${this.baseURL}/api/v1/auth/register`, userData);
    const token = userResponse.data.data.token;

    // اختبار إضافة منتج
    await this.runTest('Product Creation', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        category: 'Test Category'
      };

      const response = await axios.post(`${this.baseURL}/api/v1/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: response.status === 200 || response.status === 201,
        message: 'Product created successfully',
        details: { productId: response.data.data?.id }
      };
    });

    // اختبار جلب المنتجات
    await this.runTest('Product Retrieval', async () => {
      const response = await axios.get(`${this.baseURL}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: response.status === 200,
        message: `Retrieved ${response.data.data?.length || 0} products`,
        details: { count: response.data.data?.length }
      };
    });
  }

  async runAllTests() {
    console.log('🧪 بدء الاختبارات الشاملة للأمان\n');

    try {
      await this.testPublicRoutes();
      await this.testAuthenticationRequired();
      await this.testCompanyIsolation();
      await this.testAdminRoutes();
      await this.testDataManipulation();

      this.printSummary();
    } catch (error) {
      console.error('❌ خطأ في تشغيل الاختبارات:', error.message);
    }
  }

  printSummary() {
    console.log('\n📊 ملخص نتائج الاختبارات:');
    console.log('═══════════════════════════════════════');
    console.log(`📈 إجمالي الاختبارات: ${this.results.total}`);
    console.log(`✅ نجح: ${this.results.passed}`);
    console.log(`❌ فشل: ${this.results.failed}`);
    console.log(`📊 معدل النجاح: ${Math.round((this.results.passed / this.results.total) * 100)}%`);

    const securityLevel = this.getSecurityLevel();
    console.log(`🛡️ مستوى الأمان: ${securityLevel.emoji} ${securityLevel.level}`);

    if (this.results.failed > 0) {
      console.log('\n❌ الاختبارات الفاشلة:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.message}`);
        });
    }

    console.log('\n🎯 التوصيات:');
    if (this.results.failed === 0) {
      console.log('🎉 ممتاز! جميع الاختبارات نجحت');
      console.log('🔄 يُنصح بإجراء اختبارات دورية');
    } else if (this.results.failed <= 2) {
      console.log('🟡 جيد مع بعض التحسينات المطلوبة');
      console.log('🔧 إصلاح المشاكل المتبقية');
    } else {
      console.log('🔴 يحتاج إصلاحات أمنية عاجلة');
      console.log('⚠️ مراجعة شاملة للنظام مطلوبة');
    }
  }

  getSecurityLevel() {
    const successRate = (this.results.passed / this.results.total) * 100;
    
    if (successRate >= 95) return { level: 'ممتاز', emoji: '🟢' };
    if (successRate >= 85) return { level: 'جيد جداً', emoji: '🟢' };
    if (successRate >= 75) return { level: 'جيد', emoji: '🟡' };
    if (successRate >= 60) return { level: 'متوسط', emoji: '🟠' };
    return { level: 'ضعيف', emoji: '🔴' };
  }
}

// تشغيل الاختبارات
const tester = new ComprehensiveSecurityTest();
tester.runAllTests();
