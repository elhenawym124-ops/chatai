const fetch = require('node-fetch');

async function testSearch() {
  try {
    console.log('🔍 اختبار البحث الجديد...\n');
    
    // اختبار 1: البحث عن العميل المطلوب
    console.log('1️⃣ البحث عن: 24283883604576317');
    const response1 = await fetch('http://localhost:3001/api/v1/conversations?search=24283883604576317');
    const result1 = await response1.json();
    
    console.log('النتيجة:', result1.message || 'لا توجد رسالة');
    console.log('عدد النتائج:', result1.data ? result1.data.length : 0);
    
    if (result1.data && result1.data.length > 0) {
      console.log('✅ تم العثور على المحادثة!');
      result1.data.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.customerName} - ${conv.customerId}`);
        console.log(`   آخر رسالة: ${conv.lastMessage.substring(0, 50)}...`);
      });
    } else {
      console.log('❌ لم يتم العثور على المحادثة');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار 2: البحث بدون كلمة بحث (جميع المحادثات)
    console.log('2️⃣ تحميل جميع المحادثات (بدون بحث)');
    const response2 = await fetch('http://localhost:3001/api/v1/conversations');
    const result2 = await response2.json();
    
    console.log('النتيجة:', result2.message || 'لا توجد رسالة');
    console.log('عدد المحادثات:', result2.data ? result2.data.length : 0);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // اختبار 3: البحث عن كلمة شائعة
    console.log('3️⃣ البحث عن: "كوتشي"');
    const response3 = await fetch('http://localhost:3001/api/v1/conversations?search=كوتشي');
    const result3 = await response3.json();
    
    console.log('النتيجة:', result3.message || 'لا توجد رسالة');
    console.log('عدد النتائج:', result3.data ? result3.data.length : 0);
    
    if (result3.data && result3.data.length > 0) {
      console.log('أول 3 نتائج:');
      result3.data.slice(0, 3).forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.customerName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testSearch();
