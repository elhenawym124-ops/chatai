const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDebugOrderFlow() {
  console.log('🔍 اختبار تشخيص مشكلة إنشاء الطلبات...\n');

  const conversationId = `debug-order-${Date.now()}`;
  const senderId = 'debug-customer';
  
  const customerData = {
    id: 'debug-customer-id',
    name: 'عميل تشخيص',
    phone: '01111111111',
    email: 'debug@example.com',
    orderCount: 0
  };

  // محادثة تشخيصية
  const messages = [
    'مساء الخير',
    'عايز كوتشي ابيض مقاس 40',
    'تمام اطلبه'
  ];

  try {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`\n📝 الرسالة ${i + 1}: "${message}"`);
      
      const response = await axios.post(`${BASE_URL}/test-ai-direct`, {
        conversationId,
        senderId,
        content: message,
        attachments: [],
        customerData
      });

      if (response.data.success) {
        const content = response.data.content || response.data.message || 'لا يوجد محتوى';
        console.log(`✅ رد الذكاء الصناعي: ${content.substring(0, 100)}...`);
        
        // فحص إذا تم إنشاء طلب
        if (response.data.orderCreated) {
          console.log(`🎉 تم إنشاء طلب!`);
          console.log(`📋 رقم الطلب: ${response.data.orderCreated.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${response.data.orderCreated.total} جنيه`);
          break;
        }
        
        // فحص معلومات الطلب المستخرجة
        if (response.data.orderInfo) {
          console.log(`📊 معلومات الطلب:`);
          console.log(`   المنتج: ${response.data.orderInfo.productName || 'غير محدد'}`);
          console.log(`   اللون: ${response.data.orderInfo.productColor || 'غير محدد'}`);
          console.log(`   المقاس: ${response.data.orderInfo.productSize || 'غير محدد'}`);
          console.log(`   مكتمل: ${response.data.orderInfo.isComplete ? 'نعم' : 'لا'}`);
        }
        
      } else {
        console.log(`❌ فشل في الرسالة ${i + 1}: ${response.data.error || 'خطأ غير معروف'}`);
      }
      
      console.log('─'.repeat(80));
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار التشخيص:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testDebugOrderFlow();
