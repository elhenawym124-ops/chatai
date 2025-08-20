/**
 * 🧪 اختبار النظام الجديد للصور المعتمد على الذكاء الاصطناعي
 */

const aiAgent = require('./src/services/aiAgentService');

async function testAIImageSystem() {
  console.log('🧪 اختبار النظام الجديد للصور المعتمد على الذكاء الاصطناعي\n');
  
  // حالات اختبار متنوعة
  const testCases = [
    {
      name: 'طلب صور مباشر',
      message: 'ممكن صورة للكوتشي',
      expectedImages: true,
      description: 'يجب أن يرسل صور'
    },
    {
      name: 'طلب صور غير مباشر',
      message: 'عايز أشوف الكوتشي المتاح',
      expectedImages: true,
      description: 'يجب أن يرسل صور'
    },
    {
      name: 'استفسار عام',
      message: 'إيه اللي عندكم من كوتشي؟',
      expectedImages: false,
      description: 'لا يجب أن يرسل صور'
    },
    {
      name: 'سؤال عن السعر',
      message: 'كام سعر الكوتشي؟',
      expectedImages: false,
      description: 'لا يجب أن يرسل صور'
    },
    {
      name: 'سؤال عن التوفر',
      message: 'الكوتشي متوفر؟',
      expectedImages: false,
      description: 'لا يجب أن يرسل صور'
    },
    {
      name: 'طلب رؤية شكل المنتج',
      message: 'شكله ايه الكوتشي ده؟',
      expectedImages: true,
      description: 'يجب أن يرسل صور'
    },
    {
      name: 'طلب عرض المنتج',
      message: 'وريني الكوتشي',
      expectedImages: true,
      description: 'يجب أن يرسل صور'
    },
    {
      name: 'استفسار عن المقاسات',
      message: 'إيه المقاسات المتاحة؟',
      expectedImages: false,
      description: 'لا يجب أن يرسل صور'
    },
    {
      name: 'كلمة شوف عامة',
      message: 'شوف لي إيه المتاح',
      expectedImages: false,
      description: 'لا يجب أن يرسل صور (كلمة عامة)'
    },
    {
      name: 'طلب صور بلون محدد',
      message: 'عايز أشوف الكوتشي الأبيض',
      expectedImages: true,
      description: 'يجب أن يرسل صور مفلترة باللون'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  console.log(`🎯 بدء اختبار ${totalTests} حالة...\n`);

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 اختبار ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`📝 الرسالة: "${testCase.message}"`);
    console.log(`🎯 المتوقع: ${testCase.expectedImages ? 'إرسال صور' : 'عدم إرسال صور'}`);
    
    try {
      // اختبار كشف طلب الصور
      const startTime = Date.now();
      const wantsImages = await aiAgent.isCustomerRequestingImages(testCase.message, []);
      const detectionTime = Date.now() - startTime;
      
      console.log(`🧠 نتيجة AI: ${wantsImages ? '✅ يريد صور' : '❌ لا يريد صور'} (${detectionTime}ms)`);
      
      // اختبار الرد الذكي
      const smartStartTime = Date.now();
      const smartResponse = await aiAgent.getSmartResponse(
        testCase.message,
        'product_inquiry',
        [],
        'test_customer_123'
      );
      const smartTime = Date.now() - smartStartTime;
      
      const actualImages = smartResponse.images?.length || 0;
      console.log(`📸 الصور المرسلة: ${actualImages} صورة`);
      console.log(`📊 RAG البيانات: ${smartResponse.ragData?.length || 0} عنصر`);
      console.log(`⏱️ وقت المعالجة: ${smartTime}ms`);
      
      // تحقق من النتيجة
      const testPassed = (testCase.expectedImages && actualImages > 0) || 
                        (!testCase.expectedImages && actualImages === 0);
      
      if (testPassed) {
        console.log(`✅ نجح الاختبار`);
        passedTests++;
      } else {
        console.log(`❌ فشل الاختبار`);
        console.log(`   المتوقع: ${testCase.expectedImages ? 'صور' : 'لا صور'}`);
        console.log(`   الفعلي: ${actualImages > 0 ? 'صور' : 'لا صور'}`);
      }
      
      // عرض تفاصيل الصور إذا وجدت
      if (actualImages > 0) {
        console.log(`📋 تفاصيل الصور:`);
        smartResponse.images.forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.payload.title}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
    }
    
    console.log(`${'─'.repeat(60)}`);
  }

  // النتائج النهائية
  console.log(`\n🎉 نتائج الاختبار:`);
  console.log(`✅ نجح: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ فشل: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎊 ممتاز! جميع الاختبارات نجحت!`);
    console.log(`🧠 النظام الجديد يعمل بذكاء ودقة`);
  } else {
    console.log(`\n⚠️ يحتاج تحسين في ${totalTests - passedTests} حالة`);
  }

  // اختبار إضافي: قياس الأداء
  console.log(`\n⚡ اختبار الأداء...`);
  const performanceTests = [
    'ممكن صورة',
    'عايز أشوف المنتج',
    'إيه السعر؟'
  ];

  let totalTime = 0;
  for (const msg of performanceTests) {
    const start = Date.now();
    await aiAgent.isCustomerRequestingImages(msg, []);
    const time = Date.now() - start;
    totalTime += time;
    console.log(`📊 "${msg}" -> ${time}ms`);
  }
  
  const avgTime = totalTime / performanceTests.length;
  console.log(`📈 متوسط وقت الاستجابة: ${avgTime.toFixed(0)}ms`);
  
  if (avgTime < 2000) {
    console.log(`✅ الأداء ممتاز (أقل من 2 ثانية)`);
  } else if (avgTime < 5000) {
    console.log(`⚠️ الأداء مقبول (أقل من 5 ثوان)`);
  } else {
    console.log(`❌ الأداء بطيء (أكثر من 5 ثوان)`);
  }

  console.log(`\n🎯 انتهى الاختبار!`);
}

// تشغيل الاختبار
if (require.main === module) {
  testAIImageSystem().catch(console.error);
}

module.exports = testAIImageSystem;
