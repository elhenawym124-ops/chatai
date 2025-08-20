const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPromptContentField() {
  try {
    console.log('🔧 إصلاح حقل content في جدول system_prompts...\n');
    
    // فحص البنية الحالية
    console.log('1️⃣ فحص البنية الحالية:');
    const result = await prisma.$queryRaw`
      DESCRIBE system_prompts
    `;
    
    console.log('البنية الحالية:');
    result.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
    
    // تغيير نوع الحقل
    console.log('\n2️⃣ تغيير نوع حقل content:');
    await prisma.$executeRaw`
      ALTER TABLE system_prompts 
      MODIFY COLUMN content LONGTEXT NOT NULL
    `;
    
    console.log('✅ تم تغيير نوع الحقل بنجاح!');
    
    // فحص البنية الجديدة
    console.log('\n3️⃣ فحص البنية الجديدة:');
    const newResult = await prisma.$queryRaw`
      DESCRIBE system_prompts
    `;
    
    console.log('البنية الجديدة:');
    newResult.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type}`);
    });
    
    // اختبار النص الطويل
    console.log('\n4️⃣ اختبار النص الطويل:');
    const longText = 'أنت مساعد ذكي لخدمة العملاء. '.repeat(100); // نص طويل
    
    const testPrompt = await prisma.systemPrompt.create({
      data: {
        name: 'اختبار النص الطويل الجديد',
        content: longText,
        category: 'test',
        isActive: false
      }
    });
    
    console.log('طول النص الأصلي:', longText.length, 'حرف');
    console.log('طول النص المحفوظ:', testPrompt.content.length, 'حرف');
    
    if (testPrompt.content.length === longText.length) {
      console.log('✅ النص محفوظ بالكامل! المشكلة تم حلها!');
    } else {
      console.log('❌ لا تزال هناك مشكلة في الحفظ');
    }
    
    // حذف البرومبت التجريبي
    await prisma.systemPrompt.delete({
      where: { id: testPrompt.id }
    });
    
    console.log('\n🎉 تم إصلاح المشكلة بنجاح!');
    console.log('💡 يمكنك الآن كتابة برومبت بأي طول تريده');
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح الحقل:', error.message);
    
    if (error.code === 'P2010') {
      console.log('💡 قد تحتاج لصلاحيات أعلى لتعديل بنية الجدول');
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixPromptContentField();
