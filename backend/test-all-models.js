const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAllModels() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCgrI96CyFIhT6D_RjiWYaghI-hZYUpPQE';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.5-pro', 
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];
  
  console.log('🧪 اختبار النماذج المختلفة...');
  console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
  console.log('');
  
  const workingModels = [];
  const failedModels = [];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`🔄 اختبار ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const startTime = Date.now();
      const result = await model.generateContent('اختبار بسيط');
      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();
      
      console.log(`✅ ${modelName}: يعمل بنجاح`);
      console.log(`   الرد: ${text.substring(0, 50)}...`);
      console.log(`   الوقت: ${endTime - startTime}ms`);
      
      workingModels.push({
        model: modelName,
        status: 'working',
        responseTime: endTime - startTime,
        response: text.substring(0, 50)
      });
      
    } catch (error) {
      console.log(`❌ ${modelName}: ${error.message}`);
      console.log(`   كود الخطأ: ${error.status || 'غير محدد'}`);
      
      failedModels.push({
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
  
  console.log('\n✅ النماذج التي تعمل:');
  if (workingModels.length === 0) {
    console.log('   لا توجد نماذج تعمل');
  } else {
    workingModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.model} (${model.responseTime}ms)`);
    });
  }
  
  console.log('\n❌ النماذج التي لا تعمل:');
  if (failedModels.length === 0) {
    console.log('   جميع النماذج تعمل');
  } else {
    failedModels.forEach((model, index) => {
      console.log(`   ${index + 1}. ${model.model} - ${model.error}`);
    });
  }
  
  console.log('\n🎯 التوصية:');
  if (workingModels.length > 0) {
    const fastest = workingModels.reduce((prev, current) => 
      prev.responseTime < current.responseTime ? prev : current
    );
    console.log(`   استخدم: ${fastest.model} (الأسرع: ${fastest.responseTime}ms)`);
  } else {
    console.log('   لا توجد نماذج متاحة - تحقق من مفتاح API');
  }
}

testAllModels();
