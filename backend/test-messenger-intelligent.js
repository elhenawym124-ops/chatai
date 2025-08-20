/**
 * اختبار النظام الذكي مع الماسنجر
 * يحاكي رسائل الماسنجر لاختبار النظام الجديد
 */

async function testMessengerIntelligent() {
  console.log('📱 بدء اختبار النظام الذكي مع الماسنجر...\n');
  
  const baseURL = 'http://localhost:3001';
  const testMessages = [
    {
      message: 'مرحبا',
      description: 'تحية بسيطة - يجب ألا تعرض منتجات',
      expectedProducts: false
    },
    {
      message: 'عايز كوتشي',
      description: 'طلب منتج - يجب أن تعرض منتجات',
      expectedProducts: true
    },
    {
      message: 'كام سعر الشحن؟',
      description: 'سؤال عن الخدمة - قد تعرض منتجات',
      expectedProducts: true
    },
    {
      message: 'شكرا',
      description: 'شكر - يجب ألا تعرض منتجات',
      expectedProducts: false
    }
  ];
  
  console.log('🎯 سيناريوهات الاختبار:');
  testMessages.forEach((test, index) => {
    console.log(`${index + 1}. "${test.message}" - ${test.description}`);
  });
  console.log('');
  
  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    
    console.log(`\n📝 اختبار ${i + 1}: "${test.message}"`);
    console.log(`📋 ${test.description}`);
    
    try {
      // محاكاة webhook الماسنجر
      const webhookPayload = {
        object: 'page',
        entry: [{
          id: '250528358137901',
          time: Date.now(),
          messaging: [{
            sender: { id: `test_user_${Date.now()}` },
            recipient: { id: '250528358137901' },
            timestamp: Date.now(),
            message: {
              mid: `test_mid_${Date.now()}`,
              text: test.message
            }
          }]
        }]
      };
      
      console.log('📤 إرسال للماسنجر webhook...');
      
      const response = await fetch(`${baseURL}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-Signature-256': 'sha256=test' // توقيع وهمي للاختبار
        },
        body: JSON.stringify(webhookPayload)
      });
      
      if (response.ok) {
        console.log('✅ تم إرسال الرسالة بنجاح');
        console.log('⏳ انتظار معالجة الرسالة...');
        
        // انتظار لمعالجة الرسالة
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📊 تم معالجة الرسالة');
        
      } else {
        console.log(`❌ فشل إرسال الرسالة: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
    }
    
    // انتظار بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 انتهى اختبار الماسنجر');
  console.log('='.repeat(60));
  
  console.log('\n💡 للتحقق من النتائج:');
  console.log('1. راجع logs الخادم لمعرفة كيف تم معالجة كل رسالة');
  console.log('2. تحقق من أن النظام الذكي تم استخدامه');
  console.log('3. تأكد من أن المنتجات تم عرضها في الحالات المناسبة فقط');
  
  console.log('\n🔍 اختبار مباشر:');
  console.log('ارسل رسائل من الماسنجر الحقيقي وراقب السلوك:');
  console.log('• "مرحبا" ← يجب أن يرد بتحية بدون منتجات');
  console.log('• "عايز كوتشي" ← يجب أن يعرض منتجات');
  console.log('• "شكرا" ← يجب أن يرد بالعفو بدون منتجات');
  
  console.log('\n📈 مراقبة الأداء:');
  console.log(`• إحصائيات النظام: GET ${baseURL}/api/v1/ai/intelligent-analytics`);
  console.log(`• معلومات النظام: GET ${baseURL}/api/v1/ai/intelligent-info`);
}

// تشغيل الاختبار
testMessengerIntelligent().catch(console.error);
