const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAvailableModels() {
  console.log('🔍 Testing Available Gemini Models...\n');
  
  try {
    // الحصول على المفتاح النشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true }
    });
    
    if (!activeKey) {
      console.log('❌ No active key found');
      return;
    }
    
    console.log('🔑 Current API Key:', activeKey.apiKey.substring(0, 20) + '...');
    console.log('📋 Current Model:', activeKey.model);
    
    // النماذج المتاحة للاختبار
    const modelsToTest = [
      {
        name: 'gemini-1.5-flash',
        description: 'Fast and efficient - 1,500 requests/day',
        quota: '1,500/day'
      },
      {
        name: 'gemini-1.5-pro',
        description: 'More capable - 50 requests/day',
        quota: '50/day'
      },
      {
        name: 'gemini-pro',
        description: 'Legacy model - Good quota',
        quota: 'Variable'
      },
      {
        name: 'gemini-2.0-flash-exp',
        description: 'Experimental 2.0 - Higher quota',
        quota: 'Higher'
      }
    ];
    
    console.log('\n🧪 Testing models with current API key...\n');
    
    const genAI = new GoogleGenerativeAI(activeKey.apiKey);
    
    for (const modelInfo of modelsToTest) {
      try {
        console.log(`🔄 Testing ${modelInfo.name}...`);
        console.log(`   Description: ${modelInfo.description}`);
        console.log(`   Expected Quota: ${modelInfo.quota}`);
        
        const model = genAI.getGenerativeModel({
          model: modelInfo.name,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          }
        });
        
        const result = await model.generateContent('مرحبا، هذا اختبار بسيط');
        const response = await result.response;
        const text = response.text();
        
        console.log(`   ✅ SUCCESS: ${text.substring(0, 50)}...`);
        console.log(`   📊 Model works with current API key`);
        
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        
        if (error.status === 429) {
          console.log(`   🚨 Quota exceeded for ${modelInfo.name}`);
        } else if (error.status === 404) {
          console.log(`   ⚠️ Model ${modelInfo.name} not found or not accessible`);
        } else {
          console.log(`   🔧 Other error: ${error.status || 'Unknown'}`);
        }
      }
      
      console.log('');
      
      // تأخير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎯 Recommendations:');
    console.log('1. gemini-1.5-flash: Best balance of speed and quota (1,500/day)');
    console.log('2. gemini-2.0-flash-exp: Experimental but potentially higher quota');
    console.log('3. gemini-pro: Legacy but stable');
    console.log('4. gemini-1.5-pro: Most capable but lowest quota (50/day)');
    
    console.log('\n💡 Next steps:');
    console.log('- Update to the model with highest available quota');
    console.log('- Test quota limits for each working model');
    console.log('- Implement model rotation based on quota availability');
    
  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAvailableModels();
