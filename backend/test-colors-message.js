/**
 * اختبار رسالة الألوان المُصلحة
 */

async function testColorsMessage() {
  console.log('🎨 اختبار رسالة الألوان...\n');
  
  const baseURL = 'http://localhost:3001';
  const pageId = '250528358137901';
  const senderId = 'test_colors_' + Date.now();
  
  const testMessages = [
    'في الوان منه ؟',
    'ايه الألوان المتاحة؟',
    'عندك ألوان تانية؟'
  ];
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    
    console.log(`\n📝 اختبار ${i + 1}: "${message}"`);
    
    try {
      // إرسال رسالة للماسنجر
      const response = await fetch(`${baseURL}/api/v1/integrations/facebook/test-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: pageId,
          senderId: senderId + '_' + i,
          messageText: message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ تم إرسال الرسالة بنجاح');
        console.log('⏳ انتظار معالجة الرسالة...');
        
        // انتظار لمعالجة الرسالة
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } else {
        console.log(`❌ فشل إرسال الرسالة: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
    }
    
    // انتظار بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 انتهى اختبار رسائل الألوان');
  console.log('='.repeat(60));
  
  console.log('\n💡 للتحقق من النتائج:');
  console.log('1. راجع logs الخادم');
  console.log('2. تأكد من عدم ظهور "Converting circular structure to JSON"');
  console.log('3. تحقق من ظهور "🧠 النظام الذكي" في المعالجة');
  console.log('4. تأكد من عرض المنتجات مع الألوان');
}

// تشغيل الاختبار
testColorsMessage().catch(console.error);
