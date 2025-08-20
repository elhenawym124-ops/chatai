const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testConversationOrderCreation() {
  console.log('💬 اختبار إنشاء طلب من المحادثة...\n');

  const conversationId = `conv-order-${Date.now()}`;
  const senderId = 'conv-customer';
  
  const customerData = {
    id: 'conv-customer-id',
    name: 'عميل المحادثة',
    phone: '01999888777',
    email: 'conv@example.com',
    orderCount: 0
  };

  // محادثة كاملة لإنشاء طلب
  const messages = [
    'مساء الخير',
    'عايز كوتشي ابيض مقاس 42',
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
          console.log(`🎉 تم إنشاء طلب من المحادثة!`);
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

    if (!orderCreated) {
      console.log('\n⚠️ لم يتم إنشاء طلب من المحادثة');
      console.log('🔍 سأحاول فحص الطلبات الموجودة...');
      
      try {
        const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
        if (ordersResponse.data.success) {
          const orders = ordersResponse.data.data;
          const recentOrders = orders.filter(order => {
            const orderTime = new Date(order.createdAt).getTime();
            const now = Date.now();
            return (now - orderTime) < 300000; // آخر 5 دقائق
          });
          
          console.log(`📊 الطلبات الحديثة (آخر 5 دقائق): ${recentOrders.length}`);
          recentOrders.forEach(order => {
            console.log(`   - ${order.orderNumber}: ${order.customerName} (${order.total} جنيه)`);
          });
        }
      } catch (error) {
        console.log('❌ خطأ في فحص الطلبات:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار المحادثة:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testConversationOrderCreation();
