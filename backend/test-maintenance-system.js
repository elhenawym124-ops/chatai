const axios = require('axios');

async function testMaintenanceSystem() {
  console.log('🕐 اختبار نظام الصيانة الدورية...\n');
  
  try {
    // 1. فحص حالة النظام
    console.log('1️⃣ فحص حالة نظام الصيانة...');
    const statusResponse = await axios.get('http://localhost:3001/api/v1/success-learning/maintenance/status');
    
    if (statusResponse.data.success) {
      const status = statusResponse.data.data;
      console.log(`🔄 حالة التشغيل: ${status.isRunning ? 'يعمل' : 'متوقف'}`);
      console.log(`📊 إجمالي العمليات: ${status.totalRuns}`);
      console.log(`🗑️ أنماط تم حذفها: ${status.totalPatternsDeleted}`);
      console.log(`📦 أنماط تم أرشفتها: ${status.totalPatternsArchived}`);
      console.log(`⏱️ آخر مدة تشغيل: ${status.lastRunDuration}ms`);
      
      console.log('\n📅 جدولة الصيانة:');
      console.log(`   أسبوعية: ${status.nextRun.weekly}`);
      console.log(`   يومية: ${status.nextRun.daily}`);
      console.log(`   شهرية: ${status.nextRun.monthly}`);
    }
    
    // 2. اختبار صيانة فورية (نوع daily)
    console.log('\n2️⃣ اختبار صيانة يومية فورية...');
    const dailyResponse = await axios.post('http://localhost:3001/api/v1/success-learning/maintenance/run', {
      type: 'daily'
    });
    
    if (dailyResponse.data.success) {
      console.log('✅ تمت الصيانة اليومية بنجاح');
      console.log(`📊 الإحصائيات المحدثة:`, dailyResponse.data.data);
    } else {
      console.log('❌ فشلت الصيانة اليومية:', dailyResponse.data.error);
    }
    
    // 3. اختبار صيانة أسبوعية فورية
    console.log('\n3️⃣ اختبار صيانة أسبوعية فورية...');
    const weeklyResponse = await axios.post('http://localhost:3001/api/v1/success-learning/maintenance/run', {
      type: 'cleanup'
    });
    
    if (weeklyResponse.data.success) {
      console.log('✅ تمت الصيانة الأسبوعية بنجاح');
      const finalStats = weeklyResponse.data.data;
      console.log(`📊 إجمالي العمليات بعد الصيانة: ${finalStats.totalRuns}`);
      console.log(`🗑️ أنماط تم حذفها: ${finalStats.totalPatternsDeleted}`);
      console.log(`⏱️ آخر مدة تشغيل: ${finalStats.lastRunDuration}ms`);
    } else {
      console.log('❌ فشلت الصيانة الأسبوعية:', weeklyResponse.data.error);
    }
    
    // 4. فحص الحالة النهائية
    console.log('\n4️⃣ فحص الحالة النهائية...');
    const finalStatusResponse = await axios.get('http://localhost:3001/api/v1/success-learning/maintenance/status');
    
    if (finalStatusResponse.data.success) {
      const finalStatus = finalStatusResponse.data.data;
      console.log(`🔄 حالة التشغيل: ${finalStatus.isRunning ? 'يعمل' : 'متوقف'}`);
      console.log(`📊 إجمالي العمليات: ${finalStatus.totalRuns}`);
      
      if (finalStatus.totalRuns > 0) {
        console.log('🎉 نجح! نظام الصيانة يعمل بشكل صحيح');
      } else {
        console.log('⚠️ لم يتم تسجيل أي عمليات صيانة');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار نظام الصيانة:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMaintenanceSystem();
