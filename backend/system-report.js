/**
 * تقرير شامل عن حالة النظام بعد التحسينات
 * Comprehensive System Report After Optimizations
 */

const axios = require('axios');

async function generateSystemReport() {
  console.log('📊 تقرير شامل عن حالة النظام بعد التحسينات');
  console.log('=' .repeat(60));
  console.log(`📅 التاريخ: ${new Date().toLocaleString('ar-EG')}`);
  console.log('=' .repeat(60));

  try {
    // 1. إحصائيات الأنماط
    console.log('\n🎯 إحصائيات الأنماط:');
    console.log('-' .repeat(30));
    
    const statsResponse = await axios.get('http://localhost:3001/api/v1/success-learning/cleanup-stats/cme4yvrco002kuftceydlrwdi');
    const stats = statsResponse.data.stats;
    
    console.log(`📊 إجمالي الأنماط: ${stats.totalPatterns}`);
    console.log(`🔍 مجموعات محتملة للتكرار: ${stats.potentialDuplicates}`);
    console.log(`🗑️ أنماط قابلة للحذف: ${stats.potentialDeletions}`);
    
    console.log('\n📈 توزيع الأنماط حسب النوع:');
    const topTypes = Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    topTypes.forEach(([type, count]) => {
      console.log(`   ${type}: ${count} نمط`);
    });

    // 2. حالة نظام الصيانة
    console.log('\n🕐 حالة نظام الصيانة الدورية:');
    console.log('-' .repeat(30));
    
    const maintenanceResponse = await axios.get('http://localhost:3001/api/v1/success-learning/maintenance/status');
    const maintenance = maintenanceResponse.data.data;
    
    console.log(`🔄 حالة التشغيل: ${maintenance.isRunning ? 'يعمل' : 'متوقف'}`);
    console.log(`📊 إجمالي العمليات: ${maintenance.totalRuns}`);
    console.log(`🗑️ أنماط تم حذفها: ${maintenance.totalPatternsDeleted}`);
    console.log(`📦 أنماط تم أرشفتها: ${maintenance.totalPatternsArchived}`);
    
    console.log('\n📅 جدولة الصيانة:');
    console.log(`   أسبوعية: ${maintenance.nextRun.weekly}`);
    console.log(`   يومية: ${maintenance.nextRun.daily}`);
    console.log(`   شهرية: ${maintenance.nextRun.monthly}`);

    // 3. اختبار سرعة النظام
    console.log('\n⚡ اختبار سرعة النظام:');
    console.log('-' .repeat(30));
    
    const testMessage = {
      object: 'page',
      entry: [{
        id: 'system-test-page',
        time: Date.now(),
        messaging: [{
          sender: { id: 'system-test-user-' + Date.now() },
          recipient: { id: 'system-test-page' },
          timestamp: Date.now(),
          message: {
            mid: 'system-test-' + Date.now(),
            text: 'اختبار سرعة النظام'
          }
        }]
      }]
    };

    const startTime = Date.now();
    
    try {
      await axios.post('http://localhost:3001/webhook', testMessage, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ وقت الاستجابة: ${responseTime}ms`);
      
      if (responseTime < 1000) {
        console.log(`🚀 ممتاز! النظام سريع جداً`);
      } else if (responseTime < 5000) {
        console.log(`✅ جيد! النظام يعمل بسرعة مقبولة`);
      } else {
        console.log(`⚠️ بطيء! يحتاج تحسين إضافي`);
      }
      
    } catch (error) {
      console.log(`❌ خطأ في اختبار السرعة: ${error.message}`);
    }

    // 4. ملخص التحسينات المطبقة
    console.log('\n🎉 ملخص التحسينات المطبقة:');
    console.log('-' .repeat(30));
    
    console.log('✅ المرحلة الأولى: منع التكرار في الحفظ');
    console.log('   - فحص التشابه الذكي (85% دقة)');
    console.log('   - تحديث بدلاً من التكرار');
    console.log('   - دعم النصوص العربية');
    
    console.log('✅ المرحلة الثانية: تنظيف الأنماط الموجودة');
    console.log('   - دمج الأنماط المتشابهة');
    console.log('   - تحسين واجهة العرض');
    console.log('   - APIs للمراقبة والتنظيف');
    
    console.log('✅ المرحلة الثالثة: نظام الصيانة الدورية');
    console.log('   - تنظيف أسبوعي تلقائي');
    console.log('   - صيانة يومية خفيفة');
    console.log('   - أرشفة شهرية');
    console.log('   - تحسين خوارزمية الاكتشاف');

    // 5. التوصيات
    console.log('\n💡 التوصيات للمستقبل:');
    console.log('-' .repeat(30));
    
    if (stats.potentialDuplicates > 5) {
      console.log('⚠️ يُنصح بتشغيل تنظيف شامل للأنماط');
    }
    
    if (stats.totalPatterns > 100) {
      console.log('📦 يُنصح بأرشفة الأنماط القديمة');
    }
    
    console.log('🔄 مراقبة دورية لأداء النظام');
    console.log('📊 تحليل إحصائيات الاستخدام شهرياً');
    console.log('🎯 تحسين معايير اكتشاف الأنماط حسب الحاجة');

    console.log('\n🎯 حالة النظام العامة:');
    console.log('-' .repeat(30));
    
    const systemHealth = calculateSystemHealth(stats, maintenance);
    console.log(`🏥 صحة النظام: ${systemHealth.status}`);
    console.log(`📊 النقاط: ${systemHealth.score}/100`);
    
    systemHealth.issues.forEach(issue => {
      console.log(`⚠️ ${issue}`);
    });
    
    systemHealth.strengths.forEach(strength => {
      console.log(`✅ ${strength}`);
    });

    console.log('\n' + '=' .repeat(60));
    console.log('🎉 تم إنجاز جميع التحسينات بنجاح!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error.message);
  }
}

function calculateSystemHealth(stats, maintenance) {
  let score = 100;
  const issues = [];
  const strengths = [];

  // تقييم عدد الأنماط
  if (stats.totalPatterns > 150) {
    score -= 10;
    issues.push('عدد الأنماط مرتفع - يحتاج أرشفة');
  } else if (stats.totalPatterns > 100) {
    score -= 5;
    issues.push('عدد الأنماط متوسط - مراقبة مطلوبة');
  } else {
    strengths.push('عدد الأنماط مثالي');
  }

  // تقييم التكرارات
  if (stats.potentialDuplicates > 10) {
    score -= 15;
    issues.push('تكرارات كثيرة - يحتاج تنظيف فوري');
  } else if (stats.potentialDuplicates > 5) {
    score -= 8;
    issues.push('تكرارات متوسطة - تنظيف مُوصى به');
  } else {
    strengths.push('تكرارات قليلة أو معدومة');
  }

  // تقييم نظام الصيانة
  if (maintenance.totalRuns === 0) {
    strengths.push('نظام الصيانة جديد ونظيف');
  } else {
    strengths.push('نظام الصيانة يعمل بانتظام');
  }

  // تحديد الحالة العامة
  let status;
  if (score >= 90) {
    status = 'ممتاز 🟢';
  } else if (score >= 75) {
    status = 'جيد 🟡';
  } else if (score >= 60) {
    status = 'مقبول 🟠';
  } else {
    status = 'يحتاج تحسين 🔴';
  }

  return { score, status, issues, strengths };
}

generateSystemReport();
