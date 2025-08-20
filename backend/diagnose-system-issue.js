const axios = require('axios');

async function diagnoseSystemIssue() {
  try {
    console.log('🔍 تشخيص مشكلة النظام...\n');
    
    const baseURL = 'http://localhost:3001/api/v1/success-learning';
    const companyId = 'cme4yvrco002kuftceydlrwdi';
    
    // 1. فحص حالة النظام من API
    console.log('1️⃣ فحص حالة النظام من API...');
    const statusResponse = await axios.get(`${baseURL}/system/status?companyId=${companyId}`);
    const status = statusResponse.data.data;
    
    console.log('📊 حالة النظام من API:');
    console.log(`   مفعل: ${status.enabled ? '🟢 نعم' : '🔴 لا'}`);
    console.log(`   أنماط نشطة: ${status.activePatterns}`);
    console.log(`   أنماط معتمدة: ${status.approvedPatterns}`);
    console.log(`   آخر تغيير: ${status.lastChange || 'غير محدد'}`);
    console.log(`   بواسطة: ${status.changedBy || 'غير محدد'}`);
    
    // 2. فحص الأنماط الفعلية النشطة
    console.log('\n2️⃣ فحص الأنماط النشطة فعلياً...');
    const activePatternsResponse = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isActive=true`);
    const activePatterns = activePatternsResponse.data.data.patterns;
    
    console.log(`📊 الأنماط النشطة فعلياً: ${activePatterns.length}`);
    
    if (activePatterns.length > 0) {
      console.log('🔥 الأنماط التي لا تزال نشطة:');
      activePatterns.slice(0, 10).forEach((pattern, i) => {
        console.log(`   ${i + 1}. ${pattern.patternType} - معتمد: ${pattern.isApproved ? '✅' : '❌'} - ID: ${pattern.id.substring(0, 8)}`);
      });
    }
    
    // 3. فحص الأنماط المعتمدة
    console.log('\n3️⃣ فحص الأنماط المعتمدة...');
    const approvedPatternsResponse = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isApproved=true`);
    const approvedPatterns = approvedPatternsResponse.data.data.patterns;
    
    console.log(`📊 الأنماط المعتمدة: ${approvedPatterns.length}`);
    const approvedAndActive = approvedPatterns.filter(p => p.isActive);
    console.log(`📊 الأنماط المعتمدة والنشطة: ${approvedAndActive.length}`);
    
    // 4. التشخيص
    console.log('\n🎯 التشخيص:');
    
    if (!status.enabled && activePatterns.length > 0) {
      console.log('❌ مشكلة مؤكدة: النظام معطل لكن الأنماط لا تزال نشطة!');
      console.log('🔧 السبب المحتمل: فشل في تحديث قاعدة البيانات');
      console.log('💡 الحل: إعادة تشغيل عملية الإيقاف');
      
      // محاولة إصلاح المشكلة
      console.log('\n🔧 محاولة إصلاح المشكلة...');
      const fixResponse = await axios.post(`${baseURL}/system/disable`, {
        companyId,
        reason: 'إصلاح مشكلة التزامن'
      });
      
      if (fixResponse.data.success) {
        console.log('✅ تم إصلاح المشكلة - تم إيقاف جميع الأنماط');
        
        // فحص مرة أخرى
        const finalCheck = await axios.get(`${baseURL}/patterns?companyId=${companyId}&isActive=true`);
        const stillActive = finalCheck.data.data.patterns.length;
        console.log(`📊 الأنماط النشطة بعد الإصلاح: ${stillActive}`);
        
        if (stillActive === 0) {
          console.log('🎉 تم حل المشكلة بنجاح!');
        } else {
          console.log('⚠️ لا تزال هناك مشكلة - يحتاج تدخل يدوي');
        }
      }
      
    } else if (status.enabled && activePatterns.length === 0) {
      console.log('❌ مشكلة: النظام مفعل لكن لا توجد أنماط نشطة!');
      console.log('🔧 الحل: إعادة تفعيل النظام');
      
    } else if (status.enabled && activePatterns.length === status.approvedPatterns) {
      console.log('✅ النظام يعمل بشكل صحيح');
      
    } else {
      console.log('⚠️ حالة غير متوقعة - يحتاج فحص إضافي');
    }
    
  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

diagnoseSystemIssue();
