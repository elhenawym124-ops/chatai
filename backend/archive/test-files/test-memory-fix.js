async function testMemoryFix() {
  console.log('🧪 اختبار إصلاح مشكلة الذاكرة...\n');

  // محاكاة دالة buildPrompt
  function buildPrompt(message, context) {
    const {
      personalityPrompt = '',
      responsePrompt = '',
      conversationHistory = [],
      memorySettings = {}
    } = context;

    let prompt = '';

    // Add personality context
    if (personalityPrompt) {
      prompt += `شخصيتك: ${personalityPrompt}\n\n`;
    }

    // Add response guidelines
    if (responsePrompt) {
      prompt += `طريقة الرد: ${responsePrompt}\n\n`;
    }

    // Add memory instructions
    prompt += `🧠 تعليمات الذاكرة المهمة:
- اقرأ سياق المحادثة السابقة بعناية
- تذكر جميع المعلومات التي ذكرها العميل (المقاس، اللون، الاسم، العنوان، رقم التلفون)
- لا تسأل مرة أخرى عن معلومات ذكرها العميل بالفعل
- استخدم المعلومات المحفوظة لتقديم خدمة أفضل
- إذا ذكر العميل مقاس معين، لا تسأل عنه مرة أخرى
- إذا ذكر العميل لون معين، لا تسأل عنه مرة أخرى

`;

    // Add conversation history (configurable number of messages)
    if (conversationHistory.length > 0) {
      const memoryLimit = Math.min(memorySettings?.conversationMemoryLimit || 3, 1000);

      prompt += '\n📝 سياق المحادثة السابقة (اقرأ بعناية وتذكر المعلومات المهمة):\n';

      // Extract important information from conversation
      const customerInfo = {
        size: null,
        color: null,
        name: null,
        address: null,
        phone: null
      };

      // Analyze conversation for key information
      conversationHistory.slice(-memoryLimit).forEach(msg => {
        const content = msg.content.toLowerCase();

        // Extract size information
        if (content.includes('مقاس') || content.includes('مناسب') || /\d+\s*(مقاس|مناسب)/.test(content)) {
          const sizeMatch = content.match(/(\d+)/);
          if (sizeMatch) {
            customerInfo.size = sizeMatch[1];
          }
        }

        // Also check for size patterns like "38 مقاس مناسب"
        const sizePattern = content.match(/(\d+)\s*(مقاس|مناسب)/);
        if (sizePattern) {
          customerInfo.size = sizePattern[1];
        }

        // Extract color information
        if (content.includes('أسود') || content.includes('اسود')) customerInfo.color = 'أسود';
        if (content.includes('أبيض') || content.includes('ابيض')) customerInfo.color = 'أبيض';
        if (content.includes('أحمر') || content.includes('احمر')) customerInfo.color = 'أحمر';
        if (content.includes('جملي')) customerInfo.color = 'جملي';
      });

      // Add conversation history
      conversationHistory.slice(-memoryLimit).forEach(msg => {
        prompt += `${msg.isFromCustomer ? 'العميل' : 'المساعد'}: ${msg.content}\n`;
      });

      // Add extracted information summary
      if (customerInfo.size || customerInfo.color) {
        prompt += '\n🎯 معلومات مهمة من المحادثة:\n';
        if (customerInfo.size) prompt += `- المقاس المطلوب: ${customerInfo.size}\n`;
        if (customerInfo.color) prompt += `- اللون المطلوب: ${customerInfo.color}\n`;
        prompt += '\n⚠️ تذكر: لا تسأل مرة أخرى عن المعلومات التي ذكرها العميل بالفعل!\n';
      }
    }

    prompt += `\nرسالة العميل الحالية: ${message}\n\nردك:`;

    return prompt;
  }
  
  // محاكاة المحادثة من الصورة
  const conversationHistory = [
    { isFromCustomer: true, content: 'عايز أعرف السعر' },
    { isFromCustomer: false, content: 'سعر الكوتشي 250 جنيه... المتاحة عندنا؟ 🤔' },
    { isFromCustomer: true, content: 'عايزه أعرف المقاسات' },
    { isFromCustomer: false, content: 'المقاسات المتاحة عندنا من 36 لحد 41... مناسب ليكي؟ ✨' },
    { isFromCustomer: true, content: '38 مقاس مناسب' },
    { isFromCustomer: false, content: 'أهلاً يا قمر 😍، مقاس 38 متوفر. تحبي اللون إيه؟...' },
    { isFromCustomer: true, content: 'الاسود' },
    { isFromCustomer: false, content: 'أهلاً بيكي يا قمر! 💖 الكوتشي الأسود متاح طبعًا 🖤... إيه المقاس المطلوب؟ 👟' }
  ];
  
  const context = {
    personalityPrompt: 'أنت مساعد مبيعات ودود ومفيد',
    responsePrompt: 'رد بطريقة ودودة ومفيدة',
    conversationHistory: conversationHistory,
    memorySettings: {
      conversationMemoryLimit: 15,
      memoryType: 'all',
      memoryDuration: 48,
      enableContextualMemory: true
    }
  };
  
  // اختبار الرسالة الجديدة
  const newMessage = 'تمام، عايز أأكد الطلب';
  
  console.log('📝 المحادثة السابقة:');
  conversationHistory.forEach((msg, i) => {
    console.log(`${i+1}. [${msg.isFromCustomer ? 'عميل' : 'بوت'}] ${msg.content}`);
  });
  
  console.log(`\n💬 الرسالة الجديدة: "${newMessage}"`);
  
  // بناء الـ prompt
  const prompt = buildPrompt(newMessage, context);
  
  console.log('\n🔍 الـ Prompt المُنشأ:');
  console.log('='.repeat(50));
  console.log(prompt);
  console.log('='.repeat(50));
  
  // فحص إذا كان الـ prompt يحتوي على المعلومات المهمة
  console.log('\n✅ فحص المعلومات المستخرجة:');
  
  if (prompt.includes('المقاس المطلوب: 38')) {
    console.log('✅ المقاس 38 تم استخراجه بنجاح');
  } else {
    console.log('❌ المقاس 38 لم يتم استخراجه');
  }
  
  if (prompt.includes('اللون المطلوب: أسود')) {
    console.log('✅ اللون الأسود تم استخراجه بنجاح');
  } else {
    console.log('❌ اللون الأسود لم يتم استخراجه');
  }
  
  if (prompt.includes('لا تسأل مرة أخرى عن المعلومات')) {
    console.log('✅ تعليمات عدم السؤال مرة أخرى موجودة');
  } else {
    console.log('❌ تعليمات عدم السؤال مرة أخرى غير موجودة');
  }
  
  console.log('\n🎯 النتيجة المتوقعة:');
  console.log('يجب أن يرد البوت بتأكيد الطلب (كوتشي أسود مقاس 38) بدون السؤال عن المقاس مرة أخرى');
}

if (require.main === module) {
  testMemoryFix().catch(console.error);
}

module.exports = { testMemoryFix };
