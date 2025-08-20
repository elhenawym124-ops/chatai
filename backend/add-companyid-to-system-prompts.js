/**
 * إضافة companyId إلى جدول system_prompts لضمان العزل الأمني
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCompanyIdToSystemPrompts() {
  console.log('🔧 إضافة companyId إلى جدول system_prompts...\n');

  try {
    // 1. إضافة عمود companyId إلى الجدول
    console.log('1️⃣ فحص وإضافة عمود companyId...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE \`system_prompts\`
        ADD COLUMN \`companyId\` VARCHAR(191) NULL
      `;
      console.log('✅ تم إضافة عمود companyId');
    } catch (columnError) {
      if (columnError.message.includes('Duplicate column name')) {
        console.log('✅ عمود companyId موجود مسبقاً');
      } else {
        throw columnError;
      }
    }

    // 2. إضافة index للأداء
    console.log('\n2️⃣ إضافة index للأداء...');
    try {
      await prisma.$executeRaw`
        CREATE INDEX \`system_prompts_companyId_fkey\` 
        ON \`system_prompts\` (\`companyId\`)
      `;
      console.log('✅ تم إضافة index');
    } catch (indexError) {
      console.log('⚠️ Index موجود مسبقاً أو خطأ في الإنشاء:', indexError.message);
    }

    // 3. إضافة foreign key constraint
    console.log('\n3️⃣ إضافة foreign key constraint...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE \`system_prompts\` 
        ADD CONSTRAINT \`system_prompts_companyId_fkey\` 
        FOREIGN KEY (\`companyId\`) REFERENCES \`companies\`(\`id\`) 
        ON DELETE CASCADE ON UPDATE CASCADE
      `;
      console.log('✅ تم إضافة foreign key constraint');
    } catch (fkError) {
      console.log('⚠️ Foreign key constraint موجود مسبقاً أو خطأ:', fkError.message);
    }

    // 4. الحصول على أول شركة لتعيينها للبرومبت الموجودة
    console.log('\n4️⃣ تحديث البرومبت الموجودة...');
    const firstCompany = await prisma.company.findFirst();
    
    if (firstCompany) {
      // تحديث جميع البرومبت الموجودة لتنتمي للشركة الأولى باستخدام SQL مباشرة
      const updateResult = await prisma.$executeRaw`
        UPDATE \`system_prompts\`
        SET \`companyId\` = ${firstCompany.id}
        WHERE \`companyId\` IS NULL
      `;

      console.log(`✅ تم تحديث البرومبت لتنتمي للشركة: ${firstCompany.name}`);
    } else {
      console.log('⚠️ لا توجد شركات في النظام');
    }

    // 5. فحص النتائج
    console.log('\n5️⃣ فحص النتائج...');
    const allPrompts = await prisma.systemPrompt.findMany({
      select: {
        id: true,
        name: true,
        companyId: true,
        isActive: true
      }
    });

    console.log('📊 البرومبت الموجودة:');
    allPrompts.forEach(prompt => {
      console.log(`   - ${prompt.name} (${prompt.isActive ? 'نشط' : 'غير نشط'}) - شركة: ${prompt.companyId || 'غير محدد'}`);
    });

    console.log('\n✅ تم إكمال إضافة العزل الأمني لجدول system_prompts بنجاح!');
    console.log('🔒 الآن جميع البرومبت معزولة حسب الشركة');

  } catch (error) {
    console.error('❌ خطأ في إضافة العزل الأمني:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الدالة
if (require.main === module) {
  addCompanyIdToSystemPrompts()
    .then(() => {
      console.log('\n🎉 تم إكمال العملية بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 فشلت العملية:', error);
      process.exit(1);
    });
}

module.exports = { addCompanyIdToSystemPrompts };
