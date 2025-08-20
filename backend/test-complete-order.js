const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCompleteOrder() {
  console.log('🛒 اختبار طلب كامل مع العنوان...\n');

  const conversationId = `complete-order-${Date.now()}`;
  const senderId = 'complete-customer';
  
  const customerData = {
    id: 'complete-customer-id',
    name: 'عميل كامل',
    phone: '01222333444',
    email: 'complete@example.com',
    orderCount: 0
  };

  try {
    // الرسالة الأولى: طلب المنتج
    console.log('1️⃣ العميل يطلب المنتج...');
    let response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'عاوز الكوتشي الأبيض مقاس 38',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // الرسالة الثانية: التأكيد بـ "ايوه"
    console.log('\n2️⃣ العميل يؤكد بـ "ايوه"...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'ايوه',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // الرسالة الثالثة: إضافة العنوان
    console.log('\n3️⃣ العميل يضيف العنوان...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'العنوان: شارع التحرير، المعادي، القاهرة',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
        console.log('💰 المبلغ:', response.data.data.orderCreated.total);
        console.log('📍 العنوان:', response.data.data.orderCreated.address || 'غير محدد');
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
      }
    }

    // فحص قاعدة البيانات
    console.log('\n4️⃣ فحص الطلبات في قاعدة البيانات...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
    
    if (ordersResponse.data.success) {
      const recentOrders = ordersResponse.data.data.filter(order => 
        order.createdAt > new Date(Date.now() - 5 * 60 * 1000) // آخر 5 دقائق
      );
      
      if (recentOrders.length > 0) {
        console.log(`✅ تم العثور على ${recentOrders.length} طلب حديث:`);
        recentOrders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.productName} - ${order.productColor} - مقاس ${order.productSize}`);
          console.log(`      العميل: ${order.customerName} - الحالة: ${order.status}`);
          console.log(`      المبلغ: ${order.total} جنيه`);
        });
      } else {
        console.log('❌ لم يتم العثور على طلبات حديثة');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testCompleteOrder();
