const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getRealUserId() {
  console.log('🔍 Getting Real User ID from Database...\n');
  
  try {
    // البحث عن آخر محادثة حقيقية
    const recentConversations = await prisma.conversation.findMany({
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: 10,
      include: {
        customer: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    console.log(`📋 Found ${recentConversations.length} recent conversations:`);

    recentConversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. Conversation ID: ${conv.id}`);
      console.log(`   Customer: ${conv.customer?.name || 'Unknown'}`);
      console.log(`   Channel: ${conv.channel || 'Not set'}`);
      console.log(`   Last Message: ${conv.lastMessageAt}`);
      console.log(`   Messages Count: ${conv.messages.length}`);
      if (conv.messages.length > 0) {
        console.log(`   Last Message Content: ${conv.messages[0].content?.substring(0, 50)}...`);
      }
    });

    // البحث عن رسائل حديثة
    console.log('\n📨 Recent Messages:');
    const recentMessages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        conversation: {
          include: {
            customer: true
          }
        }
      }
    });

    recentMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.id}`);
      console.log(`   Content: ${msg.content?.substring(0, 50)}...`);
      console.log(`   From Customer: ${msg.isFromCustomer}`);
      console.log(`   Channel: ${msg.conversation.channel || 'Not set'}`);
      console.log(`   Customer Name: ${msg.conversation.customer?.name || 'Unknown'}`);
      console.log(`   Created: ${msg.createdAt}`);
    });

    // البحث في جدول العملاء عن Facebook IDs
    console.log('\n👥 Facebook Customers:');
    const facebookCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { facebookId: { not: null } },
          { phone: { not: null } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    facebookCustomers.forEach((customer, index) => {
      console.log(`\n${index + 1}. Customer: ${customer.name}`);
      console.log(`   Facebook ID: ${customer.facebookId || 'Not set'}`);
      console.log(`   Phone: ${customer.phone || 'Not set'}`);
      console.log(`   Email: ${customer.email || 'Not set'}`);
      console.log(`   Created: ${customer.createdAt}`);
    });

    // اقتراح User ID للاختبار
    const validUserIds = [
      ...facebookCustomers.map(c => c.facebookId).filter(id => id)
    ];

    if (validUserIds.length > 0) {
      console.log('\n✅ Valid User IDs for testing:');
      [...new Set(validUserIds)].forEach((id, index) => {
        console.log(`   ${index + 1}. ${id}`);
      });
    } else {
      console.log('\n⚠️ No valid Facebook User IDs found in database');
      console.log('💡 Suggestion: Send a message to your Facebook page first to get a valid User ID');
    }

  } catch (error) {
    console.error('❌ Error getting user ID:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getRealUserId();
