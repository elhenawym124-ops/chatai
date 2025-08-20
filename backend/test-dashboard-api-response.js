const fetch = require('node-fetch');

async function testDashboardAPI() {
  console.log('🧪 اختبار API Dashboard مباشرة...\n');
  
  try {
    const url = 'http://localhost:3001/api/v1/learning/dashboard?companyId=cmdt8nrjq003vufuss47dqc45';
    console.log(`📡 طلب GET إلى: ${url}`);
    
    const response = await fetch(url);
    console.log(`📊 حالة الاستجابة: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log('❌ فشل في الطلب');
      return;
    }
    
    const data = await response.json();
    console.log('\n📋 البيانات المستلمة:');
    console.log(JSON.stringify(data, null, 2));
    
    // تحليل البيانات
    console.log('\n🔍 تحليل البيانات:');
    console.log(`✅ نجح الطلب: ${data.success ? 'نعم' : 'لا'}`);
    
    if (data.success && data.data) {
      console.log('\n📊 محتوى البيانات:');
      console.log(`- Overview: ${data.data.overview ? 'موجود' : 'غير موجود'}`);
      console.log(`- Patterns: ${data.data.patterns ? 'موجود' : 'غير موجود'}`);
      console.log(`- Improvements: ${data.data.improvements ? 'موجود' : 'غير موجود'}`);
      console.log(`- Recommendations: ${data.data.recommendations ? 'موجود' : 'غير موجود'}`);
      
      if (data.data.overview) {
        console.log('\n📈 Overview Details:');
        console.log(`  - Total Interactions: ${data.data.overview.totalInteractions || 0}`);
        console.log(`  - Success Rate: ${data.data.overview.successRate || 0}%`);
        console.log(`  - Data Quality: ${data.data.overview.dataQuality || 'غير محدد'}`);
        console.log(`  - AI Enabled: ${data.data.overview.aiEnabled ? 'نعم' : 'لا'}`);
      }
      
      if (data.data.patterns) {
        console.log('\n🔍 Patterns Details:');
        console.log(`  - Total Patterns: ${data.data.patterns.totalPatterns || 0}`);
        console.log(`  - Discovered: ${data.data.patterns.discovered || 0}`);
        console.log(`  - Applied: ${data.data.patterns.applied || 0}`);
        console.log(`  - High Confidence: ${data.data.patterns.highConfidencePatterns || 0}`);
      }
      
      if (data.data.improvements) {
        console.log('\n🚀 Improvements Details:');
        console.log(`  - Active: ${data.data.improvements.active || 0}`);
        console.log(`  - Suggested: ${data.data.improvements.suggested || 0}`);
        console.log(`  - Active Improvements: ${data.data.improvements.activeImprovements || 0}`);
        console.log(`  - Testing Improvements: ${data.data.improvements.testingImprovements || 0}`);
      }
      
      if (data.data.recommendations) {
        console.log('\n💡 Recommendations:');
        if (Array.isArray(data.data.recommendations)) {
          data.data.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec.message || rec} (Priority: ${rec.priority || 'normal'})`);
          });
        } else {
          console.log(`  - Count: ${data.data.recommendations.length || 0}`);
        }
      }
      
      // فحص إذا كانت البيانات فارغة
      const isEmpty = (
        (!data.data.overview || data.data.overview.totalInteractions === 0) &&
        (!data.data.patterns || data.data.patterns.totalPatterns === 0) &&
        (!data.data.improvements || data.data.improvements.active === 0)
      );
      
      console.log('\n🎯 تقييم البيانات:');
      if (isEmpty) {
        console.log('⚠️ البيانات فارغة أو تحتوي على قيم صفر');
        console.log('💡 هذا يفسر لماذا الواجهة تظهر فارغة');
        console.log('🔧 الحل: تحتاج لجمع المزيد من البيانات من المحادثات');
      } else {
        console.log('✅ البيانات تحتوي على قيم حقيقية');
        console.log('🤔 إذا كانت الواجهة فارغة، فالمشكلة في عرض البيانات');
      }
      
    } else {
      console.log('❌ لا توجد بيانات في الاستجابة');
      console.log(`📝 رسالة الخطأ: ${data.message || 'غير محدد'}`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار API:', error.message);
  }
}

testDashboardAPI();
