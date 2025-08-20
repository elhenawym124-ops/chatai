const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugMessagesQuery() {
  try {
    console.log('🔍 Debugging messages query...\n');
    
    // First, let's see what conversations exist
    console.log('1️⃣ Checking conversations:');
    const conversations = await prisma.conversation.findMany({
      select: {
        id: true,
        customerId: true,
        createdAt: true,
        status: true,
        lastMessageAt: true
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 5
    });
    
    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach(conv => {
      const customerName = conv.customer ? `${conv.customer.firstName} ${conv.customer.lastName}` : 'Unknown';
      console.log(`  - ID: ${conv.id}, Customer: ${customerName}`);
    });
    
    // Now let's check messages for each conversation
    console.log('\n2️⃣ Checking messages for each conversation:');
    
    for (const conv of conversations) {
      console.log(`\n📨 Conversation ${conv.id}:`);
      
      // Raw query without any filters
      const allMessages = await prisma.message.findMany({
        where: {
          conversationId: conv.id
        },
        select: {
          id: true,
          content: true,
          isFromCustomer: true,
          createdAt: true,
          type: true,
          isRead: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      console.log(`  Total messages: ${allMessages.length}`);
      
      if (allMessages.length > 0) {
        console.log('  Messages:');
        allMessages.forEach((msg, index) => {
          console.log(`    ${index + 1}. ${msg.isFromCustomer ? '👤' : '🎧'} "${msg.content.substring(0, 50)}..." (${msg.type}, Read: ${msg.isRead})`);
        });
        
        // Now let's test the exact same query used in the API
        console.log('\n  🔬 Testing API query format:');
        const apiMessages = await prisma.message.findMany({
          where: {
            conversationId: conv.id
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
        
        console.log(`  API query returned: ${apiMessages.length} messages`);
        
        if (apiMessages.length > 0) {
          console.log('  API format messages:');
          apiMessages.forEach((msg, index) => {
            const transformedMsg = {
              id: msg.id,
              content: msg.content,
              isFromCustomer: msg.isFromCustomer,
              timestamp: msg.createdAt,
              senderName: msg.isFromCustomer ? 'Customer' : (msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Support Agent'),
              type: msg.type,
              attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
              isRead: msg.isRead,
              readAt: msg.readAt,
            };
            console.log(`    ${index + 1}. Transformed: ${JSON.stringify(transformedMsg, null, 2)}`);
          });
        }
        
        // Test the exact API endpoint simulation
        console.log('\n  🌐 Simulating API response:');
        const apiResponse = {
          success: true,
          data: apiMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isFromCustomer: msg.isFromCustomer,
            timestamp: msg.createdAt,
            senderName: msg.isFromCustomer ? 'Customer' : (msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Support Agent'),
            type: msg.type,
            attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
            isRead: msg.isRead,
            readAt: msg.readAt,
          })),
          pagination: {
            page: 1,
            limit: 100,
            total: apiMessages.length,
            pages: 1
          }
        };
        
        console.log(`  API Response: ${JSON.stringify(apiResponse, null, 2)}`);
        
      } else {
        console.log('  ❌ No messages found');
      }
    }
    
    // Let's also check if there are any messages without conversation reference
    console.log('\n3️⃣ Checking orphaned messages:');
    const orphanedMessages = await prisma.message.findMany({
      where: {
        conversationId: {
          notIn: conversations.map(c => c.id)
        }
      },
      take: 10
    });
    
    console.log(`Found ${orphanedMessages.length} orphaned messages`);
    if (orphanedMessages.length > 0) {
      orphanedMessages.forEach(msg => {
        console.log(`  - Message ${msg.id} references conversation ${msg.conversationId} (not found)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging messages:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugMessagesQuery();
