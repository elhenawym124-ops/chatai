const axios = require('axios');

console.log('🧪 اختبار رد سولا 132 بعد الإصلاح...\n');

async function testSolaResponse() {
  try {
    const webhookData = {
      object: 'page',
      entry: [{
        id: '250528358137901', // سولا 132
        time: Date.now(),
        messaging: [{
          sender: { id: 'test_customer_final' },
          recipient: { id: '250528358137901' },
          timestamp: Date.now(),
          message: {
            mid: 'test_final_message',
            text: 'السلام عليكم، اريد اعرف المنتجات المتوفرة'
          }
        }]
      }]
    };
    
    console.log('📤 إرسال رسالة لسولا 132...');
    console.log(`📱 Page ID: 250528358137901`);
    console.log(`👤 Customer: test_customer_final`);
    console.log(`💬 Message: "السلام عليكم، اريد اعرف المنتجات المتوفرة"`);
    
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log(`\n✅ تم إرسال الرسالة بنجاح!`);
    console.log(`📊 Status: ${response.status}`);
    console.log(`📝 Response: ${JSON.stringify(response.data, null, 2)}`);
    
    console.log('\n⏳ انتظار 5 ثوان لمعالجة الرسالة...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🔍 تحقق من اللوج للتأكد من:');
    console.log('   ✅ استخدام شركة الحلو');
    console.log('   ✅ وجود مفتاح Gemini نشط');
    console.log('   ✅ إرسال رد للعميل');
    console.log('   ✅ عدم ظهور أخطاء صامتة');
    
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error(`📊 Status: ${error.response.status}`);
      console.error(`📝 Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

testSolaResponse();
