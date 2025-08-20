const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFinalOrderCreation() {
  console.log('🎯 اختبار إنشاء طلب من المحادثة النهائي...\n');

  const conversationId = `final-conv-${Date.now()}`;
  const senderId = 'final-customer';
  
  const customerData = {
    id: 'final-customer-id',
    name: 'عميل نهائي للاختبار',
    phone: '01777888999',
    email: 'final@example.com',
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
      
      // إحصائيات نهائية
      console.log('\n📈 إحصائيات النظام النهائية...');
      
      try {
        const statsResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
        if (statsResponse.data.success) {
          const orders = statsResponse.data.data;
          console.log(`✅ إجمالي الطلبات في النظام: ${orders.length}`);
          
          const todayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
          });
          
          console.log(`📅 طلبات اليوم: ${todayOrders.length}`);
          
          const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
          console.log(`💰 إجمالي قيمة الطلبات: ${totalValue} جنيه`);
        }
      } catch (error) {
        console.log('⚠️ خطأ في جلب الإحصائيات:', error.message);
      }
      
    } else {
      console.log('\n❌ فشل الاختبار! لم يتم إنشاء طلب من المحادثة');
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
    console.error('❌ خطأ في اختبار إنشاء الطلب النهائي:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testFinalOrderCreation();
