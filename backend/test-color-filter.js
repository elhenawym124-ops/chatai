/**
 * 🎨 اختبار نظام فلترة الألوان
 */

const aiAgent = require('./src/services/aiAgentService');

async function testColorFilter() {
  console.log('🎨 اختبار نظام فلترة الألوان المحسن\n');
  
  // حالات اختبار الألوان
  const colorTests = [
    {
      name: 'طلب اللون الأسود',
      message: 'عايز أشوف الكوتشي الأسود',
      expectedColor: 'اسود',
      description: 'يجب أن يرسل صور سوداء فقط'
    },
    {
      name: 'طلب اللون الأبيض',
      message: 'ممكن صورة للكوتشي الأبيض',
      expectedColor: 'ابيض',
      description: 'يجب أن يرسل صور بيضاء فقط'
    },
    {
      name: 'طلب اللون الأحمر',
      message: 'وريني الكوتشي الأحمر',
      expectedColor: 'احمر',
      description: 'يجب أن يرسل صور حمراء فقط'
    },
    {
      name: 'طلب اللون الأزرق',
      message: 'شكله ايه الكوتشي الأزرق؟',
      expectedColor: 'ازرق',
      description: 'يجب أن يرسل صور زرقاء فقط'
    },
    {
      name: 'بدون لون محدد',
      message: 'عايز أشوف الكوتشي',
      expectedColor: null,
      description: 'يجب أن يرسل جميع الصور المتاحة'
    }
  ];

  let passedTests = 0;
  let totalTests = colorTests.length;

  console.log(`🎯 بدء اختبار ${totalTests} حالة لفلترة الألوان...\n`);

  for (let i = 0; i < colorTests.length; i++) {
    const testCase = colorTests[i];
    console.log(`\n📋 اختبار ${i + 1}/${totalTests}: ${testCase.name}`);
    console.log(`📝 الرسالة: "${testCase.message}"`);
    console.log(`🎨 اللون المتوقع: ${testCase.expectedColor || 'جميع الألوان'}`);
    
    try {
      const startTime = Date.now();
      
      // اختبار النظام الكامل
      const response = await aiAgent.getSmartResponse(
        testCase.message,
        'product_inquiry',
        [],
        'test_customer_color'
      );
      
      const responseTime = Date.now() - startTime;
      const images = response.images || [];
      
      console.log(`📸 عدد الصور المرسلة: ${images.length}`);
      console.log(`⏱️ وقت المعالجة: ${responseTime}ms`);
      
      // فحص النتائج
      if (images.length > 0) {
        console.log(`📋 تفاصيل الصور:`);
        images.forEach((img, idx) => {
          if (img.type === 'image') {
            console.log(`   ${idx + 1}. ${img.payload.title}`);
            console.log(`      URL: ${img.payload.url.substring(0, 50)}...`);
          } else if (img.type === 'text') {
            console.log(`   ${idx + 1}. رسالة نصية: ${img.payload.text}`);
          }
        });
        
        // فحص صحة الفلترة
        if (testCase.expectedColor) {
          const hasCorrectColor = images.some(img => 
            img.payload.title && img.payload.title.toLowerCase().includes(testCase.expectedColor)
          );
          
          if (hasCorrectColor) {
            console.log(`✅ الفلترة صحيحة - وجدت صور باللون ${testCase.expectedColor}`);
            passedTests++;
          } else {
            console.log(`❌ الفلترة خاطئة - لم توجد صور باللون ${testCase.expectedColor}`);
            
            // فحص إذا كانت رسالة نصية توضيحية
            const hasExplanation = images.some(img => 
              img.type === 'text' && img.payload.text.includes('لا توجد صور متاحة')
            );
            
            if (hasExplanation) {
              console.log(`ℹ️ تم إرسال رسالة توضيحية بدلاً من صور خاطئة - هذا صحيح`);
              passedTests++;
            }
          }
        } else {
          // بدون لون محدد - يجب أن يرسل عدة صور
          if (images.length >= 2) {
            console.log(`✅ صحيح - أرسل ${images.length} صور بدون فلترة`);
            passedTests++;
          } else {
            console.log(`❌ خطأ - أرسل صور قليلة جداً (${images.length})`);
          }
        }
      } else {
        console.log(`⚠️ لم يتم إرسال أي صور`);
        
        // فحص إذا كان هذا متوقع
        if (testCase.expectedColor) {
          console.log(`❌ خطأ - كان يجب إرسال صور باللون ${testCase.expectedColor}`);
        } else {
          console.log(`❌ خطأ - كان يجب إرسال صور`);
        }
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
    }
    
    console.log(`${'─'.repeat(60)}`);
  }

  // النتائج النهائية
  console.log(`\n🎉 نتائج اختبار فلترة الألوان:`);
  console.log(`✅ نجح: ${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ فشل: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log(`\n🎊 ممتاز! نظام فلترة الألوان يعمل بشكل مثالي!`);
  } else {
    console.log(`\n⚠️ يحتاج تحسين في ${totalTests - passedTests} حالة`);
  }

  // اختبار إضافي: فحص كشف الألوان
  console.log(`\n🔍 اختبار كشف الألوان المباشر...`);
  
  const colorDetectionTests = [
    'الكوتشي الأسود',
    'الكوتشي الأبيض', 
    'الكوتشي الأحمر',
    'الكوتشي الأزرق',
    'الكوتشي'
  ];

  for (const msg of colorDetectionTests) {
    try {
      // إنشاء صور وهمية للاختبار
      const dummyImages = [
        { type: 'image', payload: { title: 'كوتشي - صورة 1', url: 'http://example.com/1.jpg' } },
        { type: 'image', payload: { title: 'كوتشي - صورة 2', url: 'http://example.com/2.jpg' } },
        { type: 'image', payload: { title: 'كوتشي - صورة 3', url: 'http://example.com/3.jpg' } }
      ];
      
      const filtered = await aiAgent.filterImagesByColor(dummyImages, msg);
      console.log(`📝 "${msg}" -> ${filtered.length} صور`);
      
      if (filtered.length > 0 && filtered[0].payload) {
        console.log(`   العنوان: ${filtered[0].payload.title}`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في كشف اللون: ${error.message}`);
    }
  }

  console.log(`\n🎯 انتهى اختبار فلترة الألوان!`);
}

// تشغيل الاختبار
if (require.main === module) {
  testColorFilter().catch(console.error);
}

module.exports = testColorFilter;
