const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simpleAPITest() {
  console.log('🧪 اختبار API بسيط...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // اختبار 1: معلومات الأدوات
  console.log('--- اختبار 1: معلومات الأدوات ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/tools`);
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ نجح:', data.success);
      } catch (e) {
        console.log('❌ خطأ في JSON:', e.message);
      }
    } else {
      console.log('❌ خطأ HTTP:', response.status);
    }
  } catch (error) {
    console.log('❌ خطأ في الطلب:', error.message);
  }
  
  // اختبار 2: النظام الاحتياطي
  console.log('\n--- اختبار 2: النظام الاحتياطي ---');
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/generate-response-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'أريد أن أرى المنتجات الشائعة',
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
      })
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response text:', text.substring(0, 200) + '...');
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('✅ نجح:', data.success);
        if (data.success) {
          console.log('🤖 الرد:', data.data.response.substring(0, 100) + '...');
          console.log('🔧 النموذج:', data.metadata.model);
        }
      } catch (e) {
        console.log('❌ خطأ في JSON:', e.message);
      }
    } else {
      console.log('❌ خطأ HTTP:', response.status);
    }
  } catch (error) {
    console.log('❌ خطأ في الطلب:', error.message);
  }
}

simpleAPITest();
