const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRealOrderFlow() {
  console.log('🛒 اختبار تدفق الطلب الحقيقي...\n');

  const conversationId = `test-real-order-${Date.now()}`;
  const senderId = '24275986865345617'; // نفس ID العميل الحقيقي
  
  const customerData = {
    id: 'cmdls0lgn000qufm8g1dpj0k2',
    name: 'Facebook User',
    phone: '',
    email: 'facebook_24275986865345617@example.com',
    orderCount: 0
  };

  // محاكاة المحادثة الحقيقية
  const messages = [
    'مساء الخير',
    'الابيض مقاس 40',
    'تمام'
  ];

  try {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.log(`📝 الرسالة ${i + 1}: "${message}"`);
      
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
      
      console.log('─'.repeat(60));
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // فحص الطلبات النهائية
    console.log('\n📊 فحص الطلبات النهائية...');
    
    try {
      const simpleOrdersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
      if (simpleOrdersResponse.data.success) {
        const orders = simpleOrdersResponse.data.data;
        console.log(`✅ إجمالي الطلبات البسيطة: ${orders.length}`);
        
        // عرض آخر 3 طلبات
        const recentOrders = orders.slice(-3);
        recentOrders.forEach((order, index) => {
          console.log(`\n${index + 1}. طلب رقم: ${order.orderNumber}`);
          console.log(`   العميل: ${order.customerName}`);
          console.log(`   الهاتف: ${order.customerPhone || 'غير محدد'}`);
          console.log(`   المنتج: ${order.items[0]?.name || 'غير محدد'}`);
          console.log(`   اللون: ${order.items[0]?.metadata?.color || 'غير محدد'}`);
          console.log(`   المقاس: ${order.items[0]?.metadata?.size || 'غير محدد'}`);
          console.log(`   المبلغ: ${order.total} جنيه`);
          console.log(`   الحالة: ${order.status}`);
          console.log(`   التاريخ: ${new Date(order.createdAt).toLocaleString('ar-EG')}`);
        });
      }
    } catch (error) {
      console.log('⚠️ لا يمكن الوصول للطلبات البسيطة');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار تدفق الطلب الحقيقي:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testRealOrderFlow();
