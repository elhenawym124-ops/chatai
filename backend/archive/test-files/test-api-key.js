/**
 * سكريپت لاختبار صحة مفتاح API مع Google Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testApiKey() {
  const targetApiKey = 'AIzaSyAdWtZ3BgcAs3bN_UyCnpMl_tzMWtueH5k';
  
  console.log('🧪 اختبار صحة مفتاح API مع Google Gemini');
  console.log(`🔑 المفتاح: ${targetApiKey}`);
  console.log('=' * 80);

  try {
    // إنشاء عميل Google Generative AI
    console.log('\n🔄 إنشاء عميل Google Generative AI...');
    const genAI = new GoogleGenerativeAI(targetApiKey);

    // اختبار النماذج المختلفة
    const modelsToTest = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    for (const modelName of modelsToTest) {
      console.log(`\n🤖 اختبار النموذج: ${modelName}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      try {
        // الحصول على النموذج
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // إرسال رسالة اختبار بسيطة
        const prompt = "مرحبا، هذا اختبار بسيط. أجب بكلمة واحدة: نعم";
        
        console.log(`📤 إرسال الرسالة: "${prompt}"`);
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const endTime = Date.now();
        
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ النموذج يعمل بنجاح!`);
        console.log(`📥 الرد: "${text.trim()}"`);
        console.log(`⏱️ وقت الاستجابة: ${endTime - startTime} مللي ثانية`);
        
        // معلومات إضافية عن الاستجابة
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          console.log(`🎯 تقييم السلامة: ${candidate.safetyRatings ? 'متوفر' : 'غير متوفر'}`);
          console.log(`📊 سبب الانتهاء: ${candidate.finishReason || 'غير محدد'}`);
        }
        
      } catch (modelError) {
        console.log(`❌ فشل اختبار النموذج: ${modelError.message}`);
        
        // تحليل نوع الخطأ
        if (modelError.message.includes('API_KEY_INVALID')) {
          console.log(`🚫 المفتاح غير صحيح أو منتهي الصلاحية`);
        } else if (modelError.message.includes('PERMISSION_DENIED')) {
          console.log(`🚫 المفتاح لا يملك صلاحية الوصول لهذا النموذج`);
        } else if (modelError.message.includes('QUOTA_EXCEEDED')) {
          console.log(`📊 تم تجاوز حد الاستخدام`);
        } else if (modelError.message.includes('MODEL_NOT_FOUND')) {
          console.log(`🤖 النموذج غير موجود أو غير مدعوم`);
        } else {
          console.log(`❓ خطأ غير معروف: ${modelError.message}`);
        }
      }
    }

    // اختبار معلومات المفتاح
    console.log('\n📋 معلومات إضافية عن المفتاح:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // تحليل تنسيق المفتاح
    if (targetApiKey.startsWith('AIza')) {
      console.log('✅ تنسيق المفتاح صحيح (يبدأ بـ AIza)');
    } else {
      console.log('❌ تنسيق المفتاح غير صحيح (لا يبدأ بـ AIza)');
    }
    
    console.log(`📏 طول المفتاح: ${targetApiKey.length} حرف`);
    console.log(`🔤 يحتوي على أحرف وأرقام فقط: ${/^[A-Za-z0-9_-]+$/.test(targetApiKey) ? 'نعم' : 'لا'}`);

  } catch (error) {
    console.error('\n❌ خطأ عام في الاختبار:', error.message);
    
    // تحليل الخطأ العام
    if (error.message.includes('fetch')) {
      console.log('🌐 مشكلة في الاتصال بالإنترنت');
    } else if (error.message.includes('API_KEY')) {
      console.log('🔑 مشكلة في مفتاح API');
    } else {
      console.log('❓ خطأ غير معروف');
    }
  }

  console.log('\n' + '=' * 80);
  console.log('🏁 انتهى الاختبار');
}

// تشغيل السكريپت
testApiKey().catch(console.error);
