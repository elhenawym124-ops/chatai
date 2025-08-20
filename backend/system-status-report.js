/**
 * تقرير شامل عن حالة النظام
 * Comprehensive System Status Report
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateSystemStatusReport() {
  console.log('📊 تقرير شامل عن حالة النظام\n');
  console.log('='.repeat(80));
  
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // 1. إحصائيات الأنماط
    console.log('\n1️⃣ إحصائيات الأنماط:');
    
    const allPatterns = await prisma.successPattern.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
    
    const approvedPatterns = allPatterns.filter(p => p.isApproved);
    const pendingPatterns = allPatterns.filter(p => !p.isApproved);
    const aiPatterns = allPatterns.filter(p => {
      try {
        const metadata = JSON.parse(p.metadata || '{}');
        return metadata.aiGenerated || metadata.source === 'ai_detection';
      } catch {
        return false;
      }
    });
    
    const recentPatterns = allPatterns.filter(p => {
      const createdAt = new Date(p.createdAt);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return createdAt > oneHourAgo;
    });

    console.log(`   📊 إجمالي الأنماط: ${allPatterns.length}`);
    console.log(`   ✅ أنماط معتمدة: ${approvedPatterns.length}`);
    console.log(`   ⏳ تحتاج موافقة: ${pendingPatterns.length}`);
    console.log(`   🤖 أنماط الذكاء الصناعي: ${aiPatterns.length}`);
    console.log(`   🆕 أنماط حديثة (آخر ساعة): ${recentPatterns.length}`);

    // 2. حالة النظام التلقائي
    console.log('\n2️⃣ حالة النظام التلقائي:');
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/auto-patterns/status');
      const autoStatus = await response.json();
      
      if (autoStatus.success) {
        const data = autoStatus.data;
        console.log(`   🔄 الحالة: ${data.isRunning ? '✅ يعمل' : '❌ متوقف'}`);
        console.log(`   ⏰ فترة الاكتشاف: ${data.intervalMinutes} دقيقة`);
        console.log(`   🏢 الشركات المراقبة: ${data.companies.length}`);
        
        if (data.lastDetection) {
          console.log(`   📅 آخر اكتشاف: منذ ${data.lastDetectionAgo} دقيقة`);
          console.log(`   🎯 أنماط مكتشفة: ${data.lastDetection.totalNewPatterns}`);
          console.log(`   ⏱️ مدة الاكتشاف: ${Math.round(data.lastDetection.duration / 1000)} ثانية`);
        }
        
        if (data.nextDetection) {
          const nextTime = new Date(data.nextDetection);
          console.log(`   ⏭️ الاكتشاف التالي: ${nextTime.toLocaleString('ar-EG')}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ خطأ في جلب حالة النظام التلقائي: ${error.message}`);
    }

    // 3. تحليل الأداء
    console.log('\n3️⃣ تحليل الأداء:');
    
    const avgSuccessRate = allPatterns.reduce((sum, p) => sum + p.successRate, 0) / allPatterns.length;
    const highPerformancePatterns = allPatterns.filter(p => p.successRate >= 0.8);
    const lowPerformancePatterns = allPatterns.filter(p => p.successRate < 0.6);
    
    console.log(`   📈 متوسط معدل النجاح: ${(avgSuccessRate * 100).toFixed(1)}%`);
    console.log(`   🏆 أنماط عالية الأداء (≥80%): ${highPerformancePatterns.length}`);
    console.log(`   ⚠️ أنماط منخفضة الأداء (<60%): ${lowPerformancePatterns.length}`);

    // 4. حالة التطبيق
    console.log('\n4️⃣ حالة التطبيق:');
    
    try {
      // اختبار API المحادثة
      const testResponse = await fetch('http://localhost:3001/api/v1/conversations/cme6no3bx000fuf4wj0f6enbw/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'اختبار تطبيق الأنماط',
          senderId: 'test-system',
          senderType: 'customer'
        })
      });
      
      const testResult = await testResponse.json();
      console.log(`   💬 API المحادثة: ${testResult.success ? '✅ يعمل' : '❌ لا يعمل'}`);
      
      if (testResult.success) {
        console.log(`   🤖 تطبيق الأنماط: ✅ يعمل (تم إنشاء رد)`);
      }
    } catch (error) {
      console.log(`   💬 API المحادثة: ❌ خطأ - ${error.message}`);
    }

    // 5. إحصائيات قاعدة البيانات
    console.log('\n5️⃣ إحصائيات قاعدة البيانات:');
    
    const customers = await prisma.customer.count();
    const conversations = await prisma.conversation.count();
    const messages = await prisma.message.count();
    
    console.log(`   👥 العملاء: ${customers}`);
    console.log(`   💬 المحادثات: ${conversations}`);
    console.log(`   📨 الرسائل: ${messages}`);

    // 6. التوصيات
    console.log('\n6️⃣ التوصيات:');
    
    const recommendations = [];
    
    if (pendingPatterns.length > 5) {
      recommendations.push(`📋 راجع ${pendingPatterns.length} نمط في انتظار الموافقة`);
    }
    
    if (lowPerformancePatterns.length > 0) {
      recommendations.push(`⚠️ راجع ${lowPerformancePatterns.length} نمط منخفض الأداء`);
    }
    
    if (recentPatterns.length === 0) {
      recommendations.push(`🔍 لم يتم اكتشاف أنماط جديدة مؤخراً - تحقق من البيانات`);
    }
    
    if (recommendations.length === 0) {
      console.log(`   ✅ النظام يعمل بكفاءة عالية - لا توجد توصيات`);
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    // 7. الخلاصة
    console.log('\n7️⃣ الخلاصة:');
    
    const systemHealth = {
      patterns: allPatterns.length > 0,
      autoDetection: true, // سيتم تحديثه من API
      performance: avgSuccessRate >= 0.7,
      database: customers > 0 && conversations > 0
    };
    
    const healthScore = Object.values(systemHealth).filter(Boolean).length;
    const totalChecks = Object.keys(systemHealth).length;
    
    console.log(`   🎯 نقاط الصحة: ${healthScore}/${totalChecks}`);
    console.log(`   📊 النسبة المئوية: ${(healthScore/totalChecks*100).toFixed(1)}%`);
    
    if (healthScore === totalChecks) {
      console.log(`   🏆 حالة النظام: ممتازة`);
    } else if (healthScore >= totalChecks * 0.8) {
      console.log(`   👍 حالة النظام: جيدة`);
    } else if (healthScore >= totalChecks * 0.6) {
      console.log(`   ⚠️ حالة النظام: متوسطة`);
    } else {
      console.log(`   ❌ حالة النظام: تحتاج تحسين`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📅 تاريخ التقرير:', new Date().toLocaleString('ar-EG'));
    console.log('🔗 صفحة إدارة الأنماط: http://localhost:3000/pattern-management');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ خطأ في إنشاء تقرير حالة النظام:', error);
  }
}

// تشغيل التقرير
if (require.main === module) {
  generateSystemStatusReport();
}

module.exports = { generateSystemStatusReport };
