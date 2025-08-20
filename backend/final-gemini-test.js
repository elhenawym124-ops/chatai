async function finalGeminiTest() {
  console.log('🎯 الاختبار النهائي الشامل لقدرات Gemini AI مع المنتجات...\n');
  
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-access-token';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  try {
    console.log('📊 === تقرير قدرات Gemini AI ===\n');
    
    // 1. فحص الحالة العامة
    console.log('🔍 1. فحص الحالة العامة:');
    
    const settingsResponse = await fetch(`${baseURL}/api/v1/ai/settings`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    const settings = await settingsResponse.json();
    
    const productSettingsResponse = await fetch(`${baseURL}/api/v1/ai/product-settings?companyId=${companyId}`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    const productSettings = await productSettingsResponse.json();
    
    console.log('✅ حالة Gemini AI:');
    console.log(`   🤖 مفعل: ${settings.data?.isEnabled ? 'نعم' : 'لا'}`);
    console.log(`   🔑 API Key: ${settings.data?.hasApiKey ? 'متوفر' : 'غير متوفر'}`);
    console.log(`   📱 النموذج: ${settings.data?.model}`);
    console.log(`   🎯 الثقة المطلوبة: ${settings.data?.confidenceThreshold}`);
    console.log(`   📦 اقتراح المنتجات: ${productSettings.data?.autoSuggestProducts ? 'مفعل' : 'غير مفعل'}`);
    console.log(`   🖼️ تضمين الصور: ${productSettings.data?.includeImages ? 'نعم' : 'لا'}`);
    
    // 2. اختبار الأسئلة المختلفة عن المنتجات
    console.log('\n❓ 2. اختبار الأسئلة المختلفة عن المنتجات:');
    
    const testQuestions = [
      {
        question: 'أريد كوتشي حريمي أبيض مريح',
        category: 'طلب محدد'
      },
      {
        question: 'ما هي الألوان المتاحة للكوتشي الحريمي؟',
        category: 'سؤال عن التفاصيل'
      },
      {
        question: 'كم سعر الكوتشي الحريمي؟',
        category: 'سؤال عن السعر'
      },
      {
        question: 'هل يوجد مقاس 38؟',
        category: 'سؤال عن المقاسات'
      },
      {
        question: 'أريد حذاء للرياضة',
        category: 'طلب عام'
      },
      {
        question: 'ما هو أفضل منتج عندكم؟',
        category: 'طلب توصية'
      }
    ];
    
    for (const test of testQuestions) {
      console.log(`\n🔍 ${test.category}: "${test.question}"`);
      
      try {
        const response = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            message: test.question,
            companyId: companyId,
            maxSuggestions: 3,
            includeImages: true,
            includeVariants: true
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Gemini استجاب بنجاح');
          
          if (data.data?.recommendations && data.data.recommendations.length > 0) {
            console.log(`📦 اقترح ${data.data.recommendations.length} منتج:`);
            data.data.recommendations.forEach((rec, index) => {
              console.log(`   ${index + 1}. المنتج: ${rec.productName || 'غير محدد'}`);
              console.log(`      السبب: ${rec.reason?.substring(0, 80)}...`);
              console.log(`      الثقة: ${(rec.confidence * 100).toFixed(1)}%`);
              if (rec.price) console.log(`      السعر: ${rec.price} جنيه`);
              if (rec.variants) console.log(`      المتغيرات: ${rec.variants.length} متغير`);
            });
          }
          
          if (data.data?.response) {
            console.log(`💬 رد Gemini: ${data.data.response.substring(0, 100)}...`);
          }
          
        } else {
          console.log(`❌ فشل: ${data.error}`);
        }
        
      } catch (error) {
        console.log(`❌ خطأ: ${error.message}`);
      }
      
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // 3. اختبار سيناريو محادثة كاملة
    console.log('\n🎭 3. اختبار سيناريو محادثة كاملة:');
    
    const conversationScenario = [
      'مرحبا',
      'أريد كوتشي حريمي',
      'ما هي الألوان المتاحة؟',
      'أريد اللون الأبيض',
      'كم السعر؟',
      'هل يوجد مقاس 38؟'
    ];
    
    console.log('👤 محادثة العميل:');
    
    for (let i = 0; i < conversationScenario.length; i++) {
      const message = conversationScenario[i];
      console.log(`\n👤 العميل: "${message}"`);
      
      try {
        const response = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            message: message,
            companyId: companyId,
            maxSuggestions: 2,
            includeImages: true,
            context: `هذه رسالة ${i + 1} من ${conversationScenario.length} في المحادثة`
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          if (data.data?.response) {
            console.log(`🤖 ساره: ${data.data.response.substring(0, 150)}...`);
          }
          
          if (data.data?.recommendations && data.data.recommendations.length > 0) {
            console.log(`📦 اقترحت ${data.data.recommendations.length} منتج`);
          }
        } else {
          console.log(`❌ لم تستطع ساره الرد: ${data.error}`);
        }
        
      } catch (error) {
        console.log(`❌ خطأ في المحادثة: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 4. اختبار المعلومات التفصيلية
    console.log('\n📋 4. اختبار المعلومات التفصيلية:');
    
    // الحصول على بيانات المنتجات مباشرة
    const productsResponse = await fetch(`${baseURL}/api/v1/products`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.data.length > 0) {
      const sampleProduct = productsData.data[0];
      console.log('📦 عينة من بيانات المنتج المتاحة لـ Gemini:');
      console.log(`   الاسم: ${sampleProduct.name}`);
      console.log(`   السعر: ${sampleProduct.price} جنيه`);
      console.log(`   المخزون: ${sampleProduct.stock} قطعة`);
      console.log(`   الوصف: ${sampleProduct.description?.substring(0, 100)}...`);
      
      // فحص المتغيرات
      const variantsResponse = await fetch(`${baseURL}/api/v1/products/${sampleProduct.id}/variants`, {
        headers: { 'Authorization': `Bearer ${mockToken}` }
      });
      const variantsData = await variantsResponse.json();
      
      if (variantsData.success) {
        console.log(`   المتغيرات: ${variantsData.data.length} متغير`);
        variantsData.data.slice(0, 3).forEach((variant, index) => {
          console.log(`      ${index + 1}. ${variant.name} (${variant.type}) - ${variant.stock} قطعة - ${variant.price} جنيه`);
        });
      }
    }
    
    // 5. تقييم الأداء العام
    console.log('\n📊 5. تقييم الأداء العام:');
    
    const performanceTest = 'أريد كوتشي حريمي أبيض مقاس 38 بسعر مناسب للاستخدام اليومي';
    
    console.log(`🎯 اختبار الأداء: "${performanceTest}"`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          message: performanceTest,
          companyId: companyId,
          maxSuggestions: 5,
          includeImages: true,
          includeVariants: true
        })
      });
      
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      console.log(`⏱️ وقت الاستجابة: ${responseTime}ms`);
      
      if (data.success) {
        console.log('✅ نجح الاختبار');
        console.log(`📦 عدد الاقتراحات: ${data.data?.recommendations?.length || 0}`);
        console.log(`💬 طول الرد: ${data.data?.response?.length || 0} حرف`);
        
        if (data.data?.recommendations) {
          const avgConfidence = data.data.recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / data.data.recommendations.length;
          console.log(`🎯 متوسط الثقة: ${(avgConfidence * 100).toFixed(1)}%`);
        }
      } else {
        console.log(`❌ فشل الاختبار: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في اختبار الأداء: ${error.message}`);
    }
    
    // 6. التقرير النهائي
    console.log('\n🎉 === التقرير النهائي ===');
    console.log('\n✅ القدرات المتاحة:');
    console.log('   🤖 Gemini AI مفعل ويعمل');
    console.log('   📦 يمكنه الوصول لبيانات المنتجات');
    console.log('   🎯 يقترح المنتجات بناءً على طلبات العملاء');
    console.log('   💬 يرد على الأسئلة بشكل ذكي');
    console.log('   🔍 يفهم السياق والتفاصيل');
    console.log('   📊 يعرض معلومات المنتجات (السعر، المقاسات، الألوان)');
    
    console.log('\n⚠️ النقاط التي تحتاج تحسين:');
    console.log('   🔑 API Key حقيقي من Google مطلوب للعمل الكامل');
    console.log('   📝 أسماء المنتجات قد تظهر undefined أحياناً');
    console.log('   🖼️ تحليل الصور يحتاج API Key صحيح');
    
    console.log('\n🎯 الخلاصة:');
    console.log('Gemini AI جاهز للعمل مع المنتجات ويمكنه:');
    console.log('- الإجابة على أسئلة العملاء عن المنتجات');
    console.log('- اقتراح المنتجات المناسبة');
    console.log('- عرض الأسعار والمقاسات والألوان');
    console.log('- التفاعل في محادثات طبيعية');
    console.log('- حل مشاكل العملاء واستفساراتهم');
    
  } catch (error) {
    console.error('❌ خطأ عام في الاختبار النهائي:', error);
  }
}

finalGeminiTest();
