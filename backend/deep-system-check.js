const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function deepSystemCheck() {
  console.log('🔍 فحص شامل للنظام...\n');
  
  try {
    // 1. فحص قاعدة البيانات
    console.log('📊 1. فحص قاعدة البيانات:');
    console.log('================================');
    
    // فحص الشركات
    const companies = await prisma.company.findMany();
    console.log(`✅ الشركات: ${companies.length}`);
    companies.forEach(company => {
      console.log(`   - ${company.name} (${company.id})`);
    });
    
    // فحص إعدادات AI
    const aiSettings = await prisma.aiSettings.findMany();
    console.log(`✅ إعدادات AI: ${aiSettings.length}`);
    aiSettings.forEach(setting => {
      console.log(`   - الشركة: ${setting.companyId}`);
      console.log(`   - مُفعل: ${setting.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${setting.workingHours || 'غير محدد'}`);
      console.log(`   - الحد الأقصى للردود: ${setting.maxRepliesPerCustomer || 'غير محدد'}`);
    });
    
    // فحص مفاتيح Gemini
    const geminiKeys = await prisma.geminiKey.findMany();
    console.log(`✅ مفاتيح Gemini: ${geminiKeys.length}`);
    geminiKeys.forEach(key => {
      console.log(`   - ${key.name}: ${key.isActive ? 'نشط' : 'غير نشط'} (${key.model})`);
    });
    
    // فحص صفحات Facebook
    const facebookPages = await prisma.facebookPage.findMany();
    console.log(`✅ صفحات Facebook: ${facebookPages.length}`);
    facebookPages.forEach(page => {
      console.log(`   - ${page.pageName}: ${page.status}`);
    });
    
    // 2. فحص APIs
    console.log('\n🌐 2. فحص APIs:');
    console.log('================================');
    
    // فحص API الإعدادات
    try {
      const settingsResponse = await fetch('http://localhost:3001/api/v1/ai/settings');
      const settingsData = await settingsResponse.json();
      console.log('✅ API الإعدادات يعمل:');
      console.log(`   - مُفعل: ${settingsData.data?.isEnabled}`);
      console.log(`   - ساعات العمل: ${JSON.stringify(settingsData.data?.workingHours)}`);
      console.log(`   - الحد الأقصى للردود: ${settingsData.data?.maxRepliesPerCustomer}`);
    } catch (error) {
      console.log('❌ API الإعدادات لا يعمل:', error.message);
    }
    
    // فحص API مفاتيح Gemini
    try {
      const keysResponse = await fetch('http://localhost:3001/api/v1/ai/gemini-keys');
      const keysData = await keysResponse.json();
      console.log(`✅ API مفاتيح Gemini يعمل: ${keysData.data?.length || 0} مفتاح`);
    } catch (error) {
      console.log('❌ API مفاتيح Gemini لا يعمل:', error.message);
    }
    
    // فحص API صفحات Facebook
    try {
      const fbResponse = await fetch('http://localhost:3001/api/v1/integrations/facebook/connected');
      const fbData = await fbResponse.json();
      console.log(`✅ API Facebook يعمل: ${fbData.data?.length || 0} صفحة`);
    } catch (error) {
      console.log('❌ API Facebook لا يعمل:', error.message);
    }
    
    // 3. اختبار تغيير الإعدادات
    console.log('\n🔄 3. اختبار تغيير الإعدادات:');
    console.log('================================');
    
    // تعطيل AI
    try {
      const disableResponse = await fetch('http://localhost:3001/api/v1/ai/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false })
      });
      const disableData = await disableResponse.json();
      console.log('✅ تعطيل AI:', disableData.success ? 'نجح' : 'فشل');
      
      // التحقق من التغيير
      const checkResponse1 = await fetch('http://localhost:3001/api/v1/ai/settings');
      const checkData1 = await checkResponse1.json();
      console.log(`   - الحالة بعد التعطيل: ${checkData1.data?.isEnabled}`);
      
      // إعادة تفعيل AI
      const enableResponse = await fetch('http://localhost:3001/api/v1/ai/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true })
      });
      const enableData = await enableResponse.json();
      console.log('✅ تفعيل AI:', enableData.success ? 'نجح' : 'فشل');
      
      // التحقق من التغيير
      const checkResponse2 = await fetch('http://localhost:3001/api/v1/ai/settings');
      const checkData2 = await checkResponse2.json();
      console.log(`   - الحالة بعد التفعيل: ${checkData2.data?.isEnabled}`);
      
    } catch (error) {
      console.log('❌ خطأ في اختبار التغيير:', error.message);
    }
    
    // 4. فحص قاعدة البيانات مرة أخرى
    console.log('\n🔍 4. التحقق من حفظ التغييرات في قاعدة البيانات:');
    console.log('================================');
    
    const finalSettings = await prisma.aiSettings.findMany();
    finalSettings.forEach(setting => {
      console.log(`✅ الشركة ${setting.companyId}:`);
      console.log(`   - مُفعل: ${setting.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${setting.workingHours}`);
      console.log(`   - الحد الأقصى للردود: ${setting.maxRepliesPerCustomer}`);
      console.log(`   - آخر تحديث: ${setting.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ خطأ في الفحص الشامل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deepSystemCheck();
