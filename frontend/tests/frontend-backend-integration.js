/**
 * Frontend-Backend Integration Test
 * 
 * فحص التفاعل بين الواجهة الأمامية والخلفية
 * يتحقق من API calls، error handling، loading states
 */

const axios = require('axios');

class FrontendBackendIntegration {
  constructor() {
    this.frontendURL = 'http://localhost:3000';
    this.backendURL = 'http://localhost:3002';
    this.results = {
      apiTests: [],
      errorHandling: [],
      dataFlow: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async testAPIEndpoint(name, endpoint, method = 'GET', data = null, expectedStatus = 200) {
    console.log(`🔗 اختبار API: ${name}`);
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${this.backendURL}${endpoint}`,
        timeout: 10000,
        validateStatus: () => true
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const startTime = Date.now();
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      const testResult = {
        name,
        endpoint,
        method,
        expectedStatus,
        actualStatus: response.status,
        responseTime,
        passed: response.status === expectedStatus,
        hasData: response.data && Object.keys(response.data).length > 0,
        dataStructure: this.analyzeDataStructure(response.data)
      };
      
      console.log(`   ${testResult.passed ? '✅' : '❌'} ${method} ${endpoint}: ${response.status} (${responseTime}ms)`);
      
      if (testResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
        console.log(`      متوقع: ${expectedStatus}, الفعلي: ${response.status}`);
      }
      
      this.results.apiTests.push(testResult);
      this.results.summary.total++;
      
      return testResult;
    } catch (error) {
      console.log(`   ❌ خطأ في API: ${error.message}`);
      
      const testResult = {
        name,
        endpoint,
        method,
        expectedStatus,
        actualStatus: 'ERROR',
        responseTime: 0,
        passed: false,
        error: error.message
      };
      
      this.results.apiTests.push(testResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return testResult;
    }
  }

  async testErrorHandling(name, endpoint, method = 'GET', data = null, expectedErrorCode = 400) {
    console.log(`⚠️ اختبار معالجة الأخطاء: ${name}`);
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${this.backendURL}${endpoint}`,
        timeout: 10000,
        validateStatus: () => true
      };
      
      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      
      const errorTest = {
        name,
        endpoint,
        method,
        expectedErrorCode,
        actualStatus: response.status,
        passed: response.status === expectedErrorCode,
        hasErrorMessage: response.data && response.data.error,
        errorStructure: response.data
      };
      
      console.log(`   ${errorTest.passed ? '✅' : '❌'} Error ${method} ${endpoint}: ${response.status}`);
      
      if (errorTest.hasErrorMessage) {
        console.log(`      رسالة الخطأ: ${response.data.error}`);
      }
      
      if (errorTest.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.errorHandling.push(errorTest);
      this.results.summary.total++;
      
      return errorTest;
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار الأخطاء: ${error.message}`);
      
      const errorTest = {
        name,
        endpoint,
        method,
        expectedErrorCode,
        actualStatus: 'ERROR',
        passed: false,
        error: error.message
      };
      
      this.results.errorHandling.push(errorTest);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return errorTest;
    }
  }

  async testDataFlow(name, description, testFunction) {
    console.log(`📊 اختبار تدفق البيانات: ${name}`);
    
    try {
      const result = await testFunction();
      
      const dataFlowTest = {
        name,
        description,
        passed: result.success,
        details: result.details,
        timing: result.timing || {}
      };
      
      console.log(`   ${dataFlowTest.passed ? '✅' : '❌'} ${name}: ${result.message}`);
      
      if (dataFlowTest.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.dataFlow.push(dataFlowTest);
      this.results.summary.total++;
      
      return dataFlowTest;
    } catch (error) {
      console.log(`   ❌ خطأ في تدفق البيانات: ${error.message}`);
      
      const dataFlowTest = {
        name,
        description,
        passed: false,
        error: error.message
      };
      
      this.results.dataFlow.push(dataFlowTest);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return dataFlowTest;
    }
  }

  analyzeDataStructure(data) {
    if (!data) return { type: 'empty' };
    
    const structure = {
      type: Array.isArray(data) ? 'array' : typeof data,
      hasSuccess: data.hasOwnProperty && data.hasOwnProperty('success'),
      hasData: data.hasOwnProperty && data.hasOwnProperty('data'),
      hasError: data.hasOwnProperty && data.hasOwnProperty('error'),
      hasPagination: data.hasOwnProperty && data.hasOwnProperty('pagination'),
      keys: typeof data === 'object' ? Object.keys(data) : []
    };
    
    if (Array.isArray(data)) {
      structure.length = data.length;
      structure.itemStructure = data.length > 0 ? Object.keys(data[0]) : [];
    }
    
    return structure;
  }

  async runIntegrationTests() {
    console.log('🚀 بدء اختبارات التفاعل بين Frontend و Backend...\n');
    
    // 1. اختبار APIs الأساسية
    console.log('📡 اختبار APIs الأساسية:');
    await this.testAPIEndpoint('Health Check', '/health', 'GET', null, 200);
    await this.testAPIEndpoint('قائمة العملاء', '/api/v1/customers', 'GET', null, 200);
    await this.testAPIEndpoint('قائمة المنتجات', '/api/v1/products', 'GET', null, 200);
    await this.testAPIEndpoint('المحادثات (بدون auth)', '/api/v1/conversations', 'GET', null, 401);
    console.log('');
    
    // 2. اختبار معالجة الأخطاء
    console.log('⚠️ اختبار معالجة الأخطاء:');
    await this.testErrorHandling('بيانات غير صحيحة', '/api/v1/test/customers', 'POST', {}, 422);
    await this.testErrorHandling('JSON غير صحيح', '/api/v1/customers', 'POST', '{"invalid": json}', 400);
    await this.testErrorHandling('مورد غير موجود', '/api/v1/customers/999999', 'GET', null, 404);
    await this.testErrorHandling('SQL Injection', '/api/v1/customers?search=\'; DROP TABLE users; --', 'GET', null, 403);
    console.log('');
    
    // 3. اختبار تدفق البيانات
    console.log('📊 اختبار تدفق البيانات:');
    
    await this.testDataFlow('تحميل بيانات العملاء', 'فحص بنية البيانات المُرجعة', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/customers`);
      
      const hasCorrectStructure = response.data && 
                                 response.data.success && 
                                 response.data.data && 
                                 Array.isArray(response.data.data);
      
      return {
        success: hasCorrectStructure,
        message: hasCorrectStructure ? 'بنية البيانات صحيحة' : 'بنية البيانات غير صحيحة',
        details: {
          hasSuccess: !!response.data.success,
          hasData: !!response.data.data,
          isArray: Array.isArray(response.data.data),
          itemCount: response.data.data ? response.data.data.length : 0
        }
      };
    });
    
    await this.testDataFlow('تحميل بيانات المنتجات', 'فحص بنية بيانات المنتجات', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/products`);
      
      const hasProducts = response.data && 
                         response.data.success && 
                         response.data.data && 
                         response.data.data.length > 0;
      
      return {
        success: hasProducts,
        message: hasProducts ? 'بيانات المنتجات متوفرة' : 'لا توجد بيانات منتجات',
        details: {
          productCount: response.data.data ? response.data.data.length : 0,
          hasCategories: response.data.data ? response.data.data.some(p => p.category) : false,
          hasPrices: response.data.data ? response.data.data.some(p => p.price) : false
        }
      };
    });
    
    await this.testDataFlow('اختبار Pagination', 'فحص نظام الصفحات', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/customers`);
      
      const hasPagination = response.data && 
                           response.data.pagination && 
                           typeof response.data.pagination.page === 'number';
      
      return {
        success: hasPagination,
        message: hasPagination ? 'نظام الصفحات يعمل' : 'نظام الصفحات لا يعمل',
        details: response.data.pagination || {}
      };
    });
    
    console.log('');
    
    // 4. إنشاء التقرير
    this.generateIntegrationReport();
  }

  generateIntegrationReport() {
    console.log('📊 تقرير التفاعل بين Frontend و Backend:');
    console.log('=' * 60);
    
    const successRate = (this.results.summary.passed / this.results.summary.total) * 100;
    
    console.log(`إجمالي الاختبارات: ${this.results.summary.total}`);
    console.log(`الاختبارات الناجحة: ${this.results.summary.passed}`);
    console.log(`الاختبارات الفاشلة: ${this.results.summary.failed}`);
    console.log(`معدل النجاح: ${successRate.toFixed(1)}%`);
    
    // تفاصيل APIs
    console.log('\n🔗 APIs:');
    const workingAPIs = this.results.apiTests.filter(t => t.passed).length;
    console.log(`   APIs العاملة: ${workingAPIs}/${this.results.apiTests.length}`);
    
    // تفاصيل معالجة الأخطاء
    console.log('\n⚠️ معالجة الأخطاء:');
    const workingErrorHandling = this.results.errorHandling.filter(t => t.passed).length;
    console.log(`   معالجة الأخطاء العاملة: ${workingErrorHandling}/${this.results.errorHandling.length}`);
    
    // تفاصيل تدفق البيانات
    console.log('\n📊 تدفق البيانات:');
    const workingDataFlow = this.results.dataFlow.filter(t => t.passed).length;
    console.log(`   تدفق البيانات العامل: ${workingDataFlow}/${this.results.dataFlow.length}`);
    
    // التقييم العام
    console.log('\n🎯 التقييم العام:');
    if (successRate >= 90) {
      console.log('🎉 ممتاز! التفاعل بين Frontend و Backend يعمل بشكل مثالي');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، مع بعض المشاكل البسيطة');
    } else if (successRate >= 60) {
      console.log('⚠️ مقبول، يحتاج بعض التحسينات');
    } else {
      console.log('❌ يحتاج عمل كبير لتحسين التفاعل');
    }
    
    // حفظ التقرير
    const reportPath = `integration-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  const tester = new FrontendBackendIntegration();
  tester.runIntegrationTests().catch(console.error);
}

module.exports = FrontendBackendIntegration;
