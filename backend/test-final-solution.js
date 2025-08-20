const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

async function testFinalSolution() {
  console.log('🎯 اختبار الحل النهائي للمشكلة الأساسية...\n');

  try {
    // انتظار تهيئة النظام
    await ragService.ensureInitialized();
    
    console.log('='.repeat(60));
    console.log('🔥 اختبار السيناريو الأساسي: "عايز اشوف كوتشي لمسه"');
    console.log('='.repeat(60));
    
    const testMessage = 'عايز اشوف كوتشي لمسه';
    
    // محاكاة بيانات العميل
    const messageData = {
      conversationId: 'test_conversation',
      senderId: 'test_customer',
      content: testMessage,
      attachments: [],
      timestamp: new Date().toISOString(),
      customerData: {
        id: 'test_customer_id',
        name: 'Test Customer',
        phone: '',
        email: 'test@example.com',
        orderCount: 0
      }
    };
    
    console.log(`📨 رسالة العميل: "${testMessage}"`);
    console.log('⏳ معالجة الرسالة...\n');
    
    // معالجة الرسالة بـ AI Agent
    const response = await aiAgentService.processCustomerMessage(messageData);
    
    console.log('📊 تحليل النتيجة:');
    console.log('-'.repeat(40));
    
    if (response.success) {
      console.log('✅ AI Agent استجاب بنجاح');
      console.log(`📝 الرد: ${response.content.substring(0, 100)}...`);
      console.log(`🎯 النية المكتشفة: ${response.intent}`);
      console.log(`📸 عدد الصور: ${response.images?.length || 0}`);
      
      if (response.images && response.images.length > 0) {
        console.log('\n🎉 تم إرسال الصور بنجاح!');
        console.log('📸 تفاصيل الصور:');
        
        response.images.forEach((image, index) => {
          console.log(`   صورة ${index + 1}: ${image.payload?.title || 'غير محدد'}`);
          console.log(`   الرابط: ${image.payload?.url || 'غير محدد'}`);
        });
        
        // فحص إذا كانت الصور من المنتج الصحيح
        const correctProduct = 'كوتشي لمسة من سوان';
        const hasCorrectImages = response.images.some(img => 
          img.payload?.title?.includes('لمسة') || 
          img.payload?.title?.includes('سوان')
        );
        
        if (hasCorrectImages) {
          console.log('\n✅ الصور من المنتج الصحيح: كوتشي لمسة من سوان');
        } else {
          console.log('\n❌ الصور من منتج خاطئ!');
          console.log('🔍 فحص تفصيلي للصور:');
          response.images.forEach((image, index) => {
            console.log(`   صورة ${index + 1}: ${image.payload?.title}`);
          });
        }
        
      } else {
        console.log('\n❌ لم يتم إرسال أي صور!');
        console.log('🔍 السبب المحتمل: AI لم يكتشف طلب الصور أو فشل في استخراجها');
      }
      
    } else {
      console.log('❌ AI Agent فشل في الاستجابة');
      console.log(`🔍 السبب: ${response.error || 'غير محدد'}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🧪 اختبار مقارن: البحث المحدد مقابل العام');
    console.log('='.repeat(60));
    
    // اختبار البحث المحدد
    console.log('🎯 1. البحث المحدد:');
    const specificResult = await ragService.retrieveSpecificProduct(testMessage, 'product_inquiry', 'test_customer');
    
    if (specificResult.isSpecific) {
      console.log(`   ✅ وجد منتج محدد: ${specificResult.product.metadata?.name}`);
      console.log(`   📊 الثقة: ${(specificResult.confidence * 100).toFixed(1)}%`);
      console.log(`   📸 الصور: ${specificResult.product.metadata?.imageCount || 0}`);
    } else {
      console.log('   ❌ لم يجد منتج محدد');
    }
    
    // اختبار البحث العام
    console.log('\n🔄 2. البحث العام:');
    const generalResults = await ragService.retrieveRelevantData(testMessage, 'product_inquiry', 'test_customer');
    console.log(`   📊 عدد النتائج: ${generalResults.length}`);
    
    const productResults = generalResults.filter(r => r.type === 'product');
    productResults.forEach((result, index) => {
      console.log(`   📦 منتج ${index + 1}: ${result.metadata?.name}`);
      console.log(`   📸 الصور: ${result.metadata?.imageCount || 0}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 النتيجة النهائية');
    console.log('='.repeat(60));
    
    const isFixed = response.success && 
                   response.images && 
                   response.images.length > 0 && 
                   response.images.some(img => 
                     img.payload?.title?.includes('لمسة') || 
                     img.payload?.title?.includes('سوان')
                   );
    
    if (isFixed) {
      console.log('🎉 المشكلة تم حلها بنجاح!');
      console.log('✅ العميل طلب "كوتشي لمسه"');
      console.log('✅ النظام أرسل صور "كوتشي لمسة من سوان"');
      console.log('✅ لم يعد يرسل صور خاطئة');
      console.log('\n🚀 النظام جاهز للإنتاج!');
    } else {
      console.log('❌ المشكلة لم يتم حلها بالكامل');
      console.log('🔍 يحتاج مراجعة إضافية');
      
      if (!response.success) {
        console.log('   - AI Agent فشل في الاستجابة');
      }
      if (!response.images || response.images.length === 0) {
        console.log('   - لم يتم إرسال صور');
      }
      if (response.images && !response.images.some(img => img.payload?.title?.includes('لمسة'))) {
        console.log('   - الصور من منتج خاطئ');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار الحل النهائي:', error);
  }
}

testFinalSolution();
