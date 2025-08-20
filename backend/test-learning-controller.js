/**
 * اختبار مباشر لـ Continuous Learning Controller
 * 
 * يختبر الـ controller مباشرة بدون الحاجة لخادم
 */

const continuousLearningController = require('./src/controllers/continuousLearningController');

class LearningControllerTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * تشغيل جميع اختبارات Controller
   */
  async runAllTests() {
    console.log('🧪 بدء اختبار Continuous Learning Controller...\n');

    try {
      // اختبار Dashboard
      await this.testDashboard();
      
      // اختبار Analytics
      await this.testAnalytics();
      
      // اختبار Patterns
      await this.testPatterns();
      
      // اختبار Improvements
      await this.testImprovements();
      
      // اختبار Settings
      await this.testSettings();
      
      // اختبار Performance
      await this.testPerformance();

      // عرض النتائج
      this.displayResults();

    } catch (error) {
      console.error('❌ خطأ في تشغيل اختبارات Controller:', error);
    }
  }

  /**
   * إنشاء mock request و response
   */
  createMockReqRes(user = null, query = {}, body = {}, params = {}) {
    const req = {
      user: user || {
        id: 'test_user_123',
        companyId: 'test_company_123',
        email: 'test@learning.com',
        role: 'ADMIN'
      },
      query: query,
      body: body,
      params: params
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      },
      statusCode: 200,
      data: null
    };

    return { req, res };
  }

  /**
   * اختبار Dashboard
   */
  async testDashboard() {
    console.log('📊 اختبار Dashboard...');

    try {
      const { req, res } = this.createMockReqRes();
      
      await continuousLearningController.getDashboard(req, res);
      
      this.assertTest('Dashboard - استجابة ناجحة', res.statusCode === 200, res.statusCode);
      this.assertTest('Dashboard - وجود البيانات', !!res.data, res.data);
      
      if (res.data && res.data.success) {
        this.assertTest('Dashboard - نجاح العملية', res.data.success === true, res.data.success);
        this.assertTest('Dashboard - وجود overview', !!res.data.data?.overview, res.data.data?.overview);
      }

    } catch (error) {
      this.assertTest('Dashboard - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Dashboard\n');
  }

  /**
   * اختبار Analytics
   */
  async testAnalytics() {
    console.log('📈 اختبار Analytics...');

    try {
      // اختبار مع فترات مختلفة
      const periods = ['day', 'week', 'month'];
      
      for (const period of periods) {
        const { req, res } = this.createMockReqRes(null, { period });
        
        await continuousLearningController.getAnalytics(req, res);
        
        this.assertTest(`Analytics - ${period}`, res.statusCode === 200, res.statusCode);
        
        if (res.data && res.data.success) {
          this.assertTest(`Analytics - ${period} - البيانات`, !!res.data.data, res.data.data);
        }
      }

      // اختبار فترة غير صحيحة
      const { req: invalidReq, res: invalidRes } = this.createMockReqRes(null, { period: 'invalid' });
      
      await continuousLearningController.getAnalytics(invalidReq, invalidRes);
      
      this.assertTest('Analytics - فترة غير صحيحة', invalidRes.statusCode === 400, invalidRes.statusCode);

    } catch (error) {
      this.assertTest('Analytics - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Analytics\n');
  }

  /**
   * اختبار Patterns
   */
  async testPatterns() {
    console.log('🔍 اختبار Patterns...');

    try {
      // الحصول على جميع الأنماط
      const { req, res } = this.createMockReqRes();
      
      await continuousLearningController.getPatterns(req, res);
      
      this.assertTest('Patterns - الحصول على الأنماط', res.statusCode === 200, res.statusCode);
      this.assertTest('Patterns - وجود البيانات', !!res.data, res.data);

      // اختبار مع فلاتر
      const { req: filteredReq, res: filteredRes } = this.createMockReqRes(null, { 
        type: 'performance', 
        minConfidence: 0.8 
      });
      
      await continuousLearningController.getPatterns(filteredReq, filteredRes);
      
      this.assertTest('Patterns - مع فلاتر', filteredRes.statusCode === 200, filteredRes.statusCode);

    } catch (error) {
      this.assertTest('Patterns - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Patterns\n');
  }

  /**
   * اختبار Improvements
   */
  async testImprovements() {
    console.log('🚀 اختبار Improvements...');

    try {
      // الحصول على التحسينات
      const { req, res } = this.createMockReqRes();
      
      await continuousLearningController.getImprovements(req, res);
      
      this.assertTest('Improvements - الحصول على التحسينات', res.statusCode === 200, res.statusCode);
      this.assertTest('Improvements - وجود البيانات', !!res.data, res.data);

      // اختبار مع فلاتر
      const { req: filteredReq, res: filteredRes } = this.createMockReqRes(null, { 
        status: 'active' 
      });
      
      await continuousLearningController.getImprovements(filteredReq, filteredRes);
      
      this.assertTest('Improvements - مع فلاتر', filteredRes.statusCode === 200, filteredRes.statusCode);

    } catch (error) {
      this.assertTest('Improvements - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Improvements\n');
  }

  /**
   * اختبار Settings
   */
  async testSettings() {
    console.log('⚙️ اختبار Settings...');

    try {
      // الحصول على الإعدادات
      const { req: getReq, res: getRes } = this.createMockReqRes();
      
      await continuousLearningController.getSettings(getReq, getRes);
      
      this.assertTest('Settings - الحصول على الإعدادات', getRes.statusCode === 200, getRes.statusCode);
      this.assertTest('Settings - وجود البيانات', !!getRes.data, getRes.data);

      // تحديث الإعدادات
      const updateData = {
        learning: {
          enabled: true,
          learningSpeed: 'medium',
          autoApplyImprovements: false
        },
        ai: {
          learningEnabled: true
        }
      };

      const { req: updateReq, res: updateRes } = this.createMockReqRes(null, {}, updateData);
      
      await continuousLearningController.updateSettings(updateReq, updateRes);
      
      this.assertTest('Settings - تحديث الإعدادات', updateRes.statusCode === 200, updateRes.statusCode);

    } catch (error) {
      this.assertTest('Settings - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Settings\n');
  }

  /**
   * اختبار Performance
   */
  async testPerformance() {
    console.log('📈 اختبار Performance...');

    try {
      const { req, res } = this.createMockReqRes();
      
      await continuousLearningController.getPerformance(req, res);
      
      this.assertTest('Performance - الحصول على البيانات', res.statusCode === 200, res.statusCode);
      this.assertTest('Performance - وجود البيانات', !!res.data, res.data);

    } catch (error) {
      this.assertTest('Performance - خطأ عام', false, error.message);
    }

    console.log('✅ اكتمل اختبار Performance\n');
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
    console.log('\n📋 نتائج اختبارات Controller:');
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
    
    console.log('\n🎉 اكتمل اختبار Continuous Learning Controller!');
  }
}

// تشغيل الاختبارات
async function runControllerTests() {
  const tester = new LearningControllerTester();
  await tester.runAllTests();
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runControllerTests().catch(console.error);
}

module.exports = LearningControllerTester;
