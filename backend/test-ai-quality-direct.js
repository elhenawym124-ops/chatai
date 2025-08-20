/**
 * اختبار مباشر لنظام التقييم الذكي مع بيانات محاكاة
 */

const QualityMonitorService = require('./src/services/qualityMonitorService');

async function testDirectAIQuality() {
  console.log('🧪 [TEST] بدء الاختبار المباشر لنظام التقييم الذكي...\n');

  try {
    // إنشاء خدمة المراقبة
    const qualityMonitor = new QualityMonitorService();
    
    console.log('✅ [TEST] تم إنشاء خدمة المراقبة بنجاح\n');

    // بيانات محاكاة لردود مختلفة الجودة
    const mockResponses = [
      {
        messageId: 'direct_msg_001',
        conversationId: 'direct_conv_001',
        userMessage: 'كم سعر الجاكيت الأزرق؟',
        botResponse: 'سعر الجاكيت الأزرق 250 جنيه مصري. متوفر بجميع المقاسات من S إلى XL. يمكنك طلبه الآن مع خدمة التوصيل المجاني داخل القاهرة.',
        ragData: {
          used: true,
          sources: [
            { title: 'جاكيت أزرق', price: 250, sizes: ['S', 'M', 'L', 'XL'], available: true }
          ]
        },
        confidence: 0.95,
        model: 'gemini-2.5-pro',
        timestamp: new Date()
      },
      {
        messageId: 'direct_msg_002',
        conversationId: 'direct_conv_002',
        userMessage: 'هل يمكن توصيل الطلب لمدينة الإسكندرية؟',
        botResponse: 'نعم، نوفر خدمة التوصيل لجميع المحافظات بما في ذلك الإسكندرية. رسوم التوصيل 30 جنيه ويستغرق من 2-3 أيام عمل.',
        ragData: {
          used: true,
          sources: [
            { city: 'الإسكندرية', shipping_cost: 30, delivery_time: '2-3 أيام' }
          ]
        },
        confidence: 0.88,
        model: 'gemini-2.5-pro',
        timestamp: new Date()
      },
      {
        messageId: 'direct_msg_003',
        conversationId: 'direct_conv_003',
        userMessage: 'أريد معلومات عن الحقائب الجلدية',
        botResponse: 'لدينا مجموعة متنوعة من الحقائب الجلدية عالية الجودة.',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.65,
        model: 'gemini-2.0-flash',
        timestamp: new Date()
      },
      {
        messageId: 'direct_msg_004',
        conversationId: 'direct_conv_004',
        userMessage: 'ما هي مواصفات الحذاء الرياضي الأسود؟',
        botResponse: 'نعم',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.30,
        model: 'gemini-2.0-flash',
        timestamp: new Date()
      },
      {
        messageId: 'direct_msg_005',
        conversationId: 'direct_conv_005',
        userMessage: 'هل يمكنني إرجاع المنتج إذا لم يعجبني؟',
        botResponse: 'بالطبع! لدينا سياسة إرجاع مرنة. يمكنك إرجاع أي منتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون في حالته الأصلية. سنقوم بإرجاع كامل المبلغ أو استبدال المنتج حسب رغبتك. للإرجاع، يرجى التواصل معنا على رقم خدمة العملاء.',
        ragData: {
          used: true,
          sources: [
            { policy: 'return_policy', duration: '14 days', conditions: 'original condition' }
          ]
        },
        confidence: 0.92,
        model: 'gemini-2.5-pro',
        timestamp: new Date()
      }
    ];

    console.log('📊 [TEST] بدء تقييم الردود...\n');

    // تقييم كل رد
    for (const response of mockResponses) {
      console.log(`🔍 [TEST] تقييم الرد: ${response.messageId}`);
      console.log(`   📝 السؤال: "${response.userMessage}"`);
      console.log(`   🤖 الرد: "${response.botResponse.substring(0, 80)}${response.botResponse.length > 80 ? '...' : ''}"`);
      
      // إضافة للقائمة للتقييم
      await qualityMonitor.evaluateResponse(response);
      
      console.log(`   ✅ تم إضافة الرد للقائمة\n`);
    }

    // انتظار معالجة التقييمات
    console.log('⏳ [TEST] انتظار معالجة التقييمات...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // فحص النتائج
    console.log('\n📈 [TEST] فحص نتائج التقييم...\n');

    // الحصول على الإحصائيات
    const statistics = qualityMonitor.getQualityStatistics();
    console.log(`📊 إجمالي التقييمات: ${statistics.overall.totalEvaluations}`);
    console.log(`🎯 متوسط الجودة: ${statistics.overall.averageScore}%`);

    // توزيع الجودة
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

    // أهم المشاكل
    if (statistics.overall.topIssues.length > 0) {
      console.log(`🔍 أهم المشاكل:`);
      statistics.overall.topIssues.forEach(issue => {
        console.log(`   - ${issue.issue}: ${issue.count} مرة`);
      });
    }

    // آخر التقييمات
    console.log('\n📋 [TEST] آخر التقييمات:\n');
    const recentEvaluations = qualityMonitor.getRecentEvaluations(5);
    
    recentEvaluations.forEach((evaluation, index) => {
      console.log(`${index + 1}. ${evaluation.messageId}:`);
      console.log(`   🏆 مستوى الجودة: ${evaluation.qualityLevel}`);
      console.log(`   📊 النقاط:`);
      console.log(`      - الإجمالي: ${evaluation.scores.overall}%`);
      console.log(`      - الملاءمة: ${evaluation.scores.relevance}%`);
      console.log(`      - الدقة: ${evaluation.scores.accuracy}%`);
      console.log(`      - الوضوح: ${evaluation.scores.clarity}%`);
      console.log(`      - الاكتمال: ${evaluation.scores.completeness}%`);
      console.log(`      - استخدام RAG: ${evaluation.scores.ragUsage}%`);
      
      if (evaluation.issues.length > 0) {
        console.log(`   ⚠️ المشاكل: ${evaluation.issues.join(', ')}`);
      }
      
      if (evaluation.recommendations.length > 0) {
        console.log(`   💡 التوصيات: ${evaluation.recommendations.join(', ')}`);
      }
      
      console.log('');
    });

    // التقييمات المشكوك فيها
    console.log('⚠️ [TEST] التقييمات المشكوك فيها:\n');
    const problematicEvaluations = qualityMonitor.getProblematicEvaluations(3);
    
    if (problematicEvaluations.length > 0) {
      problematicEvaluations.forEach((evaluation, index) => {
        console.log(`${index + 1}. ${evaluation.messageId}: ${evaluation.scores.overall}%`);
        console.log(`   🔍 المشاكل: ${evaluation.issues.join(', ')}`);
        console.log('');
      });
    } else {
      console.log('✅ لا توجد تقييمات مشكوك فيها');
    }

    // تحليل الاتجاهات
    console.log('\n📊 [TEST] تحليل الاتجاهات:\n');
    const trends = qualityMonitor.analyzeTrends(1);
    
    console.log(`📈 إجمالي التقييمات: ${trends.totalEvaluations}`);
    console.log(`🎯 متوسط الجودة: ${trends.averageScore}%`);
    
    if (trends.insights.length > 0) {
      console.log(`💡 الرؤى الذكية:`);
      trends.insights.forEach(insight => {
        console.log(`   - ${insight}`);
      });
    }

    // حالة النظام
    console.log('\n⚙️ [TEST] حالة النظام:\n');
    const systemStatus = qualityMonitor.getSystemStatus();
    
    console.log(`🔧 النظام مفعل: ${systemStatus.isEnabled ? 'نعم' : 'لا'}`);
    console.log(`📋 طول القائمة: ${systemStatus.queueLength}`);
    console.log(`📊 إجمالي التقييمات: ${systemStatus.totalEvaluations}`);
    console.log(`⏱️ وقت التشغيل: ${Math.round(systemStatus.uptime)} ثانية`);

    console.log('\n✅ [TEST] اكتمل الاختبار المباشر بنجاح!');

    // ملخص النتائج
    console.log('\n📋 [SUMMARY] ملخص شامل:');
    console.log(`   - تم تقييم ${mockResponses.length} ردود`);
    console.log(`   - تم إنشاء ${recentEvaluations.length} تقييمات`);
    
    if (recentEvaluations.length > 0) {
      const scores = recentEvaluations.map(e => e.scores.overall);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const bestScore = Math.max(...scores);
      const worstScore = Math.min(...scores);
      
      console.log(`   - متوسط الجودة: ${avgScore}%`);
      console.log(`   - أفضل رد: ${bestScore}%`);
      console.log(`   - أضعف رد: ${worstScore}%`);
      
      // تحليل النتائج
      const excellentCount = recentEvaluations.filter(e => e.qualityLevel === 'excellent').length;
      const goodCount = recentEvaluations.filter(e => e.qualityLevel === 'good').length;
      const acceptableCount = recentEvaluations.filter(e => e.qualityLevel === 'acceptable').length;
      const poorCount = recentEvaluations.filter(e => e.qualityLevel === 'poor').length;
      
      console.log(`   - ردود ممتازة: ${excellentCount}`);
      console.log(`   - ردود جيدة: ${goodCount}`);
      console.log(`   - ردود مقبولة: ${acceptableCount}`);
      console.log(`   - ردود ضعيفة: ${poorCount}`);
    }

    console.log('\n🎉 [TEST] نظام التقييم الذكي يعمل بكفاءة عالية!');

  } catch (error) {
    console.error('❌ [TEST] خطأ في الاختبار المباشر:', error);
    throw error;
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testDirectAIQuality()
    .then(() => {
      console.log('\n🏁 [TEST] انتهى الاختبار المباشر بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [TEST] فشل الاختبار المباشر:', error);
      process.exit(1);
    });
}

module.exports = { testDirectAIQuality };
