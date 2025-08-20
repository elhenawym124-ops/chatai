const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateLearningData() {
  try {
    console.log('🚀 إنشاء بيانات التعلم المستمر...\n');
    
    const companyId = 'cmdkj6coz0000uf0cyscco6lr';
    
    // 1. إنشاء بيانات التعلم
    console.log('1️⃣ إنشاء بيانات التعلم...');
    const learningDataEntries = [
      {
        id: 'learn_001',
        companyId,
        type: 'conversation_analysis',
        data: JSON.stringify({
          customerMessage: 'عايزة اعرف سعر الكوتشي',
          aiResponse: 'سعر كوتشي الاسكوتش 349 جنيه',
          responseTime: 1200,
          customerSatisfaction: 4.5,
          intent: 'price_inquiry',
          sentiment: 'neutral'
        }),
        outcome: 'successful',
        insights: JSON.stringify({
          effectiveKeywords: ['سعر', 'كوتشي'],
          responseQuality: 'high',
          improvementAreas: ['add_product_images']
        }),
        metadata: JSON.stringify({
          sessionId: 'session_001',
          timestamp: new Date(),
          source: 'facebook_messenger'
        })
      },
      {
        id: 'learn_002',
        companyId,
        type: 'sentiment_analysis',
        data: JSON.stringify({
          customerMessage: 'الشحن غالي قوي',
          detectedSentiment: 'negative',
          actualSentiment: 'negative',
          aiResponse: 'ممكن اعرف محافظتك عشان اقولك سعر الشحن المناسب؟',
          customerReaction: 'positive'
        }),
        outcome: 'improved',
        insights: JSON.stringify({
          sentimentAccuracy: 1.0,
          responseEffectiveness: 0.9,
          improvementAreas: ['shipping_cost_transparency']
        }),
        metadata: JSON.stringify({
          sessionId: 'session_002',
          timestamp: new Date(),
          source: 'facebook_messenger'
        })
      },
      {
        id: 'learn_003',
        companyId,
        type: 'product_recommendation',
        data: JSON.stringify({
          customerMessage: 'عندكم كوتشي رياضي؟',
          recommendedProducts: ['كوتشي الاسكوتش'],
          customerInteraction: 'clicked',
          finalOutcome: 'purchase'
        }),
        outcome: 'successful',
        insights: JSON.stringify({
          recommendationAccuracy: 1.0,
          conversionRate: 1.0,
          revenue: 349
        }),
        metadata: JSON.stringify({
          sessionId: 'session_003',
          timestamp: new Date(),
          source: 'facebook_messenger'
        })
      }
    ];
    
    for (const entry of learningDataEntries) {
      await prisma.learningData.upsert({
        where: { id: entry.id },
        update: entry,
        create: entry
      });
    }
    console.log(`✅ تم إنشاء ${learningDataEntries.length} سجل تعلم`);
    
    // 2. إنشاء الأنماط المكتشفة
    console.log('\n2️⃣ إنشاء الأنماط المكتشفة...');
    const patterns = [
      {
        id: 'pattern_001',
        companyId,
        patternType: 'customer_behavior',
        pattern: JSON.stringify({
          trigger: 'price_inquiry',
          commonResponses: ['كام سعره؟', 'بكام ده؟', 'عايزة اعرف السعر'],
          successfulApproach: 'direct_price_with_benefits'
        }),
        description: 'العملاء يسألون عن السعر مباشرة ويفضلون الرد الواضح مع المميزات',
        confidence: 0.95,
        occurrences: 15,
        status: 'validated',
        contexts: JSON.stringify({
          timeOfDay: ['morning', 'afternoon'],
          customerType: ['new', 'returning'],
          productCategory: ['shoes']
        }),
        actionableInsights: JSON.stringify([
          'اذكر السعر مباشرة',
          'أضف مميزات المنتج',
          'اسأل عن المقاس واللون'
        ]),
        impact: JSON.stringify({
          conversionRate: 0.85,
          customerSatisfaction: 4.3,
          responseTime: 1200
        })
      },
      {
        id: 'pattern_002',
        companyId,
        patternType: 'shipping_concern',
        pattern: JSON.stringify({
          trigger: 'shipping_inquiry',
          commonConcerns: ['الشحن غالي', 'كام الشحن؟', 'متوفر الشحن؟'],
          successfulApproach: 'ask_location_first'
        }),
        description: 'العملاء قلقون من تكلفة الشحن ويفضلون معرفة السعر حسب المحافظة',
        confidence: 0.88,
        occurrences: 12,
        status: 'active',
        contexts: JSON.stringify({
          customerLocation: ['outside_cairo'],
          orderValue: ['under_200']
        }),
        actionableInsights: JSON.stringify([
          'اسأل عن المحافظة أولاً',
          'اذكر أسعار الشحن بوضوح',
          'اقترح الشحن المجاني للطلبات الكبيرة'
        ]),
        impact: JSON.stringify({
          conversionRate: 0.72,
          customerSatisfaction: 3.8,
          responseTime: 1500
        })
      }
    ];
    
    for (const pattern of patterns) {
      await prisma.discoveredPattern.upsert({
        where: { id: pattern.id },
        update: pattern,
        create: pattern
      });
    }
    console.log(`✅ تم إنشاء ${patterns.length} نمط مكتشف`);
    
    // 3. إنشاء التحسينات المطبقة
    console.log('\n3️⃣ إنشاء التحسينات المطبقة...');
    const improvements = [
      {
        id: 'improvement_001',
        companyId,
        improvementType: 'response_optimization',
        title: 'تحسين الرد على استفسارات الأسعار',
        description: 'إضافة السعر مع مميزات المنتج في رد واحد',
        implementation: JSON.stringify({
          changes: [
            'إضافة السعر مباشرة',
            'ذكر المميزات الرئيسية',
            'السؤال عن المقاس واللون'
          ],
          prompt_updates: ['تحديث البرومبت ليشمل السعر والمميزات']
        }),
        status: 'active',
        impact: JSON.stringify({
          before: { conversionRate: 0.65, responseTime: 1800 },
          after: { conversionRate: 0.85, responseTime: 1200 },
          improvement: { conversionRate: 0.20, responseTime: -600 }
        }),
        metrics: JSON.stringify({
          successRate: 0.85,
          customerSatisfaction: 4.3,
          implementationDate: new Date()
        })
      },
      {
        id: 'improvement_002',
        companyId,
        improvementType: 'shipping_transparency',
        title: 'تحسين شفافية أسعار الشحن',
        description: 'السؤال عن المحافظة قبل ذكر سعر الشحن',
        implementation: JSON.stringify({
          changes: [
            'السؤال عن المحافظة أولاً',
            'ذكر سعر الشحن المحدد',
            'اقتراح الشحن المجاني'
          ]
        }),
        status: 'testing',
        impact: JSON.stringify({
          before: { conversionRate: 0.55, customerSatisfaction: 3.2 },
          after: { conversionRate: 0.72, customerSatisfaction: 3.8 },
          improvement: { conversionRate: 0.17, customerSatisfaction: 0.6 }
        }),
        metrics: JSON.stringify({
          successRate: 0.72,
          customerSatisfaction: 3.8,
          implementationDate: new Date()
        })
      }
    ];
    
    for (const improvement of improvements) {
      await prisma.appliedImprovement.upsert({
        where: { id: improvement.id },
        update: improvement,
        create: improvement
      });
    }
    console.log(`✅ تم إنشاء ${improvements.length} تحسين مطبق`);
    
    // 4. إنشاء إعدادات التعلم
    console.log('\n4️⃣ إنشاء إعدادات التعلم...');
    const settings = [
      {
        id: 'setting_001',
        companyId,
        settingKey: 'learning_enabled',
        settingValue: 'true',
        description: 'تفعيل نظام التعلم المستمر'
      },
      {
        id: 'setting_002',
        companyId,
        settingKey: 'pattern_confidence_threshold',
        settingValue: '0.8',
        description: 'الحد الأدنى لثقة الأنماط المكتشفة'
      },
      {
        id: 'setting_003',
        companyId,
        settingKey: 'auto_improvement_enabled',
        settingValue: 'true',
        description: 'تفعيل التحسينات التلقائية'
      }
    ];
    
    for (const setting of settings) {
      await prisma.learningSettings.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting
      });
    }
    console.log(`✅ تم إنشاء ${settings.length} إعداد تعلم`);
    
    console.log('\n🎉 تم إنشاء جميع بيانات التعلم المستمر بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

populateLearningData();
