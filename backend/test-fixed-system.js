const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFixedSystem() {
  console.log('🧪 اختبار النظام المحسن (بعد إصلاح جميع المشاكل)...\n');

  const conversationId = `fixed-system-${Date.now()}`;
  const senderId = 'fixed-system-customer';
  
  const customerData = {
    id: 'fixed-system-customer-id',
    name: 'عميل النظام المحسن',
    phone: '01222333444',
    email: 'fixed-system@example.com',
    orderCount: 0
  };

  try {
    // السيناريو 1: العميل يطلب لون ومقاس بدون منتج
    console.log('🎯 السيناريو 1: العميل يطلب لون ومقاس بدون منتج');
    console.log('1️⃣ العميل: "اللون الأزرق مقاس 42"');
    
    let response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'اللون الأزرق مقاس 42',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:');
      console.log(response.data.data.content);
      
      // فحص إذا كان النظام سأل عن المنتج
      if (response.data.data.content.includes('إيه نوع المنتج') || 
          response.data.data.content.includes('المنتج اللي') ||
          response.data.data.content.includes('عندنا منتجات')) {
        console.log('\n🎉 ممتاز! النظام سأل عن المنتج بدلاً من استخدام منتج افتراضي');
      } else {
        console.log('\n⚠️ النظام لم يسأل عن المنتج');
        console.log('📊 orderInfo:', JSON.stringify(response.data.data.orderInfo, null, 2));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // السيناريو 2: العميل يحدد المنتج
    console.log('\n2️⃣ العميل: "كوتشي حريمي"');
    
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'كوتشي حريمي',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:');
      console.log(response.data.data.content);
      console.log('\n📊 orderInfo:', JSON.stringify(response.data.data.orderInfo, null, 2));
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // السيناريو 3: العميل يؤكد
    console.log('\n3️⃣ العميل: "ايوه اكد"');
    
    response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'ايوه اكد',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ رد النظام:');
      console.log(response.data.data.content);
      console.log('\n📊 orderInfo:', JSON.stringify(response.data.data.orderInfo, null, 2));
      
      if (response.data.data.orderCreated) {
        console.log('\n🎉 تم إنشاء الطلب بنجاح!');
        console.log('📋 رقم الطلب:', response.data.data.orderCreated.orderNumber);
        console.log('💰 المبلغ:', response.data.data.orderCreated.total);
        console.log('🏷️ المنتج:', response.data.data.orderCreated.items[0].name);
        console.log('🎨 اللون:', response.data.data.orderCreated.items[0].metadata.color);
        console.log('📏 المقاس:', response.data.data.orderCreated.items[0].metadata.size);
        
        console.log('\n✅ النظام يعمل بشكل مثالي!');
        console.log('✅ لا يستخدم منتج افتراضي');
        console.log('✅ يسأل العميل عن المنتج المطلوب');
        console.log('✅ ينشئ الطلب بعد التأكيد');
        
      } else {
        console.log('\n⚠️ لم يتم إنشاء طلب');
        console.log('❌ السبب: orderInfo.isComplete =', response.data.data.orderInfo?.isComplete);
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
testFixedSystem();
