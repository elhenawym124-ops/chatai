const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleDebugMessages() {
  try {
    console.log('🔍 Simple debug for messages...\n');
    
    // First, let's see what conversations exist (simple query)
    console.log('1️⃣ Checking conversations:');
    const conversations = await prisma.conversation.findMany({
      take: 5
    });
    
    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}, Customer ID: ${conv.customerId}`);
    });
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found!');
      return;
    }
    
    // Now let's check messages for the first conversation
    const firstConv = conversations[0];
    console.log(`\n2️⃣ Checking messages for conversation ${firstConv.id}:`);
    
    // Raw query for messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: firstConv.id
      }
    });
    
    console.log(`Found ${messages.length} messages:`);
    
    if (messages.length > 0) {
      messages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.isFromCustomer ? '👤' : '🎧'} "${msg.content.substring(0, 50)}..."`);
        console.log(`      - ID: ${msg.id}`);
        console.log(`      - Type: ${msg.type}`);
        console.log(`      - Created: ${msg.createdAt}`);
        console.log(`      - From Customer: ${msg.isFromCustomer}`);
        console.log(`      - Is Read: ${msg.isRead}`);
        console.log('');
      });
    } else {
      console.log('  ❌ No messages found for this conversation');
    }
    
    // Let's also check total messages in database
    console.log('\n3️⃣ Total messages in database:');
    const totalMessages = await prisma.message.count();
    console.log(`Total messages: ${totalMessages}`);
    
    if (totalMessages > 0) {
      console.log('\n📊 Sample messages from database:');
      const sampleMessages = await prisma.message.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      sampleMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. Conversation: ${msg.conversationId}`);
        console.log(`      Content: "${msg.content.substring(0, 50)}..."`);
        console.log(`      From Customer: ${msg.isFromCustomer}`);
        console.log('');
      });
    }
    
    // Now let's test the exact API call that's failing
    console.log('\n4️⃣ Testing API call simulation:');
    console.log(`Testing: GET /api/v1/conversations/${firstConv.id}/messages`);
    
    try {
      const apiMessages = await prisma.message.findMany({
        where: {
          conversationId: firstConv.id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      console.log(`API query returned: ${apiMessages.length} messages`);
      
      if (apiMessages.length > 0) {
        console.log('✅ API query successful! Messages found:');
        apiMessages.forEach((msg, index) => {
          console.log(`  ${index + 1}. "${msg.content.substring(0, 30)}..."`);
        });
      } else {
        console.log('❌ API query returned empty result');
      }
      
    } catch (apiError) {
      console.error('❌ API query failed:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleDebugMessages();
