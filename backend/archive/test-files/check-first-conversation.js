const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFirstConversation() {
  try {
    console.log('🔍 فحص المحادثات من فيسبوك...\n');
    
    const conversations = await prisma.conversation.findMany({
      where: { channel: 'FACEBOOK' },
      include: { 
        customer: true,
        messages: { 
          take: 3, 
          orderBy: { createdAt: 'desc' },
          include: { sender: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 وُجد ${conversations.length} محادثة من فيسبوك:`);
    
    conversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. المحادثة ${conv.id}:`);
      console.log(`   👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
      console.log(`   🆔 معرف فيسبوك: ${conv.customer.facebookId || 'غير متوفر'}`);
      console.log(`   📋 Metadata:`, conv.metadata || 'غير متوفر');
      console.log(`   📅 تاريخ الإنشاء: ${conv.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   💬 عدد الرسائل: ${conv.messages.length}`);
      
      if (conv.messages.length > 0) {
        console.log(`   📝 آخر رسالة: "${conv.messages[0].content.substring(0, 50)}..."`);
        console.log(`   👥 من: ${conv.messages[0].isFromCustomer ? 'العميل' : 'الدعم'}`);
      }
      
      // تحديد إذا كان لديه معرف فيسبوك صحيح
      const hasValidFacebookId = conv.customer.facebookId && 
        conv.customer.facebookId !== 'test_user_final' && 
        /^\d+$/.test(conv.customer.facebookId);
      
      const hasValidMetadataId = conv.metadata && 
        conv.metadata.facebookPageScopedId && 
        conv.metadata.facebookPageScopedId !== 'test_user_final' && 
        /^\d+$/.test(conv.metadata.facebookPageScopedId);
      
      if (hasValidFacebookId || hasValidMetadataId) {
        console.log(`   ✅ معرف فيسبوك صحيح - يمكن إرسال رسائل لهذا العميل`);
      } else {
        console.log(`   ❌ معرف فيسبوك غير صحيح - لا يمكن إرسال رسائل`);
      }
    });
    
    // البحث عن المحادثة الأولى مع معرف صحيح
    const validConversation = conversations.find(conv => {
      const hasValidFacebookId = conv.customer.facebookId && 
        conv.customer.facebookId !== 'test_user_final' && 
        /^\d+$/.test(conv.customer.facebookId);
      
      const hasValidMetadataId = conv.metadata && 
        conv.metadata.facebookPageScopedId && 
        conv.metadata.facebookPageScopedId !== 'test_user_final' && 
        /^\d+$/.test(conv.metadata.facebookPageScopedId);
      
      return hasValidFacebookId || hasValidMetadataId;
    });
    
    if (validConversation) {
      console.log(`\n🎯 المحادثة المناسبة للاختبار:`);
      console.log(`   ID: ${validConversation.id}`);
      console.log(`   العميل: ${validConversation.customer.firstName} ${validConversation.customer.lastName}`);
      
      const recipientId = validConversation.customer.facebookId || 
        (validConversation.metadata && validConversation.metadata.facebookPageScopedId);
      console.log(`   معرف المستلم: ${recipientId}`);
      
      return {
        conversationId: validConversation.id,
        recipientId: recipientId,
        customerName: `${validConversation.customer.firstName} ${validConversation.customer.lastName}`
      };
    } else {
      console.log(`\n❌ لم يتم العثور على محادثة بمعرف فيسبوك صحيح`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
if (require.main === module) {
  checkFirstConversation().then(result => {
    if (result) {
      console.log(`\n✅ جاهز لاختبار الإرسال للمحادثة: ${result.conversationId}`);
    }
  });
}

module.exports = { checkFirstConversation };
