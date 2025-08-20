/**
 * إضافة بيانات تجريبية لنظام التقييم الذكي في الخادم الأساسي
 */

const aiAgentService = require('./src/services/aiAgentService');

async function populateAIQualityData() {
  console.log('📊 [POPULATE] بدء إضافة بيانات تجريبية لنظام التقييم الذكي...\n');

  try {
    // الحصول على خدمة التقييم من aiAgentService
    const qualityMonitor = aiAgentService.qualityMonitor;
    
    if (!qualityMonitor) {
      console.error('❌ خدمة التقييم غير متاحة في aiAgentService');
      return false;
    }

    console.log('✅ تم العثور على خدمة التقييم في aiAgentService\n');

    // بيانات تجريبية متنوعة
    const testData = [
      {
        messageId: 'populate_msg_001',
        conversationId: 'populate_conv_001',
        userMessage: 'كم سعر الجاكيت الأزرق؟',
        botResponse: 'سعر الجاكيت الأزرق 250 جنيه مصري. متوفر بجميع المقاسات من S إلى XL. يمكنك طلبه الآن مع خدمة التوصيل المجاني داخل القاهرة.',
        ragData: {
          used: true,
          sources: [{ title: 'جاكيت أزرق', price: 250, sizes: ['S', 'M', 'L', 'XL'] }]
        },
        confidence: 0.95,
        model: 'gemini-2.5-pro',
        timestamp: new Date(Date.now() - 3600000) // منذ ساعة
      },
      {
        messageId: 'populate_msg_002',
        conversationId: 'populate_conv_002',
        userMessage: 'هل يمكن التوصيل للإسكندرية؟',
        botResponse: 'نعم، نوفر خدمة التوصيل للإسكندرية. رسوم التوصيل 30 جنيه ويستغرق من 2-3 أيام عمل.',
        ragData: {
          used: true,
          sources: [{ city: 'الإسكندرية', cost: 30, time: '2-3 أيام' }]
        },
        confidence: 0.88,
        model: 'gemini-2.5-pro',
        timestamp: new Date(Date.now() - 7200000) // منذ ساعتين
      },
      {
        messageId: 'populate_msg_003',
        conversationId: 'populate_conv_003',
        userMessage: 'أريد معلومات عن الحقائب الجلدية',
        botResponse: 'لدينا مجموعة متنوعة من الحقائب الجلدية عالية الجودة. أسعارها تتراوح من 200 إلى 800 جنيه حسب الحجم والتصميم.',
        ragData: {
          used: true,
          sources: [{ category: 'حقائب جلدية', price_range: '200-800' }]
        },
        confidence: 0.82,
        model: 'gemini-2.0-flash',
        timestamp: new Date(Date.now() - 10800000) // منذ 3 ساعات
      },
      {
        messageId: 'populate_msg_004',
        conversationId: 'populate_conv_004',
        userMessage: 'ما هي مواصفات الحذاء الرياضي؟',
        botResponse: 'نعم',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.30,
        model: 'gemini-2.0-flash',
        timestamp: new Date(Date.now() - 14400000) // منذ 4 ساعات
      },
      {
        messageId: 'populate_msg_005',
        conversationId: 'populate_conv_005',
        userMessage: 'كيف يمكنني إرجاع المنتج؟',
        botResponse: 'يمكنك إرجاع أي منتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون في حالته الأصلية. سنقوم بإرجاع كامل المبلغ أو استبدال المنتج حسب رغبتك. للإرجاع، يرجى التواصل معنا على رقم خدمة العملاء.',
        ragData: {
          used: true,
          sources: [{ policy: 'return_policy', duration: '14 days' }]
        },
        confidence: 0.92,
        model: 'gemini-2.5-pro',
        timestamp: new Date(Date.now() - 18000000) // منذ 5 ساعات
      },
      {
        messageId: 'populate_msg_006',
        conversationId: 'populate_conv_006',
        userMessage: 'هل عندكم خصومات؟',
        botResponse: 'نعم، لدينا خصومات تصل إلى 30% على مجموعة مختارة من المنتجات. كما نوفر خصم 10% للعملاء الجدد عند أول طلب.',
        ragData: {
          used: true,
          sources: [{ discount: '30%', new_customer: '10%' }]
        },
        confidence: 0.89,
        model: 'gemini-2.5-pro',
        timestamp: new Date(Date.now() - 21600000) // منذ 6 ساعات
      },
      {
        messageId: 'populate_msg_007',
        conversationId: 'populate_conv_007',
        userMessage: 'أريد شراء حذاء رياضي',
        botResponse: 'لدينا مجموعة رائعة من الأحذية الرياضية. ما هو المقاس المطلوب واللون المفضل؟',
        ragData: {
          used: true,
          sources: [{ category: 'أحذية رياضية', available: true }]
        },
        confidence: 0.85,
        model: 'gemini-2.5-flash',
        timestamp: new Date(Date.now() - 25200000) // منذ 7 ساعات
      },
      {
        messageId: 'populate_msg_008',
        conversationId: 'populate_conv_008',
        userMessage: 'مرحبا',
        botResponse: 'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.75,
        model: 'gemini-2.0-flash',
        timestamp: new Date(Date.now() - 28800000) // منذ 8 ساعات
      }
    ];

    console.log('📝 إضافة البيانات التجريبية...\n');

    // إضافة البيانات للتقييم
    for (const [index, data] of testData.entries()) {
      console.log(`${index + 1}. إضافة: ${data.messageId}`);
      console.log(`   📝 السؤال: "${data.userMessage}"`);
      console.log(`   🤖 الرد: "${data.botResponse.substring(0, 60)}..."`);
      
      await qualityMonitor.evaluateResponse(data);
      
      // انتظار قصير بين كل إضافة
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`   ✅ تم إضافة للقائمة\n`);
    }

    // انتظار معالجة جميع التقييمات
    console.log('⏳ انتظار معالجة جميع التقييمات...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // فحص النتائج
    console.log('\n📊 فحص النتائج النهائية...\n');

    const statistics = qualityMonitor.getQualityStatistics();
    console.log(`📈 إجمالي التقييمات: ${statistics.overall.totalEvaluations}`);
    console.log(`🎯 متوسط الجودة: ${statistics.overall.averageScore}%`);

    console.log(`📋 توزيع الجودة:`);
    Object.entries(statistics.overall.qualityDistribution).forEach(([level, count]) => {
      const levelNames = {
        excellent: 'ممتاز',
        good: 'جيد',
        acceptable: 'مقبول',
        poor: 'ضعيف',
        very_poor: 'ضعيف جداً'
      };
      if (count > 0) {
        console.log(`   - ${levelNames[level]}: ${count}`);
      }
    });

    if (statistics.overall.topIssues.length > 0) {
      console.log(`🔍 أهم المشاكل:`);
      statistics.overall.topIssues.forEach(issue => {
        console.log(`   - ${issue.issue}: ${issue.count} مرة`);
      });
    }

    // عرض آخر التقييمات
    const recentEvaluations = qualityMonitor.getRecentEvaluations(5);
    console.log(`\n📋 آخر ${recentEvaluations.length} تقييمات:`);
    
    recentEvaluations.forEach((evaluation, index) => {
      console.log(`${index + 1}. ${evaluation.messageId}: ${evaluation.scores.overall}% (${evaluation.qualityLevel})`);
    });

    console.log('\n✅ تم إضافة البيانات التجريبية بنجاح!');
    console.log('\n🌐 يمكنك الآن فتح الواجهة لرؤية البيانات:');
    console.log('   - http://localhost:3002/ai-quality');
    console.log('   - http://localhost:3002/quality-advanced');

    return true;

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
    return false;
  }
}

// تشغيل الإضافة
if (require.main === module) {
  populateAIQualityData()
    .then((success) => {
      if (success) {
        console.log('\n🎉 انتهت إضافة البيانات بنجاح!');
        process.exit(0);
      } else {
        console.log('\n❌ فشلت إضافة البيانات!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 خطأ في العملية:', error);
      process.exit(1);
    });
}

module.exports = { populateAIQualityData };
