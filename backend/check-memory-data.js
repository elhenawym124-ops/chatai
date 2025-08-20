const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMemoryData() {
  console.log('🔍 Checking conversation memory data...\n');
  
  try {
    // Check conversation memory table
    const memoryRecords = await prisma.conversationMemory.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10
    });
    
    console.log(`📊 Found ${memoryRecords.length} memory records:`);
    
    memoryRecords.forEach((record, index) => {
      console.log(`\n${index + 1}. Memory Record:`);
      console.log(`   ID: ${record.id}`);
      console.log(`   Conversation: ${record.conversationId}`);
      console.log(`   Sender: ${record.senderId}`);
      console.log(`   User Message: "${record.userMessage}"`);
      console.log(`   AI Response: "${record.aiResponse.substring(0, 100)}..."`);
      console.log(`   Intent: ${record.intent}`);
      console.log(`   Sentiment: ${record.sentiment}`);
      console.log(`   Timestamp: ${record.timestamp}`);
    });
    
    // Check if memory is being retrieved correctly
    console.log('\n🧠 Testing memory retrieval...');
    
    if (memoryRecords.length > 0) {
      const testConversationId = memoryRecords[0].conversationId;
      const testSenderId = memoryRecords[0].senderId;
      
      const memoryForConversation = await prisma.conversationMemory.findMany({
        where: {
          conversationId: testConversationId,
          senderId: testSenderId
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      });
      
      console.log(`✅ Retrieved ${memoryForConversation.length} memory records for conversation ${testConversationId}`);
    }
    
    // Check recent conversations
    console.log('\n💬 Recent conversations:');
    const recentConversations = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 5,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            facebookId: true
          }
        }
      }
    });
    
    recentConversations.forEach((conv, index) => {
      console.log(`${index + 1}. Conversation ${conv.id}`);
      console.log(`   Customer: ${conv.customer.firstName} ${conv.customer.lastName} (${conv.customer.facebookId})`);
      console.log(`   Last Message: ${conv.lastMessageAt}`);
      console.log(`   Status: ${conv.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking memory data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMemoryData();
