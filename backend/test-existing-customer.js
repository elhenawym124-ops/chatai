const axios = require('axios');

console.log('🧪 اختبار النظام مع عميل موجود...\n');

async function testExistingCustomer() {
  try {
    console.log('📤 إرسال رسالة من عميل موجود...');
    
    const webhookData = {
      object: 'page',
      entry: [{
        id: '250528358137901', // سولا 132
        time: Date.now(),
        messaging: [{
          sender: { id: '7582293631801453' }, // عميل موجود
          recipient: { id: '250528358137901' },
          timestamp: Date.now(),
          message: {
            mid: 'test_existing_customer_message',
            text: 'مرحبا، أريد معرفة المنتجات المتوفرة'
          }
        }]
      }]
    };
    
    console.log('📱 Page ID: 250528358137901 (سولا 132)');
    console.log('👤 Customer: 7582293631801453 (عميل موجود)');
    console.log('💬 Message: "مرحبا، أريد معرفة المنتجات المتوفرة"');
    
    const response = await axios.post('http://localhost:3001/webhook', webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log(`\n📊 Response Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ الطلب تم قبوله');
      
      // انتظار لمعالجة الرسالة
      console.log('\n⏳ انتظار 5 ثوان لمعالجة الرسالة...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('\n🔍 تحقق من اللوج للبحث عن:');
      console.log('   ✅ "Using company from page: cme8zve740006ufbcre9qzue4"');
      console.log('   ✅ "Found existing customer"');
      console.log('   ✅ "🤖 Processing customer message with advanced RAG system"');
      console.log('   ✅ "✅ Using model: gemini-2.5-pro"');
      console.log('   ✅ "📤 Message sent to Facebook user"');
      
      return { test: 'success', message: 'تحقق من اللوج للنتائج' };
    } else {
      console.log('❌ فشل الطلب');
      return { test: 'failed', status: response.status };
    }
    
  } catch (error) {
    if (error.response) {
      console.log(`📊 Response Status: ${error.response.status}`);
      console.log(`📝 Response Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`❌ خطأ في الشبكة: ${error.message}`);
    }
    return { test: 'error', error: error.message };
  }
}

async function runTest() {
  console.log('🎯 اختبار النظام مع عميل موجود:');
  console.log('═'.repeat(50));
  
  const result = await testExistingCustomer();
  
  console.log('\n🏆 النتيجة النهائية:');
  console.log('─'.repeat(30));
  
  if (result.test === 'success') {
    console.log('🟢 الاختبار نجح - تحقق من اللوج');
    console.log('✅ النظام يجب أن يرد على العميل الموجود');
  } else if (result.test === 'failed') {
    console.log('🔴 الاختبار فشل');
    console.log(`❌ Status: ${result.status}`);
  } else {
    console.log('🟡 خطأ في الاختبار');
    console.log(`❌ Error: ${result.error}`);
  }
  
  return result;
}

runTest();
