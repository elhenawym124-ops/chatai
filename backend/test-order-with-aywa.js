const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testOrderWithAywa() {
  console.log('🛒 اختبار إنشاء الطلبات مع كلمة "ايوه"...\n');

  const conversationId = `aywa-test-${Date.now()}`;
  const senderId = 'aywa-customer';
  
  const customerData = {
    id: 'aywa-customer-id',
    name: 'عميل ايوه',
    phone: '01444555666',
    email: 'aywa@example.com',
    orderCount: 0
  };

  try {
    console.log('📝 محاكاة محادثة طلب مع "ايوه"...');
    
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

    // انتظار قصير
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
      
      // فحص إذا تم إنشاء طلب
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 تفاصيل الطلب:', JSON.stringify(response.data.data.orderCreated, null, 2));
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
        console.log('🔍 سبب عدم الإنشاء: النظام لم يتعرف على التأكيد');
      }
    }

    // فحص قاعدة البيانات للطلبات
    console.log('\n3️⃣ فحص الطلبات في قاعدة البيانات...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
    
    if (ordersResponse.data.success) {
      const recentOrders = ordersResponse.data.data.filter(order => 
        order.createdAt > new Date(Date.now() - 5 * 60 * 1000) // آخر 5 دقائق
      );
      
      if (recentOrders.length > 0) {
        console.log(`✅ تم العثور على ${recentOrders.length} طلب حديث:`);
        recentOrders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.productName} - ${order.productColor} - مقاس ${order.productSize}`);
          console.log(`      العميل: ${order.customerName || 'غير محدد'} - الحالة: ${order.status}`);
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
testOrderWithAywa();
