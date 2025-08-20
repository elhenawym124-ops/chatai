const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAISettingsPersistence() {
  console.log('🔧 إصلاح مشكلة حفظ إعدادات الذكاء الصناعي...');
  
  try {
    // 1. الحصول على الشركة الأولى
    const firstCompany = await prisma.company.findFirst();
    if (!firstCompany) {
      console.log('❌ لا توجد شركة في قاعدة البيانات');
      return;
    }
    
    console.log(`🏢 الشركة: ${firstCompany.name} (${firstCompany.id})`);
    
    // 2. إنشاء أو تحديث إعدادات الذكاء الصناعي
    const aiSettings = await prisma.aiSettings.upsert({
      where: { companyId: firstCompany.id },
      update: {
        autoReplyEnabled: true,
        workingHours: JSON.stringify({ start: "09:00", end: "18:00" }),
        maxRepliesPerCustomer: 5,
        confidenceThreshold: 0.7,
        updatedAt: new Date()
      },
      create: {
        companyId: firstCompany.id,
        autoReplyEnabled: true,
        workingHours: JSON.stringify({ start: "09:00", end: "18:00" }),
        maxRepliesPerCustomer: 5,
        confidenceThreshold: 0.7
      }
    });
    
    console.log('✅ تم حفظ إعدادات الذكاء الصناعي:');
    console.log(`   - مُفعل: ${aiSettings.autoReplyEnabled}`);
    console.log(`   - ساعات العمل: ${aiSettings.workingHours}`);
    console.log(`   - الحد الأقصى للردود: ${aiSettings.maxRepliesPerCustomer}`);
    
    // 3. اختبار قراءة الإعدادات
    console.log('\n🔍 اختبار قراءة الإعدادات...');
    const savedSettings = await prisma.aiSettings.findFirst({
      where: { companyId: firstCompany.id }
    });
    
    if (savedSettings) {
      console.log('✅ تم قراءة الإعدادات بنجاح:');
      console.log(`   - ID: ${savedSettings.id}`);
      console.log(`   - مُفعل: ${savedSettings.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${savedSettings.workingHours}`);
      console.log(`   - الحد الأقصى للردود: ${savedSettings.maxRepliesPerCustomer}`);
      console.log(`   - آخر تحديث: ${savedSettings.updatedAt}`);
    } else {
      console.log('❌ فشل في قراءة الإعدادات');
    }
    
    // 4. اختبار API
    console.log('\n🌐 اختبار API...');
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch('http://localhost:3001/api/v1/ai/settings');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API يعمل بشكل صحيح:');
        console.log(`   - مُفعل: ${data.data.isEnabled}`);
        console.log(`   - ساعات العمل: ${JSON.stringify(data.data.workingHours)}`);
        console.log(`   - الحد الأقصى للردود: ${data.data.maxRepliesPerCustomer}`);
      } else {
        console.log('❌ API لا يعمل بشكل صحيح:', data);
      }
    } catch (apiError) {
      console.log('❌ خطأ في اختبار API:', apiError.message);
    }

  } catch (error) {
    console.error('❌ خطأ في إصلاح الإعدادات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAISettingsPersistence();
