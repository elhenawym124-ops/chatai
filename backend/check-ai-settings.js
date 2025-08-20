const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAISettings() {
  console.log('🔍 فحص إعدادات الذكاء الصناعي...');
  
  try {
    // فحص مفاتيح Gemini
    console.log('\n🔑 مفاتيح Gemini:');
    const geminiKeys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (geminiKeys.length === 0) {
      console.log('❌ لا توجد مفاتيح Gemini في قاعدة البيانات');
    } else {
      console.log(`✅ تم العثور على ${geminiKeys.length} مفتاح:`);
      
      geminiKeys.forEach((key, index) => {
        console.log(`\n${index + 1}. ${key.name}`);
        console.log(`   ID: ${key.id}`);
        console.log(`   Model: ${key.model}`);
        console.log(`   Active: ${key.isActive}`);
        console.log(`   API Key: ${key.apiKey.substring(0, 20)}...`);
        console.log(`   Usage: ${key.usage}`);
        console.log(`   Created: ${key.createdAt}`);
      });
    }
    
    // فحص إعدادات AI للشركات
    console.log('\n⚙️ إعدادات AI للشركات:');
    const aiSettings = await prisma.aiSettings.findMany({
      include: {
        company: {
          select: { name: true }
        }
      }
    });
    
    if (aiSettings.length === 0) {
      console.log('❌ لا توجد إعدادات AI للشركات');
    } else {
      console.log(`✅ تم العثور على ${aiSettings.length} إعداد:`);
      
      aiSettings.forEach((setting, index) => {
        console.log(`\n${index + 1}. ${setting.company?.name || 'Unknown Company'}`);
        console.log(`   Company ID: ${setting.companyId}`);
        console.log(`   Auto Reply: ${setting.autoReplyEnabled}`);
        console.log(`   Confidence Threshold: ${setting.confidenceThreshold}`);
        console.log(`   Max Response Delay: ${setting.maxResponseDelay}`);
        console.log(`   Model: ${setting.model}`);
        console.log(`   Temperature: ${setting.temperature}`);
        console.log(`   Max Tokens: ${setting.maxTokens}`);
        console.log(`   Updated: ${setting.updatedAt}`);
      });
    }
    
    // فحص متغيرات البيئة
    console.log('\n🌍 متغيرات البيئة:');
    console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 20) + '...' : 'غير موجود'}`);
    console.log(`   GOOGLE_GEMINI_API_KEY: ${process.env.GOOGLE_GEMINI_API_KEY ? process.env.GOOGLE_GEMINI_API_KEY.substring(0, 20) + '...' : 'غير موجود'}`);
    
    // اختبار مفتاح Gemini
    console.log('\n🧪 اختبار مفتاح Gemini:');
    const testKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (testKey) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(testKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const result = await model.generateContent('مرحباً');
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ مفتاح Gemini يعمل بنجاح');
        console.log(`   الرد: ${text.substring(0, 50)}...`);
      } catch (error) {
        console.log('❌ مفتاح Gemini لا يعمل:', error.message);
      }
    } else {
      console.log('❌ لا يوجد مفتاح Gemini في متغيرات البيئة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص إعدادات AI:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ تم إنهاء الفحص');
  }
}

checkAISettings();
