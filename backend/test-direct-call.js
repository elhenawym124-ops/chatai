// اختبار مباشر لخدمة AI Agent
const { PrismaClient } = require('@prisma/client');
const aiAgent = require('./src/services/aiAgentService');

const prisma = new PrismaClient();

async function testDirectCall() {
  console.log('🧪 اختبار مباشر لخدمة AI Agent...\n');

  try {
    // استخدام خدمة AI Agent المُصدرة
    
    console.log('📤 إرسال رسالة: "مرحبا"');

    // إنشاء messageData بالشكل الصحيح
    const messageData = {
      conversationId: 'test_conversation',
      senderId: 'test_user_123',
      content: 'مرحبا',
      attachments: [],
      customerData: {
        companyId: 'cmdkj6coz0000uf0cyscco6lr'
      }
    };

    // استدعاء مباشر للخدمة
    const result = await aiAgent.processCustomerMessage(messageData);

    console.log('\n✅ النتيجة:');
    console.log('🔍 [DEBUG] Full result structure:', JSON.stringify(result, null, 2));
    
    if (result) {
      console.log('✅ النجاح:', result.success);
      console.log('📝 المحتوى:', result.content);
      console.log('🤖 النموذج:', result.model);
      console.log('🔄 نوع التبديل:', result.switchType);
      
      // فحص إضافي للمحتوى
      console.log('\n🔍 فحص المحتوى:');
      console.log('📏 طول المحتوى:', result.content?.length);
      console.log('📋 نوع المحتوى:', typeof result.content);
      console.log('🔤 المحتوى بعد trim:', result.content?.trim());
      console.log('❓ هل المحتوى فارغ؟:', !result.content?.trim());
    } else {
      console.log('❌ لا توجد نتيجة');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    console.error('📋 تفاصيل الخطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectCall();
