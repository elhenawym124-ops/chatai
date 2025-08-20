/**
 * Test Conversations API Fix
 * 
 * اختبار إصلاح API المحادثات
 * يتحقق من أن API المحادثات يعمل بدون token
 */

const axios = require('axios');

class ConversationsFixTest {
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
    console.log(`💬 اختبار: ${testName}`);
    
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

  async testGetConversationsWithoutToken() {
    return this.runTest('اختبار جلب المحادثات بدون token', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 200 && response.data.success === true) {
          return {
            success: true,
            message: 'جلب المحادثات بدون token نجح',
            details: {
              status: response.status,
              hasData: !!response.data.data,
              conversationsCount: response.data.data?.length || 0,
              hasPagination: !!response.data.pagination
            }
          };
        } else {
          return {
            success: false,
            message: `فشل جلب المحادثات: ${response.status}`,
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

  async testGetConversationsWithToken() {
    return this.runTest('اختبار جلب المحادثات مع token وهمي', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          headers: {
            'Authorization': 'Bearer fake-token-for-testing'
          },
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 200 && response.data.success === true) {
          return {
            success: true,
            message: 'جلب المحادثات مع token وهمي نجح',
            details: {
              status: response.status,
              hasData: !!response.data.data,
              conversationsCount: response.data.data?.length || 0
            }
          };
        } else {
          return {
            success: false,
            message: `فشل جلب المحادثات مع token: ${response.status}`,
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

  async testCreateConversationWithoutToken() {
    return this.runTest('اختبار إنشاء محادثة بدون token', async () => {
      try {
        const conversationData = {
          customerId: '123',
          customerName: 'عميل تجريبي',
          message: 'رسالة تجريبية',
          priority: 'medium'
        };

        const response = await axios.post(`${this.backendURL}/api/v1/conversations`, conversationData, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 201 && response.data.success === true) {
          return {
            success: true,
            message: 'إنشاء محادثة بدون token نجح',
            details: {
              status: response.status,
              hasData: !!response.data.data,
              conversationId: response.data.data?.id
            }
          };
        } else {
          return {
            success: false,
            message: `فشل إنشاء محادثة: ${response.status}`,
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

  async testConversationsDataStructure() {
    return this.runTest('اختبار هيكل بيانات المحادثات', async () => {
      try {
        const response = await axios.get(`${this.backendURL}/api/v1/conversations`, {
          validateStatus: () => true,
          timeout: 10000
        });
        
        if (response.status === 200 && response.data.success === true) {
          const conversations = response.data.data;
          const firstConversation = conversations[0];
          
          const requiredFields = ['id', 'customerId', 'customerName', 'status', 'lastMessage'];
          const hasAllFields = requiredFields.every(field => firstConversation.hasOwnProperty(field));
          
          if (hasAllFields) {
            return {
              success: true,
              message: 'هيكل بيانات المحادثات صحيح',
              details: {
                conversationsCount: conversations.length,
                firstConversationFields: Object.keys(firstConversation),
                hasRequiredFields: hasAllFields
              }
            };
          } else {
            return {
              success: false,
              message: 'هيكل بيانات المحادثات غير مكتمل',
              details: {
                missingFields: requiredFields.filter(field => !firstConversation.hasOwnProperty(field)),
                availableFields: Object.keys(firstConversation)
              }
            };
          }
        } else {
          return {
            success: false,
            message: `فشل جلب المحادثات للاختبار: ${response.status}`,
            details: { status: response.status }
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

  async runConversationsFixTests() {
    console.log('💬 بدء اختبار إصلاح API المحادثات...\n');
    
    // اختبار جلب المحادثات بدون token
    await this.testGetConversationsWithoutToken();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار جلب المحادثات مع token وهمي
    await this.testGetConversationsWithToken();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار إنشاء محادثة
    await this.testCreateConversationWithoutToken();
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // اختبار هيكل البيانات
    await this.testConversationsDataStructure();
    
    console.log('');
    this.generateConversationsFixReport();
  }

  generateConversationsFixReport() {
    console.log('💬 تقرير اختبار إصلاح API المحادثات:');
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
    console.log('\n🎯 التقييم العام لإصلاح API المحادثات:');
    if (successRate >= 100) {
      console.log('🎉 ممتاز! API المحادثات يعمل بالكامل');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، معظم وظائف API المحادثات تعمل');
    } else if (successRate >= 50) {
      console.log('⚠️ مقبول، بعض المشاكل في API المحادثات');
    } else {
      console.log('❌ مشاكل كبيرة في API المحادثات');
    }
    
    // حفظ التقرير
    const reportPath = `conversations-fix-test-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  const tester = new ConversationsFixTest();
  tester.runConversationsFixTests().catch(console.error);
}

module.exports = ConversationsFixTest;
