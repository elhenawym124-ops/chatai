/**
 * اختبار شامل لنظام تعلم أنماط النجاح
 * 
 * يختبر جميع مكونات النظام:
 * - قاعدة البيانات والجداول الجديدة
 * - خدمات التحليل والاكتشاف
 * - API endpoints
 * - تكامل النظام
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const SuccessAnalyzer = require('./src/services/successAnalyzer');
const PatternDetector = require('./src/services/patternDetector');
const OutcomeTracker = require('./src/services/outcomeTracker');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001/api/v1';

class SuccessLearningSystemTest {
  constructor() {
    this.testResults = {
      database: [],
      services: [],
      api: [],
      integration: []
    };
    this.defaultCompanyId = 'cme4yvrco002kuftceydlrwdi';
  }

  /**
   * تشغيل جميع الاختبارات
   */
  async runAllTests() {
    console.log('🚀 بدء اختبار نظام تعلم أنماط النجاح...\n');

    try {
      // اختبار قاعدة البيانات
      await this.testDatabase();
      
      // اختبار الخدمات
      await this.testServices();
      
      // اختبار API
      await this.testAPI();
      
      // اختبار التكامل
      await this.testIntegration();
      
      // عرض النتائج
      this.displayResults();

    } catch (error) {
      console.error('❌ خطأ في تشغيل الاختبارات:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * اختبار قاعدة البيانات
   */
  async testDatabase() {
    console.log('📊 اختبار قاعدة البيانات...');

    // اختبار الجداول الجديدة
    await this.testTable('SuccessPattern', 'success_patterns');
    await this.testTable('ConversationOutcome', 'conversation_outcomes');
    await this.testTable('ResponseEffectiveness', 'response_effectiveness');

    // اختبار إنشاء البيانات التجريبية
    await this.createTestData();
  }

  /**
   * اختبار جدول معين
   */
  async testTable(modelName, tableName) {
    try {
      // اختبار الإنشاء
      const testData = this.getTestDataForTable(modelName);
      const created = await prisma[modelName.toLowerCase()].create({
        data: testData
      });

      this.testResults.database.push({
        test: `Create ${modelName}`,
        status: 'PASS',
        message: `تم إنشاء ${modelName} بنجاح: ${created.id}`
      });

      // اختبار القراءة
      const found = await prisma[modelName.toLowerCase()].findUnique({
        where: { id: created.id }
      });

      this.testResults.database.push({
        test: `Read ${modelName}`,
        status: found ? 'PASS' : 'FAIL',
        message: found ? `تم قراءة ${modelName} بنجاح` : `فشل في قراءة ${modelName}`
      });

      // اختبار التحديث
      const updated = await prisma[modelName.toLowerCase()].update({
        where: { id: created.id },
        data: { updatedAt: new Date() }
      });

      this.testResults.database.push({
        test: `Update ${modelName}`,
        status: 'PASS',
        message: `تم تحديث ${modelName} بنجاح`
      });

      // اختبار الحذف
      await prisma[modelName.toLowerCase()].delete({
        where: { id: created.id }
      });

      this.testResults.database.push({
        test: `Delete ${modelName}`,
        status: 'PASS',
        message: `تم حذف ${modelName} بنجاح`
      });

    } catch (error) {
      this.testResults.database.push({
        test: `${modelName} Operations`,
        status: 'FAIL',
        message: `خطأ في عمليات ${modelName}: ${error.message}`
      });
    }
  }

  /**
   * الحصول على بيانات تجريبية للجدول
   */
  getTestDataForTable(modelName) {
    const baseData = {
      companyId: this.defaultCompanyId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (modelName) {
      case 'SuccessPattern':
        return {
          ...baseData,
          patternType: 'word_usage',
          pattern: JSON.stringify({ words: ['ممتاز', 'رائع'] }),
          description: 'نمط اختبار',
          successRate: 0.85,
          sampleSize: 50,
          confidenceLevel: 0.9
        };

      case 'ConversationOutcome':
        return {
          ...baseData,
          conversationId: 'test_conv_' + Date.now(),
          customerId: 'test_customer_' + Date.now(),
          outcome: 'purchase',
          outcomeValue: 349,
          responseQuality: 8.5,
          customerSatisfaction: 4.2,
          conversionTime: 15,
          messageCount: 8,
          aiResponseCount: 4,
          humanHandoff: false
        };

      case 'ResponseEffectiveness':
        return {
          ...baseData,
          conversationId: 'test_conv_' + Date.now(),
          responseText: 'مرحباً! كيف يمكنني مساعدتك؟',
          responseType: 'greeting',
          effectivenessScore: 8.0,
          leadToPurchase: true,
          responseTime: 1500,
          wordCount: 6,
          sentimentScore: 0.8,
          keywords: 'مرحبا, مساعدة'
        };

      default:
        return baseData;
    }
  }

  /**
   * إنشاء بيانات تجريبية
   */
  async createTestData() {
    try {
      console.log('📝 إنشاء بيانات تجريبية...');

      // إنشاء محادثات تجريبية
      const testConversations = [];
      for (let i = 0; i < 10; i++) {
        const outcome = await prisma.conversationOutcome.create({
          data: {
            companyId: this.defaultCompanyId,
            conversationId: `test_conv_${Date.now()}_${i}`,
            customerId: `test_customer_${Date.now()}_${i}`,
            outcome: i < 6 ? 'purchase' : 'abandoned', // 60% نجاح
            outcomeValue: i < 6 ? 300 + (i * 50) : null,
            responseQuality: i < 6 ? 8 + (i * 0.2) : 4 + (i * 0.3),
            customerSatisfaction: i < 6 ? 4 + (i * 0.1) : 2 + (i * 0.2),
            conversionTime: 10 + (i * 5),
            messageCount: 5 + i,
            aiResponseCount: 2 + Math.floor(i / 2),
            humanHandoff: i > 8
          }
        });
        testConversations.push(outcome);
      }

      // إنشاء ردود تجريبية
      const testResponses = [];
      for (let i = 0; i < 20; i++) {
        const response = await prisma.responseEffectiveness.create({
          data: {
            companyId: this.defaultCompanyId,
            conversationId: testConversations[i % 10].conversationId,
            responseText: this.getTestResponse(i),
            responseType: this.getResponseType(i),
            effectivenessScore: i < 12 ? 7 + (i * 0.2) : 3 + (i * 0.1),
            leadToPurchase: i < 12,
            responseTime: 1000 + (i * 200),
            wordCount: 10 + (i * 2),
            sentimentScore: i < 12 ? 0.5 + (i * 0.04) : -0.2 + (i * 0.02),
            keywords: this.getTestKeywords(i)
          }
        });
        testResponses.push(response);
      }

      this.testResults.database.push({
        test: 'Create Test Data',
        status: 'PASS',
        message: `تم إنشاء ${testConversations.length} محادثة و ${testResponses.length} رد تجريبي`
      });

      // حفظ المعرفات للاختبارات اللاحقة
      this.testConversations = testConversations;
      this.testResponses = testResponses;

    } catch (error) {
      this.testResults.database.push({
        test: 'Create Test Data',
        status: 'FAIL',
        message: `فشل في إنشاء البيانات التجريبية: ${error.message}`
      });
    }
  }

  /**
   * الحصول على رد تجريبي
   */
  getTestResponse(index) {
    const responses = [
      'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
      'الكوتشي متوفر بسعر 349 جنيه',
      'متوفر منه ألوان مختلفة',
      'المقاسات من 37 إلى 41',
      'الشحن مجاني داخل القاهرة',
      'جودة ممتازة ومضمونة',
      'يمكنك الدفع عند الاستلام',
      'التوصيل خلال 24 ساعة',
      'هل تريد تأكيد الطلب؟',
      'شكراً لك على الثقة',
      'السعر غالي شوية',
      'مش متأكد من الجودة',
      'محتاج أفكر فيه',
      'ممكن خصم؟',
      'الشحن كام؟',
      'متوفر لون أحمر؟',
      'المقاس 38 موجود؟',
      'كام يوم التوصيل؟',
      'ضمان كام سنة؟',
      'ممكن أشوف صور أكتر؟'
    ];
    return responses[index % responses.length];
  }

  /**
   * الحصول على نوع الرد
   */
  getResponseType(index) {
    const types = ['greeting', 'price_quote', 'product_info', 'shipping_info', 'closing'];
    return types[index % types.length];
  }

  /**
   * الحصول على كلمات مفتاحية تجريبية
   */
  getTestKeywords(index) {
    const keywords = [
      'أهلاً, مساعدة',
      'سعر, جنيه',
      'ألوان, متوفر',
      'مقاسات, أرقام',
      'شحن, مجاني',
      'جودة, ممتازة',
      'دفع, استلام',
      'توصيل, ساعة',
      'طلب, تأكيد',
      'شكراً, ثقة'
    ];
    return keywords[index % keywords.length];
  }

  /**
   * اختبار الخدمات
   */
  async testServices() {
    console.log('🔧 اختبار الخدمات...');

    // اختبار SuccessAnalyzer
    await this.testSuccessAnalyzer();
    
    // اختبار PatternDetector
    await this.testPatternDetector();
    
    // اختبار OutcomeTracker
    await this.testOutcomeTracker();
  }

  /**
   * اختبار محلل النجاح
   */
  async testSuccessAnalyzer() {
    try {
      const analyzer = new SuccessAnalyzer();
      
      const result = await analyzer.analyzeSuccessPatterns(this.defaultCompanyId, {
        timeRange: 1, // يوم واحد
        minSampleSize: 5
      });

      this.testResults.services.push({
        test: 'SuccessAnalyzer.analyzeSuccessPatterns',
        status: result.success ? 'PASS' : 'FAIL',
        message: result.success ? 
          `تم تحليل ${result.patterns?.length || 0} نمط` : 
          result.message || 'فشل في التحليل'
      });

    } catch (error) {
      this.testResults.services.push({
        test: 'SuccessAnalyzer',
        status: 'FAIL',
        message: `خطأ في محلل النجاح: ${error.message}`
      });
    }
  }

  /**
   * اختبار كاشف الأنماط
   */
  async testPatternDetector() {
    try {
      const detector = new PatternDetector();
      
      const result = await detector.detectNewPatterns(this.defaultCompanyId, 1);

      this.testResults.services.push({
        test: 'PatternDetector.detectNewPatterns',
        status: result.success ? 'PASS' : 'FAIL',
        message: result.success ? 
          `تم اكتشاف ${result.patterns?.length || 0} نمط جديد` : 
          result.message || 'فشل في الاكتشاف'
      });

    } catch (error) {
      this.testResults.services.push({
        test: 'PatternDetector',
        status: 'FAIL',
        message: `خطأ في كاشف الأنماط: ${error.message}`
      });
    }
  }

  /**
   * اختبار متتبع النتائج
   */
  async testOutcomeTracker() {
    try {
      const tracker = new OutcomeTracker();
      
      // اختبار تسجيل نتيجة
      const result = await tracker.recordConversationOutcome({
        conversationId: 'test_conv_tracker',
        customerId: 'test_customer_tracker',
        companyId: this.defaultCompanyId,
        outcome: 'purchase',
        outcomeValue: 500
      });

      this.testResults.services.push({
        test: 'OutcomeTracker.recordConversationOutcome',
        status: result.success ? 'PASS' : 'FAIL',
        message: result.success ? 'تم تسجيل النتيجة بنجاح' : result.error || 'فشل في التسجيل'
      });

      // اختبار الإحصائيات
      const stats = await tracker.getOutcomeStats(this.defaultCompanyId, 1);
      
      this.testResults.services.push({
        test: 'OutcomeTracker.getOutcomeStats',
        status: stats ? 'PASS' : 'FAIL',
        message: stats ? `تم جلب الإحصائيات: ${stats.total} نتيجة` : 'فشل في جلب الإحصائيات'
      });

    } catch (error) {
      this.testResults.services.push({
        test: 'OutcomeTracker',
        status: 'FAIL',
        message: `خطأ في متتبع النتائج: ${error.message}`
      });
    }
  }

  /**
   * اختبار API
   */
  async testAPI() {
    console.log('🌐 اختبار API...');

    const endpoints = [
      {
        name: 'GET /success-learning/patterns',
        method: 'GET',
        url: `${BASE_URL}/success-learning/patterns`
      },
      {
        name: 'GET /success-learning/analyze-patterns',
        method: 'GET',
        url: `${BASE_URL}/success-learning/analyze-patterns?timeRange=1&minSampleSize=5`
      },
      {
        name: 'GET /success-learning/detect-patterns',
        method: 'GET',
        url: `${BASE_URL}/success-learning/detect-patterns?timeRange=1`
      },
      {
        name: 'GET /success-learning/outcome-stats',
        method: 'GET',
        url: `${BASE_URL}/success-learning/outcome-stats?timeRange=1`
      },
      {
        name: 'POST /success-learning/record-outcome',
        method: 'POST',
        url: `${BASE_URL}/success-learning/record-outcome`,
        data: {
          conversationId: 'test_api_conv',
          customerId: 'test_api_customer',
          companyId: this.defaultCompanyId,
          outcome: 'purchase',
          outcomeValue: 400
        }
      }
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  /**
   * اختبار endpoint معين
   */
  async testEndpoint(endpoint) {
    try {
      let response;
      
      if (endpoint.method === 'GET') {
        response = await axios.get(endpoint.url, { timeout: 10000 });
      } else if (endpoint.method === 'POST') {
        response = await axios.post(endpoint.url, endpoint.data, { timeout: 10000 });
      }

      this.testResults.api.push({
        test: endpoint.name,
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: response.status === 200 ? 
          `نجح الطلب: ${response.data.message || 'OK'}` : 
          `فشل الطلب: ${response.status}`
      });

    } catch (error) {
      this.testResults.api.push({
        test: endpoint.name,
        status: 'FAIL',
        message: `خطأ في الطلب: ${error.message}`
      });
    }
  }

  /**
   * اختبار التكامل
   */
  async testIntegration() {
    console.log('🔗 اختبار التكامل...');

    try {
      // اختبار التكامل الشامل
      const response = await axios.post(`${BASE_URL}/success-learning/run-analysis`, {
        companyId: this.defaultCompanyId,
        timeRange: 1
      }, { timeout: 30000 });

      this.testResults.integration.push({
        test: 'Comprehensive Analysis Integration',
        status: response.status === 200 ? 'PASS' : 'FAIL',
        message: response.status === 200 ? 
          'تم تشغيل التحليل الشامل بنجاح' : 
          `فشل التحليل الشامل: ${response.status}`
      });

    } catch (error) {
      this.testResults.integration.push({
        test: 'Integration Test',
        status: 'FAIL',
        message: `خطأ في اختبار التكامل: ${error.message}`
      });
    }
  }

  /**
   * عرض النتائج
   */
  displayResults() {
    console.log('\n📊 نتائج الاختبارات:\n');

    const categories = ['database', 'services', 'api', 'integration'];
    const categoryNames = {
      database: 'قاعدة البيانات',
      services: 'الخدمات',
      api: 'واجهة البرمجة',
      integration: 'التكامل'
    };

    let totalTests = 0;
    let passedTests = 0;

    categories.forEach(category => {
      const results = this.testResults[category];
      const passed = results.filter(r => r.status === 'PASS').length;
      const failed = results.filter(r => r.status === 'FAIL').length;

      console.log(`\n🔸 ${categoryNames[category]}:`);
      console.log(`   ✅ نجح: ${passed}`);
      console.log(`   ❌ فشل: ${failed}`);
      console.log(`   📊 المجموع: ${results.length}`);

      if (failed > 0) {
        console.log('   🔍 الأخطاء:');
        results.filter(r => r.status === 'FAIL').forEach(result => {
          console.log(`      - ${result.test}: ${result.message}`);
        });
      }

      totalTests += results.length;
      passedTests += passed;
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 النتيجة النهائية: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
    } else {
      console.log('⚠️ بعض الاختبارات فشلت. يرجى مراجعة الأخطاء أعلاه.');
    }
  }

  /**
   * تنظيف البيانات التجريبية
   */
  async cleanup() {
    try {
      console.log('\n🧹 تنظيف البيانات التجريبية...');

      // حذف البيانات التجريبية
      await prisma.responseEffectiveness.deleteMany({
        where: {
          companyId: this.defaultCompanyId,
          conversationId: { startsWith: 'test_' }
        }
      });

      await prisma.conversationOutcome.deleteMany({
        where: {
          companyId: this.defaultCompanyId,
          conversationId: { startsWith: 'test_' }
        }
      });

      await prisma.successPattern.deleteMany({
        where: {
          companyId: this.defaultCompanyId,
          description: 'نمط اختبار'
        }
      });

      console.log('✅ تم تنظيف البيانات التجريبية');

    } catch (error) {
      console.error('❌ خطأ في تنظيف البيانات:', error);
    }
  }
}

// تشغيل الاختبارات
async function runTests() {
  const tester = new SuccessLearningSystemTest();
  
  try {
    await tester.runAllTests();
  } finally {
    await tester.cleanup();
  }
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = SuccessLearningSystemTest;
