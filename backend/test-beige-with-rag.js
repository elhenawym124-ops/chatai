/**
 * 🎯 اختبار البيج مع نظام RAG المحدث
 */

const aiAgent = require('./src/services/aiAgentService');

async function testBeigeWithRAG() {
  console.log('🎯 اختبار البيج مع نظام RAG المحدث\n');
  
  const testCases = [
    {
      name: 'طلب صور البيج مباشرة',
      message: 'عايز أشوف صور الكوتشي البيج',
      expectedResult: 'صور بيج من المتغيرات'
    },
    {
      name: 'طلب البيج بدون كلمة صور',
      message: 'عايز الكوتشي البيج',
      expectedResult: 'صور بيج من المتغيرات'
    },
    {
      name: 'سؤال عن شكل البيج',
      message: 'شكله ايه الكوتشي البيج؟',
      expectedResult: 'صور بيج من المتغيرات'
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
        'test_customer_beige_rag'
      );
      
      const responseTime = Date.now() - startTime;
      const images = response.images || [];
      
      console.log(`📸 عدد الصور المرسلة: ${images.length}`);
      console.log(`⏱️ وقت المعالجة: ${responseTime}ms`);
      
      // تحليل النتائج
      if (images.length > 0) {
        console.log(`📋 تفاصيل الصور:`);
        let hasBeigeImages = false;
        let hasVariantImages = false;
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
            
            // فحص إذا كان من المتغيرات
            if (img.payload.variantName) {
              console.log(`      🎨 من المتغير: ${img.payload.variantName}`);
              hasVariantImages = true;
            } else {
              console.log(`      📦 من صور المنتج العامة`);
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
        if (hasBeigeImages && hasVariantImages) {
          console.log(`\n🎉 النتيجة: ممتاز! تم العثور على صور بيج من المتغيرات`);
        } else if (hasBeigeImages) {
          console.log(`\n✅ النتيجة: جيد! تم العثور على صور بيج (لكن ليس من المتغيرات)`);
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
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🎯 الهدف من التحديثات:`);
  console.log(`✅ RAG يحفظ صور المتغيرات`);
  console.log(`✅ النظام يستخرج صور المتغيرات من RAG`);
  console.log(`✅ الفلترة تعمل مع أسماء المتغيرات`);
  console.log(`✅ النتيجة: صور بيج صحيحة من المتغير`);
  console.log(`${'═'.repeat(60)}`);
}

// تشغيل الاختبار
if (require.main === module) {
  testBeigeWithRAG().catch(console.error);
}

module.exports = testBeigeWithRAG;
