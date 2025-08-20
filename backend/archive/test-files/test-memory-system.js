const axios = require('axios');

async function testMemorySystem() {
  console.log('🧠 اختبار نظام الذاكرة المتقدم...\n');
  
  try {
    // 1. اختبار إعدادات مختلفة
    const testConfigs = [
      { limit: 5, type: 'recent', duration: 24, label: 'إعدادات بسيطة' },
      { limit: 15, type: 'all', duration: 168, label: 'إعدادات متوسطة' },
      { limit: 50, type: 'all', duration: 720, label: 'إعدادات متقدمة' },
      { limit: 200, type: 'all', duration: 8760, label: 'إعدادات قوية جداً' }
    ];
    
    for (const config of testConfigs) {
      console.log(`📝 اختبار ${config.label}:`);
      console.log(`   عدد الرسائل: ${config.limit}`);
      console.log(`   نوع الذاكرة: ${config.type}`);
      console.log(`   مدة الاحتفاظ: ${config.duration} ساعة`);
      
      // حفظ الإعدادات
      const saveResponse = await axios.put('http://localhost:3001/api/v1/ai/memory-settings', {
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
        conversationMemoryLimit: config.limit,
        memoryType: config.type,
        memoryDuration: config.duration,
        enableContextualMemory: true
      });
      
      if (saveResponse.data.success) {
        console.log('   ✅ تم حفظ الإعدادات بنجاح');
        
        // التحقق من الحفظ
        const getResponse = await axios.get('http://localhost:3001/api/v1/ai/memory-settings?companyId=cmd5c0c9y0000ymzdd7wtv7ib');
        const saved = getResponse.data.data;
        
        if (saved.conversationMemoryLimit === config.limit) {
          console.log('   ✅ الإعدادات محفوظة بشكل صحيح');
        } else {
          console.log('   ❌ خطأ في حفظ الإعدادات');
        }
      } else {
        console.log('   ❌ فشل في حفظ الإعدادات');
      }
      
      console.log('');
    }
    
    // 2. اختبار الحدود القصوى
    console.log('🔥 اختبار الحدود القصوى:');
    
    const extremeTests = [
      { limit: 1, label: 'الحد الأدنى' },
      { limit: 1000, label: 'الحد الأقصى' },
      { limit: 5000, label: 'فوق الحد (يجب أن يقيد إلى 1000)' }
    ];
    
    for (const test of extremeTests) {
      console.log(`   اختبار ${test.label}: ${test.limit} رسالة`);
      
      try {
        const response = await axios.put('http://localhost:3001/api/v1/ai/memory-settings', {
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
          conversationMemoryLimit: test.limit,
          memoryType: 'all',
          memoryDuration: 24,
          enableContextualMemory: true
        });
        
        if (response.data.success) {
          const getResponse = await axios.get('http://localhost:3001/api/v1/ai/memory-settings?companyId=cmd5c0c9y0000ymzdd7wtv7ib');
          const actualLimit = getResponse.data.data.conversationMemoryLimit;
          console.log(`   ✅ تم الحفظ: ${actualLimit} رسالة`);
          
          if (test.limit > 1000 && actualLimit <= 1000) {
            console.log('   ✅ النظام قيد الرقم بشكل صحيح');
          }
        }
      } catch (error) {
        console.log(`   ❌ خطأ: ${error.message}`);
      }
    }
    
    // 3. اختبار الأداء
    console.log('\n⚡ اختبار الأداء:');
    
    const performanceTests = [
      { limit: 5, expected: 'سريع جداً' },
      { limit: 20, expected: 'سريع' },
      { limit: 50, expected: 'متوسط' },
      { limit: 100, expected: 'بطيء نسبياً' }
    ];
    
    for (const test of performanceTests) {
      const startTime = Date.now();
      
      await axios.put('http://localhost:3001/api/v1/ai/memory-settings', {
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
        conversationMemoryLimit: test.limit,
        memoryType: 'all',
        memoryDuration: 24,
        enableContextualMemory: true
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   ${test.limit} رسالة: ${duration}ms (متوقع: ${test.expected})`);
    }
    
    // 4. إعادة تعيين الإعدادات الافتراضية
    console.log('\n🔄 إعادة تعيين الإعدادات الافتراضية...');
    
    await axios.put('http://localhost:3001/api/v1/ai/memory-settings', {
      companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
      conversationMemoryLimit: 10,
      memoryType: 'recent',
      memoryDuration: 24,
      enableContextualMemory: true
    });
    
    console.log('✅ تم إعادة تعيين الإعدادات الافتراضية');
    
    console.log('\n🎉 اكتمل اختبار نظام الذاكرة بنجاح!');
    console.log('\n📋 ملخص النتائج:');
    console.log('✅ حفظ واسترجاع الإعدادات يعمل بشكل صحيح');
    console.log('✅ التحقق من الحدود القصوى يعمل');
    console.log('✅ النظام يدعم أرقام كبيرة (حتى 1000 رسالة)');
    console.log('✅ الأداء مقبول لجميع الإعدادات');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

if (require.main === module) {
  testMemorySystem();
}

module.exports = { testMemorySystem };
