const axios = require('axios');

async function testCleanupSystem() {
  console.log('🧹 اختبار نظام التنظيف...\n');
  
  try {
    // 1. فحص الحالة قبل التنظيف
    console.log('1️⃣ فحص الحالة قبل التنظيف...');
    const beforeStats = await axios.get('http://localhost:3001/api/v1/success-learning/cleanup-stats/cme4yvrco002kuftceydlrwdi');
    console.log(`📊 أنماط قبل التنظيف: ${beforeStats.data.stats.totalPatterns}`);
    console.log(`🔍 مجموعات مكررة: ${beforeStats.data.stats.duplicateGroups}`);
    console.log(`🗑️ أنماط قابلة للحذف: ${beforeStats.data.stats.potentialDeletions}`);
    
    // 2. تشغيل تنظيف تجريبي (dry run)
    console.log('\n2️⃣ تشغيل تنظيف تجريبي...');
    const dryRunResponse = await axios.post('http://localhost:3001/api/v1/success-learning/cleanup-patterns/cme4yvrco002kuftceydlrwdi', {
      dryRun: true
    });
    
    if (dryRunResponse.data.success) {
      console.log(`📊 مجموعات مكررة: ${dryRunResponse.data.duplicateGroups}`);
      console.log(`🗑️ أنماط قابلة للحذف: ${dryRunResponse.data.potentialDeletions}`);
      
      if (dryRunResponse.data.potentialDeletions > 0) {
        console.log('\n3️⃣ تشغيل تنظيف فعلي...');
        const cleanupResponse = await axios.post('http://localhost:3001/api/v1/success-learning/cleanup-patterns/cme4yvrco002kuftceydlrwdi', {
          dryRun: false
        });
        
        if (cleanupResponse.data.success) {
          console.log(`✅ تم حذف ${cleanupResponse.data.patternsDeleted} نمط مكرر`);
          console.log(`🔄 تم دمج ${cleanupResponse.data.patternsMerged} مجموعة`);
          console.log(`⏱️ الوقت المستغرق: ${cleanupResponse.data.timeTaken}ms`);
        } else {
          console.log('❌ فشل التنظيف:', cleanupResponse.data.error);
        }
      } else {
        console.log('✅ لا توجد أنماط مكررة للتنظيف');
      }
    }
    
    // 4. فحص الحالة بعد التنظيف
    console.log('\n4️⃣ فحص الحالة بعد التنظيف...');
    const afterStats = await axios.get('http://localhost:3001/api/v1/success-learning/cleanup-stats/cme4yvrco002kuftceydlrwdi');
    console.log(`📊 أنماط بعد التنظيف: ${afterStats.data.stats.totalPatterns}`);
    console.log(`🔍 مجموعات مكررة: ${afterStats.data.stats.duplicateGroups}`);
    
    const improvement = beforeStats.data.stats.totalPatterns - afterStats.data.stats.totalPatterns;
    if (improvement > 0) {
      console.log(`📈 تحسن: تم توفير ${improvement} نمط`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار التنظيف:', error.message);
  }
}

testCleanupSystem();
