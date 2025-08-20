const axios = require('axios');

async function testApiResponse() {
  try {
    console.log('🧪 اختبار API response...');
    
    const response = await axios.post('http://localhost:3001/api/v1/ai/test', {
      message: 'اختبار المفاتيح الجديدة - هل تعمل؟'
    }, {
      timeout: 15000
    });
    
    console.log('📊 النتيجة الكاملة:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\n✅ الاختبار نجح!');
      console.log('📝 الرسالة:', response.data.message);
      
      if (response.data.data?.results?.gemini?.response) {
        console.log('🤖 رد Gemini:', response.data.data.results.gemini.response);
      }
      
      if (response.data.data?.testedKeys) {
        console.log('🔑 المفاتيح المختبرة:');
        response.data.data.testedKeys.forEach((key, index) => {
          console.log(`   ${index + 1}. ${key.key}: ${key.status}`);
          if (key.error) {
            console.log(`      الخطأ: ${key.error}`);
          }
        });
      }
    } else {
      console.log('\n❌ الاختبار فشل!');
      console.log('📝 الرسالة:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📊 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testApiResponse();
