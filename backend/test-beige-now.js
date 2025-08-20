/**
 * 🎨 اختبار البيج مع البيانات الحقيقية
 */

const aiAgent = require('./src/services/aiAgentService');

async function testBeigeWithRealData() {
  console.log('🎨 اختبار البيج مع البيانات الحقيقية الجديدة\n');
  
  const testCases = [
    {
      name: 'طلب البيج مباشرة',
      message: 'عايز أشوف الكوتشي البيج',
      expectedResult: 'صور بيج أو رسالة توضيحية'
    },
    {
      name: 'طلب صورة البيج',
      message: 'ممكن صورة للكوتشي البيج',
      expectedResult: 'صور بيج أو رسالة توضيحية'
    },
    {
      name: 'سؤال عن البيج',
      message: 'شكله ايه الكوتشي البيج؟',
      expectedResult: 'صور بيج أو رسالة توضيحية'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 اختبار ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`📝 الرسالة: "${testCase.message}"`);
    console.log(`🎯 المتوقع: ${testCase.expectedResult}`);
    
    try {
      const startTime = Date.now();
      
      // اختبار النظام الكامل
      const response = await aiAgent.getSmartResponse(
        testCase.message,
        'product_inquiry',
        [],
        'test_customer_beige_real'
      );
      
      const responseTime = Date.now() - startTime;
      const images = response.images || [];
      
      console.log(`📸 عدد الصور المرسلة: ${images.length}`);
      console.log(`⏱️ وقت المعالجة: ${responseTime}ms`);
      
      // تحليل النتائج
      if (images.length > 0) {
        console.log(`📋 تفاصيل الصور:`);
        let hasBeigeImages = false;
        let hasExplanationText = false;
        
        images.forEach((img, idx) => {
          if (img.type === 'image') {
            console.log(`   ${idx + 1}. ${img.payload.title}`);
            console.log(`      URL: ${img.payload.url.substring(0, 50)}...`);
            
            // فحص إذا كان العنوان يحتوي على "بيج"
            if (img.payload.title.includes('بيج') || img.payload.title.includes('البيج')) {
              console.log(`      ✅ يحتوي على "بيج" - ممتاز!`);
              hasBeigeImages = true;
            } else {
              console.log(`      ⚠️ لا يحتوي على "بيج" - قد يكون خطأ`);
            }
          } else if (img.type === 'text') {
            console.log(`   ${idx + 1}. رسالة نصية: ${img.payload.text}`);
            
            // فحص إذا كانت رسالة توضيحية
            if (img.payload.text.includes('لا توجد صور متاحة') || 
                img.payload.text.includes('غير متاح')) {
              console.log(`      ✅ رسالة توضيحية صحيحة`);
              hasExplanationText = true;
            }
          }
        });
        
        // تقييم النتيجة
        if (hasBeigeImages) {
          console.log(`\n🎉 النتيجة: ممتاز! تم العثور على صور بيج صحيحة`);
        } else if (hasExplanationText) {
          console.log(`\n✅ النتيجة: جيد! تم إرسال رسالة توضيحية بدلاً من صور خاطئة`);
        } else {
          console.log(`\n❌ النتيجة: مشكلة! أرسل صور عادية بدون تحديد اللون`);
        }
        
      } else {
        console.log(`⚠️ لم يتم إرسال أي صور`);
        console.log(`❌ النتيجة: خطأ - كان يجب إرسال شيء`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الاختبار: ${error.message}`);
    }
    
    console.log(`${'─'.repeat(60)}`);
  }
  
  // اختبار إضافي: فحص دالة الفلترة مباشرة
  console.log(`\n🔍 اختبار دالة الفلترة مباشرة...`);
  
  try {
    const dummyImages = [
      { type: 'image', payload: { title: 'كوتشي - صورة 1', url: 'http://example.com/1.jpg' } },
      { type: 'image', payload: { title: 'كوتشي - صورة 2', url: 'http://example.com/2.jpg' } },
      { type: 'image', payload: { title: 'كوتشي - صورة 3', url: 'http://example.com/3.jpg' } }
    ];
    
    const filtered = await aiAgent.filterImagesByColor(dummyImages, 'عايز أشوف الكوتشي البيج');
    console.log(`📝 نتيجة الفلترة: ${filtered.length} عنصر`);
    
    if (filtered.length > 0) {
      filtered.forEach((item, idx) => {
        if (item.type === 'image') {
          console.log(`   ${idx + 1}. صورة: ${item.payload.title}`);
        } else if (item.type === 'text') {
          console.log(`   ${idx + 1}. نص: ${item.payload.text}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`❌ خطأ في اختبار الفلترة: ${error.message}`);
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎯 الخلاصة:`);
  console.log(`✅ إذا ظهرت صور بعنوان يحتوي على "بيج" = النظام يعمل بشكل مثالي`);
  console.log(`✅ إذا ظهرت رسالة "لا توجد صور متاحة" = النظام يعمل بشكل صحيح`);
  console.log(`❌ إذا ظهرت صور عادية بدون "بيج" = يحتاج إصلاح`);
  console.log(`${'═'.repeat(60)}`);
}

// تشغيل الاختبار
if (require.main === module) {
  testBeigeWithRealData().catch(console.error);
}

module.exports = testBeigeWithRealData;
