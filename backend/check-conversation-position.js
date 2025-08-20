const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConversation() {
  try {
    const targetCustomerId = 'cmdy803ig00klufgs3dzk7n3p';
    const conversation = await prisma.conversation.findFirst({
      where: {
        customerId: targetCustomerId
      },
      include: {
        customer: true
      }
    });
    
    if (conversation) {
      console.log('✅ المحادثة موجودة:');
      console.log('ID:', conversation.id);
      console.log('Created At:', conversation.createdAt);
      console.log('Last Message At:', conversation.lastMessageAt);
      console.log('Last Message:', conversation.lastMessage);
      console.log('Status:', conversation.status);
      
      // فحص ترتيب المحادثة
      const allConversations = await prisma.conversation.findMany({
        orderBy: {
          lastMessageAt: 'desc'
        },
        select: {
          id: true,
          lastMessageAt: true,
          createdAt: true
        }
      });
      
      const position = allConversations.findIndex(conv => conv.id === conversation.id);
      console.log(`ترتيب المحادثة: ${position + 1} من ${allConversations.length}`);
      
      if (position >= 50) {
        console.log('⚠️ المحادثة خارج أول 50 محادثة!');
        console.log('السبب: lastMessageAt قديم أو null');
      }
      
    } else {
      console.log('❌ المحادثة غير موجودة');
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversation();
