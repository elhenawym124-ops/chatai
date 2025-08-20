const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testWithDetailedLogs() {
  console.log('🔍 اختبار مع الـ logs المفصلة...\n');

  const conversationId = `detailed-test-${Date.now()}`;
  const senderId = 'detailed-customer';
  
  const customerData = {
    id: 'detailed-customer-id',
    name: 'عميل مفصل',
    phone: '01555666777',
    email: 'detailed@example.com',
    orderCount: 0
  };

  try {
    console.log('📝 إرسال رسالة بسيطة لاختبار الـ logs...');
    
    const response = await axios.post(`${BASE_URL}/test-ai-direct`, {
      conversationId,
      senderId,
      content: 'السلام عليكم',
      attachments: [],
      customerData
    });

    if (response.data.success) {
      console.log('✅ تم الرد بنجاح');
      console.log('📄 محتوى الرد:', response.data.content || response.data.message);
    } else {
      console.log('❌ فشل في الرد:', response.data.error);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testWithDetailedLogs();
