const aiAgentService = require('./src/services/aiAgentService');

async function testAIAgentKey() {
  console.log('🧪 اختبار دالة getActiveGeminiKey في AI Agent...');
  
  try {
    const geminiConfig = await aiAgentService.getActiveGeminiKey();
    
    if (!geminiConfig) {
      console.log('❌ لم يتم العثور على مفتاح Gemini نشط');
      return;
    }

    console.log('✅ تم العثور على مفتاح نشط:');
    console.log(`   - المفتاح: ${geminiConfig.apiKey.substring(0, 20)}...`);
    console.log(`   - النموذج: ${geminiConfig.model}`);

    // اختبار المفتاح
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
    const model = genAI.getGenerativeModel({ model: geminiConfig.model });

    console.log('\n🔄 اختبار المفتاح...');
    const result = await model.generateContent('مرحبا');
    const response = await result.response;
    const text = response.text();

    console.log('✅ المفتاح يعمل في AI Agent!');
    console.log('📝 الرد:', text.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ خطأ في AI Agent:', error.message);
    console.error('📋 التفاصيل:', error);
  }
}

testAIAgentKey();
