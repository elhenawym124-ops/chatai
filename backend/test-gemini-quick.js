const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

async function testGeminiQuick() {
  console.log('🧪 اختبار سريع لمفتاح Gemini...');
  
  try {
    // الحصول على مفتاح نشط من قاعدة البيانات
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeKey) {
      console.log('❌ لا يوجد مفتاح Gemini نشط في قاعدة البيانات');
      return;
    }

    console.log('✅ تم العثور على مفتاح نشط:');
    console.log(`   - الاسم: ${activeKey.name}`);
    console.log(`   - النموذج: ${activeKey.model}`);
    console.log(`   - المفتاح: ${activeKey.apiKey.substring(0, 20)}...`);

    // اختبار المفتاح
    console.log('\n🔄 اختبار المفتاح...');
    const genAI = new GoogleGenerativeAI(activeKey.apiKey);
    const model = genAI.getGenerativeModel({ model: activeKey.model });

    const result = await model.generateContent('مرحبا، كيف حالك؟');
    const response = await result.response;
    const text = response.text();

    console.log('✅ المفتاح يعمل بنجاح!');
    console.log('📝 الرد:', text.substring(0, 100) + '...');

  } catch (error) {
    console.error('❌ خطأ في اختبار المفتاح:', error.message);
    console.error('📋 التفاصيل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGeminiQuick();
