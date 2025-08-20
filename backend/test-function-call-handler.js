const FunctionCallHandler = require('./src/services/functionCallHandler');

async function testFunctionCallHandler() {
  console.log('🧪 اختبار معالج Function Calling...\n');
  
  const handler = new FunctionCallHandler();
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  try {
    // اختبار 1: البحث في المنتجات
    console.log('--- اختبار 1: البحث في المنتجات ---');
    const searchCall = {
      name: 'search_products',
      args: {
        keywords: 'كوتشي',
        limit: 3
      }
    };
    
    const searchResult = await handler.handleFunctionCall(searchCall, companyId);
    if (searchResult.success) {
      console.log(`✅ وُجد ${searchResult.data.length} منتج`);
      searchResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل البحث: ${searchResult.error}`);
    }
    
    // اختبار 2: المنتجات الشائعة
    console.log('\n--- اختبار 2: المنتجات الشائعة ---');
    const popularCall = {
      name: 'get_popular_products',
      args: {
        limit: 3
      }
    };
    
    const popularResult = await handler.handleFunctionCall(popularCall, companyId);
    if (popularResult.success) {
      console.log(`✅ وُجد ${popularResult.data.length} منتج شائع`);
      popularResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل جلب المنتجات الشائعة: ${popularResult.error}`);
    }
    
    // اختبار 3: البحث بنطاق سعري
    console.log('\n--- اختبار 3: البحث بنطاق سعري ---');
    const priceRangeCall = {
      name: 'get_products_by_price_range',
      args: {
        minPrice: 200,
        maxPrice: 400,
        limit: 3
      }
    };
    
    const priceResult = await handler.handleFunctionCall(priceRangeCall, companyId);
    if (priceResult.success) {
      console.log(`✅ وُجد ${priceResult.data.length} منتج في النطاق السعري`);
      priceResult.data.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
      });
    } else {
      console.log(`❌ فشل البحث بالنطاق السعري: ${priceResult.error}`);
    }
    
    // اختبار 4: الفئات المتاحة
    console.log('\n--- اختبار 4: الفئات المتاحة ---');
    const categoriesCall = {
      name: 'get_available_categories',
      args: {}
    };
    
    const categoriesResult = await handler.handleFunctionCall(categoriesCall, companyId);
    if (categoriesResult.success) {
      console.log(`✅ وُجد ${categoriesResult.data.length} فئة`);
      categoriesResult.data.slice(0, 5).forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (${category.productCount} منتج)`);
      });
    } else {
      console.log(`❌ فشل جلب الفئات: ${categoriesResult.error}`);
    }
    
    // اختبار 5: إحصائيات المنتجات
    console.log('\n--- اختبار 5: إحصائيات المنتجات ---');
    const statsCall = {
      name: 'get_product_stats',
      args: {}
    };
    
    const statsResult = await handler.handleFunctionCall(statsCall, companyId);
    if (statsResult.success) {
      console.log('✅ إحصائيات المنتجات:');
      console.log(`   📦 إجمالي: ${statsResult.data.totalProducts}`);
      console.log(`   ✅ نشط: ${statsResult.data.activeProducts}`);
      console.log(`   📈 متوفر: ${statsResult.data.inStock}`);
      console.log(`   📉 نافد: ${statsResult.data.outOfStock}`);
    } else {
      console.log(`❌ فشل جلب الإحصائيات: ${statsResult.error}`);
    }
    
    // اختبار 6: تحليل نية العميل
    console.log('\n--- اختبار 6: تحليل نية العميل ---');
    const intentCall = {
      name: 'analyze_customer_intent',
      args: {
        message: 'انصحني بكوتشي حلو ومش غالي'
      }
    };
    
    const intentResult = await handler.handleFunctionCall(intentCall, companyId);
    if (intentResult.success) {
      console.log('✅ تحليل النية:');
      console.log(`   📝 الرسالة: ${intentResult.data.message}`);
      console.log(`   🎯 النية: ${intentResult.data.intent}`);
      console.log(`   📊 الثقة: ${intentResult.data.confidence}`);
      console.log(`   🔑 الكلمات المفتاحية: ${intentResult.data.keywords.join(', ')}`);
    } else {
      console.log(`❌ فشل تحليل النية: ${intentResult.error}`);
    }
    
    // اختبار 7: تفاصيل منتج محدد
    console.log('\n--- اختبار 7: تفاصيل منتج محدد ---');
    
    // استخدام منتج من نتائج البحث السابقة
    if (searchResult.success && searchResult.data.length > 0) {
      const productId = searchResult.data[0].id;
      
      const detailsCall = {
        name: 'get_product_details',
        args: {
          productId: productId
        }
      };
      
      const detailsResult = await handler.handleFunctionCall(detailsCall, companyId);
      if (detailsResult.success) {
        const product = detailsResult.data;
        console.log('✅ تفاصيل المنتج:');
        console.log(`   📦 الاسم: ${product.name}`);
        console.log(`   💰 السعر: ${product.price} جنيه`);
        console.log(`   📊 المخزون: ${product.stock}`);
        console.log(`   📂 الفئة: ${product.category}`);
      } else {
        console.log(`❌ فشل جلب تفاصيل المنتج: ${detailsResult.error}`);
      }
    } else {
      console.log('⚠️ لا يوجد منتج للاختبار');
    }
    
    // اختبار 8: اقتراح منتجات مشابهة
    console.log('\n--- اختبار 8: اقتراح منتجات مشابهة ---');
    
    if (searchResult.success && searchResult.data.length > 0) {
      const productId = searchResult.data[0].id;
      
      const relatedCall = {
        name: 'suggest_related_products',
        args: {
          productId: productId,
          limit: 2
        }
      };
      
      const relatedResult = await handler.handleFunctionCall(relatedCall, companyId);
      if (relatedResult.success) {
        console.log(`✅ وُجد ${relatedResult.data.length} منتج مشابه`);
        relatedResult.data.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
        });
      } else {
        console.log(`❌ فشل اقتراح المنتجات المشابهة: ${relatedResult.error}`);
      }
    } else {
      console.log('⚠️ لا يوجد منتج للاختبار');
    }
    
    // اختبار 9: استدعاء دالة غير موجودة
    console.log('\n--- اختبار 9: استدعاء دالة غير موجودة ---');
    const invalidCall = {
      name: 'invalid_function',
      args: {}
    };
    
    const invalidResult = await handler.handleFunctionCall(invalidCall, companyId);
    if (!invalidResult.success) {
      console.log(`✅ تم اكتشاف الدالة غير الصحيحة: ${invalidResult.error}`);
    } else {
      console.log('❌ لم يتم اكتشاف الخطأ');
    }
    
    console.log('\n🎉 انتهى اختبار معالج Function Calling!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await handler.disconnect();
  }
}

// تشغيل الاختبار
testFunctionCallHandler();
