const axios = require('axios');

async function testMessageEndpoint() {
  console.log('🧪 اختبار endpoint إرسال الرسائل...\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const conversationId = 'cmd9gy5vw000lm5f6eld5nrvr'; // المحادثة التي تم اختبارها سابقاً
  
  // بيانات الرسالة
  const messageData = {
    content: 'رسالة اختبار من الـ API مباشرة',
    type: 'TEXT'
  };
  
  console.log('📋 بيانات الطلب:');
  console.log(`URL: ${baseURL}/conversations/${conversationId}/messages`);
  console.log('Body:', JSON.stringify(messageData, null, 2));
  
  try {
    // محاولة إرسال الرسالة بدون authentication أولاً لفهم نوع الخطأ
    console.log('\n🔍 اختبار بدون authentication...');
    
    const response = await axios.post(
      `${baseURL}/conversations/${conversationId}/messages`,
      messageData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ نجح الإرسال:', response.data);
    
  } catch (error) {
    console.log('❌ فشل الإرسال:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('\n💡 المشكلة: مطلوب authentication');
      console.log('🔧 الحل: إضافة Authorization header');
    } else if (error.response?.status === 400) {
      console.log('\n💡 المشكلة: خطأ في بيانات الطلب');
      console.log('🔧 الحل: مراجعة الحقول المطلوبة');
      
      // اختبار بحقول إضافية
      console.log('\n🔄 اختبار بحقول إضافية...');
      await testWithExtraFields(baseURL, conversationId);
    } else if (error.response?.status === 404) {
      console.log('\n💡 المشكلة: المحادثة غير موجودة أو endpoint غير صحيح');
    }
  }
}

async function testWithExtraFields(baseURL, conversationId) {
  const enhancedMessageData = {
    content: 'رسالة اختبار مع حقول إضافية',
    type: 'TEXT',
    senderName: 'Test User',
    isFromCustomer: false,
    conversationId: conversationId,
    senderId: 'test-user-id',
    senderType: 'AGENT'
  };
  
  console.log('📋 بيانات محسنة:');
  console.log(JSON.stringify(enhancedMessageData, null, 2));
  
  try {
    const response = await axios.post(
      `${baseURL}/conversations/${conversationId}/messages`,
      enhancedMessageData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ نجح الإرسال مع الحقول الإضافية:', response.data);
    
  } catch (error) {
    console.log('❌ فشل الإرسال مع الحقول الإضافية:');
    console.log('Status:', error.response?.status);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function testEndpointExists() {
  console.log('\n🔍 اختبار وجود endpoint...');
  
  const baseURL = 'http://localhost:3001/api/v1';
  
  try {
    // اختبار GET للمحادثات
    const response = await axios.get(`${baseURL}/conversations`);
    console.log('✅ Conversations endpoint يعمل');
    
    // اختبار GET لمحادثة محددة
    const conversationId = 'cmd9gy5vw000lm5f6eld5nrvr';
    const convResponse = await axios.get(`${baseURL}/conversations/${conversationId}`);
    console.log('✅ Conversation details endpoint يعمل');
    
    // اختبار GET للرسائل
    const messagesResponse = await axios.get(`${baseURL}/conversations/${conversationId}/messages`);
    console.log('✅ Messages endpoint يعمل');
    
  } catch (error) {
    console.log('❌ خطأ في اختبار endpoints:');
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    console.log('Error:', error.response?.data);
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'endpoint') {
    testEndpointExists();
  } else if (command === 'message') {
    testMessageEndpoint();
  } else {
    console.log('الاستخدام:');
    console.log('node test-message-endpoint.js endpoint  - اختبار وجود endpoints');
    console.log('node test-message-endpoint.js message   - اختبار إرسال رسالة');
    console.log('');
    console.log('تشغيل جميع الاختبارات...');
    testEndpointExists().then(() => {
      console.log('\n' + '='.repeat(50) + '\n');
      return testMessageEndpoint();
    });
  }
}

module.exports = {
  testMessageEndpoint,
  testEndpointExists
};
