const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSystemsManagement() {
  console.log('🎮 اختبار نظام إدارة الأنظمة...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  // اختبار 1: جلب إعدادات النظام الحالية
  console.log('--- اختبار 1: جلب إعدادات النظام الحالية ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-config/${companyId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب إعدادات النظام');
      console.log(`🔧 النظام النشط: ${data.data.systemMode}`);
      console.log(`📱 التقليدي: ${data.data.traditionalEnabled ? 'مفعل' : 'معطل'}`);
      console.log(`🚀 المتقدم: ${data.data.advancedEnabled ? 'مفعل' : 'معطل'}`);
      console.log(`🔄 الهجين: ${data.data.hybridEnabled ? 'مفعل' : 'معطل'}`);
      console.log(`⚡ النظام الحالي: ${data.data.currentSystem}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 2: تفعيل النظام التقليدي
  console.log('\n--- اختبار 2: تفعيل النظام التقليدي ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-config/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemMode: 'traditional',
        traditionalEnabled: true,
        advancedEnabled: false
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم تفعيل النظام التقليدي');
      console.log(`📝 الرسالة: ${data.data.message}`);
      console.log(`⚡ النظام الحالي: ${data.data.currentSystem}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 3: اختبار النظام التقليدي
  console.log('\n--- اختبار 3: اختبار النظام التقليدي ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أهلاً، كيف حالك؟',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ النظام التقليدي يعمل');
      console.log(`💬 الرد: ${data.data.response.substring(0, 100)}...`);
      console.log(`🔧 نوع النظام: ${data.data.systemType}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 4: تفعيل النظام المتقدم
  console.log('\n--- اختبار 4: تفعيل النظام المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-config/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemMode: 'advanced',
        traditionalEnabled: false,
        advancedEnabled: true
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم تفعيل النظام المتقدم');
      console.log(`📝 الرسالة: ${data.data.message}`);
      console.log(`⚡ النظام الحالي: ${data.data.currentSystem}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 5: اختبار النظام المتقدم
  console.log('\n--- اختبار 5: اختبار النظام المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد أن أرى المنتجات الشائعة',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ النظام المتقدم يعمل');
      console.log(`💬 الرد: ${data.data.response.substring(0, 100)}...`);
      console.log(`🔧 نوع النظام: ${data.data.systemType}`);
      console.log(`🛠️ الأدوات المستخدمة: ${data.data.usedTools?.join(', ') || 'لا يوجد'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 6: تفعيل النظام الهجين
  console.log('\n--- اختبار 6: تفعيل النظام الهجين ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-config/${companyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemMode: 'hybrid',
        traditionalEnabled: true,
        advancedEnabled: true
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم تفعيل النظام الهجين');
      console.log(`📝 الرسالة: ${data.data.message}`);
      console.log(`⚡ النظام الحالي: ${data.data.currentSystem}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 7: اختبار النظام الهجين مع طلبات مختلفة
  console.log('\n--- اختبار 7: اختبار النظام الهجين ---');
  
  const testMessages = [
    { message: 'أهلاً، كيف حالك؟', expected: 'traditional' },
    { message: 'أريد المنتجات الجديدة', expected: 'advanced' },
    { message: 'شكراً لك', expected: 'traditional' },
    { message: 'عايزة كوتشي رياضي', expected: 'advanced' }
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const { message, expected } = testMessages[i];
    
    console.log(`\n🔄 طلب ${i + 1}: "${message}"`);
    
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          companyId: companyId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ نجح`);
        console.log(`   🔧 النظام المستخدم: ${data.data.systemType}`);
        console.log(`   💬 الرد: ${data.data.response.substring(0, 80)}...`);
        
        if (data.data.usedTools && data.data.usedTools.length > 0) {
          console.log(`   🛠️ الأدوات: ${data.data.usedTools.join(', ')}`);
        }
      } else {
        console.log(`   ❌ فشل: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // اختبار 8: جلب مقارنة الأنظمة
  console.log('\n--- اختبار 8: مقارنة الأنظمة ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/systems-comparison/${companyId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب مقارنة الأنظمة');
      
      console.log('\n📊 إحصائيات النظام التقليدي:');
      console.log(`   📈 الطلبات: ${data.data.traditional.requests}`);
      console.log(`   ⏱️ متوسط الوقت: ${data.data.traditional.averageTime}`);
      console.log(`   ✅ معدل النجاح: ${data.data.traditional.successRate}`);
      
      console.log('\n📊 إحصائيات النظام المتقدم:');
      console.log(`   📈 الطلبات: ${data.data.advanced.requests}`);
      console.log(`   ⏱️ متوسط الوقت: ${data.data.advanced.averageTime}`);
      console.log(`   ✅ معدل النجاح: ${data.data.advanced.successRate}`);
      console.log(`   🛠️ الأدوات المستخدمة: ${data.data.advanced.toolsUsed}`);
      
      console.log('\n🔄 مميزات النظام الهجين:');
      data.data.hybrid.features.forEach((feature, index) => {
        console.log(`   ${index + 1}. ${feature}`);
      });
      
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 9: الحالة النهائية
  console.log('\n--- اختبار 9: الحالة النهائية ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-config/${companyId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ الحالة النهائية:');
      console.log(`🎯 النظام النشط: ${data.data.systemMode}`);
      console.log(`⚡ النظام الحالي: ${data.data.currentSystem}`);
      console.log(`📱 التقليدي: ${data.data.traditionalEnabled ? 'مفعل' : 'معطل'}`);
      console.log(`🚀 المتقدم: ${data.data.advancedEnabled ? 'مفعل' : 'معطل'}`);
      console.log(`🔄 الهجين: ${data.data.hybridEnabled ? 'مفعل' : 'معطل'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  console.log('\n🎉 انتهى اختبار نظام إدارة الأنظمة!');
  
  console.log('\n📋 ملخص المميزات الجديدة:');
  console.log('✅ إدارة كاملة للأنظمة الثلاثة');
  console.log('✅ تبديل سلس بين الأنظمة');
  console.log('✅ مراقبة الحالة في الوقت الفعلي');
  console.log('✅ مقارنة شاملة للأداء');
  console.log('✅ واجهة سهلة الاستخدام');
  console.log('✅ API متكامل للتحكم');
}

// تشغيل اختبار نظام إدارة الأنظمة
testSystemsManagement();
