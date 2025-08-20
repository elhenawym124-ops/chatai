/**
 * فحص حالة نظام التعلم المستمر
 */

const { PrismaClient } = require('@prisma/client');

async function checkLearningSystemStatus() {
  const prisma = new PrismaClient();
  
  console.log('🔍 فحص حالة نظام التعلم المستمر...\n');

  try {
    // 1. فحص الجداول
    console.log('📊 فحص جداول قاعدة البيانات:');
    
    try {
      const learningDataCount = await prisma.learningData.count();
      console.log(`✅ learning_data: ${learningDataCount} سجل`);
    } catch (error) {
      console.log(`❌ learning_data: غير موجود - ${error.message}`);
    }

    try {
      const patternsCount = await prisma.discoveredPattern.count();
      console.log(`✅ discovered_patterns: ${patternsCount} نمط`);
    } catch (error) {
      console.log(`❌ discovered_patterns: غير موجود - ${error.message}`);
    }

    try {
      const improvementsCount = await prisma.appliedImprovement.count();
      console.log(`✅ applied_improvements: ${improvementsCount} تحسين`);
    } catch (error) {
      console.log(`❌ applied_improvements: غير موجود - ${error.message}`);
    }

    try {
      const settingsCount = await prisma.learningSettings.count();
      console.log(`✅ learning_settings: ${settingsCount} إعداد`);
    } catch (error) {
      console.log(`❌ learning_settings: غير موجود - ${error.message}`);
    }

    console.log('');

    // 2. فحص الخدمات
    console.log('🔧 فحص الخدمات:');
    
    try {
      const ContinuousLearningServiceV2 = require('./src/services/continuousLearningServiceV2');
      const learningService = new ContinuousLearningServiceV2();
      console.log('✅ ContinuousLearningServiceV2: متاح');
      
      // اختبار بسيط
      const testResult = await learningService.collectLearningData({
        companyId: 'test',
        type: 'test',
        data: { test: true }
      });
      
      if (testResult.success) {
        console.log('✅ جمع البيانات: يعمل');
        
        // حذف البيانات التجريبية
        await prisma.learningData.deleteMany({
          where: { companyId: 'test' }
        });
      } else {
        console.log(`❌ جمع البيانات: فشل - ${testResult.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ContinuousLearningServiceV2: غير متاح - ${error.message}`);
    }

    try {
      const aiAgentService = require('./src/services/aiAgentService');
      console.log('✅ aiAgentService: متاح');
      
      // فحص إذا كان التكامل موجود
      if (aiAgentService.collectLearningData) {
        console.log('✅ تكامل التعلم مع AI Agent: موجود');
      } else {
        console.log('❌ تكامل التعلم مع AI Agent: غير موجود');
      }
      
    } catch (error) {
      console.log(`❌ aiAgentService: غير متاح - ${error.message}`);
    }

    console.log('');

    // 3. فحص المسارات
    console.log('🌐 فحص مسارات API:');
    
    try {
      const continuousLearningRoutes = require('./src/routes/continuousLearning');
      console.log('✅ مسارات التعلم المستمر: متاحة');
    } catch (error) {
      console.log(`❌ مسارات التعلم المستمر: غير متاحة - ${error.message}`);
    }

    try {
      const continuousLearningController = require('./src/controllers/continuousLearningController');
      console.log('✅ تحكم التعلم المستمر: متاح');
    } catch (error) {
      console.log(`❌ تحكم التعلم المستمر: غير متاح - ${error.message}`);
    }

    console.log('');

    // 4. فحص البيانات الفعلية
    console.log('📈 البيانات الحالية:');
    
    const companyId = 'cmdkj6coz0000uf0cyscco6lr'; // الشركة الافتراضية
    
    const recentLearningData = await prisma.learningData.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📊 بيانات التعلم الحديثة: ${recentLearningData.length} سجل`);
    
    recentLearningData.forEach((record, index) => {
      const data = JSON.parse(record.data);
      console.log(`   ${index + 1}. ${record.type} - ${record.outcome || 'غير محدد'} (${new Date(record.createdAt).toLocaleString()})`);
    });

    const patterns = await prisma.discoveredPattern.findMany({
      where: { companyId },
      orderBy: { confidence: 'desc' },
      take: 3
    });
    
    console.log(`\n🔍 الأنماط المكتشفة: ${patterns.length} نمط`);
    patterns.forEach((pattern, index) => {
      console.log(`   ${index + 1}. ${pattern.description} (ثقة: ${pattern.confidence})`);
    });

    const improvements = await prisma.appliedImprovement.findMany({
      where: { companyId },
      orderBy: { appliedAt: 'desc' },
      take: 3
    });
    
    console.log(`\n🔧 التحسينات المطبقة: ${improvements.length} تحسين`);
    improvements.forEach((improvement, index) => {
      console.log(`   ${index + 1}. ${improvement.description} (${improvement.status})`);
    });

    // 5. التوصيات
    console.log('\n💡 التوصيات:');
    
    if (recentLearningData.length === 0) {
      console.log('⚠️  لا توجد بيانات تعلم حديثة - تأكد من أن النظام يجمع البيانات');
    } else {
      console.log('✅ النظام يجمع البيانات بنجاح');
    }
    
    if (patterns.length === 0) {
      console.log('⚠️  لا توجد أنماط مكتشفة - قد تحتاج لمزيد من البيانات');
    } else {
      console.log('✅ النظام يكتشف الأنماط بنجاح');
    }
    
    if (improvements.length === 0) {
      console.log('⚠️  لا توجد تحسينات مطبقة - فعل التحسينات التلقائية');
    } else {
      console.log('✅ النظام يطبق التحسينات بنجاح');
    }

    console.log('\n🎉 انتهى فحص النظام!');

  } catch (error) {
    console.error('❌ خطأ في فحص النظام:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
if (require.main === module) {
  checkLearningSystemStatus().catch(console.error);
}

module.exports = checkLearningSystemStatus;
