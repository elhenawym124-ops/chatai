const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdvancedAPI() {
  console.log('🧪 اختبار API المتقدم مع Function Calling...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  // اختبار 1: الحصول على معلومات الأدوات المتاحة
  console.log('--- اختبار 1: معلومات الأدوات المتاحة ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/tools`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ وُجد ${data.data.totalTools} أداة متاحة`);
      console.log('🔧 الأدوات:');
      data.data.tools.slice(0, 5).forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
      });
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 2: طلب المنتجات الشائعة (مع fallback)
  console.log('\n--- اختبار 2: طلب المنتجات الشائعة ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'أريد أن أرى المنتجات الشائعة عندكم',
        companyId: companyId,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح الطلب');
      console.log(`🤖 الرد: ${data.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
      console.log(`📊 النموذج: ${data.metadata.model}`);
      console.log(`🔄 استخدم أدوات: ${data.metadata.hasToolCalls ? 'نعم' : 'لا'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 3: البحث عن منتج محدد
  console.log('\n--- اختبار 3: البحث عن منتج محدد ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'عايزة كوتشي رياضي بسعر معقول',
        companyId: companyId,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح البحث');
      console.log(`🤖 الرد: ${data.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 4: محادثة عامة
  console.log('\n--- اختبار 4: محادثة عامة ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'أهلاً، كيف حالك؟',
        companyId: companyId,
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجحت المحادثة');
      console.log(`🤖 الرد: ${data.data.response}`);
      console.log(`🔧 استخدم أدوات: ${data.metadata.hasToolCalls ? 'نعم' : 'لا'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 5: محادثة مع سياق
  console.log('\n--- اختبار 5: محادثة مع سياق ---');
  try {
    const conversationHistory = [
      { role: 'user', content: 'أريد كوتشي رياضي' },
      { role: 'assistant', content: 'لدينا عدة أنواع من الكوتشي الرياضي' }
    ];
    
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'أريد شيء أرخص من 200 جنيه',
        companyId: companyId,
        conversationHistory: conversationHistory
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجحت المحادثة مع السياق');
      console.log(`🤖 الرد: ${data.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 6: اختبار الأدوات
  console.log('\n--- اختبار 6: اختبار الأدوات ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/test-tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح اختبار الأدوات');
      console.log(`🤖 الرد: ${data.data.response}`);
    } else {
      console.log(`❌ فشل اختبار الأدوات: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 7: إحصائيات الأدوات
  console.log('\n--- اختبار 7: إحصائيات الأدوات ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/tools/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ نجح جلب الإحصائيات');
      console.log(`📊 الرسالة: ${data.data.message}`);
      console.log('🔮 المميزات المستقبلية:');
      data.data.features.forEach((feature, index) => {
        console.log(`   ${index + 1}. ${feature}`);
      });
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  console.log('\n🎉 انتهى اختبار API المتقدم!');
  
  console.log('\n📊 ملخص النتائج:');
  console.log('✅ المميزات الجديدة:');
  console.log('   🔧 API جديد مع Function Calling');
  console.log('   📦 وصول مباشر لقاعدة البيانات');
  console.log('   🎯 ردود دقيقة بناءً على البيانات الحقيقية');
  console.log('   💬 محادثة طبيعية مع معلومات دقيقة');
  console.log('   🔄 نظام احتياطي عند انتهاء كوتا Gemini');
  console.log('   📊 معلومات مفصلة عن الأدوات المستخدمة');
}

// تشغيل الاختبار
testAdvancedAPI();
