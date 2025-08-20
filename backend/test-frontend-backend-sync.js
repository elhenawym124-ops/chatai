const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFrontendBackendSync() {
  console.log('🔄 اختبار التزامن بين الواجهة الأمامية والخلفية...\n');
  
  try {
    // 1. فحص الحالة الحالية
    console.log('📊 1. الحالة الحالية في قاعدة البيانات:');
    console.log('================================');
    
    const currentSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    
    if (currentSettings) {
      console.log('✅ إعدادات AI موجودة:');
      console.log(`   - ID: ${currentSettings.id}`);
      console.log(`   - مُفعل: ${currentSettings.autoReplyEnabled}`);
      console.log(`   - ساعات العمل: ${currentSettings.workingHours}`);
      console.log(`   - الحد الأقصى للردود: ${currentSettings.maxRepliesPerCustomer}`);
      console.log(`   - آخر تحديث: ${currentSettings.updatedAt}`);
    } else {
      console.log('❌ لا توجد إعدادات AI');
    }
    
    // 2. محاكاة تغيير من الواجهة الأمامية
    console.log('\n🔄 2. محاكاة تغيير الإعدادات:');
    console.log('================================');
    
    // تعطيل AI
    console.log('🔴 تعطيل AI...');
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        autoReplyEnabled: false,
        updatedAt: new Date()
      }
    });
    
    const disabledSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    console.log(`✅ تم التعطيل: ${!disabledSettings.autoReplyEnabled ? 'نجح' : 'فشل'}`);
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // إعادة تفعيل AI
    console.log('🟢 إعادة تفعيل AI...');
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        autoReplyEnabled: true,
        workingHours: '{"start":"09:00","end":"18:00"}',
        maxRepliesPerCustomer: 5,
        updatedAt: new Date()
      }
    });
    
    const enabledSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    console.log(`✅ تم التفعيل: ${enabledSettings.autoReplyEnabled ? 'نجح' : 'فشل'}`);
    
    // 3. اختبار تغيير ساعات العمل
    console.log('\n⏰ 3. اختبار تغيير ساعات العمل:');
    console.log('================================');
    
    const newWorkingHours = '{"start":"10:00","end":"17:00"}';
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        workingHours: newWorkingHours,
        updatedAt: new Date()
      }
    });
    
    const updatedHours = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    console.log(`✅ ساعات العمل الجديدة: ${updatedHours.workingHours}`);
    
    // إعادة ساعات العمل الأصلية
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        workingHours: '{"start":"09:00","end":"18:00"}',
        updatedAt: new Date()
      }
    });
    
    // 4. اختبار تغيير الحد الأقصى للردود
    console.log('\n🔢 4. اختبار تغيير الحد الأقصى للردود:');
    console.log('================================');
    
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        maxRepliesPerCustomer: 10,
        updatedAt: new Date()
      }
    });
    
    const updatedReplies = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    console.log(`✅ الحد الأقصى الجديد: ${updatedReplies.maxRepliesPerCustomer}`);
    
    // إعادة القيمة الأصلية
    await prisma.aiSettings.update({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' },
      data: {
        maxRepliesPerCustomer: 5,
        updatedAt: new Date()
      }
    });
    
    // 5. الحالة النهائية
    console.log('\n📋 5. الحالة النهائية:');
    console.log('================================');
    
    const finalSettings = await prisma.aiSettings.findFirst({
      where: { companyId: 'cmd5c0c9y0000ymzdd7wtv7ib' }
    });
    
    console.log('✅ الإعدادات النهائية:');
    console.log(`   - مُفعل: ${finalSettings.autoReplyEnabled}`);
    console.log(`   - ساعات العمل: ${finalSettings.workingHours}`);
    console.log(`   - الحد الأقصى للردود: ${finalSettings.maxRepliesPerCustomer}`);
    console.log(`   - آخر تحديث: ${finalSettings.updatedAt}`);
    
    // 6. فحص تكامل البيانات
    console.log('\n🔍 6. فحص تكامل البيانات:');
    console.log('================================');
    
    // فحص أن جميع الحقول المطلوبة موجودة
    const requiredFields = ['autoReplyEnabled', 'workingHours', 'maxRepliesPerCustomer'];
    const missingFields = requiredFields.filter(field => finalSettings[field] === null || finalSettings[field] === undefined);
    
    if (missingFields.length === 0) {
      console.log('✅ جميع الحقول المطلوبة موجودة');
    } else {
      console.log(`❌ حقول مفقودة: ${missingFields.join(', ')}`);
    }
    
    // فحص صحة JSON
    try {
      JSON.parse(finalSettings.workingHours);
      console.log('✅ ساعات العمل بصيغة JSON صحيحة');
    } catch (error) {
      console.log('❌ ساعات العمل بصيغة JSON غير صحيحة');
    }
    
    console.log('\n🎉 انتهى الفحص الشامل!');

  } catch (error) {
    console.error('❌ خطأ في الفحص:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendBackendSync();
