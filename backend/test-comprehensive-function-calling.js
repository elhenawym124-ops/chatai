const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function comprehensiveFunctionCallingTest() {
  console.log('🧪 اختبار شامل لنظام Function Calling...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // دالة مساعدة للاختبار
  async function runTest(testName, testFunction) {
    console.log(`--- ${testName} ---`);
    testResults.total++;
    
    try {
      const result = await testFunction();
      if (result.success) {
        console.log('✅ نجح الاختبار');
        testResults.passed++;
        return result;
      } else {
        console.log(`❌ فشل الاختبار: ${result.error}`);
        testResults.failed++;
        return result;
      }
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
      testResults.failed++;
      return { success: false, error: error.message };
    }
  }
  
  // اختبار 1: معلومات الأدوات
  await runTest('اختبار 1: معلومات الأدوات المتاحة', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/tools`);
    const data = await response.json();
    
    if (data.success && data.data.totalTools > 0) {
      console.log(`📊 وُجد ${data.data.totalTools} أداة متاحة`);
      return { success: true, data };
    }
    return { success: false, error: 'لا توجد أدوات متاحة' };
  });
  
  // اختبار 2: النظام الاحتياطي - المنتجات الشائعة
  await runTest('اختبار 2: النظام الاحتياطي - المنتجات الشائعة', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد أن أرى المنتجات الشائعة',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.usedTools.includes('get_popular_products')) {
      console.log(`🔧 استخدم الأداة: ${data.data.usedTools.join(', ')}`);
      console.log(`🤖 النموذج: ${data.metadata.model}`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يستخدم الأداة المطلوبة' };
  });
  
  // اختبار 3: البحث في المنتجات
  await runTest('اختبار 3: البحث في المنتجات', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'عايزة كوتشي رياضي',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.usedTools.includes('search_products')) {
      console.log(`🔍 نتائج البحث موجودة في الرد`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يتم البحث في المنتجات' };
  });
  
  // اختبار 4: محادثة عامة (بدون أدوات)
  await runTest('اختبار 4: محادثة عامة', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أهلاً، كيف حالك؟',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.response.length > 0) {
      console.log(`💬 رد طبيعي بدون أدوات`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يتم توليد رد' };
  });
  
  // اختبار 5: طلب بنطاق سعري
  await runTest('اختبار 5: طلب بنطاق سعري', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد منتجات أقل من 300 جنيه',
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.response.includes('جنيه')) {
      console.log(`💰 تم العثور على منتجات في النطاق السعري`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يتم العثور على منتجات بالسعر المطلوب' };
  });
  
  // اختبار 6: محادثة مع سياق
  await runTest('اختبار 6: محادثة مع سياق', async () => {
    const conversationHistory = [
      { role: 'user', content: 'أريد كوتشي رياضي' },
      { role: 'assistant', content: 'لدينا عدة أنواع من الكوتشي الرياضي' }
    ];
    
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد شيء أرخص',
        companyId: companyId,
        conversationHistory: conversationHistory
      })
    });
    
    const data = await response.json();
    
    if (data.success && data.data.response.length > 0) {
      console.log(`🧠 تم فهم السياق والرد عليه`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يتم فهم السياق' };
  });
  
  // اختبار 7: اختبار الأدوات مباشرة
  await runTest('اختبار 7: اختبار الأدوات مباشرة', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/test-tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: companyId
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`🔧 اختبار الأدوات نجح`);
      return { success: true, data };
    }
    return { success: false, error: 'فشل اختبار الأدوات' };
  });
  
  // اختبار 8: إحصائيات الأدوات
  await runTest('اختبار 8: إحصائيات الأدوات', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/tools/stats`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`📊 تم جلب إحصائيات الأدوات`);
      return { success: true, data };
    }
    return { success: false, error: 'فشل جلب الإحصائيات' };
  });
  
  // اختبار 9: اختبار الأخطاء
  await runTest('اختبار 9: التعامل مع الأخطاء', async () => {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'test',
        // companyId مفقود عمداً
      })
    });
    
    const data = await response.json();
    
    if (!data.success && data.error.includes('معرف الشركة')) {
      console.log(`⚠️ تم التعامل مع الخطأ بشكل صحيح`);
      return { success: true, data };
    }
    return { success: false, error: 'لم يتم التعامل مع الخطأ بشكل صحيح' };
  });
  
  // اختبار 10: اختبار الأداء
  await runTest('اختبار 10: اختبار الأداء', async () => {
    const startTime = Date.now();
    
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'أريد المنتجات الجديدة',
        companyId: companyId
      })
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const data = await response.json();
    
    if (data.success && responseTime < 10000) { // أقل من 10 ثوان
      console.log(`⚡ وقت الاستجابة: ${responseTime}ms`);
      return { success: true, data: { ...data, responseTime } };
    }
    return { success: false, error: `وقت الاستجابة بطيء: ${responseTime}ms` };
  });
  
  // النتائج النهائية
  console.log('\n🎯 ملخص نتائج الاختبار الشامل:');
  console.log(`✅ نجح: ${testResults.passed}/${testResults.total}`);
  console.log(`❌ فشل: ${testResults.failed}/${testResults.total}`);
  console.log(`📊 معدل النجاح: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.passed === testResults.total) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام جاهز للإنتاج.');
  } else if (testResults.passed >= testResults.total * 0.8) {
    console.log('\n⚠️ معظم الاختبارات نجحت. يحتاج تحسينات طفيفة.');
  } else {
    console.log('\n❌ النظام يحتاج مراجعة وإصلاحات.');
  }
  
  return testResults;
}

// تشغيل الاختبار الشامل
comprehensiveFunctionCallingTest();
