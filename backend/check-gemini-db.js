const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGeminiDB() {
  console.log('🔍 فحص مفاتيح Gemini في قاعدة البيانات...');
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (keys.length === 0) {
      console.log('❌ لا توجد مفاتيح Gemini في قاعدة البيانات');
      return;
    }

    console.log(`✅ تم العثور على ${keys.length} مفتاح:`);
    
    keys.forEach((key, index) => {
      console.log(`\n${index + 1}. ${key.name}`);
      console.log(`   - ID: ${key.id}`);
      console.log(`   - النموذج: ${key.model}`);
      console.log(`   - نشط: ${key.isActive}`);
      console.log(`   - المفتاح: ${key.apiKey.substring(0, 20)}...${key.apiKey.slice(-4)}`);
      console.log(`   - تاريخ الإنشاء: ${key.createdAt}`);
    });

    // فحص المفتاح النشط
    const activeKey = await prisma.geminiKey.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (activeKey) {
      console.log(`\n🎯 المفتاح النشط: ${activeKey.name}`);
      console.log(`   - النموذج: ${activeKey.model}`);
      console.log(`   - المفتاح الكامل: ${activeKey.apiKey}`);
    } else {
      console.log('\n❌ لا يوجد مفتاح نشط');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeminiDB();
