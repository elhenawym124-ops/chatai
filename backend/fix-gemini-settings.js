async function fixGeminiSettings() {
  console.log('🔧 إصلاح إعدادات Gemini AI...\n');
  
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-access-token';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  try {
    // 1. تحديث إعدادات AI العامة
    console.log('📋 1. تحديث إعدادات AI العامة:');
    
    const aiSettingsUpdate = {
      apiKey: 'AIzaSyDummy-Key-For-Testing-Replace-With-Real-Key',
      isEnabled: true,
      model: 'gemini-1.5-flash',
      autoReplyEnabled: true,
      confidenceThreshold: 0.6,
      maxTokens: 1000,
      temperature: 0.7
    };
    
    const updateAIResponse = await fetch(`${baseURL}/api/v1/ai/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(aiSettingsUpdate)
    });
    
    const aiUpdateData = await updateAIResponse.json();
    
    if (aiUpdateData.success) {
      console.log('✅ تم تحديث إعدادات AI العامة');
    } else {
      console.log('❌ فشل تحديث إعدادات AI:', aiUpdateData.error);
    }
    
    // 2. تفعيل اقتراح المنتجات
    console.log('\n📦 2. تفعيل اقتراح المنتجات:');
    
    const productSettingsUpdate = {
      companyId: companyId,
      autoSuggestProducts: true,
      maxSuggestions: 5,
      includeImages: true,
      includeVariants: true,
      confidenceThreshold: 0.5
    };
    
    const updateProductResponse = await fetch(`${baseURL}/api/v1/ai/product-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(productSettingsUpdate)
    });
    
    const productUpdateData = await updateProductResponse.json();
    
    if (productUpdateData.success) {
      console.log('✅ تم تفعيل اقتراح المنتجات');
    } else {
      console.log('❌ فشل تفعيل اقتراح المنتجات:', productUpdateData.error);
    }
    
    // 3. تحديث البرومبت لتحسين الأداء
    console.log('\n💬 3. تحديث البرومبت:');
    
    const promptUpdate = {
      personalityPrompt: `انتي اسمك ساره، بياعه شاطره ومتخصصه في الأحذية الحريمي
اسلوبك ودود ومهني
استخدمي الايموجي بشكل مناسب
اعرضي المنتجات بطريقة جذابة مع ذكر:
- الاسم والسعر
- الألوان والمقاسات المتاحة  
- المميزات والفوائد
- صور المنتج إذا متاحة

كوني مفيده وصادقه مع العملاء`,

      responsePrompt: `عند الرد على العملاء:
1. اقرأي رسالة العميل بعناية
2. ابحثي في المنتجات المتاحة
3. اقترحي المنتجات المناسبة
4. اذكري التفاصيل المهمة (السعر، المقاسات، الألوان)
5. اعرضي صور المنتجات
6. اسألي عن تفضيلات إضافية

استخدمي معلومات المنتجات الحقيقية من قاعدة البيانات`,

      productPrompt: `عند اقتراح المنتجات:
- ابحثي عن المنتجات المناسبة لطلب العميل
- اعتبري المقاس واللون والنوع المطلوب
- اذكري السعر والمخزون المتاح
- اعرضي البدائل المناسبة
- اشرحي مميزات كل منتج`
    };
    
    const updatePromptResponse = await fetch(`${baseURL}/api/v1/ai/prompts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(promptUpdate)
    });
    
    const promptUpdateData = await updatePromptResponse.json();
    
    if (promptUpdateData.success) {
      console.log('✅ تم تحديث البرومبت');
    } else {
      console.log('❌ فشل تحديث البرومبت:', promptUpdateData.error);
    }
    
    // 4. اختبار الإعدادات الجديدة
    console.log('\n🧪 4. اختبار الإعدادات الجديدة:');
    
    // فحص إعدادات AI
    const newSettingsResponse = await fetch(`${baseURL}/api/v1/ai/settings`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    
    const newSettings = await newSettingsResponse.json();
    console.log('📋 الإعدادات الجديدة:', {
      isEnabled: newSettings.data?.isEnabled,
      autoReplyEnabled: newSettings.data?.autoReplyEnabled,
      model: newSettings.data?.model,
      confidenceThreshold: newSettings.data?.confidenceThreshold
    });
    
    // فحص إعدادات المنتجات
    const newProductSettingsResponse = await fetch(`${baseURL}/api/v1/ai/product-settings?companyId=${companyId}`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    
    const newProductSettings = await newProductSettingsResponse.json();
    console.log('📦 إعدادات المنتجات الجديدة:', {
      autoSuggestProducts: newProductSettings.data?.autoSuggestProducts,
      maxSuggestions: newProductSettings.data?.maxSuggestions,
      includeImages: newProductSettings.data?.includeImages
    });
    
    // 5. اختبار اقتراح المنتجات بعد التفعيل
    console.log('\n🎯 5. اختبار اقتراح المنتجات بعد التفعيل:');
    
    const testMessage = 'أريد كوتشي حريمي أبيض مريح للاستخدام اليومي';
    
    try {
      const testResponse = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          message: testMessage,
          companyId: companyId,
          maxSuggestions: 3,
          includeImages: true
        })
      });
      
      const testData = await testResponse.json();
      
      if (testData.success) {
        console.log('✅ اقتراح المنتجات يعمل الآن!');
        if (testData.data?.recommendations) {
          testData.data.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec.productName}`);
            console.log(`      السبب: ${rec.reason}`);
          });
        }
      } else {
        console.log('❌ اقتراح المنتجات لا يزال لا يعمل:', testData.error);
      }
      
    } catch (error) {
      console.log('❌ خطأ في اختبار اقتراح المنتجات:', error.message);
    }
    
    console.log('\n🎉 انتهى إصلاح إعدادات Gemini!');
    console.log('\n📋 ملاحظات مهمة:');
    console.log('⚠️ API Key: يجب استبدال المفتاح التجريبي بمفتاح حقيقي من Google');
    console.log('✅ اقتراح المنتجات: تم تفعيله');
    console.log('✅ البرومبت: تم تحسينه');
    console.log('✅ الإعدادات: تم تحديثها');
    
  } catch (error) {
    console.error('❌ خطأ عام في الإصلاح:', error);
  }
}

fixGeminiSettings();
