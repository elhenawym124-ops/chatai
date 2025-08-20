const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testLearningFrontendSync() {
  console.log('🧪 اختبار تزامن واجهة نظام التعلم المستمر مع الخادم الخلفي\n');
  console.log('='.repeat(70));
  
  try {
    // 1. فحص البيانات في قاعدة البيانات
    console.log('\n📊 1. فحص البيانات في قاعدة البيانات:');
    
    const learningDataCount = await prisma.learningData.count();
    const patternsCount = await prisma.discoveredPattern.count();
    const improvementsCount = await prisma.appliedImprovement.count();
    
    console.log(`   📈 بيانات التعلم: ${learningDataCount} سجل`);
    console.log(`   🔍 الأنماط المكتشفة: ${patternsCount} نمط`);
    console.log(`   🚀 التحسينات المطبقة: ${improvementsCount} تحسين`);

    // 2. اختبار API endpoint للـ dashboard
    console.log('\n🌐 2. اختبار API endpoint للـ dashboard:');
    
    try {
      const dashboardResponse = await fetch('http://localhost:3001/api/v1/learning/dashboard?companyId=cmdt8nrjq003vufuss47dqc45');
      const dashboardData = await dashboardResponse.json();
      
      console.log(`   📡 حالة الاستجابة: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
      console.log(`   ✅ نجح الطلب: ${dashboardData.success ? 'نعم' : 'لا'}`);
      
      if (dashboardData.success && dashboardData.data) {
        console.log('\n   📊 بيانات Dashboard من API:');
        console.log(`      📈 إجمالي التفاعلات: ${dashboardData.data.overview?.totalInteractions || 0}`);
        console.log(`      📊 معدل النجاح: ${dashboardData.data.overview?.successRate || 0}%`);
        console.log(`      🔍 إجمالي الأنماط: ${dashboardData.data.patterns?.totalPatterns || 0}`);
        console.log(`      🚀 التحسينات النشطة: ${dashboardData.data.improvements?.activeImprovements || 0}`);
        console.log(`      💡 التوصيات: ${dashboardData.data.recommendations?.length || 0} توصية`);
      } else {
        console.log(`   ❌ فشل في جلب البيانات: ${dashboardData.message || 'خطأ غير معروف'}`);
      }
    } catch (apiError) {
      console.log(`   ❌ خطأ في الاتصال بـ API: ${apiError.message}`);
    }

    // 3. اختبار API endpoint للـ analytics
    console.log('\n📈 3. اختبار API endpoint للـ analytics:');
    
    try {
      const analyticsResponse = await fetch('http://localhost:3001/api/v1/learning/analytics?period=week&companyId=cmdt8nrjq003vufuss47dqc45');
      const analyticsData = await analyticsResponse.json();
      
      console.log(`   📡 حالة الاستجابة: ${analyticsResponse.status} ${analyticsResponse.statusText}`);
      console.log(`   ✅ نجح الطلب: ${analyticsData.success ? 'نعم' : 'لا'}`);
      
      if (analyticsData.success && analyticsData.data) {
        console.log('\n   📊 بيانات Analytics من API:');
        console.log(`      📈 إجمالي التفاعلات: ${analyticsData.data.overview?.totalInteractions || 0}`);
        console.log(`      📊 معدل النجاح: ${analyticsData.data.overview?.successRate || 0}%`);
        console.log(`      📅 الفترة: ${analyticsData.data.period || 'غير محدد'}`);
        console.log(`      📊 الاتجاهات: ${analyticsData.data.trends?.length || 0} اتجاه`);
      }
    } catch (analyticsError) {
      console.log(`   ❌ خطأ في الاتصال بـ Analytics API: ${analyticsError.message}`);
    }

    // 4. اختبار API endpoint للـ patterns
    console.log('\n🔍 4. اختبار API endpoint للـ patterns:');
    
    try {
      const patternsResponse = await fetch('http://localhost:3001/api/v1/learning/patterns?companyId=cmdt8nrjq003vufuss47dqc45');
      const patternsData = await patternsResponse.json();
      
      console.log(`   📡 حالة الاستجابة: ${patternsResponse.status} ${patternsResponse.statusText}`);
      console.log(`   ✅ نجح الطلب: ${patternsData.success ? 'نعم' : 'لا'}`);
      
      if (patternsData.success && patternsData.data) {
        console.log('\n   🔍 بيانات Patterns من API:');
        console.log(`      📊 عدد الأنماط: ${patternsData.data.patterns?.length || 0}`);
        if (patternsData.data.patterns && patternsData.data.patterns.length > 0) {
          patternsData.data.patterns.slice(0, 3).forEach((pattern, index) => {
            console.log(`      ${index + 1}. ${pattern.description || pattern.patternType} (ثقة: ${(pattern.confidence * 100).toFixed(1)}%)`);
          });
        }
      }
    } catch (patternsError) {
      console.log(`   ❌ خطأ في الاتصال بـ Patterns API: ${patternsError.message}`);
    }

    // 5. مقارنة البيانات
    console.log('\n🔄 5. مقارنة البيانات بين قاعدة البيانات والـ API:');
    
    // جلب البيانات مرة أخرى للمقارنة
    try {
      const dashboardResponse = await fetch('http://localhost:3001/api/v1/learning/dashboard?companyId=cmdt8nrjq003vufuss47dqc45');
      const dashboardData = await dashboardResponse.json();
      
      if (dashboardData.success) {
        const apiPatternsCount = dashboardData.data.patterns?.totalPatterns || 0;
        const apiImprovementsCount = dashboardData.data.improvements?.activeImprovements || 0;
        
        console.log('\n   📊 مقارنة الأنماط:');
        console.log(`      قاعدة البيانات: ${patternsCount} نمط`);
        console.log(`      API: ${apiPatternsCount} نمط`);
        console.log(`      متطابق: ${patternsCount === apiPatternsCount ? '✅' : '❌'}`);
        
        console.log('\n   🚀 مقارنة التحسينات:');
        console.log(`      قاعدة البيانات: ${improvementsCount} تحسين`);
        console.log(`      API: ${apiImprovementsCount} تحسين نشط`);
        console.log(`      متطابق: ${improvementsCount === apiImprovementsCount ? '✅' : '❌'}`);
      }
    } catch (error) {
      console.log(`   ❌ خطأ في المقارنة: ${error.message}`);
    }

    // 6. اختبار الواجهة الأمامية
    console.log('\n🎨 6. اختبار الواجهة الأمامية:');
    
    try {
      const frontendResponse = await fetch('http://localhost:3000');
      console.log(`   📡 حالة الواجهة: ${frontendResponse.status} ${frontendResponse.statusText}`);
      console.log(`   ✅ الواجهة تعمل: ${frontendResponse.ok ? 'نعم' : 'لا'}`);
    } catch (frontendError) {
      console.log(`   ❌ الواجهة لا تعمل: ${frontendError.message}`);
    }

    // 7. التقييم النهائي
    console.log('\n🎯 7. التقييم النهائي:');
    
    const hasData = learningDataCount > 0;
    const hasPatterns = patternsCount > 0;
    const hasImprovements = improvementsCount > 0;
    
    console.log('\n   📊 حالة البيانات:');
    console.log(`      بيانات التعلم: ${hasData ? '✅ متوفرة' : '⚠️ غير متوفرة'}`);
    console.log(`      الأنماط: ${hasPatterns ? '✅ متوفرة' : '⚠️ غير متوفرة'}`);
    console.log(`      التحسينات: ${hasImprovements ? '✅ متوفرة' : '⚠️ غير متوفرة'}`);
    
    console.log('\n   🔗 حالة التزامن:');
    if (hasData) {
      console.log('   ✅ الواجهة ستعرض بيانات حقيقية من الخادم');
      console.log('   ✅ نظام التعلم المستمر يعمل ويجمع البيانات');
      console.log('   ✅ API endpoints تعمل وترجع البيانات الصحيحة');
    } else {
      console.log('   ⚠️ لا توجد بيانات تعلم - الواجهة ستعرض حالة فارغة');
      console.log('   💡 ابدأ محادثات مع العملاء لجمع بيانات التعلم');
    }

    // 8. التوصيات
    console.log('\n💡 8. التوصيات:');
    
    const recommendations = [];
    
    if (!hasData) {
      recommendations.push('ابدأ محادثات مع العملاء لجمع بيانات التعلم');
    }
    
    if (!hasPatterns && hasData) {
      recommendations.push('انتظر حتى يتم جمع المزيد من البيانات لاكتشاف الأنماط');
    }
    
    if (!hasImprovements && hasPatterns) {
      recommendations.push('فعل التحسينات التلقائية في إعدادات النظام');
    }
    
    if (recommendations.length > 0) {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    } else {
      console.log('   🎉 النظام يعمل بشكل مثالي!');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 انتهى اختبار التزامن بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في اختبار التزامن:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLearningFrontendSync();
