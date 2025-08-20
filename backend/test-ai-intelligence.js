/**
 * اختبار الذكاء الاصطناعي الحقيقي
 * اختبار رسائل لا تحتوي على كلمات مفتاحية واضحة
 */

async function testAIIntelligence() {
  console.log('🧠 اختبار الذكاء الاصطناعي الحقيقي...\n');
  
  const baseURL = 'http://localhost:3001';
  
  const testCases = [
    {
      message: 'في الوان منه ؟',
      description: 'سؤال عن الألوان بدون كلمة "ألوان" واضحة',
      expectedType: 'product_inquiry',
      expectedProducts: true
    },
    {
      message: 'ايه المتاح؟',
      description: 'سؤال عام عن المتاح',
      expectedType: 'product_inquiry',
      expectedProducts: true
    },
    {
      message: 'عندك ايه؟',
      description: 'سؤال مفتوح عن المنتجات',
      expectedType: 'product_request',
      expectedProducts: true
    },
    {
      message: 'كده كام؟',
      description: 'سؤال عن السعر بطريقة عامية',
      expectedType: 'product_inquiry',
      expectedProducts: true
    },
    {
      message: 'ممكن أشوف؟',
      description: 'طلب رؤية بدون ذكر منتجات',
      expectedType: 'product_request',
      expectedProducts: true
    },
    {
      message: 'ازيك؟',
      description: 'سؤال عام - لا يحتاج منتجات',
      expectedType: 'general_question',
      expectedProducts: false
    },
    {
      message: '؟',
      description: 'علامة استفهام فقط',
      expectedType: 'general',
      expectedProducts: false
    }
  ];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    
    console.log(`\n📝 اختبار ${i + 1}: "${test.message}"`);
    console.log(`📋 ${test.description}`);
    console.log(`🎯 متوقع: ${test.expectedType} | منتجات: ${test.expectedProducts ? 'نعم' : 'لا'}`);
    
    try {
      const response = await fetch(`${baseURL}/api/v1/ai/intelligent-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: test.message,
          companyId: 'cmd5c0c9y0000ymzdd7wtv7ib',
          customerId: `test_ai_${i}`,
          conversationHistory: []
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const actualType = data.data.conversationType;
        const actualProducts = data.data.hasProducts;
        
        console.log(`📤 الرد: "${data.data.response.substring(0, 50)}..."`);
        console.log(`🤖 النوع الفعلي: ${actualType}`);
        console.log(`🛍️ منتجات فعلية: ${actualProducts ? 'نعم' : 'لا'}`);
        console.log(`📊 الثقة: ${(data.data.confidence * 100).toFixed(1)}%`);
        
        // تقييم النتيجة
        const typeCorrect = actualType === test.expectedType;
        const productsCorrect = actualProducts === test.expectedProducts;
        
        if (typeCorrect && productsCorrect) {
          console.log('✅ نجح الاختبار - الذكاء الاصطناعي يعمل بدقة!');
          passedTests++;
        } else {
          console.log('❌ فشل الاختبار:');
          if (!typeCorrect) console.log(`   - النوع خطأ: متوقع ${test.expectedType}, فعلي ${actualType}`);
          if (!productsCorrect) console.log(`   - المنتجات خطأ: متوقع ${test.expectedProducts}, فعلي ${actualProducts}`);
        }
        
      } else {
        console.log(`❌ خطأ: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في الطلب: ${error.message}`);
    }
    
    // انتظار قصير بين الاختبارات
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 نتائج اختبار الذكاء الاصطناعي');
  console.log('='.repeat(70));
  console.log(`✅ نجح: ${passedTests}/${totalTests} اختبار`);
  console.log(`📈 معدل النجاح: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ممتاز! النظام يعمل بذكاء اصطناعي حقيقي');
    console.log('   لا يعتمد على كلمات مفتاحية بل يفهم المعنى والسياق');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n👍 جيد جداً! النظام ذكي لكن يحتاج تحسينات طفيفة');
  } else {
    console.log('\n⚠️ يحتاج تحسين! النظام لا يزال يعتمد على كلمات مفتاحية');
  }
}

// تشغيل الاختبار
testAIIntelligence().catch(console.error);
