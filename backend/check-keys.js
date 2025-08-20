const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentKeys() {
  console.log('🔍 فحص المفاتيح الحالية في قاعدة البيانات...');
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📊 إجمالي المفاتيح:', keys.length);
    console.log('');
    
    keys.forEach((key, index) => {
      let usage = { used: 0, limit: 1000000 };
      try {
        if (key.usage) {
          usage = JSON.parse(key.usage);
        }
      } catch (e) {}
      
      const status = key.isActive ? '🟢 نشط' : '⚪ غير نشط';
      console.log((index + 1) + '. ' + key.name);
      console.log('   النموذج: ' + key.model);
      console.log('   الحالة: ' + status);
      console.log('   الاستخدام: ' + usage.used + '/' + usage.limit);
      console.log('   المفتاح: ' + key.apiKey.substring(0, 20) + '...');
      console.log('   تاريخ الإنشاء: ' + key.createdAt.toLocaleDateString());
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentKeys();
