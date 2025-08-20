/**
 * اختبار اتصال قاعدة البيانات لنظام اكتشاف الأنماط
 * Test Database Connection for Pattern Detection
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 اختبار اتصال قاعدة البيانات...\n');

  let prisma = null;

  try {
    // 1. إنشاء اتصال Prisma
    console.log('1️⃣ إنشاء اتصال Prisma...');
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty'
    });
    console.log('✅ تم إنشاء Prisma client بنجاح');

    // 2. اختبار الاتصال الأساسي
    console.log('\n2️⃣ اختبار الاتصال الأساسي...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ الاتصال بقاعدة البيانات يعمل');

    // 3. اختبار الجداول المطلوبة
    console.log('\n3️⃣ اختبار الجداول المطلوبة...');
    
    const companyId = 'cme4yvrco002kuftceydlrwdi';
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // آخر 30 يوم

    // اختبار جدول conversationOutcome
    try {
      const outcomes = await prisma.conversationOutcome.findMany({
        where: { companyId },
        take: 5
      });
      console.log(`✅ جدول conversationOutcome: ${outcomes.length} سجل`);
    } catch (error) {
      console.log(`❌ جدول conversationOutcome: ${error.message}`);
    }

    // اختبار جدول continuousLearningData
    try {
      const learningData = await prisma.continuousLearningData.findMany({
        where: { companyId },
        take: 5
      });
      console.log(`✅ جدول continuousLearningData: ${learningData.length} سجل`);
    } catch (error) {
      console.log(`❌ جدول continuousLearningData: ${error.message}`);
    }

    // اختبار جدول message
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversation: { companyId }
        },
        take: 5
      });
      console.log(`✅ جدول message: ${messages.length} سجل`);
    } catch (error) {
      console.log(`❌ جدول message: ${error.message}`);
    }

    // اختبار جدول responseEffectiveness
    try {
      const responses = await prisma.responseEffectiveness.findMany({
        where: { companyId },
        take: 5
      });
      console.log(`✅ جدول responseEffectiveness: ${responses.length} سجل`);
    } catch (error) {
      console.log(`❌ جدول responseEffectiveness: ${error.message}`);
    }

    // اختبار جدول aiInteraction
    try {
      const interactions = await prisma.aiInteraction.findMany({
        where: { companyId },
        take: 5
      });
      console.log(`✅ جدول aiInteraction: ${interactions.length} سجل`);
    } catch (error) {
      console.log(`❌ جدول aiInteraction: ${error.message}`);
    }

    // 4. اختبار PatternDetector مع قاعدة البيانات
    console.log('\n4️⃣ اختبار PatternDetector مع قاعدة البيانات...');
    
    try {
      const PatternDetector = require('./src/services/patternDetector');
      const detector = new PatternDetector();
      
      console.log('✅ تم إنشاء PatternDetector بنجاح');
      
      // اختبار فحص الاتصال
      const isConnected = await detector.checkDatabaseConnection();
      console.log(`📊 حالة الاتصال: ${isConnected ? 'متصل' : 'غير متصل'}`);
      
      if (isConnected) {
        // اختبار جلب البيانات
        console.log('🔄 اختبار جلب البيانات...');
        const data = await detector.getRecentData(companyId, startDate);
        
        console.log('📊 البيانات المجلبة:');
        console.log(`   - النتائج: ${data.outcomes?.length || 0}`);
        console.log(`   - الردود: ${data.responses?.length || 0}`);
        console.log(`   - التفاعلات: ${data.interactions?.length || 0}`);
        console.log(`   - بيانات التعلم: ${data.learningData?.length || 0}`);
        console.log(`   - الرسائل: ${data.messages?.length || 0}`);
        
        const totalRecords = (data.outcomes?.length || 0) + 
                           (data.responses?.length || 0) + 
                           (data.interactions?.length || 0) + 
                           (data.learningData?.length || 0) + 
                           (data.messages?.length || 0);
        
        console.log(`📈 إجمالي السجلات: ${totalRecords}`);
        
        if (totalRecords >= 3) {
          console.log('✅ البيانات كافية لاكتشاف الأنماط');
          
          // اختبار تحضير البيانات للذكاء الصناعي
          const analysisData = detector.prepareDataForAI(data);
          console.log(`📝 النصوص الناجحة: ${analysisData.successfulTexts.length}`);
          console.log(`📝 النصوص الفاشلة: ${analysisData.unsuccessfulTexts.length}`);
          console.log(`📊 البيانات كافية للتحليل: ${analysisData.hasEnoughData}`);
          
        } else {
          console.log('⚠️ البيانات غير كافية لاكتشاف الأنماط');
        }
      }
      
    } catch (detectorError) {
      console.error('❌ خطأ في PatternDetector:', detectorError.message);
    }

    // 5. اختبار النظام الكامل
    console.log('\n5️⃣ اختبار النظام الكامل...');
    
    try {
      const PatternDetector = require('./src/services/patternDetector');
      const detector = new PatternDetector();
      
      const result = await detector.detectNewPatterns(companyId, 30);
      
      console.log('📊 نتيجة النظام الكامل:');
      console.log(`   - النجاح: ${result.success}`);
      console.log(`   - عدد الأنماط: ${result.patterns?.length || 0}`);
      console.log(`   - الرسالة: ${result.message || 'لا توجد رسالة'}`);
      
      if (result.success && result.patterns && result.patterns.length > 0) {
        console.log('\n🎯 الأنماط المكتشفة:');
        result.patterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern.description} (قوة: ${pattern.strength})`);
        });
      }
      
    } catch (fullError) {
      console.error('❌ خطأ في النظام الكامل:', fullError.message);
    }

    console.log('\n✅ انتهى اختبار قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    }
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };
