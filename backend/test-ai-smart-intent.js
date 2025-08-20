const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSmartIntentAnalysis() {
  console.log('🧠 اختبار تحليل النوايا الذكي...\n');

  const conversationId = `smart-test-${Date.now()}`;
  const senderId = 'smart-customer';
  
  const customerData = {
    id: 'smart-customer-id',
    name: 'عميل ذكي',
    phone: '01777888999',
    email: 'smart@example.com',
    orderCount: 0
  };

  try {
    console.log('🧪 اختبار تعبيرات مختلفة للتأكيد...\n');
    
    // اختبار 1: طلب المنتج
    console.log('1️⃣ العميل يطلب المنتج...');
    let response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'عاوز الكوتشي الأبيض مقاس 38',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 80) + '...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // اختبار 2: تأكيد بتعبير مختلف
    console.log('\n2️⃣ العميل يؤكد بتعبير "ماشي كده"...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'ماشي كده',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 80) + '...');
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // اختبار 3: محادثة جديدة مع تعبير آخر
    const conversationId2 = `smart-test2-${Date.now()}`;
    
    console.log('\n3️⃣ محادثة جديدة - طلب منتج...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId: conversationId2,
      senderId,
      content: 'أريد الكوتشي الأسود مقاس 40',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 80) + '...');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n4️⃣ العميل يؤكد بتعبير "يلا بينا"...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId: conversationId2,
      senderId,
      content: 'يلا بينا',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 80) + '...');
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
      }
    }

    // فحص الطلبات في قاعدة البيانات
    console.log('\n5️⃣ فحص الطلبات في قاعدة البيانات...');
    const ordersResponse = await axios.get(`${BASE_URL}/api/v1/orders-new/simple`);
    
    if (ordersResponse.data.success) {
      const recentOrders = ordersResponse.data.data.filter(order => 
        order.createdAt > new Date(Date.now() - 10 * 60 * 1000) // آخر 10 دقائق
      );
      
      if (recentOrders.length > 0) {
        console.log(`✅ تم العثور على ${recentOrders.length} طلب حديث:`);
        recentOrders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.productName} - ${order.productColor} - مقاس ${order.productSize}`);
          console.log(`      العميل: ${order.customerName} - الحالة: ${order.status}`);
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
testSmartIntentAnalysis();
