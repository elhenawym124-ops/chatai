/**
 * اختبار تكامل AI Agent مع نظام التعلم المستمر
 * 
 * يختبر جمع البيانات وتطبيق التحسينات
 */

const aiAgentService = require('./src/services/aiAgentService');

class AILearningIntegrationTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * تشغيل جميع اختبارات التكامل
   */
  async runAllTests() {
    console.log('🧪 بدء اختبار تكامل AI Agent مع التعلم المستمر...\n');

    try {
      // إعداد البيانات التجريبية
      await this.setupTestData();
      
      // اختبار جمع البيانات
      await this.testDataCollection();
      
      // اختبار تطبيق التحسينات
      await this.testImprovementApplication();
      
      // اختبار إحصائيات التعلم
      await this.testLearningStats();

      // اختبار مراقبة الأداء
      await this.testPerformanceMonitoring();

      // اختبار إعدادات التعلم
      await this.testLearningSettings();

      // عرض النتائج
      this.displayResults();

    } catch (error) {
      console.error('❌ خطأ في تشغيل اختبارات التكامل:', error);
    }
  }

  /**
   * إعداد البيانات التجريبية
   */
  async setupTestData() {
    console.log('🔧 إعداد البيانات التجريبية...');
    
    // التأكد من تفعيل التعلم المستمر
    await aiAgentService.updateSettings({
      learningEnabled: true,
      isEnabled: true
    });

    console.log('✅ تم إعداد البيانات التجريبية\n');
  }

  /**
   * اختبار جمع البيانات
   */
  async testDataCollection() {
    console.log('📊 اختبار جمع البيانات...');

    // محاكاة رسالة عميل
    const testMessage = {
      conversationId: 'test_conv_integration',
      senderId: 'test_customer_integration',
      companyId: 'test_company_123',
      content: 'عايز أشتري كوتشي رياضي',
      timestamp: new Date(),
      customerData: {
        name: 'عميل تجريبي',
        phone: '01234567890'
      }
    };

    try {
      // معالجة الرسالة بواسطة AI Agent
      const response = await aiAgentService.processCustomerMessage(testMessage);
      
      this.assertTest('معالجة رسالة العميل', !!response, response);
      
      if (response) {
        this.assertTest('وجود محتوى الرد', !!response.content, response.content);
        this.assertTest('وجود النية', !!response.intent, response.intent);
        this.assertTest('وجود المشاعر', !!response.sentiment, response.sentiment);
      }

      // انتظار قليل لضمان حفظ البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('✅ اكتمل اختبار جمع البيانات\n');

    } catch (error) {
      console.error('❌ خطأ في اختبار جمع البيانات:', error);
      this.assertTest('معالجة رسالة العميل', false, error.message);
    }
  }

  /**
   * اختبار تطبيق التحسينات
   */
  async testImprovementApplication() {
    console.log('🚀 اختبار تطبيق التحسينات...');

    try {
      // تطبيق التحسينات للشركة التجريبية
      await aiAgentService.applyLearningImprovements('test_company_123');
      
      this.assertTest('تطبيق التحسينات', true, 'تم تطبيق التحسينات بنجاح');

      console.log('✅ اكتمل اختبار تطبيق التحسينات\n');

    } catch (error) {
      console.error('❌ خطأ في اختبار تطبيق التحسينات:', error);
      this.assertTest('تطبيق التحسينات', false, error.message);
    }
  }

  /**
   * اختبار إحصائيات التعلم
   */
  async testLearningStats() {
    console.log('📈 اختبار إحصائيات التعلم...');

    try {
      // الحصول على إحصائيات التعلم
      const stats = await aiAgentService.getLearningStats('test_company_123');
      
      this.assertTest('الحصول على إحصائيات التعلم', !!stats, stats);
      this.assertTest('تفعيل التعلم في الإحصائيات', stats.enabled === true, stats.enabled);

      if (stats.overview) {
        this.assertTest('وجود نظرة عامة', !!stats.overview, stats.overview);
      }

      console.log('✅ اكتمل اختبار إحصائيات التعلم\n');

    } catch (error) {
      console.error('❌ خطأ في اختبار إحصائيات التعلم:', error);
      this.assertTest('الحصول على إحصائيات التعلم', false, error.message);
    }
  }

  /**
   * اختبار مراقبة الأداء
   */
  async testPerformanceMonitoring() {
    console.log('📊 اختبار مراقبة الأداء...');

    try {
      // مراقبة أداء التحسينات
      const performance = await aiAgentService.monitorImprovementPerformance('test_company_123');

      this.assertTest('مراقبة أداء التحسينات', !!performance, performance);

      if (performance.success) {
        this.assertTest('وجود مؤشرات الأداء', !!performance.metrics, performance.metrics);
        this.assertTest('وجود التوصيات', Array.isArray(performance.recommendations), performance.recommendations);

        if (performance.metrics) {
          this.assertTest('وجود معدل النجاح', typeof performance.metrics.successRate === 'number', performance.metrics.successRate);
          this.assertTest('وجود إجمالي التفاعلات', typeof performance.metrics.totalInteractions === 'number', performance.metrics.totalInteractions);
        }
      }

      console.log('✅ اكتمل اختبار مراقبة الأداء\n');

    } catch (error) {
      console.error('❌ خطأ في اختبار مراقبة الأداء:', error);
      this.assertTest('مراقبة أداء التحسينات', false, error.message);
    }
  }

  /**
   * اختبار إعدادات التعلم
   */
  async testLearningSettings() {
    console.log('⚙️ اختبار إعدادات التعلم...');

    try {
      // الحصول على الإعدادات الحالية
      const currentSettings = await aiAgentService.getSettings();
      
      this.assertTest('الحصول على الإعدادات', !!currentSettings, currentSettings);
      this.assertTest('وجود إعداد التعلم', 'learningEnabled' in currentSettings, currentSettings.learningEnabled);

      // تحديث إعدادات التعلم
      await aiAgentService.updateSettings({
        learningEnabled: false
      });

      const updatedSettings = await aiAgentService.getSettings();
      this.assertTest('تحديث إعدادات التعلم', updatedSettings.learningEnabled === false, updatedSettings.learningEnabled);

      // إعادة تفعيل التعلم
      await aiAgentService.updateSettings({
        learningEnabled: true
      });

      console.log('✅ اكتمل اختبار إعدادات التعلم\n');

    } catch (error) {
      console.error('❌ خطأ في اختبار إعدادات التعلم:', error);
      this.assertTest('اختبار إعدادات التعلم', false, error.message);
    }
  }

  /**
   * تأكيد نتيجة الاختبار
   */
  assertTest(testName, condition, data = null) {
    const result = {
      name: testName,
      passed: !!condition,
      data: data
    };

    this.testResults.tests.push(result);
    
    if (condition) {
      this.testResults.passed++;
      console.log(`  ✅ ${testName}`);
    } else {
      this.testResults.failed++;
      console.log(`  ❌ ${testName}`);
      if (data) {
        console.log(`     البيانات:`, data);
      }
    }
  }

  /**
   * عرض النتائج النهائية
   */
  displayResults() {
    console.log('\n📋 نتائج اختبارات التكامل:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ نجح: ${this.testResults.passed}`);
    console.log(`❌ فشل: ${this.testResults.failed}`);
    console.log(`📊 المجموع: ${this.testResults.tests.length}`);
    console.log(`🎯 معدل النجاح: ${Math.round((this.testResults.passed / this.testResults.tests.length) * 100)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ الاختبارات الفاشلة:');
      this.testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`  - ${t.name}`));
    }
    
    console.log('\n🎉 اكتمل اختبار تكامل AI Agent مع التعلم المستمر!');
  }
}

// تشغيل الاختبارات
async function runIntegrationTests() {
  const tester = new AILearningIntegrationTester();
  await tester.runAllTests();
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = AILearningIntegrationTester;
