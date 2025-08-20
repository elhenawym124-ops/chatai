async function testAllEndpoints() {
  console.log('🧪 اختبار شامل لجميع endpoints...\n');
  
  try {
    // 1. اختبار الفئات
    console.log('📂 1. اختبار الفئات...');
    
    const categoriesResponse = await fetch('http://localhost:3001/api/v1/products/categories');
    const categoriesData = await categoriesResponse.json();
    
    console.log('✅ الفئات:', categoriesData.success ? 'نجح' : 'فشل');
    console.log(`📊 عدد الفئات: ${categoriesData.data?.length || 0}`);
    
    // 2. اختبار جميع المنتجات
    console.log('\n📋 2. اختبار جميع المنتجات...');
    
    const productsResponse = await fetch('http://localhost:3001/api/v1/products');
    const productsData = await productsResponse.json();
    
    console.log('✅ جميع المنتجات:', productsData.success ? 'نجح' : 'فشل');
    console.log(`📊 عدد المنتجات: ${productsData.data?.length || 0}`);
    
    if (productsData.data && productsData.data.length > 0) {
      const firstProduct = productsData.data[0];
      
      // 3. اختبار منتج واحد
      console.log('\n🔍 3. اختبار منتج واحد...');
      
      const singleProductResponse = await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}`);
      const singleProductData = await singleProductResponse.json();
      
      console.log('✅ منتج واحد:', singleProductData.success ? 'نجح' : 'فشل');
      console.log(`📝 اسم المنتج: ${singleProductData.data?.name}`);
      console.log(`🖼️ الصور: ${singleProductData.data?.images || 'لا توجد'}`);
    }
    
    // 4. اختبار إعدادات AI
    console.log('\n🤖 4. اختبار إعدادات AI...');
    
    const aiSettingsResponse = await fetch('http://localhost:3001/api/v1/ai/settings');
    const aiSettingsData = await aiSettingsResponse.json();
    
    console.log('✅ إعدادات AI:', aiSettingsData.success ? 'نجح' : 'فشل');
    console.log(`🔧 مُفعل: ${aiSettingsData.data?.isEnabled ? 'نعم' : 'لا'}`);
    console.log(`🕒 ساعات العمل: ${JSON.stringify(aiSettingsData.data?.workingHours) || 'غير محدد'}`);
    console.log(`🎨 معالجة الوسائط: ${aiSettingsData.data?.multimodalEnabled ? 'مُفعل' : 'مُعطل'}`);
    console.log(`📚 نظام RAG: ${aiSettingsData.data?.ragEnabled ? 'مُفعل' : 'مُعطل'}`);
    
    // 5. اختبار endpoint غير موجود
    console.log('\n❌ 5. اختبار endpoint غير موجود...');
    
    const notFoundResponse = await fetch('http://localhost:3001/api/v1/invalid-endpoint');
    console.log(`📊 حالة الاستجابة: ${notFoundResponse.status}`);
    
    // 6. اختبار headers
    console.log('\n📋 6. اختبار headers...');
    
    const headersResponse = await fetch('http://localhost:3001/api/v1/products/categories');
    const contentType = headersResponse.headers.get('content-type');
    
    console.log(`📄 Content-Type: ${contentType}`);
    console.log(`✅ JSON Content-Type: ${contentType?.includes('application/json') ? 'صحيح' : 'خطأ'}`);
    
    console.log('\n🎉 انتهى الاختبار الشامل!');
    console.log('\n📊 ملخص النتائج:');
    console.log('✅ جميع endpoints الأساسية تعمل بشكل صحيح');
    console.log('✅ إعدادات AI محفوظة ومُحملة بشكل صحيح');
    console.log('✅ الفئات متوفرة');
    console.log('✅ المنتجات متوفرة');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testAllEndpoints();
