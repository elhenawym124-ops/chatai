const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatternUsage() {
  try {
    console.log('🔍 فحص استخدام الأنماط...');
    
    const companyId = 'cme8zve740006ufbcre9qzue4';
    
    // 1. فحص الأنماط المعتمدة
    const approvedPatterns = await prisma.successPattern.findMany({
      where: {
        companyId: companyId,
        isApproved: true,
        isActive: true
      },
      select: {
        id: true,
        patternType: true,
        description: true,
        successRate: true,
        confidenceLevel: true,
        isApproved: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        successRate: 'desc'
      }
    });
    
    console.log(`📊 عدد الأنماط المعتمدة: ${approvedPatterns.length}`);
    
    if (approvedPatterns.length > 0) {
      console.log('\n✅ الأنماط المعتمدة:');
      approvedPatterns.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.patternType}`);
        console.log(`   الوصف: ${pattern.description.substring(0, 80)}...`);
        console.log(`   معدل النجاح: ${pattern.successRate}`);
        console.log(`   مستوى الثقة: ${pattern.confidenceLevel}`);
        console.log('');
      });
    } else {
      console.log('❌ لا توجد أنماط معتمدة!');
    }
    
    // 2. فحص جميع الأنماط
    const allPatterns = await prisma.successPattern.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true,
        patternType: true,
        isApproved: true,
        isActive: true,
        successRate: true
      }
    });
    
    console.log(`\n📈 إجمالي الأنماط: ${allPatterns.length}`);
    
    const stats = {
      approved: allPatterns.filter(p => p.isApproved).length,
      active: allPatterns.filter(p => p.isActive).length,
      approvedAndActive: allPatterns.filter(p => p.isApproved && p.isActive).length
    };
    
    console.log(`   - معتمدة: ${stats.approved}`);
    console.log(`   - نشطة: ${stats.active}`);
    console.log(`   - معتمدة ونشطة: ${stats.approvedAndActive}`);
    
    // 3. فحص استخدام الأنماط
    const patternUsage = await prisma.patternUsage.findMany({
      where: {
        companyId: companyId
      },
      select: {
        patternId: true,
        applied: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`\n📊 آخر ${patternUsage.length} استخدامات للأنماط:`);
    if (patternUsage.length > 0) {
      patternUsage.forEach((usage, index) => {
        console.log(`${index + 1}. النمط: ${usage.patternId}`);
        console.log(`   مطبق: ${usage.applied}`);
        console.log(`   التاريخ: ${usage.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ لا توجد سجلات استخدام للأنماط!');
    }
    
    // 4. اختبار خدمة تطبيق الأنماط
    console.log('\n🧪 اختبار خدمة تطبيق الأنماط...');
    
    const PatternApplicationService = require('./src/services/patternApplicationService');
    const patternService = new PatternApplicationService();
    
    // فحص حالة نظام الأنماط
    const isSystemEnabled = await patternService.isPatternSystemEnabledForCompany(companyId);
    console.log(`🔧 نظام الأنماط مفعل: ${isSystemEnabled}`);
    
    // جلب الأنماط المعتمدة من الخدمة
    const patternsFromService = await patternService.getApprovedPatterns(companyId);
    console.log(`📋 الأنماط من الخدمة: ${patternsFromService.length}`);
    
    if (patternsFromService.length > 0) {
      console.log('\n📝 الأنماط المحملة من الخدمة:');
      patternsFromService.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.type} - ${pattern.description.substring(0, 50)}...`);
      });
    }
    
    // 5. فحص إعدادات الشركة
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        plan: true,
        isActive: true
      }
    });
    
    console.log('\n🏢 معلومات الشركة:');
    console.log(`   الاسم: ${company?.name}`);
    console.log(`   الخطة: ${company?.plan}`);
    console.log(`   نشطة: ${company?.isActive}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatternUsage();
