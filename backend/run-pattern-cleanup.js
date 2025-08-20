const PatternCleanupService = require('./src/services/patternCleanupService');

async function runPatternCleanup() {
  console.log('🧹 تشغيل تنظيف الأنماط المكررة...\n');
  
  const cleanup = new PatternCleanupService();
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // 1. عرض الإحصائيات قبل التنظيف
    console.log('📊 إحصائيات قبل التنظيف:');
    const statsBefore = await cleanup.getCleanupStats(companyId);
    console.log(`   📋 إجمالي الأنماط: ${statsBefore.totalPatterns}`);
    console.log(`   🔍 مجموعات محتملة للتكرار: ${statsBefore.potentialDuplicates}`);
    
    console.log('\n📊 توزيع الأنماط حسب النوع:');
    Object.entries(statsBefore.byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} نمط`);
    });

    // 2. البحث عن الأنماط المكررة
    console.log('\n🔍 البحث عن الأنماط المكررة...');
    const duplicateGroups = await cleanup.findDuplicatePatterns(companyId);
    
    if (duplicateGroups.length === 0) {
      console.log('✅ لا توجد أنماط مكررة للتنظيف');
      return;
    }

    console.log(`\n⚠️ تم العثور على ${duplicateGroups.length} مجموعة من الأنماط المكررة:`);
    duplicateGroups.forEach((group, index) => {
      console.log(`\n${index + 1}. مجموعة من ${group.length} أنماط متشابهة:`);
      console.log(`   النوع: ${group[0].patternType}`);
      console.log(`   معدل النجاح: ${(group[0].successRate * 100).toFixed(1)}%`);
      group.forEach((pattern, i) => {
        console.log(`   ${i + 1}. ${pattern.description.substring(0, 60)}...`);
      });
    });

    // 3. تأكيد التنظيف
    console.log(`\n🤔 هل تريد المتابعة؟ سيتم حذف ${duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0)} نمط مكرر...`);
    console.log('⚠️ تشغيل التنظيف في 3 ثوان...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. تشغيل التنظيف
    console.log('\n🧹 بدء التنظيف...');
    const result = await cleanup.cleanupDuplicatePatterns(companyId);

    if (result.success) {
      console.log('\n🎉 تم التنظيف بنجاح!');
      console.log(`   📊 مجموعات مكررة: ${result.duplicateGroupsFound}`);
      console.log(`   📊 أنماط تم معالجتها: ${result.patternsProcessed}`);
      console.log(`   🗑️ أنماط تم حذفها: ${result.patternsDeleted}`);
      console.log(`   🔄 أنماط تم دمجها: ${result.patternsMerged}`);
      console.log(`   ⏱️ الوقت المستغرق: ${result.timeTaken}ms`);

      // 5. عرض الإحصائيات بعد التنظيف
      console.log('\n📊 إحصائيات بعد التنظيف:');
      const statsAfter = await cleanup.getCleanupStats(companyId);
      console.log(`   📋 إجمالي الأنماط: ${statsAfter.totalPatterns} (كان ${statsBefore.totalPatterns})`);
      console.log(`   📉 تم توفير: ${statsBefore.totalPatterns - statsAfter.totalPatterns} نمط`);
      console.log(`   📊 نسبة التحسن: ${((statsBefore.totalPatterns - statsAfter.totalPatterns) / statsBefore.totalPatterns * 100).toFixed(1)}%`);

    } else {
      console.error('❌ فشل في التنظيف:', result.error);
    }

  } catch (error) {
    console.error('❌ خطأ في تشغيل التنظيف:', error.message);
  }
}

runPatternCleanup();
