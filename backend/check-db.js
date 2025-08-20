const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database status...');
    
    // Count conversations
    const conversationCount = await prisma.conversation.count();
    console.log(`📊 Total conversations: ${conversationCount}`);
    
    // Count messages
    const messageCount = await prisma.message.count();
    console.log(`💬 Total messages: ${messageCount}`);
    
    // Get recent conversations
    const recentConversations = await prisma.conversation.findMany({
      take: 5,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        customer: true,
        _count: {
          select: { messages: true }
        }
      }
    });
    
    console.log('\n📋 Recent conversations:');
    recentConversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.customer?.firstName || 'Unknown'} - ${conv._count.messages} messages`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
