const { PrismaClient } = require('@prisma/client');

async function addSampleData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 إضافة بيانات تجريبية للتعلم المستمر...');
    
    const companyId = 'cmdt8nrjq003vufuss47dqc45';
    
    // إضافة أنماط مكتشفة
    const patterns = [
      {
        id: 'pattern_price_inquiry',
        companyId,
        pattern: 'استفسارات عن الأسعار',
        description: 'العملاء يسألون عن أسعار المنتجات بشكل متكرر',
        patternType: 'price_inquiry',
        confidence: 0.92,
        occurrences: 156,
        status: 'active',
        contexts: JSON.stringify(['سعر', 'كام', 'بكام', 'تكلفة']),
        actionableInsights: JSON.stringify({
          suggestion: 'إضافة قائمة أسعار واضحة',
          priority: 'high'
        }),
        impact: JSON.stringify({
          customerSatisfaction: 0.85,
          responseTime: 1200
        }),
        discoveredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pattern_size_inquiry',
        companyId,
        pattern: 'طلبات المقاسات',
        description: 'العملاء يحتاجون معرفة المقاسات المتاحة',
        patternType: 'size_inquiry',
        confidence: 0.87,
        occurrences: 134,
        status: 'active',
        contexts: JSON.stringify(['مقاس', 'مقاسات', 'سايز', 'متاح']),
        actionableInsights: JSON.stringify({
          suggestion: 'عرض جدول المقاسات تلقائياً',
          priority: 'medium'
        }),
        impact: JSON.stringify({
          customerSatisfaction: 0.78,
          responseTime: 800
        }),
        discoveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pattern_delivery_inquiry',
        companyId,
        pattern: 'استفسارات عن التوصيل',
        description: 'أسئلة متكررة حول أوقات وتكلفة التوصيل',
        patternType: 'delivery_inquiry',
        confidence: 0.78,
        occurrences: 89,
        status: 'testing',
        contexts: JSON.stringify(['توصيل', 'شحن', 'وصول', 'متى']),
        actionableInsights: JSON.stringify({
          suggestion: 'إضافة معلومات التوصيل للمنتجات',
          priority: 'medium'
        }),
        impact: JSON.stringify({
          customerSatisfaction: 0.72,
          responseTime: 1500
        }),
        discoveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pattern_color_inquiry',
        companyId,
        pattern: 'طلبات الألوان المتاحة',
        description: 'العملاء يسألون عن الألوان المتوفرة للمنتجات',
        patternType: 'color_inquiry',
        confidence: 0.85,
        occurrences: 67,
        status: 'active',
        contexts: JSON.stringify(['لون', 'ألوان', 'متوفر', 'موجود']),
        actionableInsights: JSON.stringify({
          suggestion: 'عرض الألوان المتاحة مع الصور',
          priority: 'low'
        }),
        impact: JSON.stringify({
          customerSatisfaction: 0.80,
          responseTime: 600
        }),
        discoveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'pattern_quality_feedback',
        companyId,
        pattern: 'ملاحظات جودة المنتج',
        description: 'تعليقات العملاء حول جودة المنتجات',
        patternType: 'quality_feedback',
        confidence: 0.65,
        occurrences: 23,
        status: 'discovered',
        contexts: JSON.stringify(['جودة', 'خامة', 'مريح', 'طبي']),
        actionableInsights: JSON.stringify({
          suggestion: 'تحسين وصف جودة المنتجات',
          priority: 'high'
        }),
        impact: JSON.stringify({
          customerSatisfaction: 0.88,
          responseTime: 900
        }),
        discoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    // إضافة الأنماط
    for (const pattern of patterns) {
      await prisma.discoveredPattern.upsert({
        where: { id: pattern.id },
        update: pattern,
        create: pattern
      });
    }

    // إضافة تحسينات مطبقة
    const improvements = [
      {
        id: 'improvement_quick_price',
        companyId,
        improvementType: 'quick_response',
        description: 'ردود سريعة للاستفسارات عن الأسعار',
        status: 'active',
        metrics: JSON.stringify({
          responseTimeReduction: 0.6,
          accuracyImprovement: 0.15
        }),
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'improvement_size_guide',
        companyId,
        improvementType: 'content_enhancement',
        description: 'تحسين عرض معلومات المقاسات',
        status: 'active',
        metrics: JSON.stringify({
          customerSatisfaction: 0.12,
          conversionRate: 0.08
        }),
        appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'improvement_delivery_info',
        companyId,
        improvementType: 'information_display',
        description: 'عرض معلومات التوصيل بوضوح',
        status: 'testing',
        metrics: JSON.stringify({
          inquiryReduction: 0.25,
          customerSatisfaction: 0.10
        }),
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    // إضافة التحسينات
    for (const improvement of improvements) {
      await prisma.appliedImprovement.upsert({
        where: { id: improvement.id },
        update: improvement,
        create: improvement
      });
    }

    console.log('✅ تم إضافة البيانات التجريبية بنجاح!');
    console.log(`📊 تم إضافة ${patterns.length} أنماط مكتشفة`);
    console.log(`🔧 تم إضافة ${improvements.length} تحسينات مطبقة`);

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
