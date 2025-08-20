const ProductSearchService = require('./src/services/productSearchService');

async function testProductSearchService() {
  console.log('🧪 اختبار خدمة البحث في المنتجات...\n');
  
  const searchService = new ProductSearchService();
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  try {
    // اختبار 1: البحث العام
    console.log('--- اختبار 1: البحث العام ---');
    const searchResult = await searchService.searchProducts('كوتشي', {
      companyId,
      limit: 5
    });
    
    if (searchResult.success) {
      console.log(`✅ وُجد ${searchResult.data.length} منتج`);
      searchResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل البحث: ${searchResult.error}`);
    }
    
    // اختبار 2: البحث بنطاق سعري
    console.log('\n--- اختبار 2: البحث بنطاق سعري ---');
    const priceRangeResult = await searchService.searchProducts('', {
      companyId,
      priceMin: 200,
      priceMax: 400,
      limit: 5
    });
    
    if (priceRangeResult.success) {
      console.log(`✅ وُجد ${priceRangeResult.data.length} منتج في النطاق السعري`);
      priceRangeResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل البحث بالنطاق السعري: ${priceRangeResult.error}`);
    }
    
    // اختبار 3: المنتجات الشائعة
    console.log('\n--- اختبار 3: المنتجات الشائعة ---');
    const popularResult = await searchService.getPopularProducts(companyId, 3);
    
    if (popularResult.success) {
      console.log(`✅ وُجد ${popularResult.data.length} منتج شائع`);
      popularResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه (مبيعات: ${product.orderCount})`);
      });
    } else {
      console.log(`❌ فشل جلب المنتجات الشائعة: ${popularResult.error}`);
    }
    
    // اختبار 4: المنتجات الجديدة
    console.log('\n--- اختبار 4: المنتجات الجديدة ---');
    const newResult = await searchService.getNewProducts(companyId, 3);
    
    if (newResult.success) {
      console.log(`✅ وُجد ${newResult.data.length} منتج جديد`);
      newResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل جلب المنتجات الجديدة: ${newResult.error}`);
    }
    
    // اختبار 5: الفئات المتاحة
    console.log('\n--- اختبار 5: الفئات المتاحة ---');
    const categoriesResult = await searchService.getAvailableCategories(companyId);
    
    if (categoriesResult.success) {
      console.log(`✅ وُجد ${categoriesResult.data.length} فئة`);
      categoriesResult.data.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (${category.productCount} منتج)`);
      });
    } else {
      console.log(`❌ فشل جلب الفئات: ${categoriesResult.error}`);
    }
    
    // اختبار 6: إحصائيات المنتجات
    console.log('\n--- اختبار 6: إحصائيات المنتجات ---');
    const statsResult = await searchService.getProductStats(companyId);
    
    if (statsResult.success) {
      console.log('✅ إحصائيات المنتجات:');
      console.log(`   📦 إجمالي المنتجات: ${statsResult.data.totalProducts}`);
      console.log(`   ✅ المنتجات النشطة: ${statsResult.data.activeProducts}`);
      console.log(`   📈 متوفر في المخزون: ${statsResult.data.inStock}`);
      console.log(`   📉 نفد من المخزون: ${statsResult.data.outOfStock}`);
      console.log(`   📂 عدد الفئات: ${statsResult.data.categories}`);
    } else {
      console.log(`❌ فشل جلب الإحصائيات: ${statsResult.error}`);
    }
    
    // اختبار 7: تفاصيل منتج محدد
    console.log('\n--- اختبار 7: تفاصيل منتج محدد ---');
    
    // أولاً نجلب منتج للاختبار
    const firstProduct = searchResult.success && searchResult.data.length > 0 
      ? searchResult.data[0] 
      : null;
    
    if (firstProduct) {
      const detailsResult = await searchService.getProductDetails(firstProduct.id, companyId);
      
      if (detailsResult.success) {
        const product = detailsResult.data;
        console.log('✅ تفاصيل المنتج:');
        console.log(`   📦 الاسم: ${product.name}`);
        console.log(`   💰 السعر: ${product.price} جنيه`);
        console.log(`   📊 المخزون: ${product.stock}`);
        console.log(`   📂 الفئة: ${product.category}`);
        console.log(`   🖼️ عدد الصور: ${product.images.length}`);
        console.log(`   🎨 عدد الأشكال: ${product.variants.length}`);
      } else {
        console.log(`❌ فشل جلب تفاصيل المنتج: ${detailsResult.error}`);
      }
    } else {
      console.log('⚠️ لا يوجد منتج للاختبار');
    }
    
    console.log('\n🎉 انتهى اختبار خدمة البحث في المنتجات!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    // إغلاق اتصال قاعدة البيانات
    await searchService.prisma.$disconnect();
  }
}

// تشغيل الاختبار
testProductSearchService();
