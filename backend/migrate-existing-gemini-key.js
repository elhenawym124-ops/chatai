const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateExistingGeminiKey() {
  console.log('🔄 نقل المفتاح الموجود للشركة الصحيحة...\n');

  try {
    // 1. فحص المفاتيح الموجودة
    console.log('1️⃣ فحص المفاتيح الموجودة:');
    console.log('═══════════════════════════════════════');

    const existingKeys = await prisma.$queryRaw`
      SELECT * FROM gemini_keys
    `;

    console.log(`📋 عدد المفاتيح الموجودة: ${existingKeys.length}`);

    if (existingKeys.length > 0) {
      console.log('🔑 المفاتيح الموجودة:');
      existingKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name}`);
        console.log(`   🆔 ID: ${key.id}`);
        console.log(`   🏢 Company ID: ${key.companyId || 'غير محدد'}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log('   ─'.repeat(40));
      });
    }

    // 2. الحصول على الشركة الافتراضية
    console.log('\n2️⃣ الحصول على الشركة الافتراضية:');
    console.log('═══════════════════════════════════════');

    const defaultCompany = await prisma.company.findFirst({
      where: { id: 'test-company-id' }
    });

    if (!defaultCompany) {
      console.log('❌ لم يتم العثور على الشركة الافتراضية');
      return;
    }

    console.log('✅ الشركة الافتراضية:', defaultCompany.name);
    console.log('🆔 Company ID:', defaultCompany.id);

    // 3. نقل المفاتيح للشركة الافتراضية
    console.log('\n3️⃣ نقل المفاتيح للشركة الافتراضية:');
    console.log('═══════════════════════════════════════');

    const keysWithoutCompany = existingKeys.filter(key => !key.companyId);
    
    if (keysWithoutCompany.length > 0) {
      console.log(`🔄 نقل ${keysWithoutCompany.length} مفتاح للشركة الافتراضية...`);

      for (const key of keysWithoutCompany) {
        await prisma.$executeRaw`
          UPDATE gemini_keys 
          SET companyId = ${defaultCompany.id}
          WHERE id = ${key.id}
        `;
        console.log(`✅ تم نقل المفتاح: ${key.name}`);
      }
    } else {
      console.log('✅ جميع المفاتيح لها شركات بالفعل');
    }

    // 4. التحقق من النتائج
    console.log('\n4️⃣ التحقق من النتائج:');
    console.log('═══════════════════════════════════════');

    const updatedKeys = await prisma.$queryRaw`
      SELECT gk.*, c.name as companyName 
      FROM gemini_keys gk 
      LEFT JOIN companies c ON gk.companyId = c.id
    `;

    console.log('🔑 المفاتيح بعد التحديث:');
    updatedKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.name}`);
      console.log(`   🏢 الشركة: ${key.companyName || 'غير محدد'}`);
      console.log(`   🆔 Company ID: ${key.companyId || 'غير محدد'}`);
      console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      console.log('   ─'.repeat(40));
    });

    // 5. اختبار الوصول للمفاتيح
    console.log('\n5️⃣ اختبار الوصول للمفاتيح:');
    console.log('═══════════════════════════════════════');

    const keysForDefaultCompany = await prisma.$queryRaw`
      SELECT * FROM gemini_keys WHERE companyId = ${defaultCompany.id}
    `;

    console.log(`📊 مفاتيح الشركة الافتراضية: ${keysForDefaultCompany.length}`);

    if (keysForDefaultCompany.length > 0) {
      console.log('✅ المفاتيح متاحة للشركة الافتراضية');
      keysForDefaultCompany.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name} - نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      });
    } else {
      console.log('⚠️ لا توجد مفاتيح للشركة الافتراضية');
    }

    console.log('\n🎉 تم نقل المفاتيح بنجاح!');
    console.log('✅ الآن يمكن للشركة الافتراضية الوصول للمفاتيح');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingGeminiKey();
