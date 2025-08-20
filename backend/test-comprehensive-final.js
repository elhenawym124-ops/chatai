const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testComprehensiveFinal() {
  console.log('🔬 اختبار شامل نهائي للتأكد من التغييرات...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(80));
    console.log('🎯 اختبار 1: المشكلة الأساسية (البحث المحدد)');
    console.log('='.repeat(80));
    
    // اختبار البحث المحدد مباشرة
    console.log('📝 اختبار: "عايز اشوف صور الكوتشي لمسه"');
    const specificResult1 = await ragService.retrieveSpecificProduct('عايز اشوف صور الكوتشي لمسه', 'product_inquiry', 'test');
    
    console.log(`✅ النتيجة: ${specificResult1.isSpecific ? specificResult1.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`📊 الثقة: ${(specificResult1.confidence * 100).toFixed(1)}%`);
    console.log(`🎯 متوقع: كوتشي لمسة من سوان`);
    
    const test1Pass = specificResult1.isSpecific && 
                     specificResult1.product?.metadata?.name?.includes('لمسة') && 
                     specificResult1.confidence >= 0.8;
    
    console.log(`🔍 النتيجة: ${test1Pass ? '✅ نجح' : '❌ فشل'}\n`);
    
    console.log('='.repeat(80));
    console.log('🧠 اختبار 2: نظام السياق');
    console.log('='.repeat(80));
    
    // محاكاة ذاكرة المحادثة
    const mockMemory = [
      {
        userMessage: 'عايز اشوف صور الكوتشي لمسه',
        aiResponse: 'تمام! هبعت لحضرتك صور كوتشي لمسة من سوان',
        timestamp: new Date()
      }
    ];
    
    console.log('📝 اختبار بدون سياق: "ابعت ليا صورة الابيض"');
    const withoutContext = await ragService.retrieveSpecificProduct('ابعت ليا صورة الابيض', 'product_inquiry', 'test');
    console.log(`📊 الثقة بدون سياق: ${(withoutContext.confidence * 100).toFixed(1)}%`);
    
    console.log('📝 اختبار مع السياق: "ابعت ليا صورة الابيض"');
    const withContext = await ragService.retrieveSpecificProduct('ابعت ليا صورة الابيض', 'product_inquiry', 'test', mockMemory);
    console.log(`📊 الثقة مع السياق: ${(withContext.confidence * 100).toFixed(1)}%`);
    console.log(`✅ النتيجة مع السياق: ${withContext.isSpecific ? withContext.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    
    const test2Pass = withContext.confidence > withoutContext.confidence && 
                     withContext.isSpecific && 
                     withContext.product?.metadata?.name?.includes('لمسة');
    
    console.log(`🔍 النتيجة: ${test2Pass ? '✅ نجح' : '❌ فشل'}\n`);
    
    console.log('='.repeat(80));
    console.log('🚫 اختبار 3: عدم وجود تضارب مع النظام القديم');
    console.log('='.repeat(80));
    
    // اختبار AI Agent كامل
    const conversationId = 'test_no_conflict';
    const senderId = 'test_customer_final';
    
    const messageData = {
      conversationId,
      senderId,
      content: 'عايز اشوف صور الكوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_final',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    console.log('📝 اختبار AI Agent كامل...');
    const aiResponse = await aiAgentService.processCustomerMessage(messageData);
    
    console.log(`✅ AI استجاب: ${aiResponse.success ? 'نعم' : 'لا'}`);
    console.log(`📸 عدد الصور: ${aiResponse.images?.length || 0}`);
    
    if (aiResponse.images && aiResponse.images.length > 0) {
      console.log('📋 تفاصيل الصور:');
      aiResponse.images.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.payload?.title}`);
      });
      
      // فحص أن جميع الصور من نفس المنتج
      const allFromSameProduct = aiResponse.images.every(img => 
        img.payload?.title?.includes('لمسة') || img.payload?.title?.includes('سوان')
      );
      
      console.log(`🔍 جميع الصور من نفس المنتج: ${allFromSameProduct ? '✅ نعم' : '❌ لا'}`);
      
      const test3Pass = allFromSameProduct && aiResponse.images.length === 3;
      console.log(`🔍 النتيجة: ${test3Pass ? '✅ نجح' : '❌ فشل'}\n`);
      
      console.log('='.repeat(80));
      console.log('📊 النتائج النهائية');
      console.log('='.repeat(80));
      
      const allTestsPass = test1Pass && test2Pass && test3Pass;
      
      console.log(`🎯 اختبار البحث المحدد: ${test1Pass ? '✅ نجح' : '❌ فشل'}`);
      console.log(`🧠 اختبار نظام السياق: ${test2Pass ? '✅ نجح' : '❌ فشل'}`);
      console.log(`🚫 اختبار عدم التضارب: ${test3Pass ? '✅ نجح' : '❌ فشل'}`);
      
      console.log('\n' + '='.repeat(80));
      if (allTestsPass) {
        console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للإنتاج!');
        console.log('✅ المشكلة الأساسية تم حلها بالكامل');
        console.log('✅ نظام السياق يعمل بشكل مثالي');
        console.log('✅ لا يوجد تضارب مع النظام القديم');
        console.log('✅ النظام مستقر وآمن');
      } else {
        console.log('❌ بعض الاختبارات فشلت! يحتاج مراجعة');
        if (!test1Pass) console.log('   - البحث المحدد لا يعمل بشكل صحيح');
        if (!test2Pass) console.log('   - نظام السياق لا يعمل بشكل صحيح');
        if (!test3Pass) console.log('   - يوجد تضارب مع النظام القديم');
      }
      console.log('='.repeat(80));
      
    } else {
      console.log('❌ لم يتم إرسال صور!');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار الشامل:', error);
  }
}

testComprehensiveFinal();
