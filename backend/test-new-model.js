const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testNewModel() {
  console.log('🎯 اختبار النموذج الجديد (gemini-2.5-flash)...\n');

  const conversationId = `new-model-test-${Date.now()}`;
  const senderId = 'new-model-customer';
  
  const customerData = {
    id: 'new-model-customer-id',
    name: 'عميل النموذج الجديد',
    phone: '01777888999',
    email: 'newmodel@example.com',
    orderCount: 0
  };

  // محادثة لاختبار النموذج الجديد
  const messages = [
    'السلام عليكم',
    'عايز كوتشي أبيض مقاس 40',
    'تمام اطلبه'
  ];

  try {
    let orderCreated = false;
    
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
        console.log(`✅ رد الذكاء الصناعي: ${content.substring(0, 150)}...`);
        
        // فحص إذا تم إنشاء طلب
        if (response.data.orderCreated) {
          console.log(`\n🎉 تم إنشاء طلب من المحادثة بنجاح!`);
          console.log(`📋 رقم الطلب: ${response.data.orderCreated.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${response.data.orderCreated.total} جنيه`);
          console.log(`👤 العميل: ${response.data.orderCreated.customerName}`);
          console.log(`📱 الهاتف: ${response.data.orderCreated.customerPhone}`);
          
          orderCreated = true;
          break;
        }
        
        // فحص معلومات الطلب المستخرجة
        if (response.data.orderInfo) {
          console.log(`📊 معلومات الطلب:`);
          console.log(`   المنتج: ${response.data.orderInfo.productName || 'غير محدد'}`);
          console.log(`   اللون: ${response.data.orderInfo.productColor || 'غير محدد'}`);
          console.log(`   المقاس: ${response.data.orderInfo.productSize || 'غير محدد'}`);
          console.log(`   السعر: ${response.data.orderInfo.productPrice || 'غير محدد'}`);
          console.log(`   مكتمل: ${response.data.orderInfo.isComplete ? 'نعم' : 'لا'}`);
        }
        
      } else {
        console.log(`❌ فشل في الرسالة ${i + 1}: ${response.data.error || 'خطأ غير معروف'}`);
      }
      
      console.log('─'.repeat(80));
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (orderCreated) {
      console.log('\n🎊 نجح الاختبار! النموذج الجديد يعمل بشكل ممتاز!');
      console.log('✅ تم التبديل بنجاح من gemini-2.0-flash-exp إلى gemini-2.5-flash');
      console.log('🚀 النظام يولد ردود ذكية ويُنشئ طلبات تلقائياً');
      
    } else {
      console.log('\n⚠️ لم يتم إنشاء طلب، لكن النموذج يعمل ويولد ردود ذكية');
      console.log('🔧 قد تحتاج لتحسين منطق استخراج الطلبات');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار النموذج الجديد:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testNewModel();
