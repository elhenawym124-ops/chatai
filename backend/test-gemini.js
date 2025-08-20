const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 اختبار Gemini API...');
  
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCgrI96CyFIhT6D_RjiWYaghI-hZYUpPQE';
  console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // جرب النماذج المختلفة
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    for (const modelName of models) {
      try {
        console.log(`🔄 جاري اختبار النموذج: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log('📤 إرسال رسالة اختبار...');
        const result = await model.generateContent('مرحباً، كيف حالك؟');
        const response = await result.response;
        const text = response.text();

        console.log(`✅ نجح النموذج ${modelName}:`);
        console.log(text);

        return { success: true, response: text, model: modelName };
      } catch (modelError) {
        console.log(`❌ فشل النموذج ${modelName}:`, modelError.message);
        continue;
      }
    }

    console.log('❌ جميع النماذج فشلت');
    return { success: false, error: 'No working models found' };
  } catch (error) {
    console.error('❌ خطأ في Gemini API:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Details:', error.details || error.response?.data);
    
    return { success: false, error: error.message };
  }
}

testGemini();
