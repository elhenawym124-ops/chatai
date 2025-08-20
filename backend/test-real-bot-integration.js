/**
 * اختبار دمج نظام التقييم الذكي مع البوت الحقيقي
 */

const aiAgentService = require('./src/services/aiAgentService');

async function testRealBotIntegration() {
  console.log('🤖 [TEST] بدء اختبار دمج النظام مع البوت الحقيقي...\n');

  try {
    // الحصول على خدمة البوت (instance جاهز)
    const aiAgent = aiAgentService;

    console.log('✅ [TEST] البوت جاهز للاختبار\n');

    // محاكاة محادثات حقيقية
    const testConversations = [
      {
        conversationId: 'real_conv_001',
        messages: [
          {
            content: 'السلام عليكم، أريد معرفة سعر الجاكيت الأزرق',
            expectedQuality: 'good' // نتوقع رد جيد لأن السؤال واضح
          }
        ]
      },
      {
        conversationId: 'real_conv_002',
        messages: [
          {
            content: 'هل عندكم توصيل؟',
            expectedQuality: 'acceptable' // سؤال بسيط
          }
        ]
      },
      {
        conversationId: 'real_conv_003',
        messages: [
          {
            content: 'أريد شراء حقيبة جلدية بنية اللون مقاس كبير',
            expectedQuality: 'excellent' // سؤال مفصل ومحدد
          }
        ]
      },
      {
        conversationId: 'real_conv_004',
        messages: [
          {
            content: 'مرحبا',
            expectedQuality: 'acceptable' // تحية بسيطة
          }
        ]
      },
      {
        conversationId: 'real_conv_005',
        messages: [
          {
            content: 'ما هي أنواع الأحذية المتوفرة لديكم؟',
            expectedQuality: 'good' // سؤال واضح عن المنتجات
          }
        ]
      }
    ];

    const evaluationResults = [];

    // معالجة كل محادثة
    for (const conversation of testConversations) {
      console.log(`💬 [TEST] معالجة المحادثة: ${conversation.conversationId}`);
      
      for (const message of conversation.messages) {
        console.log(`   📝 الرسالة: "${message.content}"`);
        
        try {
          // معالجة الرسالة بالبوت الحقيقي
          const response = await aiAgent.processCustomerMessage(
            message.content,
            conversation.conversationId,
            'test_customer_001',
            'test_page_001'
          );

          if (response.success) {
            console.log(`   ✅ رد البوت: "${response.content.substring(0, 100)}..."`);
            console.log(`   📊 النموذج المستخدم: ${response.model}`);
            console.log(`   🔍 استخدام RAG: ${response.ragDataUsed ? 'نعم' : 'لا'}`);
            console.log(`   ⏱️ وقت المعالجة: ${response.processingTime}ms`);
            
            // انتظار قليل للسماح للتقييم بالمعالجة
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            evaluationResults.push({
              conversationId: conversation.conversationId,
              userMessage: message.content,
              botResponse: response.content,
              model: response.model,
              ragUsed: response.ragDataUsed,
              processingTime: response.processingTime,
              expectedQuality: message.expectedQuality
            });
            
          } else {
            console.log(`   ❌ فشل في الرد: ${response.error || 'خطأ غير معروف'}`);
          }
          
        } catch (error) {
          console.error(`   💥 خطأ في معالجة الرسالة:`, error.message);
        }
        
        console.log(''); // سطر فارغ
      }
    }

    // انتظار لإكمال معالجة التقييمات
    console.log('⏳ [TEST] انتظار إكمال معالجة التقييمات...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // فحص نتائج التقييم
    console.log('📊 [TEST] فحص نتائج التقييم الذكي...\n');
    
    const qualityMonitor = aiAgent.qualityMonitor;
    const recentEvaluations = qualityMonitor.getRecentEvaluations(10);
    
    console.log(`📈 عدد التقييمات المكتملة: ${recentEvaluations.length}`);
    
    if (recentEvaluations.length > 0) {
      console.log('\n🔍 تفاصيل التقييمات:');
      
      recentEvaluations.forEach((evaluation, index) => {
        const originalMessage = evaluationResults.find(r => 
          evaluation.messageId.includes(r.conversationId)
        );
        
        console.log(`\n${index + 1}. التقييم ${evaluation.messageId}:`);
        console.log(`   📝 الرسالة الأصلية: "${originalMessage?.userMessage || 'غير معروف'}"`);
        console.log(`   🤖 رد البوت: "${evaluation.botResponse?.substring(0, 80) || 'غير متوفر'}..."`);
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
        
        if (originalMessage?.expectedQuality) {
          const qualityMatch = evaluation.qualityLevel === originalMessage.expectedQuality;
          console.log(`   🎯 توقع الجودة: ${originalMessage.expectedQuality} | فعلي: ${evaluation.qualityLevel} ${qualityMatch ? '✅' : '❌'}`);
        }
      });
      
      // إحصائيات عامة
      console.log('\n📈 الإحصائيات العامة:');
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
      
      // تحليل الاتجاهات
      console.log('\n📊 تحليل الاتجاهات:');
      const trends = qualityMonitor.analyzeTrends(1); // آخر يوم
      
      console.log(`📈 إجمالي التقييمات في آخر يوم: ${trends.totalEvaluations}`);
      console.log(`🎯 متوسط الجودة: ${trends.averageScore}%`);
      
      if (trends.insights.length > 0) {
        console.log(`💡 الرؤى الذكية:`);
        trends.insights.forEach(insight => {
          console.log(`   - ${insight}`);
        });
      }
      
    } else {
      console.log('⚠️ لم يتم العثور على تقييمات مكتملة');
    }

    console.log('\n✅ [TEST] اكتمل اختبار الدمج بنجاح!');
    
    // ملخص النتائج
    console.log('\n📋 [SUMMARY] ملخص الاختبار:');
    console.log(`   - تم معالجة ${evaluationResults.length} رسائل`);
    console.log(`   - تم إنشاء ${recentEvaluations.length} تقييمات`);
    
    if (recentEvaluations.length > 0) {
      const avgScore = Math.round(
        recentEvaluations.reduce((sum, e) => sum + e.scores.overall, 0) / recentEvaluations.length
      );
      console.log(`   - متوسط جودة الردود: ${avgScore}%`);
      
      const bestScore = Math.max(...recentEvaluations.map(e => e.scores.overall));
      const worstScore = Math.min(...recentEvaluations.map(e => e.scores.overall));
      console.log(`   - أفضل رد: ${bestScore}%`);
      console.log(`   - أضعف رد: ${worstScore}%`);
    }

  } catch (error) {
    console.error('❌ [TEST] خطأ في اختبار الدمج:', error);
    throw error;
  }
}

// تشغيل الاختبار
if (require.main === module) {
  testRealBotIntegration()
    .then(() => {
      console.log('\n🎉 [TEST] انتهى اختبار الدمج بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 [TEST] فشل اختبار الدمج:', error);
      process.exit(1);
    });
}

module.exports = { testRealBotIntegration };
