/**
 * اختبار نظام التقييم الذكي الجديد
 */

const AIQualityEvaluator = require('./src/services/aiQualityEvaluator');
const QualityMonitorService = require('./src/services/qualityMonitorService');

async function testAIQualitySystem() {
  console.log('🧪 [TEST] بدء اختبار نظام التقييم الذكي...\n');

  try {
    // 1. اختبار محرك التقييم الذكي
    console.log('📊 [TEST] اختبار محرك التقييم الذكي...');
    const evaluator = new AIQualityEvaluator();

    // بيانات تجريبية للاختبار
    const testResponses = [
      {
        messageId: 'test_msg_001',
        conversationId: 'test_conv_001',
        userMessage: 'كم سعر الجاكيت الأزرق؟',
        botResponse: 'سعر الجاكيت الأزرق 250 جنيه مصري. متوفر بجميع المقاسات.',
        ragData: {
          used: true,
          sources: [
            { title: 'جاكيت أزرق', price: 250, available: true }
          ]
        },
        confidence: 0.95,
        model: 'gemini-2.5-pro',
        timestamp: new Date()
      },
      {
        messageId: 'test_msg_002',
        conversationId: 'test_conv_002',
        userMessage: 'هل يمكن توصيل الطلب؟',
        botResponse: 'نعم، نوفر خدمة التوصيل لجميع المحافظات.',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.75,
        model: 'gemini-2.0-flash',
        timestamp: new Date()
      },
      {
        messageId: 'test_msg_003',
        conversationId: 'test_conv_003',
        userMessage: 'ما هي مواصفات الحقيبة الجلدية؟',
        botResponse: 'الحقيبة مصنوعة من الجلد الطبيعي، بها جيوب متعددة، مقاومة للماء.',
        ragData: {
          used: true,
          sources: [
            { title: 'حقيبة جلدية', material: 'جلد طبيعي', features: ['جيوب متعددة', 'مقاومة للماء'] }
          ]
        },
        confidence: 0.88,
        model: 'gemini-2.5-pro',
        timestamp: new Date()
      },
      {
        messageId: 'test_msg_004',
        conversationId: 'test_conv_004',
        userMessage: 'أريد معلومات عن المنتجات',
        botResponse: 'نعم',
        ragData: {
          used: false,
          sources: []
        },
        confidence: 0.45,
        model: 'gemini-2.0-flash',
        timestamp: new Date()
      }
    ];

    // تقييم كل رد
    const evaluations = [];
    for (const response of testResponses) {
      console.log(`\n🔍 [TEST] تقييم الرد: ${response.messageId}`);
      const evaluation = await evaluator.evaluateResponse(response);
      evaluations.push(evaluation);
      
      console.log(`   📊 النتيجة الإجمالية: ${evaluation.scores.overall}%`);
      console.log(`   🏆 مستوى الجودة: ${evaluation.qualityLevel}`);
      console.log(`   📈 النقاط التفصيلية:`);
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
    }

    // 2. اختبار الإحصائيات
    console.log('\n📈 [TEST] اختبار الإحصائيات...');
    const statistics = evaluator.getQualityStatistics();
    
    console.log(`📊 إجمالي التقييمات: ${statistics.overall.totalEvaluations}`);
    console.log(`🎯 متوسط النقاط: ${statistics.overall.averageScore}%`);
    console.log(`📋 توزيع الجودة:`);
    Object.entries(statistics.overall.qualityDistribution).forEach(([level, count]) => {
      const levelNames = {
        excellent: 'ممتاز',
        good: 'جيد',
        acceptable: 'مقبول',
        poor: 'ضعيف',
        very_poor: 'ضعيف جداً'
      };
      console.log(`   - ${levelNames[level]}: ${count}`);
    });

    if (statistics.overall.topIssues.length > 0) {
      console.log(`🔍 أهم المشاكل:`);
      statistics.overall.topIssues.forEach(issue => {
        console.log(`   - ${issue.issue}: ${issue.count} مرة`);
      });
    }

    // 3. اختبار خدمة المراقبة
    console.log('\n🔧 [TEST] اختبار خدمة المراقبة...');
    const qualityMonitor = new QualityMonitorService();
    
    // اختبار حالة النظام
    const systemStatus = qualityMonitor.getSystemStatus();
    console.log(`⚙️ حالة النظام:`);
    console.log(`   - مفعل: ${systemStatus.isEnabled ? 'نعم' : 'لا'}`);
    console.log(`   - طول القائمة: ${systemStatus.queueLength}`);
    console.log(`   - إجمالي التقييمات: ${systemStatus.totalEvaluations}`);

    // اختبار تحليل الاتجاهات
    console.log('\n📊 [TEST] اختبار تحليل الاتجاهات...');
    const trends = qualityMonitor.analyzeTrends(7);
    console.log(`📈 تحليل آخر 7 أيام:`);
    console.log(`   - إجمالي التقييمات: ${trends.totalEvaluations}`);
    console.log(`   - متوسط النقاط: ${trends.averageScore}%`);
    console.log(`   - الرؤى: ${trends.insights.join(', ')}`);

    // 4. اختبار التقييمات المشكوك فيها
    console.log('\n⚠️ [TEST] اختبار التقييمات المشكوك فيها...');
    const problematicEvaluations = qualityMonitor.getProblematicEvaluations(5);
    console.log(`🔍 عدد التقييمات المشكوك فيها: ${problematicEvaluations.length}`);
    
    problematicEvaluations.forEach(evaluation => {
      console.log(`   - ${evaluation.messageId}: ${evaluation.scores.overall}% (${evaluation.issues.join(', ')})`);
    });

    // 5. اختبار التقييمات حسب الجودة
    console.log('\n🏆 [TEST] اختبار التقييمات حسب الجودة...');
    const excellentEvaluations = qualityMonitor.getEvaluationsByQuality('excellent', 3);
    const poorEvaluations = qualityMonitor.getEvaluationsByQuality('poor', 3);
    
    console.log(`✨ التقييمات الممتازة: ${excellentEvaluations.length}`);
    excellentEvaluations.forEach(evaluation => {
      console.log(`   - ${evaluation.messageId}: ${evaluation.scores.overall}%`);
    });
    
    console.log(`⚠️ التقييمات الضعيفة: ${poorEvaluations.length}`);
    poorEvaluations.forEach(evaluation => {
      console.log(`   - ${evaluation.messageId}: ${evaluation.scores.overall}%`);
    });

    // 6. اختبار آخر التقييمات
    console.log('\n🕒 [TEST] اختبار آخر التقييمات...');
    const recentEvaluations = qualityMonitor.getRecentEvaluations(3);
    console.log(`📋 آخر ${recentEvaluations.length} تقييمات:`);
    
    recentEvaluations.forEach(evaluation => {
      console.log(`   - ${evaluation.messageId}: ${evaluation.scores.overall}% (${evaluation.qualityLevel})`);
    });

    console.log('\n✅ [TEST] اكتمل اختبار نظام التقييم الذكي بنجاح!');
    console.log('\n📊 [SUMMARY] ملخص النتائج:');
    console.log(`   - تم تقييم ${evaluations.length} ردود`);
    console.log(`   - متوسط الجودة: ${Math.round(evaluations.reduce((sum, e) => sum + e.scores.overall, 0) / evaluations.length)}%`);
    console.log(`   - أفضل رد: ${Math.max(...evaluations.map(e => e.scores.overall))}%`);
    console.log(`   - أضعف رد: ${Math.min(...evaluations.map(e => e.scores.overall))}%`);
    
    const qualityLevels = evaluations.reduce((acc, e) => {
      acc[e.qualityLevel] = (acc[e.qualityLevel] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   - توزيع الجودة: ${JSON.stringify(qualityLevels)}`);

  } catch (error) {
    console.error('❌ [TEST] خطأ في اختبار النظام:', error);
    throw error;
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testAIQualitySystem()
    .then(() => {
      console.log('\n🎉 [TEST] انتهى الاختبار بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [TEST] فشل الاختبار:', error);
      process.exit(1);
    });
}

module.exports = { testAIQualitySystem };
