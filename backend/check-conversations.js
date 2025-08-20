const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConversations() {
  console.log('🔍 فحص المحادثات الموجودة...\n');

  try {
    // جلب المحادثات مع بيانات العملاء
    const conversations = await prisma.conversation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            facebookId: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3 // آخر 3 رسائل فقط
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`✅ تم العثور على ${conversations.length} محادثة:\n`);

    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. محادثة: ${conv.id}`);
      const customerName = conv.customer ? `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() : 'غير محدد';
      console.log(`   📱 العميل: ${customerName} (${conv.customer?.email || 'لا يوجد إيميل'})`);
      console.log(`   📊 الحالة: ${conv.status}`);
      console.log(`   📅 آخر تحديث: ${conv.updatedAt}`);
      console.log(`   💬 عدد الرسائل: ${conv.messages.length > 0 ? 'يوجد رسائل' : 'لا توجد رسائل'}`);

      if (conv.messages.length > 0) {
        const senderType = conv.messages[0].isFromCustomer ? 'عميل' : 'موظف';
        console.log(`   📝 آخر رسالة: "${conv.messages[0].content?.substring(0, 50)}..." (${senderType})`);
      }
      console.log('   ─'.repeat(40));
    });

    // اختيار أول محادثة لاختبار الذكاء الصناعي
    if (conversations.length > 0) {
      const testConversation = conversations[0];
      console.log(`\n🧪 سيتم اختبار الذكاء الصناعي على المحادثة: ${testConversation.id}`);
      const customerName = testConversation.customer ? `${testConversation.customer.firstName || ''} ${testConversation.customer.lastName || ''}`.trim() : 'غير محدد';
      console.log(`👤 العميل: ${customerName}`);

      return testConversation.id;
    } else {
      console.log('❌ لا توجد محادثات للاختبار');
      return null;
    }

  } catch (error) {
    console.error('❌ خطأ في فحص المحادثات:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkConversations().then(conversationId => {
  if (conversationId) {
    console.log(`\n✅ معرف المحادثة للاختبار: ${conversationId}`);
  }
}).catch(console.error);
