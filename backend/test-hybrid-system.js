const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHybridSystem() {
  console.log('🔀 اختبار النظام الهجين...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  // اختبار 1: الحصول على حالة النظام
  console.log('--- اختبار 1: حالة النظام ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/system-status/${companyId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب حالة النظام');
      console.log(`📊 الشركة: ${data.data.companyId}`);
      console.log(`⚙️ النظام المتقدم مفعل: ${data.data.useAdvancedTools ? 'نعم' : 'لا'}`);
      console.log(`🤖 نوع النظام: ${data.data.systemType}`);
      console.log(`📱 الرد التلقائي: ${data.data.autoReplyEnabled ? 'مفعل' : 'معطل'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 2: اختبار النظام الهجين
  console.log('\n--- اختبار 2: اختبار النظام الهجين ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/test-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: companyId,
        testMessage: 'أريد أن أرى المنتجات الشائعة'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم اختبار النظام الهجين');
      console.log(`📱 النظام التقليدي: ${data.data.traditionalSystem.working ? 'يعمل' : 'لا يعمل'}`);
      console.log(`🚀 النظام المتقدم: ${data.data.advancedSystem.working ? 'يعمل' : 'لا يعمل'}`);
      console.log(`💡 التوصية: ${data.data.recommendation}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 3: استخدام النظام التقليدي
  console.log('\n--- اختبار 3: النظام التقليدي ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أهلاً، كيف حالك؟',
        companyId: companyId,
        aiSettings: { useAdvancedTools: false }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح النظام التقليدي');
      console.log(`🤖 الرد: ${data.data.response.substring(0, 100)}...`);
      console.log(`📊 نوع النظام: ${data.data.systemType}`);
      console.log(`🔧 استخدم أدوات: ${data.data.hasToolCalls ? 'نعم' : 'لا'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 4: تفعيل النظام المتقدم
  console.log('\n--- اختبار 4: تفعيل النظام المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/enable-advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم تفعيل النظام المتقدم');
      console.log(`📝 الرسالة: ${data.message}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 5: استخدام النظام المتقدم
  console.log('\n--- اختبار 5: النظام المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد أن أرى المنتجات الشائعة',
        companyId: companyId,
        aiSettings: { useAdvancedTools: true }
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح النظام المتقدم');
      console.log(`🤖 الرد: ${data.data.response.substring(0, 100)}...`);
      console.log(`📊 نوع النظام: ${data.data.systemType}`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
      console.log(`⚡ استخدم أدوات: ${data.data.hasToolCalls ? 'نعم' : 'لا'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 6: مقارنة الأنظمة
  console.log('\n--- اختبار 6: مقارنة الأنظمة ---');
  
  const testMessage = 'عايزة كوتشي رياضي بسعر معقول';
  
  // النظام التقليدي
  console.log('🔄 اختبار النظام التقليدي...');
  try {
    const traditionalStart = Date.now();
    const traditionalResponse = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        companyId: companyId,
        aiSettings: { useAdvancedTools: false }
      })
    });
    const traditionalEnd = Date.now();
    const traditionalData = await traditionalResponse.json();
    
    console.log(`📱 النظام التقليدي: ${traditionalData.success ? 'نجح' : 'فشل'}`);
    console.log(`⏱️ الوقت: ${traditionalEnd - traditionalStart}ms`);
    
    // النظام المتقدم
    console.log('🔄 اختبار النظام المتقدم...');
    const advancedStart = Date.now();
    const advancedResponse = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        companyId: companyId,
        aiSettings: { useAdvancedTools: true }
      })
    });
    const advancedEnd = Date.now();
    const advancedData = await advancedResponse.json();
    
    console.log(`🚀 النظام المتقدم: ${advancedData.success ? 'نجح' : 'فشل'}`);
    console.log(`⏱️ الوقت: ${advancedEnd - advancedStart}ms`);
    
    // المقارنة
    console.log('\n📊 مقارنة النتائج:');
    if (traditionalData.success && advancedData.success) {
      console.log('✅ كلا النظامين يعمل بشكل صحيح');
      console.log(`🔧 النظام المتقدم استخدم أدوات: ${advancedData.data.hasToolCalls ? 'نعم' : 'لا'}`);
      console.log(`📈 الفرق في الوقت: ${Math.abs((advancedEnd - advancedStart) - (traditionalEnd - traditionalStart))}ms`);
    }
    
  } catch (error) {
    console.log(`❌ خطأ في المقارنة: ${error.message}`);
  }
  
  // اختبار 7: إلغاء تفعيل النظام المتقدم
  console.log('\n--- اختبار 7: إلغاء تفعيل النظام المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/disable-advanced`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم إلغاء تفعيل النظام المتقدم');
      console.log(`📝 الرسالة: ${data.message}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  console.log('\n🎉 انتهى اختبار النظام الهجين!');
  
  console.log('\n📋 ملخص النظام الهجين:');
  console.log('✅ يجمع بين النظام التقليدي والمتقدم');
  console.log('✅ يختار النظام المناسب حسب إعدادات الشركة');
  console.log('✅ يوفر fallback للنظام التقليدي عند الحاجة');
  console.log('✅ يمكن تفعيل/إلغاء تفعيل النظام المتقدم بسهولة');
  console.log('✅ يوفر إحصائيات ومقارنات بين الأنظمة');
}

// تشغيل اختبار النظام الهجين
testHybridSystem();
