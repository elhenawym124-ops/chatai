const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

/**
 * أداة تشخيص شاملة لمشكلة إرسال الرسائل لفيسبوك
 */

// نسخة من دالة sendFacebookMessage للاختبار
async function testSendFacebookMessage(pageId, recipientId, message, pageAccessToken, messageType = 'TEXT') {
  try {
    console.log('🔧 Testing sendFacebookMessage function...');
    console.log(`📋 Parameters:`, {
      pageId,
      recipientId,
      message: message.substring(0, 50) + '...',
      hasToken: !!pageAccessToken,
      tokenLength: pageAccessToken ? pageAccessToken.length : 0,
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
    console.log(`📤 Message Data:`, JSON.stringify(messageData, null, 2));

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
    console.error('❌ Error in testSendFacebookMessage:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
    throw error;
  }
}

// نسخة من دالة sendMessageToFacebook للاختبار
async function testSendMessageToFacebook(recipientId, messageText, conversationId) {
  try {
    console.log('🔧 Testing sendMessageToFacebook function...');
    console.log(`📋 Parameters:`, {
      recipientId,
      messageText: messageText.substring(0, 50) + '...',
      conversationId
    });

    // البحث عن الصفحة المرتبطة بالمحادثة
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        customer: true
      }
    });
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    console.log('📋 Conversation found:', {
      id: conversation.id,
      channel: conversation.channel,
      companyId: conversation.companyId,
      customerId: conversation.customerId,
      hasMetadata: !!conversation.metadata,
      metadata: conversation.metadata
    });
    
    // البحث عن صفحة فيسبوك المناسبة
    const facebookPage = await prisma.facebookPage.findFirst({
      where: {
        companyId: conversation.companyId,
        status: 'connected'
      }
    });
    
    if (!facebookPage) {
      throw new Error('No connected Facebook page found for this conversation');
    }
    
    console.log('📋 Facebook Page found:', {
      id: facebookPage.id,
      pageId: facebookPage.pageId,
      pageName: facebookPage.pageName,
      hasToken: !!facebookPage.pageAccessToken,
      tokenLength: facebookPage.pageAccessToken ? facebookPage.pageAccessToken.length : 0,
      status: facebookPage.status
    });
    
    console.log(`📤 Sending message via Facebook page: ${facebookPage.pageName} (${facebookPage.pageId})`);
    console.log(`📤 To recipient: ${recipientId}`);
    console.log(`📤 Message: ${messageText}`);
    
    // استخدام نفس دالة الإرسال التي يستخدمها Gemini
    const result = await testSendFacebookMessage(
      facebookPage.pageId,
      recipientId,
      messageText,
      facebookPage.pageAccessToken,
      'TEXT'
    );
    
    console.log('✅ Manual message sent to Facebook successfully:', result.message_id);
    return result;
    
  } catch (error) {
    console.error('❌ Error in testSendMessageToFacebook:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
    throw error;
  }
}

async function debugFacebookMessages() {
  console.log('🔍 بدء تشخيص مشكلة إرسال الرسائل لفيسبوك...\n');
  
  try {
    // 1. فحص المحادثات من فيسبوك
    console.log('📋 1. فحص المحادثات من فيسبوك:');
    const facebookConversations = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK'
      },
      include: {
        customer: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      take: 5
    });
    
    console.log(`📊 وُجد ${facebookConversations.length} محادثة من فيسبوك`);
    
    if (facebookConversations.length === 0) {
      console.log('❌ لا توجد محادثات من فيسبوك للاختبار');
      return;
    }
    
    // 2. فحص الصفحات المربوطة
    console.log('\n📋 2. فحص الصفحات المربوطة:');
    const facebookPages = await prisma.facebookPage.findMany({
      where: {
        status: 'connected'
      }
    });
    
    console.log(`📊 وُجد ${facebookPages.length} صفحة مربوطة`);
    
    if (facebookPages.length === 0) {
      console.log('❌ لا توجد صفحات مربوطة للاختبار');
      return;
    }
    
    facebookPages.forEach((page, index) => {
      console.log(`📄 صفحة ${index + 1}:`, {
        id: page.id,
        pageId: page.pageId,
        pageName: page.pageName,
        hasToken: !!page.pageAccessToken,
        tokenLength: page.pageAccessToken ? page.pageAccessToken.length : 0,
        status: page.status
      });
    });
    
    // 3. اختبار إرسال رسالة تجريبية
    console.log('\n📋 3. اختبار إرسال رسالة تجريبية:');
    
    // البحث عن محادثة بها معرف عميل صحيح
    let testConversation = null;
    for (const conv of facebookConversations) {
      console.log(`🔍 فحص المحادثة ${conv.id}:`);
      console.log(`👤 العميل: ${conv.customer.firstName} ${conv.customer.lastName}`);
      console.log(`🆔 معرف العميل من فيسبوك: ${conv.customer.facebookId}`);
      console.log(`📋 metadata:`, conv.metadata);
      
      if (conv.customer.facebookId || (conv.metadata && conv.metadata.facebookPageScopedId)) {
        testConversation = conv;
        console.log(`✅ تم اختيار هذه المحادثة للاختبار`);
        break;
      }
    }
    
    if (!testConversation) {
      console.log('❌ لم يتم العثور على محادثة بها معرف عميل صحيح');
      return;
    }
    
    // البحث عن معرف العميل
    let recipientId = null;
    if (testConversation.facebookPageScopedId) {
      recipientId = testConversation.facebookPageScopedId;
      console.log(`✅ معرف العميل من الحقل المباشر: ${recipientId}`);
    } else if (testConversation.metadata && testConversation.metadata.facebookPageScopedId) {
      recipientId = testConversation.metadata.facebookPageScopedId;
      console.log(`✅ معرف العميل من metadata: ${recipientId}`);
    } else if (testConversation.customer.facebookId) {
      recipientId = testConversation.customer.facebookId;
      console.log(`✅ معرف العميل من جدول العملاء: ${recipientId}`);
    }
    
    if (!recipientId) {
      console.log('❌ لم يتم العثور على معرف العميل');
      return;
    }
    
    const testMessage = `🧪 رسالة اختبار من النظام - ${new Date().toLocaleString('ar-EG')}`;
    
    console.log(`📤 إرسال رسالة اختبار: "${testMessage}"`);
    
    try {
      const result = await testSendMessageToFacebook(recipientId, testMessage, testConversation.id);
      console.log('🎉 تم إرسال الرسالة بنجاح!');
      console.log('📋 معرف الرسالة:', result.message_id);
      
    } catch (error) {
      console.log('❌ فشل في إرسال الرسالة:', error.message);
      
      // محاولة تشخيص المشكلة
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('🔍 تفاصيل الخطأ من فيسبوك:');
        console.log('- الكود:', errorData.error?.code);
        console.log('- النوع:', errorData.error?.type);
        console.log('- الرسالة:', errorData.error?.message);
        console.log('- التفاصيل:', errorData.error?.error_user_title);
        console.log('- الحل المقترح:', errorData.error?.error_user_msg);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التشخيص
if (require.main === module) {
  debugFacebookMessages();
}

module.exports = {
  debugFacebookMessages,
  testSendMessageToFacebook,
  testSendFacebookMessage
};
