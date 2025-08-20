const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findFrontendUser() {
  console.log('🔍 البحث عن المستخدم المسجل في Frontend...\n');

  const frontendCompanyId = 'cme94iuhd001wuficyc0we6l9';

  try {
    // 1. البحث عن الشركة
    console.log('1️⃣ البحث عن الشركة:');
    console.log('═══════════════════════════════════════');

    const company = await prisma.company.findUnique({
      where: { id: frontendCompanyId }
    });

    if (company) {
      console.log('✅ وجدت الشركة:');
      console.log('- الاسم:', company.name);
      console.log('- البريد:', company.email);
      console.log('- ID:', company.id);
    } else {
      console.log('❌ لم يتم العثور على الشركة');
    }

    // 2. البحث عن المستخدمين في هذه الشركة
    console.log('\n2️⃣ البحث عن المستخدمين:');
    console.log('═══════════════════════════════════════');

    const users = await prisma.user.findMany({
      where: { companyId: frontendCompanyId }
    });

    if (users.length > 0) {
      console.log(`✅ وجدت ${users.length} مستخدم في هذه الشركة:`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   📧 البريد: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   🏢 Company ID: ${user.companyId}`);
        console.log('   ─'.repeat(40));
      });
    } else {
      console.log('❌ لا يوجد مستخدمين في هذه الشركة');
    }

    // 3. البحث عن مفاتيح Gemini لهذه الشركة
    console.log('\n3️⃣ البحث عن مفاتيح Gemini:');
    console.log('═══════════════════════════════════════');

    const keys = await prisma.$queryRaw`
      SELECT * FROM gemini_keys WHERE companyId = ${frontendCompanyId}
    `;

    if (keys.length > 0) {
      console.log(`✅ وجدت ${keys.length} مفتاح لهذه الشركة:`);
      keys.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name}`);
        console.log(`   🆔 ID: ${key.id}`);
        console.log(`   ✅ نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log('   ─'.repeat(40));
      });
    } else {
      console.log('❌ لا توجد مفاتيح لهذه الشركة');
    }

    // 4. إنشاء مستخدم تجريبي لهذه الشركة
    console.log('\n4️⃣ إنشاء مستخدم تجريبي:');
    console.log('═══════════════════════════════════════');

    if (company && users.length === 0) {
      console.log('🔧 إنشاء مستخدم تجريبي للشركة...');

      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'test@frontend.com',
          password: hashedPassword,
          firstName: 'مستخدم',
          lastName: 'Frontend',
          companyId: frontendCompanyId,
          role: 'ADMIN'
        }
      });

      console.log('✅ تم إنشاء المستخدم:');
      console.log('- البريد:', newUser.email);
      console.log('- كلمة المرور: password123');
      console.log('- Company ID:', newUser.companyId);
    } else if (users.length > 0) {
      console.log('✅ يوجد مستخدمين بالفعل في هذه الشركة');
    }

    // 5. نقل مفتاح موجود لهذه الشركة للاختبار
    console.log('\n5️⃣ نقل مفتاح للشركة للاختبار:');
    console.log('═══════════════════════════════════════');

    if (company && keys.length === 0) {
      // البحث عن مفتاح من شركة أخرى
      const existingKey = await prisma.$queryRaw`
        SELECT * FROM gemini_keys LIMIT 1
      `;

      if (existingKey.length > 0) {
        const key = existingKey[0];
        console.log('🔄 نقل مفتاح موجود للشركة...');

        await prisma.$executeRaw`
          UPDATE gemini_keys 
          SET companyId = ${frontendCompanyId}
          WHERE id = ${key.id}
        `;

        console.log('✅ تم نقل المفتاح للشركة');
        console.log('- اسم المفتاح:', key.name);
        console.log('- Company ID الجديد:', frontendCompanyId);
      } else {
        console.log('❌ لا توجد مفاتيح لنقلها');
      }
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findFrontendUser();
