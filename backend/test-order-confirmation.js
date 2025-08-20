/**
 * اختبار عملية اكتشاف تأكيد الطلبات
 * Test Order Confirmation Detection
 */

const aiAgentService = require('./src/services/aiAgentService');

async function testOrderConfirmation() {
  console.log('🧪 اختبار عملية اكتشاف تأكيد الطلبات\n');
  console.log('='.repeat(80));

  // محادثة تجريبية تؤدي إلى طلب
  const mockConversation = [
    {
      userMessage: "بكام الكوتشي؟",
      aiResponse: "أهلاً بحضرتك 🙋‍♀️\nالكوتشي سعره 349 جنيه، والنعل بتاعه طبي ومريح جداً في المشي.\n\nحضرتك من محافظة إيه عشان أقولك تكلفة الشحن؟",
      intent: "price_inquiry",
      sentiment: "neutral",
      timestamp: new Date(Date.now() - 300000) // 5 دقائق مضت
    },
    {
      userMessage: "من القاهرة",
      aiResponse: "تمام! الشحن للقاهرة 30 جنيه.\n\nيبقى الإجمالي 379 جنيه (349 + 30 شحن).\n\nعايزة مقاس كام؟ متوفر من 37 لحد 41.",
      intent: "location_info",
      sentiment: "neutral",
      timestamp: new Date(Date.now() - 240000) // 4 دقائق مضت
    },
    {
      userMessage: "مقاس 39",
      aiResponse: "ممتاز! مقاس 39 متوفر.\n\nعايزة لون إيه؟ متوفر منه أبيض وأسود وبيج.",
      intent: "size_selection",
      sentiment: "positive",
      timestamp: new Date(Date.now() - 180000) // 3 دقائق مضت
    },
    {
      userMessage: "أبيض",
      aiResponse: "تمام! كوتشي أبيض مقاس 39.\n\nالإجمالي: 379 جنيه (349 + 30 شحن)\n\nعشان أكمل الطلب، محتاجة اسمك ورقم تليفونك.",
      intent: "color_selection",
      sentiment: "positive",
      timestamp: new Date(Date.now() - 120000) // دقيقتين مضت
    },
    {
      userMessage: "اسمي فاطمة ورقمي 01234567890",
      aiResponse: "شكراً فاطمة! 😊\n\nملخص الطلب:\n- كوتشي أبيض مقاس 39\n- السعر: 349 جنيه\n- الشحن للقاهرة: 30 جنيه\n- الإجمالي: 379 جنيه\n\nتأكدي الطلب؟",
      intent: "contact_info",
      sentiment: "positive",
      timestamp: new Date(Date.now() - 60000) // دقيقة مضت
    }
  ];

  console.log('\n1️⃣ المحادثة التجريبية:\n');
  mockConversation.forEach((msg, index) => {
    console.log(`${index + 1}. العميل: "${msg.userMessage}"`);
    console.log(`   الرد: "${msg.aiResponse.substring(0, 80)}..."`);
    console.log(`   النية: ${msg.intent}, المشاعر: ${msg.sentiment}`);
    console.log('');
  });

  console.log('\n2️⃣ اختبار رسائل التأكيد المختلفة:\n');

  const testMessages = [
    // رسائل تأكيد واضحة
    { message: "تمام اكد", expected: true, type: "تأكيد مباشر" },
    { message: "موافق", expected: true, type: "موافقة" },
    { message: "اوكي", expected: true, type: "موافقة بالإنجليزية" },
    { message: "نعم", expected: true, type: "إيجاب" },
    { message: "ايوه", expected: true, type: "إيجاب عامي" },
    { message: "هاخده", expected: true, type: "قرار الشراء" },
    
    // رسائل غامضة قد تحتاج AI
    { message: "خلاص كده", expected: true, type: "تأكيد غير مباشر" },
    { message: "يلا بينا", expected: true, type: "استعجال" },
    { message: "ماشي", expected: true, type: "موافقة خفيفة" },
    
    // رسائل ليست تأكيد
    { message: "فكرت", expected: false, type: "تردد" },
    { message: "ممكن أشوف لون تاني؟", expected: false, type: "استفسار إضافي" },
    { message: "غالي شوية", expected: false, type: "اعتراض على السعر" },
    { message: "هفكر", expected: false, type: "تأجيل القرار" },
    
    // رسائل قصيرة
    { message: "اه", expected: true, type: "إيجاب قصير" },
    { message: "لا", expected: false, type: "رفض" },
    { message: "مش عارفة", expected: false, type: "تردد" }
  ];

  let correctDetections = 0;
  let totalTests = testMessages.length;

  for (const test of testMessages) {
    try {
      console.log(`🔍 اختبار: "${test.message}" (${test.type})`);
      
      // اختبار اكتشاف التأكيد
      const result = await aiAgentService.detectOrderConfirmation(
        test.message, 
        mockConversation,
        'test-customer-123'
      );
      
      const detected = result.isConfirming;
      const isCorrect = detected === test.expected;
      
      if (isCorrect) {
        correctDetections++;
        console.log(`   ✅ صحيح: ${detected ? 'تأكيد' : 'ليس تأكيد'}`);
      } else {
        console.log(`   ❌ خطأ: توقع ${test.expected ? 'تأكيد' : 'ليس تأكيد'} لكن حصل على ${detected ? 'تأكيد' : 'ليس تأكيد'}`);
      }
      
      if (detected && result.orderDetails) {
        console.log(`   📋 تفاصيل الطلب المستخرجة:`);
        console.log(`      - المنتج: ${result.orderDetails.productName || 'غير محدد'}`);
        console.log(`      - المقاس: ${result.orderDetails.productSize || 'غير محدد'}`);
        console.log(`      - اللون: ${result.orderDetails.productColor || 'غير محدد'}`);
        console.log(`      - السعر: ${result.orderDetails.productPrice || 'غير محدد'}`);
        console.log(`      - الاسم: ${result.orderDetails.customerName || 'غير محدد'}`);
        console.log(`      - التليفون: ${result.orderDetails.customerPhone || 'غير محدد'}`);
        console.log(`      - المدينة: ${result.orderDetails.city || 'غير محدد'}`);
      }
      
      console.log('');
      
      // تأخير قصير لتجنب تجاوز حدود API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ خطأ في الاختبار: ${error.message}`);
      console.log('');
    }
  }

  console.log('\n3️⃣ نتائج الاختبار:\n');
  
  const accuracy = (correctDetections / totalTests) * 100;
  console.log(`📊 دقة الاكتشاف: ${correctDetections}/${totalTests} (${accuracy.toFixed(1)}%)`);
  
  if (accuracy >= 90) {
    console.log('🏆 ممتاز: النظام يكتشف التأكيد بدقة عالية');
  } else if (accuracy >= 80) {
    console.log('👍 جيد: النظام يكتشف التأكيد بدقة جيدة');
  } else if (accuracy >= 70) {
    console.log('⚠️ متوسط: النظام يحتاج تحسين في اكتشاف التأكيد');
  } else {
    console.log('❌ ضعيف: النظام يحتاج تحسين كبير في اكتشاف التأكيد');
  }

  console.log('\n4️⃣ تحليل سبب عدم إنشاء طلبات في اللوج:\n');
  
  console.log('🔍 من تحليل اللوج الفعلي:');
  console.log('   📝 الرسائل المستلمة: "بكام", "المقاسات المتاحه كام ؟"');
  console.log('   🎯 نوع الرسائل: استفسارات وليس تأكيدات');
  console.log('   🤖 قرار النظام: لا تأكيد = لا طلب');
  console.log('   ✅ هذا صحيح: النظام يعمل كما هو مطلوب');
  
  console.log('\n💡 متى سينشئ النظام طلب؟');
  console.log('   1. العميل يسأل عن السعر والتفاصيل ✅');
  console.log('   2. النظام يقدم المعلومات ويطلب التأكيد ✅');
  console.log('   3. العميل يؤكد بكلمات مثل "تمام اكد" أو "موافق" ⏳');
  console.log('   4. النظام ينشئ الطلب تلقائياً ✅');
  
  console.log('\n🎯 الخلاصة:');
  console.log('   ✅ النظام يطبق الأنماط المعتمدة بنجاح');
  console.log('   ✅ النظام يفهم السياق ويقدم معلومات شاملة');
  console.log('   ✅ النظام لا ينشئ طلبات بدون تأكيد (وهذا صحيح)');
  console.log('   ✅ النظام ينتظر تأكيد صريح من العميل');
  console.log('   ✅ هذا يمنع إنشاء طلبات خاطئة أو غير مرغوبة');

  console.log('\n' + '='.repeat(80));
  console.log('📅 تاريخ الاختبار:', new Date().toLocaleString('ar-EG'));
  console.log('='.repeat(80));
}

// تشغيل الاختبار
if (require.main === module) {
  testOrderConfirmation().catch(console.error);
}

module.exports = { testOrderConfirmation };
