const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testContextAwareSearch() {
  console.log('🧪 اختبار البحث المحدد مع السياق...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('🎯 سيناريو المشكلة الأساسية');
    console.log('='.repeat(60));
    
    // محاكاة محادثة حقيقية
    const conversationId = 'test_context_conversation';
    const senderId = 'test_context_customer';
    
    // الرسالة الأولى: العميل يطلب صور كوتشي لمسة
    console.log('📨 الرسالة الأولى: "عايز اشوف صور الكوتشي لمسه"');
    
    const firstMessage = {
      conversationId,
      senderId,
      content: 'عايز اشوف صور الكوتشي لمسه',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_context',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const firstResponse = await aiAgentService.processCustomerMessage(firstMessage);
    
    console.log('🤖 رد AI:');
    console.log(`   النص: ${firstResponse.content.substring(0, 100)}...`);
    console.log(`   عدد الصور: ${firstResponse.images?.length || 0}`);
    
    if (firstResponse.images && firstResponse.images.length > 0) {
      console.log('📸 الصور المرسلة:');
      firstResponse.images.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.payload?.title}`);
      });
    }
    
    // انتظار قليل لحفظ الذاكرة
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n' + '-'.repeat(40));
    console.log('📨 الرسالة الثانية: "ابعت ليا صورة الابيض"');
    
    // الرسالة الثانية: العميل يطلب اللون الأبيض (بدون ذكر اسم المنتج)
    const secondMessage = {
      conversationId,
      senderId,
      content: 'ابعت ليا صورة الابيض',
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_context',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    const secondResponse = await aiAgentService.processCustomerMessage(secondMessage);
    
    console.log('🤖 رد AI:');
    console.log(`   النص: ${secondResponse.content.substring(0, 100)}...`);
    console.log(`   عدد الصور: ${secondResponse.images?.length || 0}`);
    
    if (secondResponse.images && secondResponse.images.length > 0) {
      console.log('📸 الصور المرسلة:');
      secondResponse.images.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img.payload?.title}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 تحليل النتائج');
    console.log('='.repeat(60));
    
    // تحليل النتائج
    const firstImagesCorrect = firstResponse.images?.some(img => 
      img.payload?.title?.includes('لمسة') || img.payload?.title?.includes('سوان')
    ) || false;
    
    const secondImagesCorrect = secondResponse.images?.some(img => 
      img.payload?.title?.includes('لمسة') || img.payload?.title?.includes('سوان')
    ) || false;
    
    console.log('📊 تقييم الأداء:');
    console.log(`   الرسالة الأولى (صريحة): ${firstImagesCorrect ? '✅ صحيح' : '❌ خطأ'}`);
    console.log(`   الرسالة الثانية (سياق): ${secondImagesCorrect ? '✅ صحيح' : '❌ خطأ'}`);
    
    // اختبار البحث المحدد مباشرة
    console.log('\n' + '='.repeat(60));
    console.log('🧠 اختبار البحث المحدد مع السياق');
    console.log('='.repeat(60));
    
    // محاكاة ذاكرة المحادثة
    const mockMemory = [
      {
        userMessage: 'عايز اشوف صور الكوتشي لمسه',
        aiResponse: 'تمام! هبعت لحضرتك صور كوتشي لمسة من سوان',
        timestamp: new Date()
      }
    ];
    
    // اختبار البحث بدون سياق
    console.log('🔍 بحث بدون سياق: "ابعت ليا صورة الابيض"');
    const withoutContext = await ragService.retrieveSpecificProduct('ابعت ليا صورة الابيض', 'product_inquiry', 'test');
    console.log(`   النتيجة: ${withoutContext.isSpecific ? withoutContext.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(withoutContext.confidence * 100).toFixed(1)}%`);
    
    // اختبار البحث مع السياق
    console.log('\n🧠 بحث مع السياق: "ابعت ليا صورة الابيض"');
    const withContext = await ragService.retrieveSpecificProduct('ابعت ليا صورة الابيض', 'product_inquiry', 'test', mockMemory);
    console.log(`   النتيجة: ${withContext.isSpecific ? withContext.product?.metadata?.name : 'لم يجد منتج محدد'}`);
    console.log(`   الثقة: ${(withContext.confidence * 100).toFixed(1)}%`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 النتيجة النهائية');
    console.log('='.repeat(60));
    
    const problemSolved = firstImagesCorrect && secondImagesCorrect;
    const contextWorking = withContext.confidence > withoutContext.confidence;
    
    if (problemSolved) {
      console.log('🎉 المشكلة تم حلها بنجاح!');
      console.log('✅ النظام يرسل الصور الصحيحة في كلا الحالتين');
    } else {
      console.log('❌ المشكلة لم يتم حلها بالكامل');
      if (!firstImagesCorrect) {
        console.log('   - الرسالة الأولى: صور خاطئة');
      }
      if (!secondImagesCorrect) {
        console.log('   - الرسالة الثانية: صور خاطئة (مشكلة السياق)');
      }
    }
    
    if (contextWorking) {
      console.log('🧠 نظام السياق يعمل بشكل صحيح');
      console.log(`   تحسن الثقة من ${(withoutContext.confidence * 100).toFixed(1)}% إلى ${(withContext.confidence * 100).toFixed(1)}%`);
    } else {
      console.log('⚠️ نظام السياق يحتاج تحسين');
    }
    
    console.log('\n📋 ملخص التحسينات:');
    console.log('✅ إضافة استخراج المنتجات من السياق');
    console.log('✅ تحسين نظام النقاط مع بونص السياق');
    console.log('✅ تمرير الذاكرة للبحث المحدد');
    console.log('✅ معالجة الطلبات الغامضة بالسياق');

  } catch (error) {
    console.error('❌ خطأ في اختبار السياق:', error);
  }
}

testContextAwareSearch();
