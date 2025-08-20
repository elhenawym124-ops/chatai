const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function findRealConversations() {
  console.log('🔍 البحث عن محادثات حقيقية من فيسبوك...\n');
  
  try {
    // البحث عن جميع محادثات فيسبوك
    const conversations = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK'
      },
      include: {
        customer: true,
        messages: {
          take: 2,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 وُجد ${conversations.length} محادثة من فيسبوك:`);
    
    let realConversations = [];
    
    conversations.forEach((conv, index) => {
      console.log(`\n${index + 1}. المحادثة ${conv.id}:`);
      console.log(`   👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
      
      // البحث عن معرف فيسبوك في أماكن مختلفة
      const facebookId = conv.customer.facebookId || 
        (conv.metadata && conv.metadata.facebookPageScopedId);
      
      console.log(`   🆔 معرف فيسبوك: ${facebookId || 'غير متوفر'}`);
      console.log(`   📋 Metadata:`, conv.metadata || 'غير متوفر');
      console.log(`   📅 تاريخ الإنشاء: ${conv.createdAt.toLocaleString('ar-EG')}`);
      
      if (conv.messages.length > 0) {
        console.log(`   📝 آخر رسالة: "${conv.messages[0].content.substring(0, 50)}..."`);
        console.log(`   👥 من: ${conv.messages[0].isFromCustomer ? 'العميل' : 'الدعم'}`);
      }
      
      // تحديد إذا كان معرف حقيقي (رقمي وليس تجريبي)
      const isRealId = facebookId && 
        /^\d+$/.test(facebookId) && 
        !facebookId.includes('test') && 
        facebookId.length > 10; // معرفات فيسبوك الحقيقية طويلة
      
      if (isRealId) {
        console.log(`   ✅ معرف حقيقي - يمكن اختبار الإرسال`);
        realConversations.push({
          conversationId: conv.id,
          customerName: `${conv.customer.firstName} ${conv.customer.lastName}`,
          facebookId: facebookId,
          metadata: conv.metadata
        });
      } else {
        console.log(`   ❌ معرف تجريبي أو غير صحيح`);
      }
    });
    
    console.log(`\n🎯 المحادثات الحقيقية المناسبة للاختبار: ${realConversations.length}`);
    
    if (realConversations.length > 0) {
      console.log('\n📋 قائمة المحادثات الحقيقية:');
      realConversations.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.customerName} - ID: ${conv.facebookId}`);
        console.log(`   المحادثة: ${conv.conversationId}`);
      });
      
      // اختبار الإرسال للمحادثة الأولى
      if (realConversations.length > 0) {
        console.log(`\n🧪 اختبار الإرسال للمحادثة الأولى...`);
        await testSendingToRealCustomer(realConversations[0]);
      }
    } else {
      console.log('\n❌ لم يتم العثور على محادثات بمعرفات حقيقية');
      console.log('💡 الحل: انتظار رسالة جديدة من عميل حقيقي أو إنشاء محادثة تجريبية بمعرف صحيح');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testSendingToRealCustomer(conversation) {
  console.log(`\n📤 اختبار إرسال رسالة للعميل الحقيقي...`);
  console.log(`👤 العميل: ${conversation.customerName}`);
  console.log(`🆔 معرف فيسبوك: ${conversation.facebookId}`);
  
  try {
    // الحصول على صفحة "سولا 132"
    const solaPage = await prisma.facebookPage.findFirst({
      where: {
        pageName: 'سولا 132',
        status: 'connected'
      }
    });
    
    if (!solaPage) {
      console.log('❌ لم يتم العثور على صفحة "سولا 132"');
      return;
    }
    
    console.log(`📄 استخدام صفحة: ${solaPage.pageName} (${solaPage.pageId})`);
    
    const testMessage = `🧪 رسالة اختبار من صفحة "سولا 132" - ${new Date().toLocaleString('ar-EG')}`;
    
    const messageData = {
      recipient: { id: conversation.facebookId },
      message: { text: testMessage }
    };
    
    const url = `https://graph.facebook.com/v18.0/${solaPage.pageId}/messages`;
    
    console.log(`🌐 API URL: ${url}`);
    console.log(`💬 الرسالة: ${testMessage}`);
    
    const response = await axios.post(url, messageData, {
      params: { access_token: solaPage.pageAccessToken },
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('\n🎉 تم إرسال الرسالة بنجاح!');
    console.log('📋 معرف الرسالة:', response.data.message_id);
    console.log('✅ الصفحة المستخدمة: سولا 132');
    console.log('✅ العميل المستلم:', conversation.customerName);
    
    // حفظ الرسالة في قاعدة البيانات
    try {
      await prisma.message.create({
        data: {
          content: testMessage,
          type: 'TEXT',
          conversationId: conversation.conversationId,
          senderId: 'system', // أو معرف المستخدم الحالي
          senderType: 'AGENT',
          isFromCustomer: false,
          metadata: JSON.stringify({
            platform: 'facebook',
            messageId: response.data.message_id,
            pageId: solaPage.pageId,
            pageName: solaPage.pageName,
            testMessage: true
          })
        }
      });
      console.log('✅ تم حفظ الرسالة في قاعدة البيانات');
    } catch (dbError) {
      console.log('⚠️ تم إرسال الرسالة لكن فشل حفظها في قاعدة البيانات:', dbError.message);
    }
    
  } catch (error) {
    console.log('\n❌ فشل الإرسال:', error.message);
    if (error.response && error.response.data) {
      const errorData = error.response.data;
      console.log('🔍 تفاصيل الخطأ من فيسبوك:');
      console.log(`- الكود: ${errorData.error?.code}`);
      console.log(`- النوع: ${errorData.error?.type}`);
      console.log(`- الرسالة: ${errorData.error?.message}`);
      
      if (errorData.error?.code === 100) {
        console.log('\n💡 الأسباب المحتملة:');
        console.log('- العميل لم يتفاعل مع صفحة "سولا 132" من قبل');
        console.log('- معرف العميل غير صحيح');
        console.log('- العميل حظر الصفحة أو حذف المحادثة');
      }
    }
  }
}

// تشغيل البحث
if (require.main === module) {
  findRealConversations();
}

module.exports = {
  findRealConversations,
  testSendingToRealCustomer
};
