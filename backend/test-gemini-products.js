async function testGeminiProductCapabilities() {
  console.log('🤖 اختبار قدرات Gemini AI مع المنتجات...\n');
  
  const baseURL = 'http://localhost:3001';
  const mockToken = 'mock-access-token';
  
  try {
    // 1. فحص إعدادات Gemini
    console.log('📋 1. فحص إعدادات Gemini AI:');
    
    const settingsResponse = await fetch(`${baseURL}/api/v1/ai/settings`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    
    const settings = await settingsResponse.json();
    console.log('✅ إعدادات Gemini:', {
      hasApiKey: settings.data?.hasApiKey,
      isEnabled: settings.data?.isEnabled,
      model: settings.data?.model,
      autoReplyEnabled: settings.data?.autoReplyEnabled
    });
    
    // 2. اختبار الوصول لبيانات المنتجات
    console.log('\n📦 2. اختبار الوصول لبيانات المنتجات:');
    
    const productsResponse = await fetch(`${baseURL}/api/v1/products`, {
      headers: { 'Authorization': `Bearer ${mockToken}` }
    });
    
    const productsData = await productsResponse.json();
    console.log(`✅ تم العثور على ${productsData.data?.length || 0} منتج`);
    
    if (productsData.data && productsData.data.length > 0) {
      const sampleProduct = productsData.data[0];
      console.log('📋 عينة من بيانات المنتج:');
      console.log(`   الاسم: ${sampleProduct.name}`);
      console.log(`   السعر: ${sampleProduct.price} جنيه`);
      console.log(`   الوصف: ${sampleProduct.description?.substring(0, 50)}...`);
      console.log(`   المخزون: ${sampleProduct.stock}`);
      
      // فحص الصور
      let imageCount = 0;
      try {
        const images = sampleProduct.images ? JSON.parse(sampleProduct.images) : [];
        imageCount = images.length;
      } catch (e) {
        imageCount = 0;
      }
      console.log(`   الصور: ${imageCount} صورة`);
    }
    
    // 3. اختبار اقتراح المنتجات
    console.log('\n🎯 3. اختبار اقتراح المنتجات:');
    
    const testQueries = [
      'أريد كوتشي حريمي مريح',
      'أبحث عن حذاء رياضي',
      'أحتاج حذاء للعمل',
      'أريد شيء أنيق للمناسبات',
      'ما هي أفضل الأحذية المتاحة؟'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 السؤال: "${query}"`);
      
      try {
        // اختبار endpoint اقتراح المنتجات المتقدم
        const recommendResponse = await fetch(`${baseURL}/api/v1/ai/recommend-products-advanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            customerMessage: query,
            companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
            maxSuggestions: 3
          })
        });
        
        const recommendData = await recommendResponse.json();
        
        if (recommendData.success && recommendData.data?.recommendations) {
          console.log('✅ اقتراحات Gemini:');
          recommendData.data.recommendations.forEach((rec, index) => {
            console.log(`   ${index + 1}. ${rec.productName}`);
            console.log(`      السبب: ${rec.reason}`);
            console.log(`      الثقة: ${(rec.confidence * 100).toFixed(1)}%`);
          });
        } else {
          console.log('❌ لم يتم الحصول على اقتراحات:', recommendData.error || 'خطأ غير معروف');
        }
        
      } catch (error) {
        console.log('❌ خطأ في الاقتراح:', error.message);
      }
      
      // انتظار قصير بين الطلبات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 4. اختبار تحليل الصور (إذا كان متاحاً)
    console.log('\n🖼️ 4. اختبار تحليل الصور:');
    
    try {
      const imageAnalysisResponse = await fetch(`${baseURL}/api/v1/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          imageUrl: 'https://via.placeholder.com/400x400/FF0000/FFFFFF?text=Red+Shoe',
          context: 'العميل يبحث عن حذاء أحمر'
        })
      });
      
      const imageData = await imageAnalysisResponse.json();
      
      if (imageData.success) {
        console.log('✅ تحليل الصورة نجح');
        console.log('📋 النتائج:', imageData.data);
      } else {
        console.log('❌ تحليل الصورة فشل:', imageData.error);
      }
      
    } catch (error) {
      console.log('❌ خطأ في تحليل الصورة:', error.message);
    }
    
    // 5. اختبار الأسئلة التفصيلية عن المنتجات
    console.log('\n❓ 5. اختبار الأسئلة التفصيلية:');
    
    const detailedQueries = [
      'ما هي الألوان المتاحة للكوتشي الحريمي؟',
      'كم سعر الكوتشي الحريمي؟',
      'ما هي المقاسات المتاحة؟',
      'هل يوجد مخزون من الكوتشي الأبيض؟',
      'أريد تفاصيل أكثر عن جودة المنتج',
      'ما هي طريقة العناية بالكوتشي؟'
    ];
    
    for (const query of detailedQueries) {
      console.log(`\n❓ السؤال: "${query}"`);
      
      try {
        // استخدام endpoint الردود الذكية
        const responseResult = await fetch(`${baseURL}/api/v1/ai/smart-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({
            message: query,
            context: {
              companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
              includeProducts: true
            }
          })
        });
        
        const responseData = await responseResult.json();
        
        if (responseData.success) {
          console.log('✅ رد Gemini:', responseData.data?.response || responseData.data);
        } else {
          console.log('❌ لم يتم الحصول على رد:', responseData.error);
        }
        
      } catch (error) {
        console.log('❌ خطأ في الرد:', error.message);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 6. اختبار إنشاء طلب من المحادثة
    console.log('\n🛒 6. اختبار إنشاء طلب من المحادثة:');
    
    try {
      const orderCreationResponse = await fetch(`${baseURL}/api/v1/ai/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          conversation: [
            'أريد كوتشي حريمي أبيض',
            'مقاس 38',
            'أريد قطعة واحدة'
          ],
          customerId: 'test-customer-id'
        })
      });
      
      const orderData = await orderCreationResponse.json();
      
      if (orderData.success) {
        console.log('✅ تم إنشاء الطلب بنجاح');
        console.log('📋 تفاصيل الطلب:', orderData.data);
      } else {
        console.log('❌ فشل إنشاء الطلب:', orderData.error);
      }
      
    } catch (error) {
      console.log('❌ خطأ في إنشاء الطلب:', error.message);
    }
    
    console.log('\n🎉 انتهى اختبار قدرات Gemini AI!');
    
  } catch (error) {
    console.error('❌ خطأ عام في الاختبار:', error);
  }
}

testGeminiProductCapabilities();
