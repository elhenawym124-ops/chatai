/**
 * اختبار شامل للتأكد من عمل نظام التقييم الذكي
 */

const QualityMonitorService = require('./src/services/qualityMonitorService');

async function verifyAIQualitySystem() {
  console.log('🔍 [VERIFY] بدء التحقق الشامل من نظام التقييم الذكي...\n');

  try {
    // 1. التحقق من إنشاء الخدمة
    console.log('📋 [STEP 1] التحقق من إنشاء خدمة المراقبة...');
    const qualityMonitor = new QualityMonitorService();
    console.log('✅ تم إنشاء خدمة المراقبة بنجاح\n');

    // 2. التحقق من حالة النظام
    console.log('📋 [STEP 2] فحص حالة النظام...');
    const systemStatus = qualityMonitor.getSystemStatus();
    console.log(`   🔧 النظام مفعل: ${systemStatus.isEnabled ? '✅ نعم' : '❌ لا'}`);
    console.log(`   📋 طول القائمة: ${systemStatus.queueLength}`);
    console.log(`   ⚙️ المعالجة: ${systemStatus.processing ? 'جارية' : 'متوقفة'}`);
    console.log(`   📊 إجمالي التقييمات: ${systemStatus.totalEvaluations}`);
    console.log(`   ⏱️ وقت التشغيل: ${Math.round(systemStatus.uptime)} ثانية\n`);

    // 3. اختبار التقييم مع بيانات متنوعة
    console.log('📋 [STEP 3] اختبار التقييم مع بيانات متنوعة...\n');

    const testCases = [
      {
        name: 'رد ممتاز - سؤال عن السعر',
        data: {
          messageId: 'verify_001',
          conversationId: 'verify_conv_001',
          userMessage: 'كم سعر الحقيبة الجلدية البنية؟',
          botResponse: 'سعر الحقيبة الجلدية البنية 450 جنيه مصري. متوفرة بمقاسين: متوسط وكبير. مصنوعة من الجلد الطبيعي عالي الجودة مع ضمان سنة كاملة. يمكنك طلبها الآن مع التوصيل المجاني داخل القاهرة.',
          ragData: { used: true, sources: [{ name: 'حقيبة جلدية', price: 450, sizes: ['متوسط', 'كبير'] }] },
          confidence: 0.95,
          model: 'gemini-2.5-pro'
        },
        expectedQuality: 'excellent'
      },
      {
        name: 'رد جيد - سؤال عن التوصيل',
        data: {
          messageId: 'verify_002',
          conversationId: 'verify_conv_002',
          userMessage: 'هل يمكن التوصيل للجيزة؟',
          botResponse: 'نعم، نوفر خدمة التوصيل للجيزة. رسوم التوصيل 25 جنيه ويستغرق من 1-2 يوم عمل.',
          ragData: { used: true, sources: [{ area: 'الجيزة', cost: 25, time: '1-2 يوم' }] },
          confidence: 0.88,
          model: 'gemini-2.5-pro'
        },
        expectedQuality: 'good'
      },
      {
        name: 'رد مقبول - معلومات عامة',
        data: {
          messageId: 'verify_003',
          conversationId: 'verify_conv_003',
          userMessage: 'أريد معلومات عن منتجاتكم',
          botResponse: 'لدينا مجموعة متنوعة من المنتجات عالية الجودة.',
          ragData: { used: false, sources: [] },
          confidence: 0.70,
          model: 'gemini-2.0-flash'
        },
        expectedQuality: 'acceptable'
      },
      {
        name: 'رد ضعيف - إجابة غير مناسبة',
        data: {
          messageId: 'verify_004',
          conversationId: 'verify_conv_004',
          userMessage: 'ما هي مواصفات الساعة الذكية؟',
          botResponse: 'شكراً لك',
          ragData: { used: false, sources: [] },
          confidence: 0.40,
          model: 'gemini-2.0-flash'
        },
        expectedQuality: 'poor'
      },
      {
        name: 'رد ضعيف جداً - رد غير مفهوم',
        data: {
          messageId: 'verify_005',
          conversationId: 'verify_conv_005',
          userMessage: 'كيف يمكنني الدفع؟',
          botResponse: 'نعم لا ربما',
          ragData: { used: false, sources: [] },
          confidence: 0.20,
          model: 'gemini-2.0-flash'
        },
        expectedQuality: 'very_poor'
      }
    ];

    const results = [];

    for (const testCase of testCases) {
      console.log(`🧪 اختبار: ${testCase.name}`);
      console.log(`   📝 السؤال: "${testCase.data.userMessage}"`);
      console.log(`   🤖 الرد: "${testCase.data.botResponse}"`);
      
      // إضافة timestamp
      testCase.data.timestamp = new Date();
      
      // تقييم الرد
      await qualityMonitor.evaluateResponse(testCase.data);
      
      // انتظار قصير للمعالجة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`   ✅ تم إرسال للتقييم\n`);
      
      results.push({
        name: testCase.name,
        messageId: testCase.data.messageId,
        expected: testCase.expectedQuality
      });
    }

    // 4. انتظار معالجة جميع التقييمات
    console.log('📋 [STEP 4] انتظار معالجة التقييمات...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    console.log('✅ تم الانتهاء من المعالجة\n');

    // 5. فحص النتائج
    console.log('📋 [STEP 5] فحص نتائج التقييم...\n');

    const recentEvaluations = qualityMonitor.getRecentEvaluations(10);
    console.log(`📊 عدد التقييمات المكتملة: ${recentEvaluations.length}`);

    if (recentEvaluations.length === 0) {
      console.log('❌ لم يتم العثور على تقييمات! النظام قد لا يعمل بشكل صحيح');
      return false;
    }

    // تحليل كل تقييم
    console.log('\n🔍 تحليل التقييمات:\n');
    let correctPredictions = 0;

    recentEvaluations.forEach((evaluation, index) => {
      const testCase = results.find(r => r.messageId === evaluation.messageId);
      
      console.log(`${index + 1}. ${evaluation.messageId}:`);
      console.log(`   🏆 الجودة الفعلية: ${evaluation.qualityLevel}`);
      console.log(`   🎯 الجودة المتوقعة: ${testCase?.expected || 'غير معروف'}`);
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
      
      // فحص دقة التوقع
      if (testCase && evaluation.qualityLevel === testCase.expected) {
        console.log(`   ✅ توقع صحيح`);
        correctPredictions++;
      } else if (testCase) {
        console.log(`   ❌ توقع خاطئ`);
      }
      
      console.log('');
    });

    // 6. فحص الإحصائيات العامة
    console.log('📋 [STEP 6] فحص الإحصائيات العامة...\n');

    const statistics = qualityMonitor.getQualityStatistics();
    console.log(`📊 إجمالي التقييمات: ${statistics.overall.totalEvaluations}`);
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

    // 7. فحص التقييمات المشكوك فيها
    console.log('\n📋 [STEP 7] فحص التقييمات المشكوك فيها...\n');

    const problematicEvaluations = qualityMonitor.getProblematicEvaluations(5);
    console.log(`⚠️ عدد التقييمات المشكوك فيها: ${problematicEvaluations.length}`);

    problematicEvaluations.forEach((evaluation, index) => {
      console.log(`${index + 1}. ${evaluation.messageId}: ${evaluation.scores.overall}%`);
      console.log(`   🔍 المشاكل: ${evaluation.issues.join(', ')}`);
    });

    // 8. فحص تحليل الاتجاهات
    console.log('\n📋 [STEP 8] فحص تحليل الاتجاهات...\n');

    const trends = qualityMonitor.analyzeTrends(1);
    console.log(`📈 إجمالي التقييمات في آخر يوم: ${trends.totalEvaluations}`);
    console.log(`🎯 متوسط الجودة: ${trends.averageScore}%`);

    if (trends.insights.length > 0) {
      console.log(`💡 الرؤى الذكية:`);
      trends.insights.forEach(insight => {
        console.log(`   - ${insight}`);
      });
    }

    // 9. النتيجة النهائية
    console.log('\n📋 [FINAL RESULT] النتيجة النهائية...\n');

    const accuracy = results.length > 0 ? (correctPredictions / results.length) * 100 : 0;
    
    console.log('🎯 تقييم شامل للنظام:');
    console.log(`   ✅ النظام يعمل: ${recentEvaluations.length > 0 ? 'نعم' : 'لا'}`);
    console.log(`   📊 عدد التقييمات: ${recentEvaluations.length}/${testCases.length}`);
    console.log(`   🎯 دقة التوقعات: ${Math.round(accuracy)}%`);
    console.log(`   📈 متوسط الجودة: ${statistics.overall.averageScore}%`);
    console.log(`   ⚠️ المشاكل المكتشفة: ${statistics.overall.issuesCount}`);

    // تحديد حالة النظام
    let systemHealth = 'ممتاز';
    if (recentEvaluations.length < testCases.length) systemHealth = 'يحتاج مراجعة';
    if (recentEvaluations.length === 0) systemHealth = 'لا يعمل';
    if (accuracy < 60) systemHealth = 'دقة منخفضة';

    console.log(`   🏥 حالة النظام: ${systemHealth}`);

    // التوصيات
    console.log('\n💡 التوصيات:');
    if (recentEvaluations.length === testCases.length) {
      console.log('   ✅ النظام يعمل بشكل مثالي');
    }
    if (accuracy >= 80) {
      console.log('   ✅ دقة التقييم ممتازة');
    } else if (accuracy >= 60) {
      console.log('   ⚠️ دقة التقييم جيدة لكن تحتاج تحسين');
    } else {
      console.log('   ❌ دقة التقييم منخفضة - يحتاج مراجعة');
    }

    if (statistics.overall.averageScore >= 70) {
      console.log('   ✅ جودة الردود جيدة');
    } else {
      console.log('   ⚠️ جودة الردود تحتاج تحسين');
    }

    console.log('\n🎉 انتهى التحقق الشامل من النظام!');
    
    return {
      working: recentEvaluations.length > 0,
      accuracy: accuracy,
      totalEvaluations: recentEvaluations.length,
      averageQuality: statistics.overall.averageScore,
      systemHealth: systemHealth
    };

  } catch (error) {
    console.error('❌ خطأ في التحقق من النظام:', error);
    return false;
  }
}

// تشغيل التحقق
if (require.main === module) {
  verifyAIQualitySystem()
    .then((result) => {
      if (result && result.working) {
        console.log('\n✅ النظام يعمل بنجاح!');
        process.exit(0);
      } else {
        console.log('\n❌ النظام لا يعمل بشكل صحيح!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 فشل في التحقق:', error);
      process.exit(1);
    });
}

module.exports = { verifyAIQualitySystem };
