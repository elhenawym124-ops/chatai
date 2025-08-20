const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetUsageCounters() {
  console.log('🔄 إعادة تعيين عدادات الاستخدام...\n');
  
  try {
    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    if (keys.length === 0) {
      console.log('❌ لا توجد مفاتيح في قاعدة البيانات');
      return;
    }
    
    console.log(`📋 تم العثور على ${keys.length} مفتاح:`);
    
    for (const key of keys) {
      // قراءة البيانات الحالية
      let usageData = { used: 0, limit: 1500, perMinute: 10 };
      try {
        if (key.usage) {
          const currentUsage = JSON.parse(key.usage);
          usageData = {
            used: 0, // إعادة تعيين العداد
            limit: currentUsage.limit || 1500,
            perMinute: currentUsage.perMinute || 10
          };
        }
      } catch (error) {
        console.log(`⚠️ خطأ في قراءة بيانات ${key.name}، استخدام القيم الافتراضية`);
        
        // تعيين القيم الافتراضية حسب النموذج
        if (key.model === 'gemini-2.0-flash-exp') {
          usageData = { used: 0, limit: 50, perMinute: 10 }; // Free tier
        } else if (key.model === 'gemini-1.5-flash') {
          usageData = { used: 0, limit: 1500, perMinute: 15 };
        } else if (key.model === 'gemini-2.5-flash') {
          usageData = { used: 0, limit: 1000000, perMinute: 1000 };
        }
      }
      
      // تحديث قاعدة البيانات
      await prisma.geminiKey.update({
        where: { id: key.id },
        data: {
          usage: JSON.stringify(usageData),
          currentUsage: 0
        }
      });
      
      console.log(`✅ ${key.name}:`);
      console.log(`   النموذج: ${key.model}`);
      console.log(`   العداد: ${usageData.used}/${usageData.limit}`);
      console.log(`   نشط: ${key.isActive}`);
      console.log('');
    }
    
    console.log('🎉 تم إعادة تعيين جميع العدادات بنجاح!');
    console.log('\n🔄 النظام جاهز للاختبار مع العدادات المحدثة');
    
  } catch (error) {
    console.error('❌ خطأ في إعادة تعيين العدادات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetUsageCounters();
