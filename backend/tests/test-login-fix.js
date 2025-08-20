/**
 * Test Login Fix
 * 
 * اختبار إصلاح API تسجيل الدخول
 * يتحقق من التمييز بين البيانات الصحيحة والخاطئة
 */

const axios = require('axios');

class LoginFixTest {
  constructor() {
    this.backendURL = 'http://localhost:3002';
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
    console.log(`🔐 اختبار: ${testName}`);
    
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

  async testValidLogin() {
    return this.runTest('اختبار تسجيل الدخول بالبيانات الصحيحة', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/auth/login`, {
          email: 'admin@test.com',
          password: 'password123'
        }, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 200 && response.data.success === true) {
          return {
            success: true,
            message: 'تسجيل الدخول بالبيانات الصحيحة نجح',
            details: {
              status: response.status,
              hasUser: !!response.data.user,
              hasTokens: !!response.data.tokens,
              userEmail: response.data.user?.email
            }
          };
        } else {
          return {
            success: false,
            message: `فشل تسجيل الدخول بالبيانات الصحيحة: ${response.status}`,
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

  async testInvalidLogin() {
    return this.runTest('اختبار تسجيل الدخول بالبيانات الخاطئة', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/auth/login`, {
          email: 'wrong@test.com',
          password: 'wrongpassword'
        }, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 401 && response.data.success === false) {
          return {
            success: true,
            message: 'تسجيل الدخول بالبيانات الخاطئة فشل كما هو متوقع',
            details: {
              status: response.status,
              errorMessage: response.data.message,
              errorCode: response.data.error
            }
          };
        } else {
          return {
            success: false,
            message: `تسجيل الدخول بالبيانات الخاطئة لم يفشل كما هو متوقع: ${response.status}`,
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

  async testWrongPassword() {
    return this.runTest('اختبار تسجيل الدخول بكلمة مرور خاطئة', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/auth/login`, {
          email: 'admin@test.com',
          password: 'wrongpassword'
        }, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 401 && response.data.success === false) {
          return {
            success: true,
            message: 'تسجيل الدخول بكلمة مرور خاطئة فشل كما هو متوقع',
            details: {
              status: response.status,
              errorMessage: response.data.message
            }
          };
        } else {
          return {
            success: false,
            message: `تسجيل الدخول بكلمة مرور خاطئة لم يفشل كما هو متوقع: ${response.status}`,
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

  async testWrongEmail() {
    return this.runTest('اختبار تسجيل الدخول ببريد إلكتروني خاطئ', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/auth/login`, {
          email: 'wrong@test.com',
          password: 'password123'
        }, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 401 && response.data.success === false) {
          return {
            success: true,
            message: 'تسجيل الدخول ببريد إلكتروني خاطئ فشل كما هو متوقع',
            details: {
              status: response.status,
              errorMessage: response.data.message
            }
          };
        } else {
          return {
            success: false,
            message: `تسجيل الدخول ببريد إلكتروني خاطئ لم يفشل كما هو متوقع: ${response.status}`,
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

  async runLoginFixTests() {
    console.log('🔐 بدء اختبار إصلاح تسجيل الدخول...\n');
    
    // اختبار البيانات الصحيحة
    await this.testValidLogin();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار البيانات الخاطئة
    await this.testInvalidLogin();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار كلمة مرور خاطئة
    await this.testWrongPassword();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار بريد إلكتروني خاطئ
    await this.testWrongEmail();
    
    console.log('');
    this.generateLoginFixReport();
  }

  generateLoginFixReport() {
    console.log('🔐 تقرير اختبار إصلاح تسجيل الدخول:');
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
    console.log('\n🎯 التقييم العام لإصلاح تسجيل الدخول:');
    if (successRate >= 100) {
      console.log('🎉 ممتاز! إصلاح تسجيل الدخول نجح بالكامل');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، معظم اختبارات تسجيل الدخول تعمل');
    } else if (successRate >= 50) {
      console.log('⚠️ مقبول، بعض المشاكل في تسجيل الدخول');
    } else {
      console.log('❌ مشاكل كبيرة في تسجيل الدخول');
    }
    
    // حفظ التقرير
    const reportPath = `login-fix-test-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  const tester = new LoginFixTest();
  tester.runLoginFixTests().catch(console.error);
}

module.exports = LoginFixTest;
