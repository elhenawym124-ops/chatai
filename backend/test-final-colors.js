/**
 * اختبار نهائي لرسالة الألوان
 */

async function testFinalColors() {
  console.log('🎨 الاختبار النهائي لرسالة الألوان...\n');
  
  const baseURL = 'http://localhost:3001';
  
  // اختبار مباشر للنظام الذكي
  console.log('📝 اختبار: "في الوان منه ؟"');
  
  try {
    const response = await fetch(`${baseURL}/api/v1/ai/intelligent-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'في الوان منه ؟',
        companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
        customerId: 'test_final_colors',
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ النظام الذكي يعمل!');
      console.log(`📤 الرد: "${data.data.response}"`);
      console.log(`🎯 نوع المحادثة: ${data.data.conversationType}`);
      console.log(`🛍️ عرض منتجات: ${data.data.hasProducts ? 'نعم' : 'لا'}`);
      console.log(`📊 مستوى الثقة: ${(data.data.confidence * 100).toFixed(1)}%`);
      console.log(`⏱️ وقت الاستجابة: ${data.metadata.responseTime}ms`);
      
      if (data.data.hasProducts) {
        console.log('🎉 ممتاز! النظام يعرض منتجات مع سؤال الألوان');
      } else {
        console.log('⚠️ النظام لا يعرض منتجات - يحتاج تحسين');
      }
      
    } else {
      console.log(`❌ خطأ: ${data.error}`);
    }
    
  } catch (error) {
    console.log(`❌ خطأ في الطلب: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 انتهى الاختبار النهائي');
  console.log('='.repeat(60));
}

// تشغيل الاختبار
testFinalColors().catch(console.error);
