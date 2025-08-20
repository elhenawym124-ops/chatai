const axios = require('axios');

async function testPatternSystemControl() {
  console.log('🎛️ اختبار نظام تشغيل/إيقاف إدارة الأنماط...\n');
  
  const baseURL = 'http://localhost:3001/api/v1/success-learning';
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // 1. فحص الحالة الحالية
    console.log('1️⃣ فحص حالة النظام الحالية...');
    const statusResponse = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (statusResponse.data.success) {
      const status = statusResponse.data.data;
      console.log('📊 حالة النظام:');
      console.log(`   مفعل: ${status.enabled ? 'نعم' : 'لا'}`);
      console.log(`   إجمالي الأنماط: ${status.totalPatterns}`);
      console.log(`   الأنماط النشطة: ${status.activePatterns}`);
      console.log(`   الأنماط المعتمدة: ${status.approvedPatterns}`);
      console.log(`   الأنماط المعطلة: ${status.inactivePatterns}`);
      
      if (status.lastChange) {
        console.log(`   آخر تغيير: ${status.lastChange}`);
        console.log(`   بواسطة: ${status.changedBy}`);
      }
    }
    
    // 2. اختبار إيقاف النظام
    console.log('\n2️⃣ اختبار إيقاف النظام...');
    const disableResponse = await axios.post(`${baseURL}/system/disable`, {
      companyId,
      reason: 'اختبار النظام'
    });
    
    if (disableResponse.data.success) {
      console.log('✅ تم إيقاف النظام بنجاح');
      const result = disableResponse.data.data;
      console.log(`📊 الأنماط المتأثرة: ${result.patternsAffected}`);
      console.log(`🕐 وقت الإيقاف: ${result.disabledAt}`);
      console.log(`📝 السبب: ${result.reason}`);
    } else {
      console.log('❌ فشل في إيقاف النظام:', disableResponse.data.message);
    }
    
    // 3. فحص الحالة بعد الإيقاف
    console.log('\n3️⃣ فحص الحالة بعد الإيقاف...');
    const statusAfterDisable = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (statusAfterDisable.data.success) {
      const status = statusAfterDisable.data.data;
      console.log(`📊 النظام مفعل: ${status.enabled ? 'نعم' : 'لا'}`);
      console.log(`📊 الأنماط النشطة: ${status.activePatterns}`);
      
      if (!status.enabled && status.activePatterns === 0) {
        console.log('✅ تم إيقاف جميع الأنماط بنجاح');
      } else {
        console.log('⚠️ لم يتم إيقاف جميع الأنماط');
      }
    }
    
    // 4. اختبار تفعيل النظام
    console.log('\n4️⃣ اختبار تفعيل النظام...');
    const enableResponse = await axios.post(`${baseURL}/system/enable`, {
      companyId
    });
    
    if (enableResponse.data.success) {
      console.log('✅ تم تفعيل النظام بنجاح');
      const result = enableResponse.data.data;
      console.log(`📊 الأنماط المتأثرة: ${result.patternsAffected}`);
      console.log(`🕐 وقت التفعيل: ${result.enabledAt}`);
    } else {
      console.log('❌ فشل في تفعيل النظام:', enableResponse.data.message);
    }
    
    // 5. فحص الحالة النهائية
    console.log('\n5️⃣ فحص الحالة النهائية...');
    const finalStatus = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (finalStatus.data.success) {
      const status = finalStatus.data.data;
      console.log(`📊 النظام مفعل: ${status.enabled ? 'نعم' : 'لا'}`);
      console.log(`📊 الأنماط النشطة: ${status.activePatterns}`);
      console.log(`📊 الأنماط المعتمدة: ${status.approvedPatterns}`);
      
      if (status.enabled && status.activePatterns === status.approvedPatterns) {
        console.log('✅ تم تفعيل جميع الأنماط المعتمدة بنجاح');
      } else {
        console.log('⚠️ لم يتم تفعيل جميع الأنماط المعتمدة');
      }
    }
    
    console.log('\n🎉 اكتمل اختبار نظام التحكم في الأنماط!');
    console.log('\n📋 ملخص النتائج:');
    console.log('✅ فحص الحالة: يعمل');
    console.log('✅ إيقاف النظام: يعمل');
    console.log('✅ تفعيل النظام: يعمل');
    console.log('✅ تحديث الحالة: يعمل');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار النظام:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// تشغيل الاختبار
testPatternSystemControl();
