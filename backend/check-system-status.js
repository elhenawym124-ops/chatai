/**
 * فحص حالة النظام الشاملة
 * Comprehensive System Status Check
 */

const PatternDetector = require('./src/services/patternDetector');

async function checkSystemStatus() {
  console.log('🔍 فحص حالة النظام الشاملة\n');

  try {
    const detector = new PatternDetector();
    const companyId = 'cme4yvrco002kuftceydlrwdi';

    // 1. فحص قاعدة البيانات
    console.log('1️⃣ فحص قاعدة البيانات...');
    const isConnected = await detector.checkDatabaseConnection();
    console.log(`   📊 الاتصال: ${isConnected ? '✅ متصل' : '❌ غير متصل'}`);

    if (!isConnected) {
      console.log('❌ لا يمكن المتابعة بدون اتصال قاعدة البيانات');
      return;
    }

    // 2. فحص البيانات المتاحة
    console.log('\n2️⃣ فحص البيانات المتاحة...');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // آخر 30 يوم
    const data = await detector.getRecentData(companyId, startDate);

    console.log(`   📊 البيانات المجلبة:`);
    console.log(`      - النتائج: ${data.outcomes?.length || 0}`);
    console.log(`      - الردود: ${data.responses?.length || 0}`);
    console.log(`      - التفاعلات: ${data.interactions?.length || 0}`);
    console.log(`      - بيانات التعلم: ${data.learningData?.length || 0}`);
    console.log(`      - الرسائل: ${data.messages?.length || 0}`);

    const totalRecords = (data.outcomes?.length || 0) + 
                        (data.responses?.length || 0) + 
                        (data.interactions?.length || 0) + 
                        (data.learningData?.length || 0) + 
                        (data.messages?.length || 0);

    console.log(`   📈 إجمالي السجلات: ${totalRecords}`);

    // 3. فحص تحضير البيانات للذكاء الصناعي
    console.log('\n3️⃣ فحص تحضير البيانات للذكاء الصناعي...');
    const analysisData = detector.prepareDataForAI(data);

    console.log(`   📝 النصوص المحضرة:`);
    console.log(`      - النصوص الناجحة: ${analysisData.successfulTexts.length}`);
    console.log(`      - النصوص الفاشلة: ${analysisData.unsuccessfulTexts.length}`);
    console.log(`      - إجمالي العينات: ${analysisData.totalSamples}`);
    console.log(`      - البيانات كافية: ${analysisData.hasEnoughData ? '✅ نعم' : '❌ لا'}`);

    if (analysisData.hasEnoughData) {
      console.log('\n   📋 عينة من النصوص الناجحة:');
      analysisData.successfulTexts.slice(0, 3).forEach((text, i) => {
        console.log(`      ${i+1}. "${text.substring(0, 50)}..."`);
      });

      console.log('\n   📋 عينة من النصوص الفاشلة:');
      analysisData.unsuccessfulTexts.slice(0, 3).forEach((text, i) => {
        console.log(`      ${i+1}. "${text.substring(0, 50)}..."`);
      });
    }

    // 4. اختبار الاكتشاف التلقائي
    console.log('\n4️⃣ اختبار الاكتشاف التلقائي...');
    
    if (analysisData.hasEnoughData) {
      try {
        console.log('   🤖 محاولة اكتشاف أنماط بالذكاء الصناعي...');
        const patterns = await detector.detectPatternsWithAI(data);
        
        console.log(`   🎯 النتيجة: تم اكتشاف ${patterns.length} نمط`);
        
        if (patterns.length > 0) {
          console.log('\n   📋 الأنماط المكتشفة:');
          patterns.forEach((pattern, index) => {
            console.log(`      ${index + 1}. ${pattern.description.substring(0, 80)}...`);
            console.log(`         💪 القوة: ${(pattern.strength * 100).toFixed(0)}%`);
            console.log(`         💾 محفوظ: ${pattern.id ? '✅ نعم' : '❌ لا'}`);
          });
        }
      } catch (aiError) {
        console.log(`   ❌ فشل الاكتشاف: ${aiError.message}`);
      }
    } else {
      console.log('   ⚠️ البيانات غير كافية للاكتشاف التلقائي');
    }

    // 5. فحص API الاكتشاف
    console.log('\n5️⃣ فحص API الاكتشاف...');
    try {
      const apiResult = await detector.detectNewPatterns(companyId, 30);
      
      console.log(`   📊 نتيجة API:`);
      console.log(`      - النجاح: ${apiResult.success ? '✅ نعم' : '❌ لا'}`);
      console.log(`      - عدد الأنماط: ${apiResult.patterns?.length || 0}`);
      console.log(`      - إجمالي المكتشفة: ${apiResult.metadata?.totalDetected || 0}`);
      console.log(`      - المهمة: ${apiResult.metadata?.significantCount || 0}`);
      console.log(`      - الرسالة: ${apiResult.message || 'لا توجد رسالة'}`);
      
    } catch (apiError) {
      console.log(`   ❌ خطأ في API: ${apiError.message}`);
    }

    // 6. فحص الأنماط الموجودة
    console.log('\n6️⃣ فحص الأنماط الموجودة...');
    const existingPatterns = await detector.prisma.successPattern.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`   📊 الأنماط الموجودة:`);
    console.log(`      - إجمالي الأنماط: ${existingPatterns.length}`);
    
    const aiPatterns = existingPatterns.filter(p => {
      try {
        const metadata = JSON.parse(p.metadata || '{}');
        return metadata.aiGenerated || metadata.source === 'ai_detection';
      } catch {
        return false;
      }
    });

    const recentPatterns = existingPatterns.filter(p => {
      const createdAt = new Date(p.createdAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return createdAt > oneHourAgo;
    });

    console.log(`      - أنماط الذكاء الصناعي: ${aiPatterns.length}`);
    console.log(`      - الأنماط الحديثة (آخر ساعة): ${recentPatterns.length}`);
    console.log(`      - تحتاج موافقة: ${existingPatterns.filter(p => !p.isApproved).length}`);

    // 7. التقييم النهائي
    console.log('\n7️⃣ التقييم النهائي...');
    
    const systemStatus = {
      database: isConnected,
      dataAvailable: totalRecords > 0,
      dataProcessing: analysisData.hasEnoughData,
      aiWorking: false, // سيتم تحديثه
      autoDetection: false, // سيتم تحديثه
      patternsVisible: existingPatterns.length > 0
    };

    // اختبار سريع للذكاء الصناعي
    if (analysisData.hasEnoughData) {
      try {
        const testPatterns = await detector.detectPatternsWithAI(data);
        systemStatus.aiWorking = testPatterns.length > 0;
        systemStatus.autoDetection = testPatterns.length > 0;
      } catch {
        systemStatus.aiWorking = false;
        systemStatus.autoDetection = false;
      }
    }

    console.log('\n📊 ملخص حالة النظام:');
    console.log(`   🔗 قاعدة البيانات: ${systemStatus.database ? '✅ تعمل' : '❌ لا تعمل'}`);
    console.log(`   📊 البيانات متوفرة: ${systemStatus.dataAvailable ? '✅ نعم' : '❌ لا'}`);
    console.log(`   🔄 معالجة البيانات: ${systemStatus.dataProcessing ? '✅ تعمل' : '❌ لا تعمل'}`);
    console.log(`   🤖 الذكاء الصناعي: ${systemStatus.aiWorking ? '✅ يعمل' : '❌ لا يعمل'}`);
    console.log(`   🔍 الاكتشاف التلقائي: ${systemStatus.autoDetection ? '✅ يعمل' : '❌ لا يعمل'}`);
    console.log(`   👀 الأنماط مرئية: ${systemStatus.patternsVisible ? '✅ نعم' : '❌ لا'}`);

    // الإجابة النهائية
    console.log('\n🎯 الإجابة على سؤالك:');
    
    if (systemStatus.autoDetection && systemStatus.patternsVisible) {
      console.log('✅ نعم، النظام سيكتشف الأنماط تلقائياً وستظهر في الصفحة');
      console.log('✅ يمكنك الموافقة عليها من صفحة إدارة الأنماط');
    } else {
      console.log('❌ لا، هناك مشاكل تمنع الاكتشاف التلقائي:');
      
      if (!systemStatus.database) console.log('   - مشكلة في قاعدة البيانات');
      if (!systemStatus.dataAvailable) console.log('   - لا توجد بيانات كافية');
      if (!systemStatus.dataProcessing) console.log('   - مشكلة في معالجة البيانات');
      if (!systemStatus.aiWorking) console.log('   - مشكلة في الذكاء الصناعي');
      if (!systemStatus.autoDetection) console.log('   - الاكتشاف التلقائي لا يعمل');
      if (!systemStatus.patternsVisible) console.log('   - الأنماط لا تظهر في الواجهة');
    }

  } catch (error) {
    console.error('❌ خطأ عام في فحص النظام:', error);
  }
}

// تشغيل الفحص
if (require.main === module) {
  checkSystemStatus();
}

module.exports = { checkSystemStatus };
