/**
 * إصلاح تضارب البيانات بين الواجهة والـ API
 * Fix Data Discrepancy Between Frontend and API
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDataDiscrepancy() {
  console.log('🔧 إصلاح تضارب البيانات بين الواجهة والـ API\n');
  console.log('='.repeat(80));

  const companyId = 'cme4yvrco002kuftceydlrwdi';

  try {
    console.log('\n1️⃣ فحص البيانات الفعلية في قاعدة البيانات:\n');

    // فحص الأنماط
    const patterns = await prisma.successPattern.findMany({
      where: { companyId }
    });

    console.log(`📊 إجمالي الأنماط: ${patterns.length}`);
    
    patterns.forEach((pattern, index) => {
      console.log(`${index + 1}. ${pattern.description.substring(0, 50)}...`);
      console.log(`   📈 معدل النجاح المحفوظ: ${(pattern.successRate * 100).toFixed(1)}%`);
      console.log(`   🎯 مفعل: ${pattern.isActive ? 'نعم' : 'لا'}`);
      console.log(`   ✅ معتمد: ${pattern.isApproved ? 'نعم' : 'لا'}`);
      console.log(`   🆔 المعرف: ${pattern.id}`);
      console.log('');
    });

    console.log('\n2️⃣ فحص بيانات الأداء:\n');

    const performanceData = await prisma.patternPerformance.findMany({
      where: { companyId },
      include: {
        pattern: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`📊 إجمالي قياسات الأداء: ${performanceData.length}`);
    
    performanceData.forEach((perf, index) => {
      console.log(`${index + 1}. النمط: ${perf.pattern.description.substring(0, 40)}...`);
      console.log(`   📊 مرات الاستخدام: ${perf.usageCount}`);
      console.log(`   ✅ مرات النجاح: ${perf.successCount}`);
      console.log(`   ❌ مرات الفشل: ${perf.failureCount}`);
      console.log(`   📈 معدل النجاح الحالي: ${(perf.currentSuccessRate * 100).toFixed(1)}%`);
      console.log(`   📉 الاتجاه: ${perf.performanceTrend}`);
      console.log(`   💰 العائد: ${perf.roi?.toFixed(1)}%`);
      console.log(`   ⏰ آخر استخدام: ${perf.lastUsedAt?.toLocaleString('ar-EG')}`);
      console.log('');
    });

    console.log('\n3️⃣ فحص بيانات الاستخدام:\n');

    // فحص الاستخدام من جدول التفاعلات
    const interactions = await prisma.interaction.findMany({
      where: {
        conversation: {
          companyId: companyId
        }
      },
      select: {
        id: true,
        userMessage: true,
        aiResponse: true,
        timestamp: true,
        conversationId: true
      },
      orderBy: { timestamp: 'desc' },
      take: 20
    });

    console.log(`📊 إجمالي التفاعلات (آخر 20): ${interactions.length}`);
    
    interactions.slice(0, 5).forEach((interaction, index) => {
      console.log(`${index + 1}. المحادثة: ${interaction.conversationId}`);
      console.log(`   💬 رسالة العميل: "${interaction.userMessage?.substring(0, 50)}..."`);
      console.log(`   🤖 رد النظام: "${interaction.aiResponse?.substring(0, 50)}..."`);
      console.log(`   ⏰ الوقت: ${interaction.timestamp?.toLocaleString('ar-EG')}`);
      console.log('');
    });

    console.log('\n4️⃣ مقارنة مع بيانات API:\n');

    // استدعاء API للمقارنة
    try {
      const apiResponse = await fetch('http://localhost:3001/api/v1/success-learning/pattern-performance?companyId=' + companyId);
      const apiData = await apiResponse.json();

      console.log('📡 بيانات API:');
      console.log(`   📊 عدد الأنماط: ${apiData.data?.performance?.length || 0}`);
      console.log(`   📈 متوسط معدل النجاح: ${(apiData.data?.summary?.avgSuccessRate * 100).toFixed(1)}%`);
      console.log(`   🎯 إجمالي الاستخدام: ${apiData.data?.summary?.totalUsage}`);

      if (apiData.data?.performance) {
        apiData.data.performance.forEach((perf, index) => {
          console.log(`   ${index + 1}. ${perf.pattern.description.substring(0, 40)}...`);
          console.log(`      📊 استخدام: ${perf.usageCount}, نجاح: ${(perf.currentSuccessRate * 100).toFixed(1)}%`);
        });
      }

    } catch (error) {
      console.log(`❌ خطأ في استدعاء API: ${error.message}`);
    }

    console.log('\n5️⃣ تحليل التضارب:\n');

    // حساب الإحصائيات الصحيحة
    const totalPatterns = patterns.length;
    const activePatterns = patterns.filter(p => p.isActive && p.isApproved).length;
    const avgSuccessRateFromDB = patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length;
    const totalUsageFromPerf = performanceData.reduce((sum, p) => sum + p.usageCount, 0);
    const avgSuccessRateFromPerf = performanceData.length > 0 ? 
      performanceData.reduce((sum, p) => sum + p.currentSuccessRate, 0) / performanceData.length : 0;

    console.log('📊 الإحصائيات الصحيحة من قاعدة البيانات:');
    console.log(`   📈 إجمالي الأنماط: ${totalPatterns}`);
    console.log(`   ✅ الأنماط المفعلة: ${activePatterns}`);
    console.log(`   📊 متوسط معدل النجاح (من الأنماط): ${(avgSuccessRateFromDB * 100).toFixed(1)}%`);
    console.log(`   📊 متوسط معدل النجاح (من الأداء): ${(avgSuccessRateFromPerf * 100).toFixed(1)}%`);
    console.log(`   🎯 إجمالي الاستخدام: ${totalUsageFromPerf}`);

    console.log('\n6️⃣ إصلاح البيانات:\n');

    // إصلاح البيانات المفقودة أو الخاطئة
    let fixedCount = 0;

    for (const pattern of patterns) {
      const existingPerf = performanceData.find(p => p.patternId === pattern.id);
      
      if (!existingPerf && pattern.isActive && pattern.isApproved) {
        console.log(`🔧 إنشاء بيانات أداء مفقودة للنمط: ${pattern.description.substring(0, 40)}...`);
        
        await prisma.patternPerformance.create({
          data: {
            patternId: pattern.id,
            companyId: companyId,
            usageCount: 0,
            successCount: 0,
            failureCount: 0,
            currentSuccessRate: pattern.successRate,
            performanceTrend: 'stable',
            impactScore: pattern.successRate * 100,
            roi: pattern.successRate * 100,
            lastUsedAt: new Date()
          }
        });
        
        fixedCount++;
      }
    }

    console.log(`✅ تم إصلاح ${fixedCount} سجل أداء مفقود`);

    console.log('\n7️⃣ إنشاء تقرير إصلاح:\n');

    const fixReport = {
      timestamp: new Date().toISOString(),
      totalPatterns: totalPatterns,
      activePatterns: activePatterns,
      performanceRecords: performanceData.length,
      recentInteractions: interactions.length,
      avgSuccessRate: avgSuccessRateFromPerf,
      totalUsage: totalUsageFromPerf,
      fixedRecords: fixedCount,
      recommendations: [
        fixedCount > 0 ? '✅ تم إصلاح البيانات المفقودة' : '✅ لا توجد بيانات مفقودة',
        avgSuccessRateFromPerf < 0.8 ? '⚠️ معدل النجاح منخفض - يحتاج مراجعة الأنماط' : '✅ معدل النجاح جيد',
        totalUsageFromPerf < 10 ? '⚠️ استخدام قليل - يحتاج المزيد من البيانات' : '✅ استخدام كافي',
        performanceData.length !== activePatterns ? '⚠️ عدم تطابق بين الأنماط المفعلة وبيانات الأداء' : '✅ البيانات متطابقة'
      ]
    };

    console.log('📋 تقرير الإصلاح:');
    console.log(JSON.stringify(fixReport, null, 2));

    // حفظ التقرير
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: 'Data discrepancy fix completed',
        metadata: JSON.stringify(fixReport),
        source: 'fix-data-discrepancy',
        companyId: companyId
      }
    }).catch(() => {
      // إذا لم يكن جدول SystemLog موجود، نتجاهل الخطأ
      console.log('📝 تم حفظ التقرير في الذاكرة فقط (جدول SystemLog غير متوفر)');
    });

    console.log('\n8️⃣ التوصيات النهائية:\n');

    console.log('🎯 لحل مشكلة التضارب:');
    console.log('   1. تأكد من أن الواجهة تستخدم نفس API المستخدم في التحليل');
    console.log('   2. راجع حسابات معدل النجاح في الواجهة');
    console.log('   3. تأكد من تحديث بيانات الأداء بانتظام');
    console.log('   4. أضف المزيد من التتبع للاستخدام الفعلي');

    console.log('\n✅ تم إكمال إصلاح البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(80));
  console.log('📅 تاريخ الإصلاح:', new Date().toLocaleString('ar-EG'));
  console.log('='.repeat(80));
}

// تشغيل الإصلاح
if (require.main === module) {
  fixDataDiscrepancy().catch(console.error);
}

module.exports = { fixDataDiscrepancy };
