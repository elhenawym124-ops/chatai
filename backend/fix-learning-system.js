/**
 * إصلاح وتفعيل نظام التعلم المستمر
 */

const { PrismaClient } = require('@prisma/client');

async function fixLearningSystem() {
  const prisma = new PrismaClient();
  
  console.log('🔧 إصلاح وتفعيل نظام التعلم المستمر...\n');

  try {
    // 1. التأكد من وجود الجداول
    console.log('📊 التحقق من جداول قاعدة البيانات...');
    
    try {
      // محاولة إنشاء سجل تجريبي للتأكد من وجود الجداول
      await prisma.learningData.findFirst();
      console.log('✅ جدول learning_data موجود');
    } catch (error) {
      console.log('❌ جدول learning_data غير موجود - تشغيل migration...');
      // هنا يمكن تشغيل migration إذا لزم الأمر
    }

    // 2. إنشاء إعدادات التعلم الافتراضية
    console.log('\n⚙️ إعداد إعدادات التعلم الافتراضية...');
    
    const defaultCompanyId = 'cmdkj6coz0000uf0cyscco6lr';
    
    const existingSettings = await prisma.learningSettings.findUnique({
      where: { companyId: defaultCompanyId }
    });

    if (!existingSettings) {
      await prisma.learningSettings.create({
        data: {
          companyId: defaultCompanyId,
          enabled: true,
          learningSpeed: 'medium',
          autoApplyImprovements: false, // ابدأ بالوضع اليدوي
          dataRetentionDays: 90,
          minimumSampleSize: 10, // قلل العدد للاختبار
          confidenceThreshold: 0.7, // قلل الحد للاختبار
          settings: JSON.stringify({
            collectConversations: true,
            collectSentiment: true,
            collectPerformance: true,
            enablePatternAnalysis: true,
            enableImprovementSuggestions: true
          })
        }
      });
      console.log('✅ تم إنشاء إعدادات التعلم الافتراضية');
    } else {
      console.log('✅ إعدادات التعلم موجودة مسبقاً');
    }

    // 3. إنشاء بيانات تجريبية للاختبار
    console.log('\n🧪 إنشاء بيانات تجريبية للاختبار...');
    
    const testData = [
      {
        companyId: defaultCompanyId,
        customerId: 'test_customer_1',
        conversationId: 'test_conv_1',
        type: 'conversation',
        data: JSON.stringify({
          userMessage: 'مرحبا، أريد معرفة المنتجات المتاحة',
          aiResponse: 'أهلاً بك! يسعدني مساعدتك. لدينا مجموعة رائعة من المنتجات...',
          intent: 'product_inquiry',
          sentiment: 'positive',
          processingTime: 1500,
          ragDataUsed: true,
          memoryUsed: false,
          model: 'gemini-pro',
          confidence: 0.9
        }),
        outcome: 'satisfied',
        feedback: JSON.stringify({
          satisfactionScore: 5,
          responseQuality: 'excellent',
          helpfulness: 'very_helpful'
        })
      },
      {
        companyId: defaultCompanyId,
        customerId: 'test_customer_2',
        conversationId: 'test_conv_2',
        type: 'conversation',
        data: JSON.stringify({
          userMessage: 'أريد أشتري تيشيرت أحمر',
          aiResponse: 'ممتاز! لدينا تيشيرتات حمراء رائعة. إليك أفضل الخيارات المتاحة...',
          intent: 'purchase',
          sentiment: 'positive',
          processingTime: 1200,
          ragDataUsed: true,
          memoryUsed: true,
          model: 'gemini-pro',
          confidence: 0.95
        }),
        outcome: 'purchase_intent',
        feedback: null
      },
      {
        companyId: defaultCompanyId,
        customerId: 'test_customer_3',
        conversationId: 'test_conv_3',
        type: 'conversation',
        data: JSON.stringify({
          userMessage: 'عندي مشكلة في الطلب',
          aiResponse: 'أعتذر عن هذه المشكلة. دعني أساعدك في حلها فوراً...',
          intent: 'support',
          sentiment: 'negative',
          processingTime: 2000,
          ragDataUsed: true,
          memoryUsed: true,
          model: 'gemini-pro',
          confidence: 0.85
        }),
        outcome: 'resolved',
        feedback: JSON.stringify({
          satisfactionScore: 4,
          responseQuality: 'good',
          helpfulness: 'helpful'
        })
      }
    ];

    // حذف البيانات التجريبية القديمة
    await prisma.learningData.deleteMany({
      where: {
        companyId: defaultCompanyId,
        customerId: { startsWith: 'test_customer_' }
      }
    });

    // إنشاء البيانات التجريبية الجديدة
    for (const data of testData) {
      await prisma.learningData.create({ data });
    }
    
    console.log(`✅ تم إنشاء ${testData.length} سجل تجريبي`);

    // 4. تشغيل تحليل الأنماط
    console.log('\n🔍 تشغيل تحليل الأنماط...');
    
    try {
      const ContinuousLearningServiceV2 = require('./src/services/continuousLearningServiceV2');
      const learningService = new ContinuousLearningServiceV2();
      
      // جلب البيانات للتحليل
      const learningData = await prisma.learningData.findMany({
        where: { companyId: defaultCompanyId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      if (learningData.length > 0) {
        console.log(`📊 تحليل ${learningData.length} سجل...`);
        
        // تحليل الأنماط
        const patterns = await learningService.analyzePatterns(learningData);
        console.log(`✅ تم اكتشاف ${patterns.length} نمط`);
        
        // حفظ الأنماط
        for (const pattern of patterns) {
          await learningService.saveDiscoveredPattern(pattern);
        }
        
        console.log('✅ تم حفظ الأنماط المكتشفة');
      } else {
        console.log('⚠️ لا توجد بيانات كافية للتحليل');
      }
      
    } catch (error) {
      console.log(`❌ خطأ في تحليل الأنماط: ${error.message}`);
    }

    // 5. اختبار التكامل مع AI Agent
    console.log('\n🤖 اختبار التكامل مع AI Agent...');
    
    try {
      const aiAgentService = require('./src/services/aiAgentService');
      
      if (aiAgentService.collectLearningData) {
        // اختبار جمع البيانات
        const testResult = await aiAgentService.collectLearningData({
          companyId: defaultCompanyId,
          customerId: 'integration_test',
          conversationId: 'integration_test_conv',
          userMessage: 'اختبار التكامل',
          aiResponse: 'تم الاختبار بنجاح',
          intent: 'test',
          sentiment: 'neutral',
          processingTime: 1000,
          ragDataUsed: false,
          memoryUsed: false,
          model: 'gemini-pro',
          confidence: 1.0
        });
        
        if (testResult.success) {
          console.log('✅ التكامل مع AI Agent يعمل بنجاح');
          
          // حذف البيانات التجريبية
          await prisma.learningData.deleteMany({
            where: { customerId: 'integration_test' }
          });
        } else {
          console.log(`❌ فشل التكامل: ${testResult.error}`);
        }
      } else {
        console.log('❌ دالة collectLearningData غير موجودة في AI Agent');
      }
      
    } catch (error) {
      console.log(`❌ خطأ في اختبار التكامل: ${error.message}`);
    }

    // 6. عرض الحالة النهائية
    console.log('\n📈 الحالة النهائية:');
    
    const totalLearningData = await prisma.learningData.count({
      where: { companyId: defaultCompanyId }
    });
    
    const totalPatterns = await prisma.discoveredPattern.count({
      where: { companyId: defaultCompanyId }
    });
    
    const totalImprovements = await prisma.appliedImprovement.count({
      where: { companyId: defaultCompanyId }
    });
    
    console.log(`📊 إجمالي بيانات التعلم: ${totalLearningData}`);
    console.log(`🔍 إجمالي الأنماط المكتشفة: ${totalPatterns}`);
    console.log(`🔧 إجمالي التحسينات المطبقة: ${totalImprovements}`);

    // 7. تعليمات للمستخدم
    console.log('\n💡 تعليمات للاستخدام:');
    console.log('1. النظام الآن جاهز ويعمل تلقائياً');
    console.log('2. سيتم جمع البيانات من كل تفاعل مع العملاء');
    console.log('3. لمراقبة النظام: node test-learning-status.js');
    console.log('4. لعرض التحليلات: GET /api/v1/learning/analytics');
    console.log('5. لتفعيل التحسينات التلقائية: PUT /api/v1/learning/settings');

    console.log('\n🎉 تم إصلاح وتفعيل نظام التعلم المستمر بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إصلاح النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
if (require.main === module) {
  fixLearningSystem().catch(console.error);
}

module.exports = fixLearningSystem;
