const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMessengerDefaultProduct() {
  console.log('🧪 اختبار المنتج الافتراضي مع الماسنجر...\n');

  const conversationId = `messenger-default-${Date.now()}`;
  const senderId = 'messenger-default-customer';
  
  const customerData = {
    id: 'messenger-default-customer-id',
    name: 'عميل افتراضي',
    phone: '01888999000',
    email: 'default@example.com',
    orderCount: 0
  };

  try {
    // الرسالة الأولى: طلب لون ومقاس فقط (محاكاة مشكلة الماسنجر)
    console.log('1️⃣ العميل يطلب لون ومقاس فقط (بدون ذكر المنتج)...');
    let response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'اللون الأبيض مقاس 40',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
      console.log('📊 orderInfo:', JSON.stringify(response.data.data.orderInfo, null, 2));
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // الرسالة الثانية: التأكيد
    console.log('\n2️⃣ العميل يؤكد بـ "ايوه اكد"...');
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'ايوه اكد',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:', response.data.data.content.substring(0, 100) + '...');
      console.log('📊 orderInfo:', JSON.stringify(response.data.data.orderInfo, null, 2));
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
        console.log('💰 المبلغ:', response.data.data.orderCreated.total);
        console.log('🏷️ المنتج:', response.data.data.orderCreated.items[0].name);
        console.log('🎨 اللون:', response.data.data.orderCreated.items[0].metadata.color);
        console.log('📏 المقاس:', response.data.data.orderCreated.items[0].metadata.size);
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
        console.log('❌ السبب: orderInfo.isComplete =', response.data.data.orderInfo?.isComplete);
        console.log('❌ productName =', response.data.data.orderInfo?.productName);
        console.log('❌ hasBasicProductInfo =', !!(response.data.data.orderInfo?.productName && (response.data.data.orderInfo?.productColor || response.data.data.orderInfo?.productSize)));
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
testMessengerDefaultProduct();
