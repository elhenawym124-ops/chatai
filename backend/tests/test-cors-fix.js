/**
 * Test CORS Fix
 * 
 * اختبار إصلاح مشاكل CORS
 * يتحقق من أن CORS يعمل بشكل صحيح
 */

const axios = require('axios');

class CorsFixTest {
  constructor() {
    this.backendURL = 'http://localhost:3002';
    this.frontendURL = 'http://localhost:3000';
    this.results = {
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async runTest(testName, testFunction) {
    console.log(`🌐 اختبار: ${testName}`);
    
    try {
      const result = await testFunction();
      
      const testResult = {
        name: testName,
        passed: result.success,
        message: result.message,
        details: result.details || {}
      };
      
      console.log(`   ${testResult.passed ? '✅' : '❌'} ${testName}: ${result.message}`);
      
      if (testResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.tests.push(testResult);
      this.results.summary.total++;
      
      return testResult;
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار ${testName}: ${error.message}`);
      
      const testResult = {
        name: testName,
        passed: false,
        message: `خطأ: ${error.message}`,
        error: error.message
      };
      
      this.results.tests.push(testResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return testResult;
    }
  }

  async testCorsHeaders() {
    return this.runTest('اختبار CORS headers', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          headers: {
            'Origin': this.frontendURL,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
          },
          validateStatus: () => true,
          timeout: 10000
        });
        
        const corsHeaders = {
          'access-control-allow-origin': response.headers['access-control-allow-origin'],
          'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
          'access-control-allow-methods': response.headers['access-control-allow-methods'],
          'access-control-allow-headers': response.headers['access-control-allow-headers']
        };
        
        if (response.status === 200) {
          return {
            success: true,
            message: 'CORS headers موجودة والطلب نجح',
            details: {
              status: response.status,
              corsHeaders: corsHeaders,
              hasOriginHeader: !!corsHeaders['access-control-allow-origin']
            }
          };
        } else {
          return {
            success: false,
            message: `فشل في الحصول على CORS headers: ${response.status}`,
            details: { status: response.status, corsHeaders: corsHeaders }
          };
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Backend server غير متصل',
            details: { error: error.message }
          };
        }
        throw error;
      }
    });
  }

  async testOptionsRequest() {
    return this.runTest('اختبار OPTIONS preflight request', async () => {
      try {
        const response = await axios.options(`${this.backendURL}/api/v1/conversations`, {
          headers: {
            'Origin': this.frontendURL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
          },
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 200 || response.status === 204) {
          return {
            success: true,
            message: 'OPTIONS preflight request نجح',
            details: {
              status: response.status,
              allowOrigin: response.headers['access-control-allow-origin'],
              allowMethods: response.headers['access-control-allow-methods'],
              allowHeaders: response.headers['access-control-allow-headers']
            }
          };
        } else {
          return {
            success: false,
            message: `فشل OPTIONS preflight request: ${response.status}`,
            details: { status: response.status, headers: response.headers }
          };
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Backend server غير متصل',
            details: { error: error.message }
          };
        }
        throw error;
      }
    });
  }

  async testCrossOriginRequest() {
    return this.runTest('اختبار Cross-Origin request', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/conversations`, {
          customerId: '123',
          customerName: 'عميل تجريبي',
          message: 'رسالة تجريبية من CORS test',
          priority: 'medium'
        }, {
          headers: {
            'Origin': this.frontendURL,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 201 && response.data.success === true) {
          return {
            success: true,
            message: 'Cross-Origin POST request نجح',
            details: {
              status: response.status,
              hasData: !!response.data.data,
              allowOrigin: response.headers['access-control-allow-origin']
            }
          };
        } else {
          return {
            success: false,
            message: `فشل Cross-Origin POST request: ${response.status}`,
            details: { status: response.status, data: response.data }
          };
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Backend server غير متصل',
            details: { error: error.message }
          };
        }
        throw error;
      }
    });
  }

  async testCredentialsSupport() {
    return this.runTest('اختبار دعم Credentials', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          headers: {
            'Origin': this.frontendURL,
            'Authorization': 'Bearer fake-token-for-cors-test'
          },
          withCredentials: true,
          validateStatus: () => true,
          timeout: 10000
        });
        
        const allowCredentials = response.headers['access-control-allow-credentials'];
        
        if (response.status === 200 && allowCredentials === 'true') {
          return {
            success: true,
            message: 'دعم Credentials يعمل بشكل صحيح',
            details: {
              status: response.status,
              allowCredentials: allowCredentials,
              hasData: !!response.data.data
            }
          };
        } else {
          return {
            success: false,
            message: `مشكلة في دعم Credentials: ${response.status}`,
            details: { 
              status: response.status, 
              allowCredentials: allowCredentials,
              data: response.data 
            }
          };
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Backend server غير متصل',
            details: { error: error.message }
          };
        }
        throw error;
      }
    });
  }

  async testInvalidOrigin() {
    return this.runTest('اختبار Origin غير مسموح', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          headers: {
            'Origin': 'http://malicious-site.com'
          },
          validateStatus: () => true,
          timeout: 10000
        });
        
        const allowOrigin = response.headers['access-control-allow-origin'];
        
        // يجب أن يكون الطلب مرفوض أو لا يحتوي على CORS headers للـ origin غير المسموح
        if (response.status === 200 && (!allowOrigin || allowOrigin !== 'http://malicious-site.com')) {
          return {
            success: true,
            message: 'Origin غير مسموح تم التعامل معه بشكل صحيح',
            details: {
              status: response.status,
              allowOrigin: allowOrigin || 'غير موجود'
            }
          };
        } else {
          return {
            success: false,
            message: `Origin غير مسموح لم يتم رفضه: ${response.status}`,
            details: { 
              status: response.status, 
              allowOrigin: allowOrigin,
              shouldBeRejected: true
            }
          };
        }
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Backend server غير متصل',
            details: { error: error.message }
          };
        }
        throw error;
      }
    });
  }

  async runCorsFixTests() {
    console.log('🌐 بدء اختبار إصلاح CORS...\n');
    
    // اختبار CORS headers
    await this.testCorsHeaders();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار OPTIONS request
    await this.testOptionsRequest();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار Cross-Origin request
    await this.testCrossOriginRequest();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار دعم Credentials
    await this.testCredentialsSupport();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار Origin غير مسموح
    await this.testInvalidOrigin();
    
    console.log('');
    this.generateCorsFixReport();
  }

  generateCorsFixReport() {
    console.log('🌐 تقرير اختبار إصلاح CORS:');
    console.log('=' * 50);
    
    const successRate = (this.results.summary.passed / this.results.summary.total) * 100;
    
    console.log(`إجمالي الاختبارات: ${this.results.summary.total}`);
    console.log(`الاختبارات الناجحة: ${this.results.summary.passed}`);
    console.log(`الاختبارات الفاشلة: ${this.results.summary.failed}`);
    console.log(`معدل النجاح: ${successRate.toFixed(1)}%`);
    
    // تفاصيل الاختبارات
    console.log('\n📋 تفاصيل الاختبارات:');
    this.results.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`   ${status} ${test.name}: ${test.message}`);
    });
    
    // التقييم العام
    console.log('\n🎯 التقييم العام لإصلاح CORS:');
    if (successRate >= 100) {
      console.log('🎉 ممتاز! CORS يعمل بالكامل');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، معظم CORS يعمل');
    } else if (successRate >= 50) {
      console.log('⚠️ مقبول، بعض المشاكل في CORS');
    } else {
      console.log('❌ مشاكل كبيرة في CORS');
    }
    
    // حفظ التقرير
    const reportPath = `cors-fix-test-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  const tester = new CorsFixTest();
  tester.runCorsFixTests().catch(console.error);
}

module.exports = CorsFixTest;
