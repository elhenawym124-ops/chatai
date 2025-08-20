const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFacebookImages() {
  console.log('📸 اختبار إرسال الصور عبر Facebook webhook...\n');

  try {
    console.log('📝 إرسال webhook message يطلب صور...');
    
    const webhookData = {
      object: 'page',
      entry: [{
        time: Date.now(),
        id: '250528358137901',
        messaging: [{
          sender: { id: '7686787131341653' },
          recipient: { id: '250528358137901' },
          timestamp: Date.now(),
          message: {
            mid: `test-message-${Date.now()}`,
            text: 'عاوز أشوف صور الكوتشي'
          }
        }]
      }]
    };

    console.log('📤 إرسال webhook data...');
    const response = await axios.post(`${BASE_URL}/webhook`, webhookData);
    
    if (response.status === 200) {
      console.log('✅ تم إرسال webhook بنجاح');
      console.log('📄 رد الـ server:', response.data);
      
      console.log('\n⏳ انتظار معالجة الرسالة وإرسال الصور...');
      console.log('🔍 راجع الـ server logs لترى إذا تم إرسال الصور');
      
    } else {
      console.log('❌ فشل في إرسال webhook:', response.status);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📄 تفاصيل الخطأ:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testFacebookImages();
