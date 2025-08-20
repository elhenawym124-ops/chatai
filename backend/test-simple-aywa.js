const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSimpleAywa() {
  console.log('🧪 اختبار بسيط لكلمة "ايوه"...\n');

  const conversationId = `simple-aywa-${Date.now()}`;
  const senderId = 'simple-customer';
  
  const customerData = {
    id: 'simple-customer-id',
    name: 'عميل بسيط',
    phone: '01333444555',
    email: 'simple@example.com',
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

    await new Promise(resolve => setTimeout(resolve, 3000));

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
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
        console.log('💰 المبلغ:', response.data.data.orderCreated.total);
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
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
testSimpleAywa();
