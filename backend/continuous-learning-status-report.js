const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateContinuousLearningReport() {
  console.log('📊 تقرير شامل عن نظام التعلم المستمر\n');
  console.log('='.repeat(60));
  
  try {
    // 1. فحص حالة قاعدة البيانات
    console.log('\n🗄️ 1. حالة قاعدة البيانات:');
    
    const learningDataCount = await prisma.learningData.count();
    const patternsCount = await prisma.discoveredPattern.count();
    const improvementsCount = await prisma.appliedImprovement.count();
    const settingsCount = await prisma.learningSettings.count();
    
    console.log(`   📊 بيانات التعلم: ${learningDataCount} سجل`);
    console.log(`   🔍 الأنماط المكتشفة: ${patternsCount} نمط`);
    console.log(`   🚀 التحسينات المطبقة: ${improvementsCount} تحسين`);
    console.log(`   ⚙️ إعدادات التعلم: ${settingsCount} شركة`);

    // 2. فحص آخر البيانات المجمعة
    console.log('\n📈 2. آخر البيانات المجمعة:');
    
    const recentLearningData = await prisma.learningData.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        company: {
          select: { name: true }
        }
      }
    });

    if (recentLearningData.length > 0) {
      console.log('   آخر 5 سجلات:');
      recentLearningData.forEach((record, index) => {
        const data = JSON.parse(record.data);
        console.log(`   ${index + 1}. ${record.type} - ${data.intent || 'غير محدد'}`);
        console.log(`      الوقت: ${record.createdAt.toLocaleString('ar-EG')}`);
        console.log(`      الشركة: ${record.company?.name || 'غير محدد'}`);
        console.log(`      النتيجة: ${record.outcome || 'غير محدد'}`);
      });
    } else {
      console.log('   ⚠️ لا توجد بيانات تعلم مجمعة');
    }

    // 3. فحص الأنماط المكتشفة
    console.log('\n🔍 3. الأنماط المكتشفة:');
    
    const discoveredPatterns = await prisma.discoveredPattern.findMany({
      orderBy: { confidence: 'desc' },
      take: 5
    });

    if (discoveredPatterns.length > 0) {
      console.log('   أهم 5 أنماط:');
      discoveredPatterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.description}`);
        console.log(`      النوع: ${pattern.patternType}`);
        console.log(`      الثقة: ${(pattern.confidence * 100).toFixed(1)}%`);
        console.log(`      التكرارات: ${pattern.occurrences}`);
        console.log(`      الحالة: ${pattern.status}`);
      });
    } else {
      console.log('   ⚠️ لا توجد أنماط مكتشفة');
    }

    // 4. فحص التحسينات المطبقة
    console.log('\n🚀 4. التحسينات المطبقة:');
    
    const appliedImprovements = await prisma.appliedImprovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (appliedImprovements.length > 0) {
      console.log('   آخر 5 تحسينات:');
      appliedImprovements.forEach((improvement, index) => {
        console.log(`   ${index + 1}. ${improvement.description}`);
        console.log(`      النوع: ${improvement.type}`);
        console.log(`      الحالة: ${improvement.status}`);
        console.log(`      نسبة التطبيق: ${improvement.rolloutPercentage}%`);
        console.log(`      التاريخ: ${improvement.createdAt.toLocaleString('ar-EG')}`);
      });
    } else {
      console.log('   ⚠️ لا توجد تحسينات مطبقة');
    }

    // 5. فحص إعدادات التعلم
    console.log('\n⚙️ 5. إعدادات التعلم:');
    
    const learningSettings = await prisma.learningSettings.findMany({
      include: {
        company: {
          select: { name: true }
        }
      }
    });

    if (learningSettings.length > 0) {
      learningSettings.forEach((setting, index) => {
        console.log(`   ${index + 1}. شركة: ${setting.company?.name || 'غير محدد'}`);
        console.log(`      مفعل: ${setting.enabled ? '✅' : '❌'}`);
        console.log(`      سرعة التعلم: ${setting.learningSpeed}`);
        console.log(`      تطبيق تلقائي: ${setting.autoApplyImprovements ? '✅' : '❌'}`);
        console.log(`      حد الثقة: ${(setting.confidenceThreshold * 100).toFixed(1)}%`);
        console.log(`      حجم العينة الأدنى: ${setting.minimumSampleSize}`);
      });
    } else {
      console.log('   ⚠️ لا توجد إعدادات تعلم');
    }

    // 6. إحصائيات الأداء
    console.log('\n📊 6. إحصائيات الأداء:');
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const dataLast24h = await prisma.learningData.count({
      where: { createdAt: { gte: last24Hours } }
    });
    
    const dataLast7d = await prisma.learningData.count({
      where: { createdAt: { gte: last7Days } }
    });

    console.log(`   📈 بيانات آخر 24 ساعة: ${dataLast24h} سجل`);
    console.log(`   📈 بيانات آخر 7 أيام: ${dataLast7d} سجل`);
    console.log(`   📈 متوسط يومي: ${(dataLast7d / 7).toFixed(1)} سجل`);

    // 7. تحليل نوعية البيانات
    console.log('\n🔬 7. تحليل نوعية البيانات:');
    
    const dataByType = await prisma.learningData.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    if (dataByType.length > 0) {
      console.log('   توزيع البيانات حسب النوع:');
      dataByType.forEach(group => {
        console.log(`   - ${group.type}: ${group._count.type} سجل`);
      });
    }

    const dataByOutcome = await prisma.learningData.groupBy({
      by: ['outcome'],
      _count: { outcome: true },
      where: { outcome: { not: null } }
    });

    if (dataByOutcome.length > 0) {
      console.log('   توزيع البيانات حسب النتيجة:');
      dataByOutcome.forEach(group => {
        console.log(`   - ${group.outcome}: ${group._count.outcome} سجل`);
      });
    }

    // 8. تقييم فعالية النظام
    console.log('\n🎯 8. تقييم فعالية النظام:');
    
    const systemHealth = {
      dataCollection: learningDataCount > 0 ? '✅ يعمل' : '❌ لا يعمل',
      patternDiscovery: patternsCount > 0 ? '✅ يعمل' : '⚠️ لا توجد أنماط',
      improvementApplication: improvementsCount > 0 ? '✅ يعمل' : '⚠️ لا توجد تحسينات',
      recentActivity: dataLast24h > 0 ? '✅ نشط' : '⚠️ غير نشط'
    };

    console.log(`   جمع البيانات: ${systemHealth.dataCollection}`);
    console.log(`   اكتشاف الأنماط: ${systemHealth.patternDiscovery}`);
    console.log(`   تطبيق التحسينات: ${systemHealth.improvementApplication}`);
    console.log(`   النشاط الحديث: ${systemHealth.recentActivity}`);

    // 9. التوصيات
    console.log('\n💡 9. التوصيات:');
    
    const recommendations = [];
    
    if (learningDataCount < 50) {
      recommendations.push('زيادة جمع البيانات - النظام يحتاج المزيد من البيانات للتعلم الفعال');
    }
    
    if (patternsCount === 0) {
      recommendations.push('تفعيل اكتشاف الأنماط - لا توجد أنماط مكتشفة حتى الآن');
    }
    
    if (improvementsCount === 0) {
      recommendations.push('تفعيل التحسينات التلقائية - لم يتم تطبيق أي تحسينات');
    }
    
    if (dataLast24h === 0) {
      recommendations.push('فحص تكامل النظام - لا توجد بيانات حديثة');
    }

    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    } else {
      console.log('   🎉 النظام يعمل بشكل مثالي!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 تم إنتاج التقرير بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إنتاج التقرير:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateContinuousLearningReport();
