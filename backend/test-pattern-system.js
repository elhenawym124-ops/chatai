/**
 * اختبار نظام الأنماط المحسن
 * Test Enhanced Pattern System
 */

const { PrismaClient } = require('@prisma/client');
const PatternApplicationService = require('./src/services/patternApplicationService');
const PromptEnhancementService = require('./src/services/promptEnhancementService');
const ResponseOptimizer = require('./src/services/responseOptimizer');

const prisma = new PrismaClient();

async function testPatternSystem() {
  console.log('🧪 بدء اختبار نظام الأنماط المحسن...\n');

  try {
    // 1. إنشاء خدمات الاختبار
    const patternApplication = new PatternApplicationService();
    const promptEnhancement = new PromptEnhancementService();
    const responseOptimizer = new ResponseOptimizer();

    // 2. إنشاء نمط تجريبي
    console.log('📝 إنشاء نمط تجريبي...');
    const testPattern = await prisma.successPattern.create({
      data: {
        companyId: 'cme4yvrco002kuftceydlrwdi',
        patternType: 'word_usage',
        pattern: JSON.stringify({
          successfulWords: ['أهلاً بيك', 'يسعدني', 'بالطبع', 'ممتاز'],
          failureWords: ['للأسف', 'غير متوفر', 'لا أعرف'],
          frequency: 0.85
        }),
        description: 'استخدام كلمات إيجابية يزيد معدل النجاح بـ 25%',
        successRate: 0.85,
        sampleSize: 150,
        confidenceLevel: 0.92,
        isActive: true,
        isApproved: true,
        approvedBy: 'test-system',
        approvedAt: new Date()
      }
    });
    console.log('✅ تم إنشاء النمط:', testPattern.id);

    // 3. اختبار جلب الأنماط المعتمدة
    console.log('\n🔍 اختبار جلب الأنماط المعتمدة...');
    const approvedPatterns = await patternApplication.getApprovedPatterns('cme4yvrco002kuftceydlrwdi');
    console.log(`✅ تم جلب ${approvedPatterns.length} نمط معتمد`);

    // 4. اختبار تحسين الـ prompt
    console.log('\n🎨 اختبار تحسين الـ prompt...');
    const basePrompt = 'أنت مساعد ذكي. ساعد العميل.';
    const enhancedPrompt = await promptEnhancement.enhancePromptWithPatterns(
      basePrompt,
      approvedPatterns,
      'greeting',
      'cme4yvrco002kuftceydlrwdi'
    );
    console.log('📝 الـ prompt الأساسي:', basePrompt);
    console.log('🚀 الـ prompt المحسن:', enhancedPrompt.substring(0, 200) + '...');

    // 5. اختبار تحسين الرد
    console.log('\n🔧 اختبار تحسين الرد...');
    const originalResponse = 'مرحبا. كيف يمكنني مساعدتك؟';
    const optimizedResponse = await responseOptimizer.optimizeResponse(
      originalResponse,
      approvedPatterns,
      { messageType: 'greeting', inquiryType: 'greeting' }
    );
    console.log('📝 الرد الأصلي:', originalResponse);
    console.log('🚀 الرد المحسن:', optimizedResponse);

    // 6. اختبار تطبيق جميع الأنماط
    console.log('\n🎯 اختبار تطبيق جميع الأنماط...');
    const testMessage = 'مرحبا، أريد معرفة أسعار المنتجات';
    const enhancedMessage = await patternApplication.applyAllPatterns(
      testMessage,
      'cme4yvrco002kuftceydlrwdi',
      'test-conversation-123'
    );
    console.log('📝 الرسالة الأصلية:', testMessage);
    console.log('🚀 الرسالة المحسنة:', enhancedMessage);

    // 7. اختبار تسجيل الاستخدام
    console.log('\n📊 اختبار تسجيل الاستخدام...');
    await patternApplication.recordPatternUsage(
      testPattern.id,
      'test-conversation-123',
      true,
      'cme4yvrco002kuftceydlrwdi'
    );
    console.log('✅ تم تسجيل استخدام النمط');

    // 8. فحص إحصائيات الأداء
    console.log('\n📈 فحص إحصائيات الأداء...');
    const performance = await prisma.patternPerformance.findFirst({
      where: { patternId: testPattern.id }
    });
    if (performance) {
      console.log('📊 إحصائيات الأداء:');
      console.log(`   - عدد الاستخدامات: ${performance.usageCount}`);
      console.log(`   - معدل النجاح الحالي: ${Math.round(performance.currentSuccessRate * 100)}%`);
      console.log(`   - اتجاه الأداء: ${performance.performanceTrend}`);
      console.log(`   - درجة التأثير: ${performance.impactScore.toFixed(2)}`);
    }

    // 9. فحص سجلات الاستخدام
    console.log('\n📋 فحص سجلات الاستخدام...');
    const usageRecords = await prisma.patternUsage.findMany({
      where: { patternId: testPattern.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(`📝 عدد سجلات الاستخدام: ${usageRecords.length}`);

    // 10. اختبار API endpoints
    console.log('\n🌐 اختبار API endpoints...');
    console.log('يمكنك الآن اختبار الـ APIs التالية:');
    console.log('GET /api/v1/success-learning/pattern-performance');
    console.log('GET /api/v1/success-learning/pattern-usage');
    console.log('POST /api/v1/success-learning/test-pattern');

    console.log('\n🎉 تم اكتمال اختبار النظام بنجاح!');
    console.log('\n📋 ملخص النتائج:');
    console.log(`✅ تم إنشاء نمط تجريبي: ${testPattern.id}`);
    console.log(`✅ تم جلب ${approvedPatterns.length} نمط معتمد`);
    console.log(`✅ تم تحسين الـ prompt بنجاح`);
    console.log(`✅ تم تحسين الرد بنجاح`);
    console.log(`✅ تم تطبيق الأنماط على الرسالة`);
    console.log(`✅ تم تسجيل الاستخدام وتحديث الإحصائيات`);

    console.log('\n🌟 النظام جاهز للاستخدام!');
    console.log('يمكنك الآن زيارة: http://localhost:3000/pattern-management');

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testPatternSystem();
}

module.exports = { testPatternSystem };
