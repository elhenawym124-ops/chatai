const { PrismaClient } = require('@prisma/client');

async function checkConversationHistory() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 فحص تاريخ المحادثات...\n');
    
    // Get recent messages
    const messages = await prisma.message.findMany({
      where: {
        conversation: {
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });
    
    console.log(`📊 إجمالي الرسائل الأخيرة: ${messages.length}`);
    console.log('\n📝 آخر 10 رسائل:');
    
    messages.forEach((msg, i) => {
      const sender = msg.isFromCustomer ? 'عميل' : 'بوت';
      const time = new Date(msg.createdAt).toLocaleTimeString('ar-EG');
      console.log(`${i+1}. [${sender}] ${msg.content.substring(0, 50)}... (${time})`);
    });
    
    // Check memory settings
    const aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    
    if (aiSettings && aiSettings.memorySettings) {
      const memorySettings = JSON.parse(aiSettings.memorySettings);
      console.log('\n🧠 إعدادات الذاكرة الحالية:');
      console.log(`   عدد الرسائل: ${memorySettings.conversationMemoryLimit}`);
      console.log(`   نوع الذاكرة: ${memorySettings.memoryType}`);
      console.log(`   مدة الاحتفاظ: ${memorySettings.memoryDuration} ساعة`);
      console.log(`   الذاكرة الذكية: ${memorySettings.enableContextualMemory ? 'مفعلة' : 'معطلة'}`);
      
      console.log('\n✅ النتيجة:');
      if (messages.length >= memorySettings.conversationMemoryLimit) {
        console.log(`   النظام سيستخدم آخر ${memorySettings.conversationMemoryLimit} رسالة من أصل ${messages.length}`);
      } else {
        console.log(`   النظام سيستخدم جميع الـ ${messages.length} رسائل المتاحة`);
      }
    } else {
      console.log('\n⚠️ لم يتم العثور على إعدادات الذاكرة - سيستخدم الافتراضي (3 رسائل)');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkConversationHistory();
}

module.exports = { checkConversationHistory };
