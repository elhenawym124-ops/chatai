const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSuccessfulOrderCreation() {
  console.log('🎯 اختبار إنشاء طلب ناجح من المحادثة...\n');

  const conversationId = `success-conv-${Date.now()}`;
  const senderId = 'success-customer';
  
  const customerData = {
    id: 'success-customer-id',
    name: 'عميل ناجح',
    phone: '01888999000',
    email: 'success@example.com',
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
        console.log(`✅ رد الذكاء الصناعي: ${content.substring(0, 100)}...`);
        
        // فحص إذا تم إنشاء طلب
        if (response.data.orderCreated) {
          console.log(`\n🎉 تم إنشاء طلب من المحادثة بنجاح!`);
          console.log(`📋 رقم الطلب: ${response.data.orderCreated.orderNumber}`);
          console.log(`💰 المبلغ الإجمالي: ${response.data.orderCreated.total} جنيه`);
          console.log(`👤 العميل: ${response.data.orderCreated.customerName}`);
          console.log(`📱 الهاتف: ${response.data.orderCreated.customerPhone}`);
          console.log(`🏙️ المدينة: ${response.data.orderCreated.shippingAddress?.city || 'غير محدد'}`);
          console.log(`📅 تاريخ الإنشاء: ${new Date(response.data.orderCreated.createdAt).toLocaleString('ar-EG')}`);
          
          orderCreated = true;
          
          // فحص الطلب في النظام
          console.log('\n📊 فحص الطلب في النظام...');
          try {
            const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
            if (ordersResponse.data.success) {
              const orders = ordersResponse.data.data;
              const ourOrder = orders.find(order => order.orderNumber === response.data.orderCreated.orderNumber);
              
              if (ourOrder) {
                console.log('✅ تم العثور على الطلب في النظام:');
                console.log(`   رقم الطلب: ${ourOrder.orderNumber}`);
                console.log(`   العميل: ${ourOrder.customerName}`);
                console.log(`   المنتج: ${ourOrder.items[0]?.name}`);
                console.log(`   اللون: ${ourOrder.items[0]?.metadata?.color}`);
                console.log(`   المقاس: ${ourOrder.items[0]?.metadata?.size}`);
                console.log(`   المبلغ: ${ourOrder.total} جنيه`);
                console.log(`   الحالة: ${ourOrder.status}`);
              } else {
                console.log('❌ لم يتم العثور على الطلب في النظام');
              }
            }
          } catch (error) {
            console.log('⚠️ خطأ في فحص الطلبات:', error.message);
          }
          
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
      console.log('\n🎊 نجح الاختبار! تم إنشاء طلب من المحادثة بنجاح!');
      console.log('\n✅ النظام يعمل بشكل صحيح الآن!');
      console.log('🚀 يمكن للعملاء إنشاء طلبات تلقائياً من المحادثة');
      
    } else {
      console.log('\n❌ فشل الاختبار! لم يتم إنشاء طلب من المحادثة');
      console.log('🔧 يحتاج النظام لمزيد من التحسينات');
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار إنشاء الطلب الناجح:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testSuccessfulOrderCreation();
