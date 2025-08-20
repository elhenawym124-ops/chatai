const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixGeminiKey() {
  console.log('🔧 إصلاح مفتاح Gemini...');
  
  try {
    // تحديث المفتاح الموجود ليستخدم النموذج الصحيح
    const updated = await prisma.geminiKey.updateMany({
      where: { isActive: true },
      data: {
        model: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash - Working'
      }
    });
    
    console.log('✅ تم تحديث', updated.count, 'مفتاح');
    
    // عرض المفاتيح المحدثة
    const keys = await prisma.geminiKey.findMany({
      where: { isActive: true }
    });
    
    keys.forEach(key => {
      console.log('🔑 مفتاح:', key.name);
      console.log('   النموذج:', key.model);
      console.log('   المفتاح:', key.apiKey.substring(0, 20) + '...');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixGeminiKey();
