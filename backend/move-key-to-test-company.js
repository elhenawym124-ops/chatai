const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function moveKeyToTestCompany() {
  console.log('🔄 نقل المفتاح للشركة التجريبية...\n');

  try {
    // 1. فحص المفتاح الحالي
    console.log('1️⃣ فحص المفتاح الحالي:');
    console.log('═══════════════════════════════════════');

    const currentKey = await prisma.$queryRaw`
      SELECT * FROM gemini_keys LIMIT 1
    `;

    if (currentKey.length === 0) {
      console.log('❌ لا يوجد مفاتيح');
      return;
    }

    const key = currentKey[0];
    console.log('🔑 المفتاح الحالي:');
    console.log('- الاسم:', key.name);
    console.log('- ID:', key.id);
    console.log('- Company ID الحالي:', key.companyId);

    // 2. نقل المفتاح للشركة التجريبية
    console.log('\n2️⃣ نقل المفتاح للشركة التجريبية:');
    console.log('═══════════════════════════════════════');

    await prisma.$executeRaw`
      UPDATE gemini_keys 
      SET companyId = 'test-company-id'
      WHERE id = ${key.id}
    `;

    console.log('✅ تم نقل المفتاح للشركة التجريبية');

    // 3. التحقق من النتيجة
    console.log('\n3️⃣ التحقق من النتيجة:');
    console.log('═══════════════════════════════════════');

    const updatedKey = await prisma.$queryRaw`
      SELECT gk.*, c.name as companyName 
      FROM gemini_keys gk 
      LEFT JOIN companies c ON gk.companyId = c.id
      WHERE gk.id = ${key.id}
    `;

    if (updatedKey.length > 0) {
      const updated = updatedKey[0];
      console.log('🔑 المفتاح بعد التحديث:');
      console.log('- الاسم:', updated.name);
      console.log('- Company ID:', updated.companyId);
      console.log('- اسم الشركة:', updated.companyName);
      console.log('- نشط:', updated.isActive ? 'نعم' : 'لا');
    }

    // 4. اختبار الوصول
    console.log('\n4️⃣ اختبار الوصول:');
    console.log('═══════════════════════════════════════');

    const testCompanyKeys = await prisma.$queryRaw`
      SELECT * FROM gemini_keys WHERE companyId = 'test-company-id'
    `;

    console.log(`📊 مفاتيح الشركة التجريبية: ${testCompanyKeys.length}`);

    if (testCompanyKeys.length > 0) {
      console.log('✅ المفتاح متاح للشركة التجريبية');
      testCompanyKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name} - نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      });
    } else {
      console.log('❌ لا توجد مفاتيح للشركة التجريبية');
    }

    console.log('\n🎉 تم نقل المفتاح بنجاح!');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

moveKeyToTestCompany();
