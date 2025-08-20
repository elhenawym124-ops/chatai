const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentMessages() {
  try {
    console.log('🔍 البحث عن الرسائل الحديثة...');
    
    // البحث عن الرسائل التي تحتوي على سؤال عن اسم الشركة
    const companyNameMessages = await prisma.message.findMany({
      where: {
        content: {
          contains: 'شركتكم',
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });

    console.log(`📨 وجدت ${companyNameMessages.length} رسائل تحتوي على سؤال عن اسم الشركة:`);
    
    companyNameMessages.forEach((msg, index) => {
      const metadata = JSON.parse(msg.metadata || '{}');
      console.log(`\n--- رسالة ${index + 1} ---`);
      console.log(`📨 ID: ${msg.id}`);
      console.log(`📄 المحتوى: ${msg.content}`);
      console.log(`👤 من العميل: ${msg.isFromCustomer ? 'نعم' : 'لا'}`);
      console.log(`🤖 مولدة بالذكاء الصناعي: ${metadata.isAIGenerated || false}`);
      console.log(`🔧 نموذج الذكاء الصناعي: ${metadata.aiModel || 'غير محدد'}`);
      console.log(`⏰ وقت الإنشاء: ${msg.createdAt}`);
      console.log(`👥 العميل: ${msg.conversation?.customer?.firstName} ${msg.conversation?.customer?.lastName}`);
      
      if (metadata.isAIGenerated) {
        console.log(`📊 تفاصيل الذكاء الصناعي:`);
        console.log(`   - الرموز المستخدمة: ${metadata.tokensUsed || 'غير محدد'}`);
        console.log(`   - وقت الاستجابة: ${metadata.responseTime || 'غير محدد'}ms`);
        console.log(`   - مستوى الثقة: ${metadata.confidence || 'غير محدد'}`);
        console.log(`   - خدمة متقدمة: ${metadata.usedAdvancedService ? 'نعم' : 'لا'}`);
      }
    });

    // البحث عن آخر الرسائل بشكل عام
    console.log('\n🔍 آخر 5 رسائل في النظام:');
    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });

    recentMessages.forEach((msg, index) => {
      const metadata = JSON.parse(msg.metadata || '{}');
      console.log(`\n--- رسالة حديثة ${index + 1} ---`);
      console.log(`📄 المحتوى: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      console.log(`🤖 مولدة بالذكاء الصناعي: ${metadata.isAIGenerated || false}`);
      console.log(`⏰ التوقيت: ${msg.createdAt}`);
    });

  } catch (error) {
    console.error('❌ خطأ في البحث:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentMessages();
