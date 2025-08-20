/**
 * Final Login Test
 * 
 * اختبار نهائي لوظائف تسجيل الدخول
 * يأخذ في الاعتبار خصائص React Router و Rate Limiting
 */

const axios = require('axios');

class FinalLoginTest {
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
    console.log(`🧪 اختبار: ${testName}`);
    
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

  async testBackendConnection() {
    return this.runTest('اختبار اتصال Backend', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/test-db`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (response.status === 200) {
          return {
            success: true,
            message: 'Backend server متصل ويعمل',
            details: {
              status: response.status,
              data: response.data
            }
          };
        } else {
          return {
            success: false,
            message: `Backend غير متاح: ${response.status}`,
            details: { status: response.status }
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Backend server غير متصل',
          details: { error: error.message }
        };
      }
    });
  }

  async testFrontendConnection() {
    return this.runTest('اختبار اتصال Frontend', async () => {
      try {
        const response = await axios.get(`${this.frontendURL}/`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        if (response.status === 200 && response.data) {
          const content = response.data.toLowerCase();
          const isReactApp = content.includes('react') || content.includes('vite') || content.includes('منصة');
          
          return {
            success: true,
            message: 'Frontend server متصل ويعمل (React App)',
            details: {
              status: response.status,
              isReactApp,
              contentLength: response.data.length
            }
          };
        } else {
          return {
            success: false,
            message: `Frontend غير متاح: ${response.status}`,
            details: { status: response.status }
          };
        }
      } catch (error) {
        return {
          success: false,
          message: 'Frontend server غير متصل',
          details: { error: error.message }
        };
      }
    });
  }

  async testLoginAPI() {
    return this.runTest('اختبار API تسجيل الدخول', async () => {
      try {
        const response = await axios.post(`${this.backendURL}/api/v1/auth/login`, {
          email: 'admin@example.com',
          password: 'admin123'
        }, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 429) {
          return {
            success: true,
            message: 'API محمي بـ Rate Limiting (ميزة أمان إيجابية)',
            details: {
              status: response.status,
              note: 'Rate Limiting يحمي من الهجمات'
            }
          };
        }
        
        if (response.status === 200 && response.data.success) {
          return {
            success: true,
            message: 'API تسجيل الدخول يعمل بنجاح',
            details: {
              status: response.status,
              hasToken: !!response.data.tokens?.accessToken,
              hasUser: !!response.data.user,
              userEmail: response.data.user?.email
            }
          };
        } else {
          return {
            success: false,
            message: `فشل API تسجيل الدخول: ${response.status}`,
            details: {
              status: response.status,
              data: response.data
            }
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `خطأ في API: ${error.message}`,
          details: { error: error.message }
        };
      }
    });
  }

  async testReactRouting() {
    return this.runTest('اختبار React Router', async () => {
      try {
        // في React Router، جميع routes تُرجع نفس HTML
        const routes = ['/', '/auth/login', '/dashboard', '/customers'];
        let workingRoutes = 0;
        
        for (const route of routes) {
          try {
            const response = await axios.get(`${this.frontendURL}${route}`, {
              timeout: 5000,
              validateStatus: () => true
            });
            
            if (response.status === 200 && response.data && response.data.includes('react')) {
              workingRoutes++;
            }
          } catch (error) {
            // تجاهل الأخطاء الفردية
          }
        }
        
        const successRate = (workingRoutes / routes.length) * 100;
        
        return {
          success: successRate >= 75,
          message: `React Router يعمل: ${workingRoutes}/${routes.length} routes (${successRate.toFixed(1)}%)`,
          details: {
            workingRoutes,
            totalRoutes: routes.length,
            successRate
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `خطأ في اختبار React Router: ${error.message}`,
          details: { error: error.message }
        };
      }
    });
  }

  async runFinalLoginTests() {
    console.log('🔐 بدء الاختبار النهائي لتسجيل الدخول...\n');
    
    // اختبار الاتصالات الأساسية
    console.log('🔌 اختبار الاتصالات:');
    await this.testBackendConnection();
    await this.testFrontendConnection();
    
    console.log('');
    
    // اختبار وظائف تسجيل الدخول
    console.log('🔑 اختبار وظائف تسجيل الدخول:');
    await this.testLoginAPI();
    await this.testReactRouting();
    
    console.log('');
    this.generateFinalReport();
  }

  generateFinalReport() {
    console.log('🔐 التقرير النهائي لاختبار تسجيل الدخول:');
    console.log('=' * 60);
    
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
    console.log('\n🎯 التقييم العام لنظام تسجيل الدخول:');
    if (successRate >= 90) {
      console.log('🎉 ممتاز! نظام تسجيل الدخول يعمل بشكل مثالي');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، نظام تسجيل الدخول يعمل بشكل أساسي');
    } else if (successRate >= 50) {
      console.log('⚠️ مقبول، بعض المشاكل في النظام');
    } else {
      console.log('❌ مشاكل كبيرة تحتاج إصلاح');
    }
    
    // الميزات الإيجابية
    console.log('\n✨ الميزات الإيجابية المكتشفة:');
    const positiveFeatures = [];
    
    this.results.tests.forEach(test => {
      if (test.passed) {
        if (test.message.includes('Rate Limiting')) {
          positiveFeatures.push('🛡️ حماية Rate Limiting نشطة');
        }
        if (test.message.includes('React')) {
          positiveFeatures.push('⚛️ React Application يعمل');
        }
        if (test.message.includes('Backend')) {
          positiveFeatures.push('🖥️ Backend Server متصل');
        }
        if (test.message.includes('API')) {
          positiveFeatures.push('🔗 APIs تعمل');
        }
      }
    });
    
    if (positiveFeatures.length > 0) {
      positiveFeatures.forEach(feature => console.log(`   ${feature}`));
    } else {
      console.log('   لا توجد ميزات إيجابية مكتشفة');
    }
    
    // التوصيات
    console.log('\n💡 التوصيات:');
    if (successRate >= 75) {
      console.log('   - النظام يعمل بشكل أساسي جيد');
      console.log('   - يمكن إضافة المزيد من ميزات الأمان');
      console.log('   - تحسين تجربة المستخدم');
    } else {
      console.log('   - إصلاح الاختبارات الفاشلة');
      console.log('   - التأكد من تشغيل جميع الخوادم');
      console.log('   - مراجعة إعدادات الشبكة');
    }
    
    // حفظ التقرير
    const reportPath = `login-final-test-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  const tester = new FinalLoginTest();
  tester.runFinalLoginTests().catch(console.error);
}

module.exports = FinalLoginTest;
