const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNewModels() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCgrI96CyFIhT6D_RjiWYaghI-hZYUpPQE';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // النماذج الجديدة المتاحة حسب الوثائق الرسمية
  const modelsToTest = [
    'gemini-2.5-flash',      // الأفضل سعر/أداء
    'gemini-2.5-flash-lite', // الأسرع والأوفر
    'gemini-2.5-pro',        // الأقوى
    'gemini-2.0-flash',      // الجيل الثاني
    'gemini-1.5-flash',      // مستقر (قديم)
    'gemini-1.5-pro'         // مستقر (قديم)
  ];
  
  console.log('🧪 اختبار النماذج الجديدة المتاحة...');
  console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
  console.log('');
  
  const results = [];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`🔄 اختبار ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const startTime = Date.now();
      const result = await model.generateContent('مرحباً، كيف حالك؟');
      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();
      
      console.log(`✅ ${modelName}: يعمل بنجاح`);
      console.log(`   الرد: ${text.substring(0, 50)}...`);
      console.log(`   الوقت: ${endTime - startTime}ms`);
      
      results.push({
        model: modelName,
        status: 'working',
        responseTime: endTime - startTime,
        response: text.substring(0, 50)
      });
      
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message}`);
      
      results.push({
        model: modelName,
        status: 'failed',
        error: error.message,
        errorCode: error.status
      });
    }
    console.log('');
  }
  
  console.log('📊 ملخص النتائج:');
  console.log('================');
  
  const working = results.filter(r => r.status === 'working');
  const failed = results.filter(r => r.status === 'failed');
  
  console.log('\n✅ النماذج التي تعمل:');
  working.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model.model} (${model.responseTime}ms)`);
  });
  
  console.log('\n❌ النماذج التي لا تعمل:');
  failed.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model.model} - ${model.error}`);
  });
  
  if (working.length > 0) {
    const fastest = working.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );
    console.log(`\n🎯 الأسرع: ${fastest.model} (${fastest.responseTime}ms)`);
    
    const recommended = working.find(m => m.model === 'gemini-2.5-flash') || working[0];
    console.log(`🏆 المُوصى به: ${recommended.model}`);
  }
  
  return results;
}

testNewModels();
