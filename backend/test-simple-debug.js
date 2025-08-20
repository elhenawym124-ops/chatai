const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSimpleDebug() {
  console.log('🔍 اختبار بسيط مع تفاصيل...\n');

  const conversationId = `simple-debug-${Date.now()}`;
  const senderId = 'simple-debug-customer';
  
  const customerData = {
    id: 'simple-debug-customer-id',
    name: 'عميل تجريبي',
    phone: '01111222333',
    email: 'debug@example.com',
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

    console.log('📊 Response status:', response.status);
    console.log('📊 Response data keys:', Object.keys(response.data));
    
    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
      console.log('📊 Data keys:', Object.keys(response.data.data));
    } else {
      console.log('❌ فشل في الحصول على رد');
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

    console.log('📊 Response status:', response.status);
    console.log('📊 Response data keys:', Object.keys(response.data));
    
    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
      console.log('📊 Data keys:', Object.keys(response.data.data));
      
      // فحص تفصيلي للبيانات
      if (response.data.data.orderInfo) {
        console.log('🔍 orderInfo موجود:', response.data.data.orderInfo);
      } else {
        console.log('⚠️ orderInfo غير موجود');
      }
      
      if (response.data.data.orderCreated) {
        console.log('🎉 orderCreated موجود:', response.data.data.orderCreated);
      } else {
        console.log('⚠️ orderCreated غير موجود');
      }
    } else {
      console.log('❌ فشل في الحصول على رد');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testSimpleDebug();
