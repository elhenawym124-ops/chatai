/**
 * اختبار دعم الـ Reply في النظام
 * يحاكي رسالة من Facebook مع reply_to
 */

const aiAgentService = require('./src/services/aiAgentService');

async function testReplySupport() {
  console.log('🧪 اختبار دعم الـ Reply في النظام...\n');

  try {
    // محاكاة رسالة أصلية من الذكاء الاصطناعي
    const originalMessage = {
      id: 'test-message-123',
      content: 'مرحباً! لدينا كوتشي حريمي لمسه متوفر بألوان مختلفة. ما اللون المفضل لديك؟',
      createdAt: new Date(Date.now() - 5 * 60 * 1000) // منذ 5 دقائق
    };

    // محاكاة رد العميل على الرسالة الأصلية
    const messageData = {
      conversationId: 'test-conversation-reply',
      senderId: 'test-customer-123',
      content: 'أريد اللون الأبيض مقاس 40',
      attachments: [],
      timestamp: new Date(),
      companyId: 'cme8zve740006ufbcre9qzue4',
      
      // معلومات الرد - هذا هو الجزء المهم
      replyContext: {
        isReply: true,
        originalMessageId: 'fb-message-456',
        originalMessage: originalMessage
      },
      
      customerData: {
        id: 'test-customer-123',
        name: 'أحمد محمد',
        phone: '01234567890',
        email: 'ahmed@test.com',
        orderCount: 2,
        companyId: 'cme8zve740006ufbcre9qzue4'
      }
    };

    console.log('📝 بيانات الاختبار:');
    console.log('=====================================');
    console.log('الرسالة الأصلية:', originalMessage.content);
    console.log('رد العميل:', messageData.content);
    console.log('هل هو رد؟', messageData.replyContext.isReply);
    console.log('=====================================\n');

    console.log('🤖 معالجة الرسالة مع الذكاء الاصطناعي...');
    
    const response = await aiAgentService.processCustomerMessage(messageData);
    
    if (response && response.success) {
      console.log('\n✅ نجح الاختبار!');
      console.log('=====================================');
      console.log('🤖 رد الذكاء الاصطناعي:');
      console.log(response.content);
      console.log('=====================================');
      console.log(`🎯 النية: ${response.intent}`);
      console.log(`😊 المشاعر: ${response.sentiment}`);
      console.log(`⏱️ وقت المعالجة: ${response.processingTime}ms`);
      console.log(`🔧 النموذج المستخدم: ${response.model}`);
      
      // فحص إذا كان الرد يشير للرسالة الأصلية
      if (response.content.includes('اللون') || response.content.includes('أبيض') || response.content.includes('مقاس')) {
        console.log('\n✅ الذكاء الاصطناعي فهم السياق بنجاح!');
      } else {
        console.log('\n⚠️ قد لا يكون الذكاء الاصطناعي فهم السياق كاملاً');
      }
      
    } else {
      console.log('\n❌ فشل الاختبار!');
      if (response && response.error) {
        console.log('الخطأ:', response.error);
      }
    }

  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testReplySupport().then(() => {
    console.log('\n🎉 انتهى اختبار دعم الـ Reply!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  });
}

module.exports = { testReplySupport };
