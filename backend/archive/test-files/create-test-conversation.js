const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// نسخة من دالة sendFacebookMessage للاختبار
async function sendFacebookMessage(pageId, recipientId, message, pageAccessToken, messageType = 'TEXT') {
  try {
    console.log('🔧 Testing Facebook message sending...');
    console.log(`📋 Parameters:`, {
      pageId,
      recipientId,
      message: message.substring(0, 50) + '...',
      hasToken: !!pageAccessToken,
      messageType
    });

    const messageData = {
      recipient: { id: recipientId },
      message: {},
    };

    if (messageType === 'TEXT') {
      messageData.message.text = message;
    }

    const url = `https://graph.facebook.com/v18.0/${pageId}/messages`;
    console.log(`🌐 API URL: ${url}`);

    const response = await axios.post(url, messageData, {
      params: {
        access_token: pageAccessToken,
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Facebook API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in sendFacebookMessage:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
    throw error;
  }
}

async function testWithRealFacebookId() {
  console.log('🧪 اختبار إرسال رسالة بمعرف فيسبوك حقيقي...\n');
  
  try {
    // الحصول على أول شركة
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ لم يتم العثور على شركة');
      return;
    }
    
    // الحصول على صفحة فيسبوك متصلة
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        companyId: company.id,
        status: 'connected'
      }
    });
    
    if (!facebookPage) {
      console.log('❌ لم يتم العثور على صفحة فيسبوك متصلة');
      return;
    }
    
    console.log(`📄 استخدام صفحة: ${facebookPage.pageName} (${facebookPage.pageId})`);
    
    // معرف فيسبوك حقيقي للاختبار (يجب أن يكون معرف صحيح)
    // هذا مجرد مثال - يجب استبداله بمعرف حقيقي
    const testRecipientId = '1234567890123456'; // معرف تجريبي رقمي
    
    console.log(`🎯 اختبار الإرسال للمعرف: ${testRecipientId}`);
    
    const testMessage = `🧪 رسالة اختبار من النظام - ${new Date().toLocaleString('ar-EG')}`;
    
    try {
      const result = await sendFacebookMessage(
        facebookPage.pageId,
        testRecipientId,
        testMessage,
        facebookPage.pageAccessToken,
        'TEXT'
      );
      
      console.log('🎉 تم إرسال الرسالة بنجاح!');
      console.log('📋 معرف الرسالة:', result.message_id);
      
    } catch (error) {
      console.log('❌ فشل في إرسال الرسالة:', error.message);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('🔍 تفاصيل الخطأ من فيسبوك:');
        console.log('- الكود:', errorData.error?.code);
        console.log('- النوع:', errorData.error?.type);
        console.log('- الرسالة:', errorData.error?.message);
        
        // تحليل نوع الخطأ
        if (errorData.error?.code === 100) {
          console.log('\n💡 الحل المقترح:');
          console.log('- تأكد من أن معرف المستلم صحيح ورقمي');
          console.log('- تأكد من أن المستخدم تفاعل مع الصفحة من قبل');
          console.log('- تأكد من صحة Page Access Token');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function listAllConversations() {
  console.log('📋 قائمة جميع المحادثات من فيسبوك:\n');
  
  try {
    const conversations = await prisma.conversation.findMany({
      where: { channel: 'FACEBOOK' },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    
    conversations.forEach((conv, index) => {
      const facebookId = conv.customer.facebookId || 
        (conv.metadata && conv.metadata.facebookPageScopedId);
      const isNumeric = facebookId && /^\d+$/.test(facebookId);
      
      console.log(`${index + 1}. ${conv.customer.firstName} ${conv.customer.lastName}`);
      console.log(`   ID: ${facebookId || 'غير متوفر'} ${isNumeric ? '✅ رقمي' : '❌ غير رقمي'}`);
      console.log(`   المحادثة: ${conv.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الاختبار
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testWithRealFacebookId();
  } else if (command === 'list') {
    listAllConversations();
  } else {
    console.log('الاستخدام:');
    console.log('node create-test-conversation.js test  - اختبار إرسال رسالة');
    console.log('node create-test-conversation.js list  - عرض جميع المحادثات');
  }
}

module.exports = {
  testWithRealFacebookId,
  listAllConversations,
  sendFacebookMessage
};
