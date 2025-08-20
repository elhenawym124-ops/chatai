/**
 * إنشاء بيانات تجريبية لنظام تعلم أنماط النجاح
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleData() {
  console.log('📝 إنشاء بيانات تجريبية لنظام تعلم أنماط النجاح...\n');

  try {
    // الحصول على معرف الشركة الافتراضي
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('⚠️ لا توجد شركات في قاعدة البيانات');
      return;
    }

    const companyId = company.id;
    console.log(`🏢 استخدام الشركة: ${company.name} (${companyId})`);

    // إنشاء أنماط نجاح تجريبية
    console.log('\n🎯 إنشاء أنماط النجاح...');
    const successPatterns = [
      {
        companyId,
        patternType: 'word_usage',
        pattern: JSON.stringify({
          significantWords: ['ممتاز', 'رائع', 'مناسب', 'جودة', 'يا قمر'],
          successWords: [
            { word: 'ممتاز', count: 15, frequency: 0.3 },
            { word: 'رائع', count: 12, frequency: 0.24 },
            { word: 'مناسب', count: 10, frequency: 0.2 },
            { word: 'يا قمر', count: 8, frequency: 0.16 }
          ],
          avoidWords: [
            { word: 'غالي', count: 5, frequency: 0.15 },
            { word: 'صعب', count: 3, frequency: 0.1 }
          ]
        }),
        description: 'الكلمات الإيجابية مثل "ممتاز" و "يا قمر" تزيد معدل النجاح بـ 23%',
        successRate: 0.85,
        sampleSize: 50,
        confidenceLevel: 0.9,
        isActive: true,
        isApproved: true,
        approvedBy: 'system',
        approvedAt: new Date()
      },
      {
        companyId,
        patternType: 'timing',
        pattern: JSON.stringify({
          optimalResponseTime: 12,
          avgSuccessTime: 12,
          avgFailTime: 25,
          timeDifference: 13,
          insight: 'faster_is_better'
        }),
        description: 'الرد السريع خلال 12 دقيقة يزيد النجاح بـ 18%',
        successRate: 0.78,
        sampleSize: 35,
        confidenceLevel: 0.8,
        isActive: true,
        isApproved: false
      },
      {
        companyId,
        patternType: 'response_style',
        pattern: JSON.stringify({
          optimalWordCount: 25,
          avgSuccessWords: 25,
          avgFailWords: 45,
          stylePreference: 'concise',
          insight: 'shorter_is_better'
        }),
        description: 'الردود المختصرة (25 كلمة) أكثر فعالية من الطويلة',
        successRate: 0.72,
        sampleSize: 40,
        confidenceLevel: 0.75,
        isActive: true,
        isApproved: false
      },
      {
        companyId,
        patternType: 'emotional_tone',
        pattern: JSON.stringify({
          optimalSentiment: 0.7,
          avgSuccessSentiment: 0.7,
          avgFailSentiment: 0.3,
          tonePreference: 'positive',
          insight: 'more_positive_is_better'
        }),
        description: 'النبرة الإيجابية تزيد معدل التحويل بـ 15%',
        successRate: 0.68,
        sampleSize: 30,
        confidenceLevel: 0.7,
        isActive: true,
        isApproved: true,
        approvedBy: 'system',
        approvedAt: new Date()
      }
    ];

    for (const pattern of successPatterns) {
      const created = await prisma.successPattern.create({ data: pattern });
      console.log(`✅ تم إنشاء نمط: ${created.description}`);
    }

    // إنشاء نتائج محادثات تجريبية
    console.log('\n💬 إنشاء نتائج المحادثات...');
    const conversationOutcomes = [];
    
    for (let i = 0; i < 25; i++) {
      const isSuccess = i < 15; // 60% نجاح
      const outcome = {
        companyId,
        conversationId: `sample_conv_${Date.now()}_${i}`,
        customerId: `sample_customer_${Date.now()}_${i}`,
        outcome: isSuccess ? 'purchase' : (i < 20 ? 'abandoned' : 'resolved'),
        outcomeValue: isSuccess ? 300 + (i * 25) : null,
        responseQuality: isSuccess ? 7 + (i * 0.15) : 4 + (i * 0.1),
        customerSatisfaction: isSuccess ? 4 + (i * 0.04) : 2.5 + (i * 0.1),
        conversionTime: isSuccess ? 8 + (i * 2) : 15 + (i * 3),
        messageCount: 4 + i,
        aiResponseCount: 2 + Math.floor(i / 3),
        humanHandoff: i > 22,
        metadata: JSON.stringify({
          sampleData: true,
          scenario: isSuccess ? 'successful_purchase' : 'abandoned_cart',
          createdAt: new Date()
        })
      };

      const created = await prisma.conversationOutcome.create({ data: outcome });
      conversationOutcomes.push(created);
    }

    console.log(`✅ تم إنشاء ${conversationOutcomes.length} نتيجة محادثة`);

    // إنشاء فعالية ردود تجريبية
    console.log('\n💭 إنشاء فعالية الردود...');
    const responseTexts = [
      'أهلاً وسهلاً يا قمر! كيف يمكنني مساعدتك؟',
      'الكوتشي متوفر بسعر ممتاز 349 جنيه',
      'جودة رائعة ومضمونة 100%',
      'الشحن مجاني والتوصيل سريع',
      'مقاسك متوفر بالتأكيد حبيبتي',
      'ألوان جميلة ومناسبة لكل الأذواق',
      'ضمان سنة كاملة على المنتج',
      'يمكنك الدفع عند الاستلام',
      'عرض خاص لفترة محدودة',
      'شكراً لثقتك فينا يا قمر',
      'السعر غالي شوية',
      'مش متأكد من الجودة',
      'محتاج أفكر فيه أكتر',
      'ممكن خصم على السعر ده؟',
      'الشحن هيكون كام؟',
      'متوفر لون أحمر؟',
      'المقاس 38 موجود؟',
      'كام يوم التوصيل؟',
      'ضمان كام سنة بالضبط؟',
      'ممكن أشوف صور أكتر للمنتج؟'
    ];

    const responseTypes = ['greeting', 'price_quote', 'product_info', 'shipping_info', 'closing'];
    const keywords = [
      'أهلاً, مساعدة, يا قمر',
      'سعر, جنيه, ممتاز',
      'جودة, رائعة, مضمونة',
      'شحن, مجاني, توصيل',
      'مقاس, متوفر, حبيبتي',
      'ألوان, جميلة, مناسبة',
      'ضمان, سنة, منتج',
      'دفع, استلام',
      'عرض, خاص, محدودة',
      'شكراً, ثقة, يا قمر'
    ];

    for (let i = 0; i < 40; i++) {
      const isEffective = i < 24; // 60% فعالية
      const response = {
        companyId,
        conversationId: conversationOutcomes[i % conversationOutcomes.length].conversationId,
        responseText: responseTexts[i % responseTexts.length],
        responseType: responseTypes[i % responseTypes.length],
        effectivenessScore: isEffective ? 7 + (i * 0.1) : 3 + (i * 0.05),
        leadToPurchase: isEffective && i < 20,
        responseTime: 800 + (i * 100),
        wordCount: 8 + (i % 15),
        sentimentScore: isEffective ? 0.4 + (i * 0.02) : -0.1 + (i * 0.01),
        keywords: keywords[i % keywords.length],
        customerReaction: isEffective ? 'positive' : (i % 3 === 0 ? 'neutral' : 'negative'),
        metadata: JSON.stringify({
          sampleData: true,
          effectiveness: isEffective ? 'high' : 'low',
          createdAt: new Date()
        })
      };

      await prisma.responseEffectiveness.create({ data: response });
    }

    console.log('✅ تم إنشاء 40 رد فعالية');

    // إحصائيات سريعة
    console.log('\n📊 إحصائيات البيانات المنشأة:');
    
    const patternCount = await prisma.successPattern.count({ where: { companyId } });
    const outcomeCount = await prisma.conversationOutcome.count({ where: { companyId } });
    const responseCount = await prisma.responseEffectiveness.count({ where: { companyId } });
    
    console.log(`   🎯 أنماط النجاح: ${patternCount}`);
    console.log(`   💬 نتائج المحادثات: ${outcomeCount}`);
    console.log(`   💭 فعالية الردود: ${responseCount}`);

    // إحصائيات النجاح
    const successfulOutcomes = await prisma.conversationOutcome.count({
      where: { companyId, outcome: 'purchase' }
    });
    
    const effectiveResponses = await prisma.responseEffectiveness.count({
      where: { companyId, effectivenessScore: { gte: 7 } }
    });

    console.log(`   ✅ محادثات ناجحة: ${successfulOutcomes}/${outcomeCount} (${((successfulOutcomes/outcomeCount)*100).toFixed(1)}%)`);
    console.log(`   ⭐ ردود فعالة: ${effectiveResponses}/${responseCount} (${((effectiveResponses/responseCount)*100).toFixed(1)}%)`);

    console.log('\n🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log('💡 يمكنك الآن اختبار نظام تعلم أنماط النجاح');

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات التجريبية:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  createSampleData()
    .then(() => {
      console.log('\n✅ اكتمل إنشاء البيانات التجريبية!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ فشل في إنشاء البيانات:', error);
      process.exit(1);
    });
}

module.exports = { createSampleData };
