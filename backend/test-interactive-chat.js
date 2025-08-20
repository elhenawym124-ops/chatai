const fetch = require('node-fetch');

async function testInteractiveChat() {
  console.log('🧪 اختبار التبويبة التفاعلية...\n');
  
  const baseURL = 'http://localhost:3001';
  
  const testMessages = [
    { message: 'مرحباً كيف الحال؟', capability: 'smart-responses' },
    { message: 'أريد كوتشي حريمي أبيض', capability: 'product-recommendations' },
    { message: 'أشعر بالسعادة اليوم', capability: 'sentiment-analysis' },
    { message: 'أريد شراء هاتف جديد', capability: 'intent-recognition' },
    { message: 'ابحث عن منتجات رياضية', capability: 'product-search' }
  ];
  
  for (const test of testMessages) {
    console.log(`💬 اختبار: ${test.message}`);
    console.log(`🎯 القدرة: ${test.capability}`);
    
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(test)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ نجح الاختبار (${data.responseTime}ms)`);
        console.log(`📋 الرد: ${JSON.stringify(data.data).substring(0, 100)}...`);
      } else {
        console.log(`❌ فشل الاختبار: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ خطأ: ${error.message}`);
    }
    
    console.log('---');
  }
  
  console.log('🎉 انتهى اختبار التبويبة التفاعلية!');
}

testInteractiveChat();
