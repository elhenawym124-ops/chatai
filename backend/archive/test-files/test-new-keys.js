/**
 * اختبار مفاتيح API الجديدة مباشرة
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKeys() {
  console.log('🧪 اختبار مفاتيح API الجديدة مباشرة');
  console.log('=' .repeat(60));

  const apiKeys = [
    {
      name: 'المفتاح الأول',
      key: 'AIzaSyAdWtZ3BgcAs3bN_UyCnpMl_tzMWtueH5k'
    },
    {
      name: 'المفتاح الثاني', 
      key: 'AIzaSyDKdxZnraopHDAm84SKaKY2zXA65CPQA8I'
    }
  ];

  for (const apiKeyObj of apiKeys) {
    console.log(`\n🔑 اختبار ${apiKeyObj.name}: ${apiKeyObj.key.substring(0, 20)}...`);
    
    try {
      // إنشاء عميل Google Generative AI
      const genAI = new GoogleGenerativeAI(apiKeyObj.key);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      // اختبار بسيط
      const testPrompt = 'مرحباً، هذا اختبار بسيط. يرجى الرد بكلمة "نجح الاختبار".';
      
      console.log('📤 إرسال طلب اختبار...');
      const startTime = Date.now();
      
      const result = await model.generateContent(testPrompt);
      const response = result.response;
      const text = response.text();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ ${apiKeyObj.name} - نجح الاختبار!`);
      console.log(`📝 الرد: ${text.substring(0, 100)}...`);
      console.log(`⏱️ الوقت: ${duration}ms`);
      console.log(`🔢 الرموز المستخدمة: ${response.usageMetadata?.totalTokenCount || 'غير محدد'}`);
      
    } catch (error) {
      console.error(`❌ ${apiKeyObj.name} - فشل الاختبار:`);
      console.error(`   الخطأ: ${error.message}`);
      
      if (error.message.includes('API_KEY_INVALID')) {
        console.error('   🔑 المفتاح غير صحيح أو منتهي الصلاحية');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        console.error('   🚫 المفتاح لا يملك صلاحيات Generative AI API');
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        console.error('   📊 تم تجاوز حد الاستخدام');
      } else {
        console.error('   ❓ خطأ غير معروف');
      }
    }
    
    console.log('-'.repeat(50));
  }
  
  console.log('\n🏁 انتهى اختبار جميع المفاتيح');
}

// تشغيل الاختبار
testApiKeys().catch(console.error);
