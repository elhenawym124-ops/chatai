const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConversationsData() {
  try {
    console.log('🔍 Checking conversations and messages in database...\n');
    
    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        _count: {
          select: {
            messages: true
          }
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });
    
    console.log(`📞 Found ${conversations.length} conversations:`);
    conversations.forEach(conv => {
      const customerName = conv.customer ? `${conv.customer.firstName} ${conv.customer.lastName}` : conv.customerName || 'Unknown';
      console.log(`  - ID: ${conv.id}, Customer: ${customerName}, Messages: ${conv._count.messages}`);
    });
    
    console.log('\n📨 Checking messages for each conversation:');
    
    for (const conv of conversations) {
      const messages = await prisma.message.findMany({
        where: {
          conversationId: conv.id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      const customerName = conv.customer ? `${conv.customer.firstName} ${conv.customer.lastName}` : conv.customerName || 'Unknown';
      console.log(`\n  Conversation ${conv.id} (${customerName}):`);
      if (messages.length === 0) {
        console.log('    ❌ No messages found');
      } else {
        messages.forEach(msg => {
          console.log(`    - ${msg.isFromCustomer ? '👤' : '🎧'} ${msg.content.substring(0, 50)}...`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConversationsData();
