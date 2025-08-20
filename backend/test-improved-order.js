const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testImprovedOrderFlow() {
  console.log('🛒 اختبار النظام المحسن لإنشاء الطلبات...\n');

  const conversationId = `test-improved-${Date.now()}`;
  const senderId = 'test-improved-customer';
  
  const customerData = {
    id: 'test-improved-customer-id',
    name: 'عميل محسن',
    phone: '01234567890',
    email: 'improved@example.com',
    orderCount: 0
  };

  // محاكاة المحادثة الحقيقية التي حدثت
  const messages = [
    'مساء الخير',
    'الابيض مقاس 40',
    'تمام'
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
        console.log(`✅ رد الذكاء الصناعي: ${content.substring(0, 150)}...`);
        
        // فحص إذا تم إنشاء طلب
        if (response.data.orderCreated) {
          console.log(`🎉 تم إنشاء طلب!`);
          console.log(`📋 رقم الطلب: ${response.data.orderCreated.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${response.data.orderCreated.total} جنيه`);
          console.log(`👤 العميل: ${response.data.orderCreated.customerName}`);
          console.log(`📱 الهاتف: ${response.data.orderCreated.customerPhone}`);
          console.log(`🏙️ المدينة: ${response.data.orderCreated.city}`);
          break;
        }
        
        // فحص معلومات الطلب المستخرجة
        if (response.data.orderInfo) {
          console.log(`📊 معلومات الطلب:`);
          console.log(`   المنتج: ${response.data.orderInfo.productName || 'غير محدد'}`);
          console.log(`   اللون: ${response.data.orderInfo.productColor || 'غير محدد'}`);
          console.log(`   المقاس: ${response.data.orderInfo.productSize || 'غير محدد'}`);
          console.log(`   العميل: ${response.data.orderInfo.customerName || 'غير محدد'}`);
          console.log(`   الهاتف: ${response.data.orderInfo.customerPhone || 'غير محدد'}`);
          console.log(`   المدينة: ${response.data.orderInfo.city || 'غير محدد'}`);
          console.log(`   مكتمل: ${response.data.orderInfo.isComplete ? 'نعم' : 'لا'}`);
        }
        
      } else {
        console.log(`❌ فشل في الرسالة ${i + 1}: ${response.data.error || 'خطأ غير معروف'}`);
      }
      
      console.log('─'.repeat(80));
      
      // انتظار قصير بين الرسائل
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // فحص الطلبات النهائية
    console.log('\n📊 فحص الطلبات النهائية...');
    
    try {
      const simpleOrdersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
      if (simpleOrdersResponse.data.success) {
        const orders = simpleOrdersResponse.data.data;
        console.log(`✅ إجمالي الطلبات البسيطة: ${orders.length}`);
        
        // البحث عن طلبنا
        const ourOrder = orders.find(order => 
          order.customerName === 'عميل محسن' || 
          order.customerPhone === '01234567890' ||
          order.conversationId === conversationId
        );
        
        if (ourOrder) {
          console.log('\n🎯 تم العثور على طلبنا:');
          console.log(`   رقم الطلب: ${ourOrder.orderNumber}`);
          console.log(`   العميل: ${ourOrder.customerName}`);
          console.log(`   الهاتف: ${ourOrder.customerPhone || 'غير محدد'}`);
          console.log(`   المنتج: ${ourOrder.items[0]?.name || 'غير محدد'}`);
          console.log(`   اللون: ${ourOrder.items[0]?.metadata?.color || 'غير محدد'}`);
          console.log(`   المقاس: ${ourOrder.items[0]?.metadata?.size || 'غير محدد'}`);
          console.log(`   المبلغ: ${ourOrder.total} جنيه`);
          console.log(`   الحالة: ${ourOrder.status}`);
          console.log(`   المدينة: ${ourOrder.shippingAddress?.city || 'غير محدد'}`);
          console.log(`   التاريخ: ${new Date(ourOrder.createdAt).toLocaleString('ar-EG')}`);
        } else {
          console.log('⚠️ لم يتم العثور على طلبنا في القائمة');
          
          // عرض آخر 3 طلبات للمقارنة
          console.log('\n📋 آخر 3 طلبات في النظام:');
          const recentOrders = orders.slice(-3);
          recentOrders.forEach((order, index) => {
            console.log(`\n${index + 1}. طلب رقم: ${order.orderNumber}`);
            console.log(`   العميل: ${order.customerName}`);
            console.log(`   الهاتف: ${order.customerPhone || 'غير محدد'}`);
            console.log(`   المحادثة: ${order.conversationId || 'غير محدد'}`);
            console.log(`   التاريخ: ${new Date(order.createdAt).toLocaleString('ar-EG')}`);
          });
        }
      }
    } catch (error) {
      console.log('⚠️ لا يمكن الوصول للطلبات البسيطة:', error.message);
    }

    // ملخص النتائج
    console.log('\n' + '='.repeat(80));
    console.log('📋 ملخص النتائج:');
    console.log('='.repeat(80));
    console.log('✅ تم اختبار النظام المحسن لإنشاء الطلبات');
    console.log('📊 المحادثة المختبرة: مساء الخير → الابيض مقاس 40 → تمام');
    console.log('🔍 النظام يجب أن ينشئ طلب تلقائ<|im_start|> عند كلمة "تمام"');

  } catch (error) {
    console.error('❌ خطأ في اختبار النظام المحسن:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testImprovedOrderFlow();
