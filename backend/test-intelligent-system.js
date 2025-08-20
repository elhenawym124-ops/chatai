/**
 * اختبار شامل للنظام الذكي الجديد
 * يختبر جميع أنواع الرسائل والسيناريوهات
 */

const testScenarios = [
  // سيناريو 1: التحيات (يجب ألا تعرض منتجات)
  {
    category: 'التحيات',
    tests: [
      {
        message: 'مرحبا',
        expectedBehavior: 'تحية ودودة بدون منتجات',
        shouldShowProducts: false
      },
      {
        message: 'السلام عليكم',
        expectedBehavior: 'رد السلام بدون منتجات',
        shouldShowProducts: false
      },
      {
        message: 'أهلا وسهلا',
        expectedBehavior: 'ترحيب بدون منتجات',
        shouldShowProducts: false
      }
    ]
  },

  // سيناريو 2: الأسئلة العامة (يجب ألا تعرض منتجات)
  {
    category: 'الأسئلة العامة',
    tests: [
      {
        message: 'كيف الحال؟',
        expectedBehavior: 'رد على السؤال بدون منتجات',
        shouldShowProducts: false
      },
      {
        message: 'ازيك؟',
        expectedBehavior: 'رد ودود بدون منتجات',
        shouldShowProducts: false
      }
    ]
  },

  // سيناريو 3: طلب المنتجات المباشر (يجب أن تعرض منتجات)
  {
    category: 'طلب المنتجات',
    tests: [
      {
        message: 'عايز كوتشي',
        expectedBehavior: 'عرض أحذية مع صور وأسعار',
        shouldShowProducts: true
      },
      {
        message: 'أريد أحذية جديدة',
        expectedBehavior: 'عرض أحذية مع تفاصيل',
        shouldShowProducts: true
      },
      {
        message: 'اعرضي المنتجات',
        expectedBehavior: 'عرض جميع المنتجات',
        shouldShowProducts: true
      },
      {
        message: 'ايه اللي عندك؟',
        expectedBehavior: 'عرض المنتجات المتاحة',
        shouldShowProducts: true
      }
    ]
  },

  // سيناريو 4: أسئلة عن المنتجات (يجب أن تعرض منتجات)
  {
    category: 'استفسارات المنتجات',
    tests: [
      {
        message: 'كام سعر الكوتشي؟',
        expectedBehavior: 'عرض أسعار الأحذية',
        shouldShowProducts: true
      },
      {
        message: 'ايه الألوان المتاحة؟',
        expectedBehavior: 'عرض المنتجات مع الألوان',
        shouldShowProducts: true
      },
      {
        message: 'عندك مقاس 42؟',
        expectedBehavior: 'عرض المنتجات مع المقاسات',
        shouldShowProducts: true
      }
    ]
  },

  // سيناريو 5: أسئلة الخدمة (قد تعرض منتجات حسب السياق)
  {
    category: 'أسئلة الخدمة',
    tests: [
      {
        message: 'كام سعر الشحن؟',
        expectedBehavior: 'معلومات الشحن + اقتراح منتجات',
        shouldShowProducts: true,
        note: 'قد يقترح منتجات للعملاء الجدد'
      },
      {
        message: 'ايه طرق الدفع؟',
        expectedBehavior: 'معلومات الدفع بدون منتجات',
        shouldShowProducts: false
      }
    ]
  },

  // سيناريو 6: الشكر والوداع (يجب ألا تعرض منتجات)
  {
    category: 'الشكر والوداع',
    tests: [
      {
        message: 'شكرا ليكي',
        expectedBehavior: 'رد بالعفو بدون منتجات',
        shouldShowProducts: false
      },
      {
        message: 'مع السلامة',
        expectedBehavior: 'وداع ودود بدون منتجات',
        shouldShowProducts: false
      },
      {
        message: 'باي باي',
        expectedBehavior: 'وداع بدون منتجات',
        shouldShowProducts: false
      }
    ]
  }
];

async function testIntelligentSystem() {
  console.log('🧪 بدء الاختبار الشامل للنظام الذكي الطبيعي...\n');
  
  const baseURL = 'http://localhost:3001';
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  // حساب العدد الإجمالي للاختبارات
  testScenarios.forEach(scenario => {
    totalTests += scenario.tests.length;
  });
  
  console.log(`📊 إجمالي الاختبارات: ${totalTests}\n`);
  console.log('='.repeat(80));
  
  for (const scenario of testScenarios) {
    console.log(`\n🎯 ${scenario.category.toUpperCase()}`);
    console.log('-'.repeat(50));
    
    for (let i = 0; i < scenario.tests.length; i++) {
      const test = scenario.tests[i];
      
      console.log(`\n📝 اختبار: "${test.message}"`);
      console.log(`🎯 متوقع: ${test.expectedBehavior}`);
      console.log(`📦 منتجات متوقعة: ${test.shouldShowProducts ? 'نعم' : 'لا'}`);
      if (test.note) console.log(`💡 ملاحظة: ${test.note}`);
      
      try {
        // إرسال الطلب للنظام الذكي
        const response = await fetch(`${baseURL}/api/v1/ai/intelligent-response`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: test.message,
            companyId: companyId,
            customerId: `test_${Date.now()}`,
            conversationHistory: []
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          const hasProducts = data.data?.hasProducts || false;
          const conversationType = data.data?.conversationType || 'unknown';
          const confidence = data.data?.confidence || 0;
          const responseText = data.data?.response || '';
          
          console.log(`📤 الرد: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`);
          console.log(`🤖 نوع المحادثة: ${conversationType}`);
          console.log(`📊 مستوى الثقة: ${(confidence * 100).toFixed(1)}%`);
          console.log(`🛍️ عرض منتجات: ${hasProducts ? 'نعم' : 'لا'}`);
          
          // تقييم النتيجة
          const testPassed = hasProducts === test.shouldShowProducts;
          
          if (testPassed) {
            console.log(`✅ نجح الاختبار`);
            passedTests++;
          } else {
            console.log(`❌ فشل الاختبار - متوقع: ${test.shouldShowProducts ? 'منتجات' : 'بدون منتجات'}, الفعلي: ${hasProducts ? 'منتجات' : 'بدون منتجات'}`);
            failedTests++;
          }
          
        } else {
          console.log(`❌ خطأ في الاستجابة: ${data.error}`);
          failedTests++;
        }
        
      } catch (error) {
        console.log(`❌ خطأ في الطلب: ${error.message}`);
        failedTests++;
      }
      
      // انتظار قصير بين الاختبارات
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // النتائج النهائية
  console.log('\n' + '='.repeat(80));
  console.log('📊 النتائج النهائية للاختبار الشامل');
  console.log('='.repeat(80));
  console.log(`✅ نجح: ${passedTests}/${totalTests} اختبار`);
  console.log(`❌ فشل: ${failedTests}/${totalTests} اختبار`);
  console.log(`📈 معدل النجاح: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // تقييم الأداء
  const successRate = (passedTests / totalTests) * 100;
  
  if (successRate >= 90) {
    console.log('\n🎉 ممتاز! النظام الذكي يعمل بشكل مثالي');
    console.log('   النظام جاهز للاستخدام في الإنتاج');
  } else if (successRate >= 80) {
    console.log('\n👍 جيد جداً! النظام يعمل بشكل جيد');
    console.log('   قد يحتاج بعض التحسينات الطفيفة');
  } else if (successRate >= 70) {
    console.log('\n⚠️ مقبول! النظام يعمل لكن يحتاج تحسينات');
    console.log('   راجع الاختبارات الفاشلة وحسن النظام');
  } else {
    console.log('\n🚨 يحتاج عمل! النظام يحتاج مراجعة شاملة');
    console.log('   راجع المنطق والقواعد في النظام');
  }
  
  console.log('\n💡 توصيات:');
  if (failedTests > 0) {
    console.log('   • راجع الاختبارات الفاشلة وحسن قواعد اكتشاف النية');
    console.log('   • تأكد من أن الكلمات المفتاحية محدثة');
    console.log('   • اختبر مع رسائل حقيقية من العملاء');
  }
  console.log('   • راقب الأداء مع العملاء الحقيقيين');
  console.log('   • اجمع ملاحظات العملاء وحسن النظام باستمرار');
  
  console.log('\n🔗 روابط مفيدة:');
  console.log(`   • إحصائيات النظام: GET ${baseURL}/api/v1/ai/intelligent-analytics`);
  console.log(`   • معلومات النظام: GET ${baseURL}/api/v1/ai/intelligent-info`);
  console.log(`   • تنظيف الذاكرة: POST ${baseURL}/api/v1/ai/cleanup-memory`);
}

// تشغيل الاختبار
testIntelligentSystem().catch(console.error);
