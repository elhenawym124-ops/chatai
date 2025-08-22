const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPatternStatus() {
  try {
    console.log('🔍 فحص حالة الأنماط بالتفصيل...');
    
    const companyId = 'cme8zve740006ufbcre9qzue4';
    
    // جلب جميع الأنماط مع التفاصيل
    const allPatterns = await prisma.successPattern.findMany({
      where: {
        companyId: companyId
      },
      select: {
        id: true,
        patternType: true,
        description: true,
        isApproved: true,
        isActive: true,
        successRate: true,
        confidenceLevel: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 إجمالي الأنماط: ${allPatterns.length}`);
    
    // تصنيف الأنماط
    const approved = allPatterns.filter(p => p.isApproved);
    const active = allPatterns.filter(p => p.isActive);
    const approvedAndActive = allPatterns.filter(p => p.isApproved && p.isActive);
    const approvedButNotActive = allPatterns.filter(p => p.isApproved && !p.isActive);
    const activeButNotApproved = allPatterns.filter(p => !p.isApproved && p.isActive);
    
    console.log(`\n📈 تصنيف الأنماط:`);
    console.log(`   ✅ معتمدة: ${approved.length}`);
    console.log(`   🟢 نشطة: ${active.length}`);
    console.log(`   ✅🟢 معتمدة ونشطة: ${approvedAndActive.length}`);
    console.log(`   ✅❌ معتمدة لكن غير نشطة: ${approvedButNotActive.length}`);
    console.log(`   ❌🟢 نشطة لكن غير معتمدة: ${activeButNotApproved.length}`);
    
    // عرض الأنماط المعتمدة لكن غير النشطة
    if (approvedButNotActive.length > 0) {
      console.log(`\n⚠️ أنماط معتمدة لكن غير نشطة (${approvedButNotActive.length}):`);
      approvedButNotActive.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.patternType}`);
        console.log(`   الوصف: ${pattern.description.substring(0, 80)}...`);
        console.log(`   معدل النجاح: ${pattern.successRate}`);
        console.log(`   مستوى الثقة: ${pattern.confidenceLevel}`);
        console.log(`   ID: ${pattern.id}`);
        console.log('');
      });
      
      // اقتراح تفعيل الأنماط المعتمدة
      console.log('🔧 هل تريد تفعيل الأنماط المعتمدة؟');
      console.log('سيتم تفعيل الأنماط المعتمدة تلقائياً...');
      
      const updateResult = await prisma.successPattern.updateMany({
        where: {
          companyId: companyId,
          isApproved: true,
          isActive: false
        },
        data: {
          isActive: true
        }
      });
      
      console.log(`✅ تم تفعيل ${updateResult.count} نمط معتمد`);
    }
    
    // عرض الأنماط النشطة لكن غير المعتمدة
    if (activeButNotApproved.length > 0) {
      console.log(`\n⚠️ أنماط نشطة لكن غير معتمدة (${activeButNotApproved.length}):`);
      activeButNotApproved.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.patternType}`);
        console.log(`   الوصف: ${pattern.description.substring(0, 80)}...`);
        console.log(`   معدل النجاح: ${pattern.successRate}`);
        console.log(`   مستوى الثقة: ${pattern.confidenceLevel}`);
        console.log(`   ID: ${pattern.id}`);
        console.log('');
      });
      
      // اقتراح اعتماد الأنماط عالية الجودة
      const highQualityPatterns = activeButNotApproved.filter(p => 
        p.successRate >= 0.8 && p.confidenceLevel >= 0.7
      );
      
      if (highQualityPatterns.length > 0) {
        console.log(`🎯 أنماط عالية الجودة يمكن اعتمادها (${highQualityPatterns.length}):`);
        highQualityPatterns.forEach((pattern, index) => {
          console.log(`${index + 1}. ${pattern.patternType} - نجاح: ${pattern.successRate}, ثقة: ${pattern.confidenceLevel}`);
        });
        
        console.log('🔧 سيتم اعتماد الأنماط عالية الجودة تلقائياً...');
        
        const approveResult = await prisma.successPattern.updateMany({
          where: {
            companyId: companyId,
            isActive: true,
            isApproved: false,
            successRate: { gte: 0.8 },
            confidenceLevel: { gte: 0.7 }
          },
          data: {
            isApproved: true
          }
        });
        
        console.log(`✅ تم اعتماد ${approveResult.count} نمط عالي الجودة`);
      }
    }
    
    // فحص النتيجة النهائية
    console.log('\n🔄 فحص النتيجة بعد التحديث...');
    
    const finalPatterns = await prisma.successPattern.findMany({
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
        confidenceLevel: true
      },
      orderBy: {
        successRate: 'desc'
      }
    });
    
    console.log(`🎉 الأنماط المعتمدة والنشطة الآن: ${finalPatterns.length}`);
    
    if (finalPatterns.length > 0) {
      console.log('\n✅ الأنماط الجاهزة للاستخدام:');
      finalPatterns.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern.patternType}`);
        console.log(`   الوصف: ${pattern.description.substring(0, 80)}...`);
        console.log(`   معدل النجاح: ${pattern.successRate}`);
        console.log(`   مستوى الثقة: ${pattern.confidenceLevel}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPatternStatus();
