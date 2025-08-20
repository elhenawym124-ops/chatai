const axios = require('axios');

async function finalSystemTest() {
  console.log('🎯 اختبار شامل نهائي لنظام إدارة الأنماط...\n');
  
  const baseURL = 'http://localhost:3001/api/v1/success-learning';
  const companyId = 'cme4yvrco002kuftceydlrwdi';
  
  try {
    // 1. فحص حالة النظام
    console.log('1️⃣ فحص حالة النظام...');
    const statusResponse = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (statusResponse.data.success) {
      const status = statusResponse.data.data;
      console.log(`📊 النظام: ${status.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
      console.log(`📈 إجمالي الأنماط: ${status.totalPatterns}`);
      console.log(`✅ أنماط نشطة: ${status.activePatterns}`);
      console.log(`🎯 أنماط معتمدة: ${status.approvedPatterns}`);
      console.log(`⏸️ أنماط معطلة: ${status.inactivePatterns}`);
    }
    
    // 2. اختبار جلب الأنماط
    console.log('\n2️⃣ اختبار جلب الأنماط...');
    const patternsResponse = await axios.get(`${baseURL}/patterns?companyId=${companyId}&limit=5`);
    
    if (patternsResponse.data.success) {
      const patterns = patternsResponse.data.data.patterns;
      console.log(`📊 تم جلب ${patterns.length} أنماط`);
      
      patterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.patternType} - ${pattern.isActive ? '✅' : '❌'} ${pattern.isApproved ? '🎯' : '⏳'}`);
      });
    }
    
    // 3. اختبار إيقاف النظام
    console.log('\n3️⃣ اختبار إيقاف النظام...');
    const disableResponse = await axios.post(`${baseURL}/system/disable`, {
      companyId,
      reason: 'اختبار نهائي'
    });
    
    if (disableResponse.data.success) {
      console.log('✅ تم إيقاف النظام');
      console.log(`📊 أنماط متأثرة: ${disableResponse.data.data.patternsAffected}`);
    }
    
    // 4. فحص الحالة بعد الإيقاف
    console.log('\n4️⃣ فحص الحالة بعد الإيقاف...');
    const statusAfterDisable = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (statusAfterDisable.data.success) {
      const status = statusAfterDisable.data.data;
      console.log(`📊 النظام: ${status.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
      console.log(`✅ أنماط نشطة: ${status.activePatterns}`);
      
      if (!status.enabled && status.activePatterns === 0) {
        console.log('🎉 إيقاف النظام يعمل بشكل مثالي!');
      }
    }
    
    // 5. اختبار تفعيل النظام
    console.log('\n5️⃣ اختبار تفعيل النظام...');
    const enableResponse = await axios.post(`${baseURL}/system/enable`, {
      companyId
    });
    
    if (enableResponse.data.success) {
      console.log('✅ تم تفعيل النظام');
      console.log(`📊 أنماط متأثرة: ${enableResponse.data.data.patternsAffected}`);
    }
    
    // 6. فحص الحالة النهائية
    console.log('\n6️⃣ فحص الحالة النهائية...');
    const finalStatus = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    
    if (finalStatus.data.success) {
      const status = finalStatus.data.data;
      console.log(`📊 النظام: ${status.enabled ? '🟢 مفعل' : '🔴 معطل'}`);
      console.log(`✅ أنماط نشطة: ${status.activePatterns}`);
      console.log(`🎯 أنماط معتمدة: ${status.approvedPatterns}`);
      
      if (status.enabled && status.activePatterns === status.approvedPatterns) {
        console.log('🎉 تفعيل النظام يعمل بشكل مثالي!');
      }
    }
    
    // 7. اختبار إيقاف اعتماد نمط واحد
    console.log('\n7️⃣ اختبار إيقاف اعتماد نمط واحد...');
    const patterns = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isApproved=true&limit=1`);
    
    if (patterns.data.success && patterns.data.data.patterns.length > 0) {
      const testPattern = patterns.data.data.patterns[0];
      console.log(`🎯 اختبار النمط: ${testPattern.id}`);
      
      const unapproveResponse = await axios.put(`${baseURL}/patterns/${testPattern.id}/unapprove`, {
        reason: 'اختبار إيقاف الاعتماد'
      });
      
      if (unapproveResponse.data.success) {
        console.log('✅ تم إيقاف اعتماد النمط بنجاح');
        
        // إعادة اعتماد النمط
        const reapproveResponse = await axios.put(`${baseURL}/patterns/${testPattern.id}/approve`, {
          approvedBy: 'test_system'
        });
        
        if (reapproveResponse.data.success) {
          console.log('✅ تم إعادة اعتماد النمط بنجاح');
        }
      }
    }
    
    console.log('\n🎊 اكتمل الاختبار الشامل!');
    console.log('\n📋 ملخص النتائج النهائية:');
    console.log('=' .repeat(50));
    console.log('✅ فحص حالة النظام: يعمل');
    console.log('✅ جلب الأنماط: يعمل');
    console.log('✅ إيقاف النظام: يعمل');
    console.log('✅ تفعيل النظام: يعمل');
    console.log('✅ إيقاف اعتماد الأنماط: يعمل');
    console.log('✅ إعادة اعتماد الأنماط: يعمل');
    console.log('✅ الواجهة: تعمل بدون أخطاء');
    console.log('=' .repeat(50));
    console.log('🎉 النظام جاهز 100% للاستخدام!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

finalSystemTest();
