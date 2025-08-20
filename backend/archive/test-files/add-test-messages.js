const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestMessages() {
  try {
    console.log('🔍 Adding test messages to existing conversations...\n');
    
    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      select: {
        id: true,
        customerName: true,
        customerId: true
      }
    });
    
    console.log(`📞 Found ${conversations.length} conversations`);
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found. Please create conversations first.');
      return;
    }
    
    // Add test messages for each conversation
    for (const conv of conversations) {
      console.log(`\n📨 Adding messages for conversation ${conv.id} (${conv.customerName || 'Unknown'})...`);
      
      // Check if conversation already has messages
      const existingMessages = await prisma.message.count({
        where: { conversationId: conv.id }
      });
      
      if (existingMessages > 0) {
        console.log(`  ⚠️ Conversation already has ${existingMessages} messages, skipping...`);
        continue;
      }
      
      // Create test messages
      const testMessages = [
        {
          conversationId: conv.id,
          content: 'مرحباً، أحتاج مساعدة في طلبي',
          isFromCustomer: true,
          type: 'TEXT',
          isRead: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        },
        {
          conversationId: conv.id,
          content: 'مرحباً بك! كيف يمكنني مساعدتك؟',
          isFromCustomer: false,
          type: 'TEXT',
          isRead: true,
          createdAt: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago
        },
        {
          conversationId: conv.id,
          content: 'أريد معرفة حالة طلبي رقم #12345',
          isFromCustomer: true,
          type: 'TEXT',
          isRead: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        },
        {
          conversationId: conv.id,
          content: 'سأتحقق من حالة طلبك الآن. يرجى الانتظار قليلاً.',
          isFromCustomer: false,
          type: 'TEXT',
          isRead: true,
          createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        },
        {
          conversationId: conv.id,
          content: 'طلبك قيد التجهيز وسيتم شحنه خلال 24 ساعة',
          isFromCustomer: false,
          type: 'TEXT',
          isRead: true,
          createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        }
      ];
      
      // Insert messages
      for (const msgData of testMessages) {
        await prisma.message.create({
          data: msgData
        });
      }
      
      // Update conversation with last message info
      await prisma.conversation.update({
        where: { id: conv.id },
        data: {
          lastMessageAt: new Date(Date.now() - 10 * 60 * 1000),
          lastMessagePreview: 'طلبك قيد التجهيز وسيتم شحنه خلال 24 ساعة'
        }
      });
      
      console.log(`  ✅ Added ${testMessages.length} test messages`);
    }
    
    console.log('\n🎉 Test messages added successfully!');
    console.log('\n📊 Summary:');
    
    // Show final summary
    for (const conv of conversations) {
      const messageCount = await prisma.message.count({
        where: { conversationId: conv.id }
      });
      console.log(`  - Conversation ${conv.id}: ${messageCount} messages`);
    }
    
  } catch (error) {
    console.error('❌ Error adding test messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestMessages();
