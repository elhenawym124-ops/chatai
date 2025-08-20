/**
 * 🎨 اختبار مشكلة البيج المحددة
 */

const aiAgent = require('./src/services/aiAgentService');

async function testBeigeIssue() {
  console.log('🎨 اختبار مشكلة البيج المحددة\n');
  
  const testMessage = 'عايز أشوف الكوتشي البيج';
  
  console.log(`📝 الرسالة: "${testMessage}"`);
  console.log(`🎯 المتوقع: رسالة توضيحية أو صور بيج (إذا كانت متاحة)`);
  console.log(`❌ المشكلة الحالية: يرسل 3 صور عادية\n`);
  
  try {
    const startTime = Date.now();
    
    // اختبار النظام الكامل
    const response = await aiAgent.getSmartResponse(
      testMessage,
      'product_inquiry',
      [],
      'test_customer_beige'
    );
    
    const responseTime = Date.now() - startTime;
    const images = response.images || [];
    
    console.log(`📸 عدد الصور المرسلة: ${images.length}`);
    console.log(`⏱️ وقت المعالجة: ${responseTime}ms\n`);
    
    // فحص النتائج
    if (images.length > 0) {
      console.log(`📋 تفاصيل الصور:`);
      images.forEach((img, idx) => {
        if (img.type === 'image') {
          console.log(`   ${idx + 1}. ${img.payload.title}`);
          console.log(`      URL: ${img.payload.url.substring(0, 50)}...`);
          
          // فحص إذا كان العنوان يحتوي على "بيج"
          if (img.payload.title.includes('بيج')) {
            console.log(`      ✅ يحتوي على "بيج" - صحيح!`);
          } else {
            console.log(`      ❌ لا يحتوي على "بيج" - خطأ!`);
          }
        } else if (img.type === 'text') {
          console.log(`   ${idx + 1}. رسالة نصية: ${img.payload.text}`);
          
          // فحص إذا كانت رسالة توضيحية
          if (img.payload.text.includes('لا توجد صور متاحة')) {
            console.log(`      ✅ رسالة توضيحية صحيحة`);
          }
        }
      });
    } else {
      console.log(`⚠️ لم يتم إرسال أي صور`);
    }
    
    // اختبار كشف اللون مباشرة
    console.log(`\n🔍 اختبار كشف اللون المباشر...`);
    
    const dummyImages = [
      { type: 'image', payload: { title: 'كوتشي - صورة 1', url: 'http://example.com/1.jpg' } },
      { type: 'image', payload: { title: 'كوتشي - صورة 2', url: 'http://example.com/2.jpg' } },
      { type: 'image', payload: { title: 'كوتشي - صورة 3', url: 'http://example.com/3.jpg' } }
    ];
    
    const filtered = await aiAgent.filterImagesByColor(dummyImages, testMessage);
    console.log(`📝 كشف اللون: ${filtered.length} صور`);
    
    if (filtered.length > 0 && filtered[0].type === 'text') {
      console.log(`✅ تم إرسال رسالة توضيحية بدلاً من صور خاطئة`);
      console.log(`📄 الرسالة: ${filtered[0].payload.text}`);
    } else if (filtered.length > 0 && filtered[0].payload.title.includes('بيج')) {
      console.log(`✅ تم العثور على صور بيج صحيحة`);
    } else {
      console.log(`❌ مشكلة: أرسل صور عادية بدلاً من رسالة توضيحية`);
    }
    
  } catch (error) {
    console.log(`❌ خطأ في الاختبار: ${error.message}`);
    console.log(`📋 تفاصيل الخطأ:`, error);
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎯 الهدف: عندما يطلب العميل لون غير متاح (مثل البيج)`);
  console.log(`✅ يجب أن يرسل: رسالة توضيحية`);
  console.log(`❌ لا يجب أن يرسل: صور عادية بعناوين مضللة`);
  console.log(`${'═'.repeat(60)}`);
}

// تشغيل الاختبار
if (require.main === module) {
  testBeigeIssue().catch(console.error);
}

module.exports = testBeigeIssue;
