const ragService = require('./src/services/ragService');

async function testSpecificProductSearch() {
  console.log('🧪 اختبار البحث المحدد للمنتجات...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('🎯 1. اختبار البحث المحدد');
    console.log('='.repeat(60));
    
    // اختبارات مختلفة للبحث المحدد
    const testQueries = [
      'عايز اشوف كوتشي لمسه',
      'كوتشي لمسة من سوان',
      'لمسة',
      'سوان',
      'كوتشي حريمي',
      'حريمي',
      'كوتشي',
      'عايز اشوف الكوتشي الحريمي',
      'صور كوتشي لمسة',
      'ممكن اشوف لمسة من سوان'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 اختبار: "${query}"`);
      console.log('-'.repeat(40));
      
      const result = await ragService.retrieveSpecificProduct(query, 'product_inquiry', 'test_customer');
      
      console.log(`📊 النتيجة:`);
      console.log(`   🎯 منتج محدد: ${result.isSpecific ? 'نعم' : 'لا'}`);
      console.log(`   📈 الثقة: ${(result.confidence * 100).toFixed(1)}%`);
      
      if (result.product) {
        console.log(`   📦 المنتج: ${result.product.metadata?.name || 'غير محدد'}`);
        console.log(`   💰 السعر: ${result.product.metadata?.price || 'غير محدد'} جنيه`);
        console.log(`   📸 الصور: ${result.product.metadata?.imageCount || 0} صورة`);
      } else {
        console.log(`   ❌ لم يتم العثور على منتج محدد`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 2. تحليل دقة النتائج');
    console.log('='.repeat(60));
    
    // تحليل دقة النتائج
    const expectedResults = {
      'عايز اشوف كوتشي لمسه': 'كوتشي لمسة من سوان',
      'كوتشي لمسة من سوان': 'كوتشي لمسة من سوان',
      'لمسة': 'كوتشي لمسة من سوان',
      'سوان': 'كوتشي لمسة من سوان',
      'كوتشي حريمي': 'كوتشي حريمي',
      'حريمي': 'كوتشي حريمي',
      'عايز اشوف الكوتشي الحريمي': 'كوتشي حريمي',
      'صور كوتشي لمسة': 'كوتشي لمسة من سوان',
      'ممكن اشوف لمسة من سوان': 'كوتشي لمسة من سوان'
    };
    
    let correctResults = 0;
    let totalTests = 0;
    
    for (const [query, expectedProduct] of Object.entries(expectedResults)) {
      totalTests++;
      const result = await ragService.retrieveSpecificProduct(query, 'product_inquiry', 'test_customer');
      
      const actualProduct = result.product?.metadata?.name || null;
      const isCorrect = actualProduct === expectedProduct;
      
      if (isCorrect) {
        correctResults++;
        console.log(`✅ "${query}" -> ${actualProduct} (صحيح)`);
      } else {
        console.log(`❌ "${query}" -> ${actualProduct || 'لا شيء'} (متوقع: ${expectedProduct})`);
      }
    }
    
    const accuracy = (correctResults / totalTests) * 100;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 3. النتائج النهائية');
    console.log('='.repeat(60));
    
    console.log(`📊 إجمالي الاختبارات: ${totalTests}`);
    console.log(`✅ النتائج الصحيحة: ${correctResults}`);
    console.log(`❌ النتائج الخاطئة: ${totalTests - correctResults}`);
    console.log(`🎯 دقة النظام: ${accuracy.toFixed(1)}%`);
    
    if (accuracy >= 90) {
      console.log('🎉 النظام يعمل بدقة ممتازة!');
    } else if (accuracy >= 70) {
      console.log('✅ النظام يعمل بدقة جيدة');
    } else if (accuracy >= 50) {
      console.log('⚠️ النظام يحتاج تحسينات');
    } else {
      console.log('❌ النظام يحتاج إعادة تصميم');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 4. اختبار مقارنة مع النظام القديم');
    console.log('='.repeat(60));
    
    // اختبار مقارنة مع البحث العام
    const testQuery = 'عايز اشوف كوتشي لمسه';
    
    console.log(`🔍 اختبار الاستفسار: "${testQuery}"`);
    
    // البحث المحدد الجديد
    const specificResult = await ragService.retrieveSpecificProduct(testQuery, 'product_inquiry', 'test_customer');
    console.log('\n🎯 النتيجة من البحث المحدد:');
    if (specificResult.product) {
      console.log(`   📦 المنتج: ${specificResult.product.metadata?.name}`);
      console.log(`   📸 الصور: ${specificResult.product.metadata?.imageCount} صورة`);
      console.log(`   📊 الثقة: ${(specificResult.confidence * 100).toFixed(1)}%`);
    } else {
      console.log(`   ❌ لم يتم العثور على منتج محدد`);
    }
    
    // البحث العام القديم
    const generalResults = await ragService.retrieveRelevantData(testQuery, 'product_inquiry', 'test_customer');
    console.log('\n🔄 النتيجة من البحث العام:');
    console.log(`   📊 عدد النتائج: ${generalResults.length}`);
    generalResults.forEach((result, index) => {
      if (result.type === 'product') {
        console.log(`   📦 منتج ${index + 1}: ${result.metadata?.name}`);
        console.log(`   📸 الصور: ${result.metadata?.imageCount} صورة`);
      }
    });
    
    console.log('\n🎯 المقارنة:');
    if (specificResult.isSpecific) {
      console.log('✅ البحث المحدد: يرجع منتج واحد محدد');
      console.log(`❌ البحث العام: يرجع ${generalResults.filter(r => r.type === 'product').length} منتج`);
      console.log('🎉 البحث المحدد أفضل للصور!');
    } else {
      console.log('❌ البحث المحدد: فشل في تحديد المنتج');
      console.log('🔄 سيتم استخدام البحث العام كـ fallback');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار البحث المحدد:', error);
  }
}

testSpecificProductSearch();
