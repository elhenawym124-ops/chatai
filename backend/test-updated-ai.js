const axios = require('axios');

async function testUpdatedAI() {
  console.log('🧪 Testing Updated AI with Image Capabilities...\n');
  
  const testCases = [
    {
      message: 'أريد أن أرى صور الكوتشيات',
      expected: 'Should say it will show images, not that it cannot'
    },
    {
      message: 'ممكن تورني صور المنتجات؟',
      expected: 'Should confirm it will display images'
    },
    {
      message: 'عايز أشوف الكوتشي الاسكوتش',
      expected: 'Should show product details and images'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`📝 Test ${i + 1}/3: "${test.message}"`);
    console.log(`   Expected: ${test.expected}`);
    
    const testData = {
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '7801113803290451' },
          recipient: { id: 'page_id' },
          timestamp: Date.now(),
          message: { text: test.message }
        }]
      }]
    };
    
    try {
      await axios.post('http://localhost:3001/webhook', testData);
      console.log('✅ Sent successfully');
      
      // انتظار بين الاختبارات
      console.log('⏳ Waiting for response...');
      await new Promise(resolve => setTimeout(resolve, 12000));
      
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
    
    console.log('');
  }
  
  console.log('🔍 Check server logs for updated responses');
  console.log('');
  console.log('📊 What should change:');
  console.log('❌ Before: "لا أستطيع عرض الصور مباشرة"');
  console.log('✅ After: "سأعرض لك الصور الآن" or "ستجد الصور أدناه"');
  console.log('');
  console.log('🎯 Expected behavior:');
  console.log('1. AI acknowledges it CAN send images');
  console.log('2. AI tells customer images will be displayed');
  console.log('3. System sends images after text response');
  console.log('4. No more "تحويل لموظف خدمة العملاء" for image requests');
}

testUpdatedAI().catch(console.error);
