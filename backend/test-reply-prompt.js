/**
 * اختبار بناء الـ prompt مع دعم الـ Reply
 */

const aiAgentService = require('./src/services/aiAgentService');

async function testReplyPrompt() {
  console.log('🧪 اختبار بناء الـ prompt مع دعم الـ Reply...\n');

  try {
    // محاكاة رسالة أصلية
    const originalMessage = {
      id: 'test-message-123',
      content: 'مرحباً! لدينا كوتشي حريمي لمسه متوفر بألوان مختلفة. ما اللون المفضل لديك؟',
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    };

    // محاكاة بيانات الرسالة مع الرد
    const messageData = {
      replyContext: {
        isReply: true,
        originalMessageId: 'fb-message-456',
        originalMessage: originalMessage
      }
    };

    // محاكاة بيانات الشركة
    const companyPrompts = {
      personalityPrompt: 'أنت ساره، مساعدة ذكية ودودة لمتجر الأحذية.',
      responsePrompt: 'كوني مفيدة ومهذبة في ردودك.'
    };

    // محاكاة بيانات العميل
    const customerData = {
      name: 'أحمد محمد',
      phone: '01234567890',
      orderCount: 2
    };

    console.log('📝 اختبار دالة buildPrompt...');
    
    // اختبار دالة buildPrompt مع الرد
    const prompt = aiAgentService.buildPrompt(
      'أريد اللون الأبيض مقاس 40',
      companyPrompts,
      [], // conversationMemory
      [], // ragData
      customerData,
      messageData // messageData مع replyContext
    );

    console.log('\n✅ تم بناء الـ prompt بنجاح!');
    console.log('=====================================');
    console.log(prompt);
    console.log('=====================================');

    // فحص إذا كان الـ prompt يحتوي على معلومات الرد
    if (prompt.includes('سياق الرد')) {
      console.log('\n✅ الـ prompt يحتوي على معلومات الرد!');
    } else {
      console.log('\n❌ الـ prompt لا يحتوي على معلومات الرد!');
    }

    if (prompt.includes('الرسالة الأصلية')) {
      console.log('✅ الـ prompt يحتوي على الرسالة الأصلية!');
    } else {
      console.log('❌ الـ prompt لا يحتوي على الرسالة الأصلية!');
    }

    if (prompt.includes('أريد اللون الأبيض')) {
      console.log('✅ الـ prompt يحتوي على رد العميل!');
    } else {
      console.log('❌ الـ prompt لا يحتوي على رد العميل!');
    }

  } catch (error) {
    console.error('\n❌ خطأ في الاختبار:', error.message);
    console.error('التفاصيل:', error.stack);
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testReplyPrompt().then(() => {
    console.log('\n🎉 انتهى اختبار بناء الـ prompt!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ خطأ عام:', error);
    process.exit(1);
  });
}

module.exports = { testReplyPrompt };
