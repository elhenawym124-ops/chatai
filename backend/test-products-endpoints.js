async function testProductsEndpoints() {
  console.log('🧪 اختبار endpoints المنتجات...\n');
  
  try {
    // 1. اختبار جلب جميع المنتجات
    console.log('📋 1. اختبار جلب جميع المنتجات...');
    
    const allProductsResponse = await fetch('http://localhost:3001/api/v1/products');
    const allProductsData = await allProductsResponse.json();
    
    console.log('✅ جميع المنتجات:', allProductsData.success ? 'نجح' : 'فشل');
    console.log(`📊 عدد المنتجات: ${allProductsData.data?.length || 0}`);
    
    if (allProductsData.data && allProductsData.data.length > 0) {
      const firstProduct = allProductsData.data[0];
      console.log(`🎯 أول منتج: ${firstProduct.name} (${firstProduct.id})`);
      
      // 2. اختبار جلب منتج واحد
      console.log('\n🔍 2. اختبار جلب منتج واحد...');
      
      const singleProductResponse = await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}`);
      const singleProductData = await singleProductResponse.json();
      
      console.log('✅ منتج واحد:', singleProductData.success ? 'نجح' : 'فشل');
      console.log(`📝 اسم المنتج: ${singleProductData.data?.name}`);
      console.log(`💰 السعر: ${singleProductData.data?.price}`);
      console.log(`📦 متوفر: ${singleProductData.data?.isActive ? 'نعم' : 'لا'}`);
      
      // 3. اختبار تحديث حالة المنتج
      console.log('\n🔄 3. اختبار تحديث حالة المنتج...');
      
      const currentStatus = singleProductData.data?.isActive;
      const newStatus = !currentStatus;
      
      const updateResponse = await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      
      const updateData = await updateResponse.json();
      console.log('✅ تحديث الحالة:', updateData.success ? 'نجح' : 'فشل');
      console.log(`🔄 الحالة الجديدة: ${updateData.data?.isActive ? 'مُفعل' : 'مُعطل'}`);
      
      // إعادة الحالة الأصلية
      await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: currentStatus })
      });
      
      console.log(`🔙 تم إعادة الحالة الأصلية: ${currentStatus ? 'مُفعل' : 'مُعطل'}`);
      
      // 4. اختبار منتج غير موجود
      console.log('\n❌ 4. اختبار منتج غير موجود...');
      
      const notFoundResponse = await fetch('http://localhost:3001/api/v1/products/invalid-id');
      console.log(`📊 حالة الاستجابة: ${notFoundResponse.status}`);
      
      if (notFoundResponse.status === 404) {
        const notFoundData = await notFoundResponse.json();
        console.log('✅ خطأ 404 يعمل بشكل صحيح');
        console.log(`📝 رسالة الخطأ: ${notFoundData.error}`);
      } else {
        console.log('❌ خطأ 404 لا يعمل بشكل صحيح');
      }
      
      // 5. اختبار headers و content-type
      console.log('\n📋 5. اختبار headers و content-type...');
      
      const headersResponse = await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}`);
      const contentType = headersResponse.headers.get('content-type');
      
      console.log(`📄 Content-Type: ${contentType}`);
      console.log(`✅ JSON Content-Type: ${contentType?.includes('application/json') ? 'صحيح' : 'خطأ'}`);
      
      // 6. اختبار مع timestamp (cache busting)
      console.log('\n⏰ 6. اختبار مع timestamp...');
      
      const timestamp = new Date().getTime();
      const timestampResponse = await fetch(`http://localhost:3001/api/v1/products/${firstProduct.id}?_t=${timestamp}`);
      const timestampData = await timestampResponse.json();
      
      console.log('✅ مع timestamp:', timestampData.success ? 'نجح' : 'فشل');
      console.log(`📝 اسم المنتج: ${timestampData.data?.name}`);
      
    } else {
      console.log('❌ لا توجد منتجات للاختبار');
    }
    
    console.log('\n🎉 انتهى اختبار endpoints المنتجات!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testProductsEndpoints();
