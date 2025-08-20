const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMessages() {
  try {
    const conversationId = 'cmdy803x300knufgsfunfmaao';
    console.log('🔍 فحص رسائل المحادثة:', conversationId);
    
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`عدد الرسائل: ${messages.length}`);
    messages.forEach((msg, index) => {
      console.log(`رسالة ${index + 1}:`);
      console.log(`  المرسل: ${msg.senderId}`);
      console.log(`  النوع: ${msg.senderType}`);
      console.log(`  المحتوى: ${msg.content.substring(0, 100)}...`);
      console.log(`  التاريخ: ${msg.createdAt}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMessages();
