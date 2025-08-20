const axios = require('axios');

async function testImprovedDisable() {
  try {
    console.log('🛑 اختبار الإيقاف المحسن...\n');
    
    const baseURL = 'http://localhost:3001/api/v1/success-learning';
    const companyId = 'cme4yvrco002kuftceydlrwdi';
    
    // 1. فحص الحالة قبل الإيقاف
    console.log('1️⃣ الحالة قبل الإيقاف:');
    const beforeStatus = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    console.log(`   النظام: ${beforeStatus.data.data.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
    console.log(`   أنماط نشطة: ${beforeStatus.data.data.activePatterns}`);
    
    // 2. إيقاف النظام
    console.log('\n2️⃣ إيقاف النظام...');
    const disableResponse = await axios.post(`${baseURL}/system/disable`, {
      companyId,
      reason: 'اختبار الإيقاف المحسن'
    });
    
    console.log(`✅ استجابة الإيقاف: ${disableResponse.data.message}`);
    console.log(`📊 أنماط متأثرة: ${disableResponse.data.data.patternsAffected}`);
    
    // 3. انتظار تحديث قاعدة البيانات
    console.log('\n3️⃣ انتظار تحديث قاعدة البيانات...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. فحص الحالة بعد الإيقاف
    console.log('\n4️⃣ الحالة بعد الإيقاف:');
    const afterStatus = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    console.log(`   النظام: ${afterStatus.data.data.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
    console.log(`   أنماط نشطة: ${afterStatus.data.data.activePatterns}`);
    
    // 5. فحص الأنماط الفعلية
    console.log('\n5️⃣ فحص الأنماط الفعلية...');
    const actualPatterns = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isActive=true`);
    const stillActive = actualPatterns.data.data.patterns.length;
    console.log(`   أنماط نشطة فعلياً: ${stillActive}`);
    
    if (stillActive > 0) {
      console.log('🔥 الأنماط التي لا تزال نشطة:');
      actualPatterns.data.data.patterns.slice(0, 5).forEach((pattern, i) => {
        console.log(`   ${i + 1}. ${pattern.patternType} - ID: ${pattern.id.substring(0, 8)}`);
      });
    }
    
    // 6. النتيجة والحل
    console.log('\n🎯 النتيجة:');
    if (!afterStatus.data.data.enabled && stillActive === 0) {
      console.log('🎉 الإيقاف يعمل بشكل مثالي!');
    } else if (!afterStatus.data.data.enabled && stillActive > 0) {
      console.log(`❌ مشكلة مؤكدة: النظام معطل لكن ${stillActive} نمط لا يزال نشط!`);
      console.log('🔧 تطبيق الحل...');
      
      // حل المشكلة - إيقاف قسري
      const forceDisableResponse = await axios.post(`${baseURL}/system/disable`, {
        companyId,
        reason: 'إيقاف قسري لحل مشكلة التزامن'
      });
      
      console.log(`✅ نتيجة الإيقاف القسري: ${forceDisableResponse.data.data.patternsAffected} نمط تم إيقافه`);
      
      // فحص نهائي
      await new Promise(resolve => setTimeout(resolve, 1000));
      const finalCheck = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isActive=true`);
      const finalActive = finalCheck.data.data.patterns.length;
      
      console.log(`📊 الأنماط النشطة بعد الإصلاح: ${finalActive}`);
      
      if (finalActive === 0) {
        console.log('🎉 تم حل المشكلة بنجاح!');
      } else {
        console.log('⚠️ لا تزال هناك مشكلة - يحتاج تدخل يدوي في قاعدة البيانات');
      }
    } else {
      console.log('⚠️ حالة غير متوقعة');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testImprovedDisable();
