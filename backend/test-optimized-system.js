const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOptimizedSystem() {
  console.log('🚀 اختبار النظام المحسن مع Cache ومراقبة الأداء...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  // اختبار 1: تقرير الصحة العامة
  console.log('--- اختبار 1: تقرير الصحة العامة ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/performance/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب تقرير الصحة');
      console.log(`🏥 حالة النظام: ${data.data.status}`);
      console.log(`📊 نقاط الصحة: ${data.data.score}/100`);
      console.log(`📈 معدل النجاح: ${data.data.summary.successRate}`);
      console.log(`⏱️ متوسط وقت الاستجابة: ${data.data.summary.averageResponseTime}`);
      console.log(`💾 معدل إصابة Cache: ${data.data.summary.cacheHitRate}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 2: إحصائيات Cache
  console.log('\n--- اختبار 2: إحصائيات Cache ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/performance/cache`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب إحصائيات Cache');
      console.log(`📦 حجم Cache: ${data.data.cache.size} عنصر`);
      console.log(`💾 استخدام الذاكرة: ${data.data.cache.memoryUsage.kb}KB`);
      console.log(`🎯 معدل الإصابة: ${data.data.performance.hitRate}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 3: اختبار الأداء مع Cache
  console.log('\n--- اختبار 3: اختبار الأداء مع Cache ---');
  
  const testMessage = 'أريد أن أرى المنتجات الشائعة';
  
  // الطلب الأول (Cache Miss)
  console.log('🔄 الطلب الأول (Cache Miss)...');
  const firstStart = Date.now();
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        companyId: companyId,
        aiSettings: { useAdvancedTools: true }
      })
    });
    
    const firstEnd = Date.now();
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ الطلب الأول نجح في ${firstEnd - firstStart}ms`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
    } else {
      console.log(`❌ فشل الطلب الأول: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ في الطلب الأول: ${error.message}`);
  }
  
  // انتظار قصير
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // الطلب الثاني (Cache Hit محتمل)
  console.log('🔄 الطلب الثاني (Cache Hit محتمل)...');
  const secondStart = Date.now();
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: testMessage,
        companyId: companyId,
        aiSettings: { useAdvancedTools: true }
      })
    });
    
    const secondEnd = Date.now();
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ الطلب الثاني نجح في ${secondEnd - secondStart}ms`);
      console.log(`🔧 الأدوات المستخدمة: ${data.data.usedTools.join(', ') || 'لا يوجد'}`);
    } else {
      console.log(`❌ فشل الطلب الثاني: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ في الطلب الثاني: ${error.message}`);
  }
  
  // اختبار 4: ملخص الأداء
  console.log('\n--- اختبار 4: ملخص الأداء ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/performance/summary`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم جلب ملخص الأداء');
      console.log(`📊 إجمالي الطلبات: ${data.data.overview.totalRequests}`);
      console.log(`✅ معدل النجاح: ${data.data.overview.successRate}`);
      console.log(`⏱️ متوسط وقت الاستجابة: ${data.data.overview.averageResponseTime}`);
      console.log(`💾 معدل إصابة Cache: ${data.data.overview.cacheHitRate}`);
      
      console.log('\n📈 مقارنة الأنظمة:');
      console.log(`📱 النظام التقليدي: ${data.data.systems.traditional.requests} طلب، ${data.data.systems.traditional.averageTime}`);
      console.log(`🚀 النظام المتقدم: ${data.data.systems.advanced.requests} طلب، ${data.data.systems.advanced.averageTime}`);
      
      if (data.data.recommendations.length > 0) {
        console.log('\n💡 التوصيات:');
        data.data.recommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. [${rec.priority}] ${rec.message}`);
        });
      }
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 5: اختبار الأداء المتقدم
  console.log('\n--- اختبار 5: اختبار الأداء المتقدم ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/performance/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        iterations: 5,
        message: 'اختبار الأداء'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ تم اختبار الأداء');
      console.log(`🔄 عدد التكرارات: ${data.data.iterations}`);
      console.log(`⏱️ متوسط الوقت: ${data.data.summary.averageTime.toFixed(2)}ms`);
      console.log(`⚡ أسرع وقت: ${data.data.summary.minTime}ms`);
      console.log(`🐌 أبطأ وقت: ${data.data.summary.maxTime}ms`);
      console.log(`✅ معدل النجاح: ${data.data.summary.successRate.toFixed(2)}%`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  // اختبار 6: اختبار طلبات متعددة لقياس Cache
  console.log('\n--- اختبار 6: اختبار طلبات متعددة لقياس Cache ---');
  
  const testMessages = [
    'أريد المنتجات الجديدة',
    'عايزة كوتشي رياضي',
    'أريد المنتجات الجديدة', // تكرار لاختبار Cache
    'عايزة كوتشي رياضي' // تكرار لاختبار Cache
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    const isRepeat = i >= 2;
    
    console.log(`🔄 طلب ${i + 1}: "${message}" ${isRepeat ? '(تكرار)' : '(جديد)'}`);
    
    const start = Date.now();
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/generate-response-hybrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          companyId: companyId,
          aiSettings: { useAdvancedTools: true }
        })
      });
      
      const end = Date.now();
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ نجح في ${end - start}ms`);
      } else {
        console.log(`   ❌ فشل: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
    
    // انتظار قصير بين الطلبات
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // اختبار 7: التقرير النهائي
  console.log('\n--- اختبار 7: التقرير النهائي ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/performance/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ التقرير النهائي:');
      console.log(`🏥 حالة النظام: ${data.data.status}`);
      console.log(`📊 نقاط الصحة: ${data.data.score}/100`);
      console.log(`📈 إجمالي الطلبات: ${data.data.summary.totalRequests}`);
      console.log(`✅ معدل النجاح: ${data.data.summary.successRate}`);
      console.log(`💾 حجم Cache: ${data.data.cache.size} عنصر`);
      console.log(`🎯 معدل إصابة Cache: ${data.data.cache.hitRate}`);
    } else {
      console.log(`❌ فشل: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
  }
  
  console.log('\n🎉 انتهى اختبار النظام المحسن!');
  
  console.log('\n📋 ملخص التحسينات:');
  console.log('✅ نظام Cache للبحث في المنتجات');
  console.log('✅ مراقبة الأداء في الوقت الفعلي');
  console.log('✅ إحصائيات مفصلة للأنظمة');
  console.log('✅ تقارير الصحة العامة');
  console.log('✅ توصيات تلقائية للتحسين');
  console.log('✅ اختبارات الأداء المتقدمة');
}

// تشغيل اختبار النظام المحسن
testOptimizedSystem();
