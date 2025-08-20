const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFinalImages() {
  console.log('🧪 اختبار النظام النهائي للصور...\n');

  try {
    const response = await fetch('http://localhost:3001/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'page',
        entry: [{
          time: Date.now(),
          id: '250528358137901',
          messaging: [{
            sender: { id: '23949903971327041' },
            recipient: { id: '250528358137901' },
            timestamp: Date.now(),
            message: {
              mid: 'test_final_images_working',
              text: 'ممكن صور الكوتشي؟'
            }
          }]
        }]
      })
    });

    if (response.ok) {
      console.log('✅ تم إرسال الطلب بنجاح');
      console.log('⏳ انتظار معالجة الطلب...');
      
      // انتظار 10 ثوان لمعالجة الطلب
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('🎯 تحقق من لوج الخادم لرؤية النتائج');
    } else {
      console.log('❌ فشل في إرسال الطلب:', response.status);
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testFinalImages();
