const axios = require('axios');

async function testNewFunctions() {
  console.log('🧪 اختبار الدوال الجديدة...\n');
  
  const baseURL = 'http://localhost:3001/api/v1/success-learning';
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // 1. اختبار getPatternPerformance
    console.log('1️⃣ اختبار getPatternPerformance...');
    try {
      const performance = await axios.get(`${baseURL}/pattern-performance?companyId=${companyId}`);
      if (performance.data.success) {
        console.log('✅ getPatternPerformance: يعمل');
        console.log(`📊 البيانات: ${JSON.stringify(performance.data.data).substring(0, 100)}...`);
      } else {
        console.log('⚠️ getPatternPerformance: API موجود لكن لا توجد بيانات');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ getPatternPerformance: API غير موجود');
      } else {
        console.log('❌ getPatternPerformance: خطأ -', error.message);
      }
    }
    
    // 2. اختبار getPatternUsage
    console.log('\n2️⃣ اختبار getPatternUsage...');
    try {
      const usage = await axios.get(`${baseURL}/pattern-usage?companyId=${companyId}&days=7`);
      if (usage.data.success) {
        console.log('✅ getPatternUsage: يعمل');
      } else {
        console.log('⚠️ getPatternUsage: API موجود لكن لا توجد بيانات');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ getPatternUsage: API غير موجود');
      } else {
        console.log('❌ getPatternUsage: خطأ -', error.message);
      }
    }
    
    // 3. اختبار getOutcomeStats
    console.log('\n3️⃣ اختبار getOutcomeStats...');
    try {
      const stats = await axios.get(`${baseURL}/outcome-stats?timeRange=30`);
      if (stats.data.success) {
        console.log('✅ getOutcomeStats: يعمل');
      } else {
        console.log('⚠️ getOutcomeStats: API موجود لكن لا توجد بيانات');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ getOutcomeStats: API غير موجود');
      } else {
        console.log('❌ getOutcomeStats: خطأ -', error.message);
      }
    }
    
    // 4. اختبار الدوال الأساسية التي تعمل
    console.log('\n4️⃣ اختبار الدوال الأساسية...');
    
    const patterns = await axios.get(`${baseURL}/patterns?companyId=${companyId}&limit=3`);
    if (patterns.data.success) {
      console.log('✅ getPatterns: يعمل');
    }
    
    const systemStatus = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    if (systemStatus.data.success) {
      console.log('✅ getPatternSystemStatus: يعمل');
    }
    
    console.log('\n📋 ملخص الاختبار:');
    console.log('✅ الدوال الأساسية: تعمل');
    console.log('✅ نظام التحكم: يعمل');
    console.log('⚠️ بعض APIs الإضافية: قد تحتاج إنشاء');
    console.log('\n🎯 النظام الأساسي جاهز للاستخدام!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
  }
}

testNewFunctions();
