const ragService = require('./src/services/ragService');

async function testAIProductSearch() {
  console.log('🤖 اختبار نظام البحث بالذكاء الصناعي...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('🧪 اختبار حالات مختلفة');
    console.log('='.repeat(60));
    
    // الحالة 1: طلب صريح
    console.log('1️⃣ طلب صريح: "عايز اشوف كوتشي لمسه"');
    const test1 = await ragService.retrieveSpecificProduct('عايز اشوف كوتشي لمسه', 'product_inquiry', 'test');
    console.log(`   النتيجة: ${test1.isSpecific ? test1.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(test1.confidence * 100).toFixed(1)}%`);
    if (test1.reasoning) console.log(`   السبب: ${test1.reasoning}`);
    console.log('');
    
    // الحالة 2: طلب غامض مع سياق
    const mockMemory = [
      {
        userMessage: 'عايز اشوف كوتشي لمسه',
        aiResponse: 'تمام! هبعت لحضرتك صور كوتشي لمسة من سوان',
        timestamp: new Date()
      }
    ];
    
    console.log('2️⃣ طلب غامض مع سياق: "ابعت ليا صورة الابيض"');
    const test2 = await ragService.retrieveSpecificProduct('ابعت ليا صورة الابيض', 'product_inquiry', 'test', mockMemory);
    console.log(`   النتيجة: ${test2.isSpecific ? test2.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(test2.confidence * 100).toFixed(1)}%`);
    if (test2.reasoning) console.log(`   السبب: ${test2.reasoning}`);
    console.log('');
    
    // الحالة 3: طلب منتج آخر
    console.log('3️⃣ طلب منتج آخر: "ابعت ليا صورة الكوتشي التاني"');
    const test3 = await ragService.retrieveSpecificProduct('ابعت ليا صورة الكوتشي التاني', 'product_inquiry', 'test', mockMemory);
    console.log(`   النتيجة: ${test3.isSpecific ? test3.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(test3.confidence * 100).toFixed(1)}%`);
    if (test3.reasoning) console.log(`   السبب: ${test3.reasoning}`);
    console.log('');
    
    // الحالة 4: طلب غير واضح
    console.log('4️⃣ طلب غير واضح: "ابعت ليا صورة"');
    const test4 = await ragService.retrieveSpecificProduct('ابعت ليا صورة', 'product_inquiry', 'test');
    console.log(`   النتيجة: ${test4.isSpecific ? test4.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(test4.confidence * 100).toFixed(1)}%`);
    if (test4.reasoning) console.log(`   السبب: ${test4.reasoning}`);
    console.log('');
    
    console.log('='.repeat(60));
    console.log('📊 ملخص النتائج');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'طلب صريح', result: test1 },
      { name: 'طلب غامض مع سياق', result: test2 },
      { name: 'طلب منتج آخر', result: test3 },
      { name: 'طلب غير واضح', result: test4 }
    ];
    
    tests.forEach((test, index) => {
      const status = test.result.isSpecific ? '✅ نجح' : '❌ فشل';
      const confidence = (test.result.confidence * 100).toFixed(1);
      console.log(`${index + 1}. ${test.name}: ${status} (${confidence}%)`);
    });
    
    const successCount = tests.filter(t => t.result.isSpecific).length;
    console.log(`\n🎯 معدل النجاح: ${successCount}/${tests.length} (${(successCount/tests.length*100).toFixed(1)}%)`);
    
    if (successCount >= 3) {
      console.log('🎉 النظام الجديد يعمل بشكل ممتاز!');
    } else if (successCount >= 2) {
      console.log('⚠️ النظام يحتاج تحسين');
    } else {
      console.log('❌ النظام يحتاج مراجعة شاملة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error);
  }
}

testAIProductSearch();
