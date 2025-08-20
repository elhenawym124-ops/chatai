const ragService = require('./src/services/ragService');

async function testRAGAutoUpdate() {
  console.log('🧪 اختبار التحديث التلقائي لـ RAG...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    // إحصائيات النظام
    const stats = ragService.getStats();
    console.log('📊 إحصائيات قاعدة المعرفة الحالية:');
    console.log(`   📦 إجمالي العناصر: ${stats.total}`);
    console.log(`   📦 المنتجات: ${stats.byType.product || 0}`);
    console.log(`   ❓ الأسئلة الشائعة: ${stats.byType.faq || 0}`);
    console.log(`   📋 السياسات: ${stats.byType.policy || 0}\n`);

    // اختبار البحث عن جميع المنتجات
    console.log('🔍 اختبار البحث عن جميع المنتجات:');
    const allProductsResults = await ragService.retrieveRelevantData('عندك ايه من الكوتشيات؟', 'product_inquiry', 'test_customer');
    
    console.log(`   📊 عدد النتائج: ${allProductsResults.length}`);
    
    if (allProductsResults.length > 0) {
      allProductsResults.forEach((result, index) => {
        console.log(`   📦 منتج ${index + 1}: ${result.metadata?.name || 'غير محدد'}`);
        console.log(`   💰 السعر: ${result.metadata?.price || 'غير محدد'} جنيه`);
        if (result.metadata?.images) {
          console.log(`   📸 عدد الصور: ${result.metadata.images.length}`);
        }
        if (result.metadata?.variants) {
          console.log(`   🎨 عدد المتغيرات: ${result.metadata.variants.length}`);
          result.metadata.variants.forEach((variant, vIndex) => {
            console.log(`      ${vIndex + 1}. ${variant.name} - ${variant.price} جنيه - المخزون: ${variant.stock}`);
          });
        }
        console.log('');
      });
    } else {
      console.log('   ❌ لم يتم العثور على منتجات');
    }

    // اختبار البحث عن منتج محدد
    console.log('🔍 اختبار البحث عن "كوتشي لمسة من سوان":');
    const specificResults = await ragService.retrieveRelevantData('كوتشي لمسة من سوان', 'product_inquiry', 'test_customer');
    
    console.log(`   📊 عدد النتائج: ${specificResults.length}`);
    
    if (specificResults.length > 0) {
      const result = specificResults[0];
      console.log(`   ✅ تم العثور على: ${result.metadata?.name || 'غير محدد'}`);
      console.log(`   💰 السعر: ${result.metadata?.price || 'غير محدد'} جنيه`);
      console.log(`   📸 عدد الصور: ${result.metadata?.images?.length || 0}`);
      console.log(`   🎨 عدد المتغيرات: ${result.metadata?.variants?.length || 0}`);
    } else {
      console.log('   ❌ لم يتم العثور على المنتج الجديد');
    }

    console.log('\n🎯 نتيجة الاختبار:');
    if (allProductsResults.length >= 2) {
      console.log('   ✅ التحديث التلقائي يعمل بنجاح!');
      console.log('   ✅ RAG يرى جميع المنتجات الجديدة');
    } else {
      console.log('   ❌ التحديث التلقائي لا يعمل بشكل صحيح');
      console.log('   ❌ RAG لا يرى المنتجات الجديدة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار RAG:', error);
  }
}

testRAGAutoUpdate();
