const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testReplyOnImage() {
  try {
    console.log('🔍 اختبار الـ Reply على الصور...');
    
    // البحث عن رسائل تحتوي على صور
    const messagesWithImages = await prisma.message.findMany({
      where: {
        isFromCustomer: false, // رسائل من النظام
        metadata: {
          contains: '"images"'
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        content: true,
        metadata: true,
        createdAt: true,
        conversation: {
          select: {
            id: true,
            customer: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📸 عدد الرسائل التي تحتوي على صور: ${messagesWithImages.length}`);
    
    messagesWithImages.forEach((message, index) => {
      console.log(`\n${index + 1}. رسالة: ${message.id}`);
      console.log(`   العميل: ${message.conversation.customer.firstName} ${message.conversation.customer.lastName}`);
      console.log(`   التاريخ: ${message.createdAt}`);
      console.log(`   المحتوى: ${message.content.substring(0, 100)}...`);
      
      try {
        const metadata = JSON.parse(message.metadata);
        if (metadata.images && metadata.images.length > 0) {
          console.log(`   عدد الصور: ${metadata.images.length}`);
          metadata.images.forEach((img, imgIndex) => {
            console.log(`     صورة ${imgIndex + 1}: ${img.title || 'بدون عنوان'}`);
          });
        }
      } catch (e) {
        console.log(`   ⚠️ خطأ في تحليل metadata`);
      }
    });
    
    // البحث عن ردود على هذه الرسائل
    console.log('\n🔄 البحث عن ردود على الرسائل التي تحتوي على صور...');
    
    for (const message of messagesWithImages) {
      const replies = await prisma.message.findMany({
        where: {
          conversationId: message.conversation.id,
          isFromCustomer: true,
          createdAt: { gt: message.createdAt }
        },
        orderBy: { createdAt: 'asc' },
        take: 3,
        select: {
          id: true,
          content: true,
          metadata: true,
          createdAt: true
        }
      });
      
      if (replies.length > 0) {
        console.log(`\n📝 ردود على رسالة ${message.id}:`);
        replies.forEach((reply, replyIndex) => {
          console.log(`   ${replyIndex + 1}. "${reply.content}"`);
          
          try {
            const replyMetadata = JSON.parse(reply.metadata);
            if (replyMetadata.replyTo) {
              console.log(`      ↳ رد على: ${replyMetadata.replyTo.messageId}`);
            }
          } catch (e) {
            // تجاهل أخطاء metadata
          }
        });
      }
    }
    
    // فحص آخر محادثة للعميل الحالي
    console.log('\n🔍 فحص آخر محادثة للعميل الحالي...');
    
    const latestConversation = await prisma.conversation.findFirst({
      where: {
        customer: {
          facebookId: '23949903971327041'
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            metadata: true,
            createdAt: true
          }
        }
      }
    });
    
    if (latestConversation) {
      console.log(`\n💬 آخر محادثة: ${latestConversation.id}`);
      console.log(`📅 آخر رسالة: ${latestConversation.lastMessageAt}`);
      console.log(`📝 عدد الرسائل: ${latestConversation.messages.length}`);
      
      latestConversation.messages.forEach((msg, index) => {
        const sender = msg.isFromCustomer ? 'العميل' : 'النظام';
        console.log(`   ${index + 1}. [${sender}] ${msg.content.substring(0, 50)}...`);
        
        try {
          const metadata = JSON.parse(msg.metadata);
          if (metadata.images && metadata.images.length > 0) {
            console.log(`      📸 يحتوي على ${metadata.images.length} صورة`);
          }
          if (metadata.replyTo) {
            console.log(`      🔄 رد على: ${metadata.replyTo.messageId}`);
          }
        } catch (e) {
          // تجاهل أخطاء metadata
        }
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReplyOnImage();
