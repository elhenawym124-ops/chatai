const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSpecificKey() {
  console.log('🧪 اختبار مفتاح Gemini المحدد...');
  
  const apiKey = 'AIzaSyBWtnIh3F3BKr0W7juBoz9iCqxkJxIA_xw';
  const model = 'gemini-2.5-flash-lite';
  
  console.log(`🔑 المفتاح: ${apiKey.substring(0, 20)}...`);
  console.log(`🤖 النموذج: ${model}`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });

    console.log('\n🔄 إرسال رسالة اختبار...');
    const result = await geminiModel.generateContent('مرحبا، كيف حالك؟');
    const response = await result.response;
    const text = response.text();

    console.log('✅ المفتاح يعمل بنجاح!');
    console.log('📝 الرد:', text);

  } catch (error) {
    console.error('❌ خطأ في اختبار المفتاح:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔑 المفتاح غير صالح');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🚫 لا يوجد إذن للوصول');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('📊 تم تجاوز الحد المسموح');
    } else {
      console.error('📋 تفاصيل الخطأ:', error);
    }
  }
}

testSpecificKey();
