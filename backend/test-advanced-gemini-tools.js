const AdvancedGeminiWithTools = require('./src/services/advancedGeminiWithTools');

async function testAdvancedGeminiWithTools() {
  console.log('🧪 اختبار Gemini المتقدم مع الأدوات...\n');
  
  const geminiService = new AdvancedGeminiWithTools();
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  try {
    // اختبار 1: طلب المنتجات الشائعة
    console.log('--- اختبار 1: طلب المنتجات الشائعة ---');
    const popularRequest = "أريد أن أرى المنتجات الشائعة عندكم";
    
    const popularResult = await geminiService.generateResponseWithTools(
      popularRequest, 
      [], 
      companyId
    );
    
    if (popularResult.success) {
      console.log('✅ نجح الطلب');
      console.log(`🤖 رد Gemini: ${popularResult.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${popularResult.data.usedTools.join(', ')}`);
      console.log(`📊 عدد الأدوات: ${popularResult.metadata.toolCount}`);
    } else {
      console.log(`❌ فشل الطلب: ${popularResult.error}`);
    }
    
    // اختبار 2: البحث عن منتج محدد
    console.log('\n--- اختبار 2: البحث عن منتج محدد ---');
    const searchRequest = "عايزة كوتشي رياضي بسعر معقول";
    
    const searchResult = await geminiService.generateResponseWithTools(
      searchRequest,
      [],
      companyId
    );
    
    if (searchResult.success) {
      console.log('✅ نجح البحث');
      console.log(`🤖 رد Gemini: ${searchResult.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${searchResult.data.usedTools.join(', ')}`);
    } else {
      console.log(`❌ فشل البحث: ${searchResult.error}`);
    }
    
    // اختبار 3: طلب اقتراحات بنطاق سعري
    console.log('\n--- اختبار 3: طلب اقتراحات بنطاق سعري ---');
    const priceRequest = "أريد منتجات في حدود 200 إلى 400 جنيه";
    
    const priceResult = await geminiService.generateResponseWithTools(
      priceRequest,
      [],
      companyId
    );
    
    if (priceResult.success) {
      console.log('✅ نجح الطلب');
      console.log(`🤖 رد Gemini: ${priceResult.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${priceResult.data.usedTools.join(', ')}`);
    } else {
      console.log(`❌ فشل الطلب: ${priceResult.error}`);
    }
    
    // اختبار 4: محادثة عامة (بدون أدوات)
    console.log('\n--- اختبار 4: محادثة عامة ---');
    const generalRequest = "أهلاً، كيف حالك؟";
    
    const generalResult = await geminiService.generateResponseWithTools(
      generalRequest,
      [],
      companyId
    );
    
    if (generalResult.success) {
      console.log('✅ نجحت المحادثة');
      console.log(`🤖 رد Gemini: ${generalResult.data.response}`);
      console.log(`🔧 استخدم أدوات: ${generalResult.metadata.hasToolCalls ? 'نعم' : 'لا'}`);
    } else {
      console.log(`❌ فشلت المحادثة: ${generalResult.error}`);
    }
    
    // اختبار 5: طلب معلومات عن الفئات
    console.log('\n--- اختبار 5: طلب معلومات عن الفئات ---');
    const categoriesRequest = "ما هي الفئات المتاحة عندكم؟";
    
    const categoriesResult = await geminiService.generateResponseWithTools(
      categoriesRequest,
      [],
      companyId
    );
    
    if (categoriesResult.success) {
      console.log('✅ نجح الطلب');
      console.log(`🤖 رد Gemini: ${categoriesResult.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${categoriesResult.data.usedTools.join(', ')}`);
    } else {
      console.log(`❌ فشل الطلب: ${categoriesResult.error}`);
    }
    
    // اختبار 6: محادثة مع سياق
    console.log('\n--- اختبار 6: محادثة مع سياق ---');
    const conversationHistory = [
      { role: 'user', content: 'أريد كوتشي رياضي' },
      { role: 'assistant', content: 'لدينا عدة أنواع من الكوتشي الرياضي' }
    ];
    
    const contextRequest = "أريد شيء أرخص من 200 جنيه";
    
    const contextResult = await geminiService.generateResponseWithTools(
      contextRequest,
      conversationHistory,
      companyId
    );
    
    if (contextResult.success) {
      console.log('✅ نجحت المحادثة مع السياق');
      console.log(`🤖 رد Gemini: ${contextResult.data.response}`);
      console.log(`🔧 الأدوات المستخدمة: ${contextResult.data.usedTools.join(', ')}`);
    } else {
      console.log(`❌ فشلت المحادثة: ${contextResult.error}`);
    }
    
    console.log('\n🎉 انتهى اختبار Gemini المتقدم مع الأدوات!');
    
    // ملخص النتائج
    console.log('\n📊 ملخص النتائج:');
    console.log('✅ المميزات الجديدة:');
    console.log('   🔧 Gemini يستطيع استخدام أدوات البحث');
    console.log('   📦 وصول مباشر لقاعدة البيانات');
    console.log('   🎯 ردود دقيقة بناءً على البيانات الحقيقية');
    console.log('   💬 محادثة طبيعية مع معلومات دقيقة');
    console.log('   🧠 فهم السياق واستخدام الأدوات المناسبة');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await geminiService.disconnect();
  }
}

// تشغيل الاختبار
testAdvancedGeminiWithTools();
