const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAPI() {
  try {
    console.log('🔍 فحص API المحادثات...');
    
    // محاكاة نفس الاستعلام المستخدم في API
    const conversations = await prisma.conversation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            facebookId: true,
          }
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                isFromCustomer: true,
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      },
      take: 50
    });

    console.log(`عدد المحادثات: ${conversations.length}`);
    
    // البحث عن العميل المطلوب
    const targetCustomerId = 'cmdy803ig00klufgs3dzk7n3p';
    const targetConversation = conversations.find(conv => 
      conv.customerId === targetCustomerId
    );
    
    if (targetConversation) {
      console.log('✅ وُجدت المحادثة في قاعدة البيانات:');
      console.log('ID:', targetConversation.id);
      console.log('Customer ID:', targetConversation.customerId);
      console.log('Customer Name:', `${targetConversation.customer.firstName} ${targetConversation.customer.lastName}`.trim());
      console.log('Facebook ID:', targetConversation.customer.facebookId);
      console.log('Last Message:', targetConversation.lastMessage);
      console.log('Last Message At:', targetConversation.lastMessageAt);
      console.log('Created At:', targetConversation.createdAt);
      
      // تحويل البيانات كما يحدث في API
      const transformed = {
        id: targetConversation.id,
        customerId: targetConversation.customerId,
        customerName: `${targetConversation.customer.firstName || ''} ${targetConversation.customer.lastName || ''}`.trim() || 'عميل',
        customerEmail: targetConversation.customer.email,
        customerPhone: targetConversation.customer.phone,
        lastMessage: targetConversation.lastMessage || 'لا توجد رسائل',
        lastMessageTime: targetConversation.lastMessageAt || targetConversation.createdAt,
        timestamp: targetConversation.lastMessageAt || targetConversation.createdAt,
        unreadCount: targetConversation._count.messages,
        platform: targetConversation.channel?.toLowerCase() || 'facebook',
        status: targetConversation.status?.toLowerCase() || 'active',
      };
      
      console.log('\n📋 البيانات المُحولة:');
      console.log(JSON.stringify(transformed, null, 2));
      
    } else {
      console.log('❌ لم توجد المحادثة');
      
      // عرض أول 5 محادثات
      console.log('\nأول 5 محادثات:');
      conversations.slice(0, 5).forEach((conv, index) => {
        const customerName = `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() || 'عميل';
        console.log(`${index + 1}. ${customerName} - ${conv.customerId} - ${conv.customer.facebookId}`);
      });
    }
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAPI();
