const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function switchToBackupModel() {
  console.log('🔄 التبديل للنموذج الاحتياطي...\n');
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (keys.length < 2) {
      console.log('❌ لا توجد نماذج احتياطية كافية');
      return;
    }
    
    console.log(`📋 المفاتيح المتاحة:`);
    keys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name} (${key.model}) - نشط: ${key.isActive}`);
    });
    
    // إلغاء تفعيل النموذج الأول (المستنفد)
    const firstKey = keys.find(k => k.model === 'gemini-2.0-flash-exp');
    if (firstKey) {
      await prisma.geminiKey.update({
        where: { id: firstKey.id },
        data: { isActive: false }
      });
      console.log(`❌ تم إلغاء تفعيل: ${firstKey.name}`);
    }
    
    // تفعيل النموذج الثاني (الاحتياطي)
    const secondKey = keys.find(k => k.model === 'gemini-2.5-flash');
    if (secondKey) {
      await prisma.geminiKey.update({
        where: { id: secondKey.id },
        data: { 
          isActive: true,
          usage: JSON.stringify({ used: 0, limit: 1000000, perMinute: 1000 })
        }
      });
      console.log(`✅ تم تفعيل: ${secondKey.name}`);
    }
    
    // عرض الحالة الجديدة
    console.log('\n📊 الحالة الجديدة:');
    const updatedKeys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    updatedKeys.forEach((key, index) => {
      const usage = JSON.parse(key.usage || '{"used": 0, "limit": 1000}');
      console.log(`${index + 1}. ${key.name}:`);
      console.log(`   النموذج: ${key.model}`);
      console.log(`   نشط: ${key.isActive ? '✅' : '❌'}`);
      console.log(`   الاستخدام: ${usage.used}/${usage.limit}`);
      console.log('');
    });
    
    console.log('🎉 تم التبديل بنجاح!');
    console.log('🔄 أعد تشغيل الـ server لتطبيق التغييرات');
    
  } catch (error) {
    console.error('❌ خطأ في التبديل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

switchToBackupModel();
