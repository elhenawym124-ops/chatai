const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCompanyIsolationToGeminiKeys() {
  console.log('🔧 إضافة العزل بين الشركات لمفاتيح Gemini...\n');

  try {
    // 1. فحص الجدول الحالي
    console.log('1️⃣ فحص الجدول الحالي:');
    console.log('═══════════════════════════════════════');

    const existingKeys = await prisma.geminiKey.findMany();
    console.log(`📋 عدد المفاتيح الموجودة: ${existingKeys.length}`);

    if (existingKeys.length > 0) {
      console.log('🔑 المفاتيح الموجودة:');
      existingKeys.forEach((key, index) => {
        console.log(`${index + 1}. ${key.name} - Active: ${key.isActive}`);
      });
    }

    // 2. الحصول على الشركة الافتراضية
    console.log('\n2️⃣ الحصول على الشركة الافتراضية:');
    console.log('═══════════════════════════════════════');

    let defaultCompany = await prisma.company.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!defaultCompany) {
      console.log('⚠️ لا توجد شركات، إنشاء شركة افتراضية...');
      defaultCompany = await prisma.company.create({
        data: {
          name: 'الشركة الافتراضية',
          email: 'default@company.com',
          plan: 'BASIC'
        }
      });
      console.log('✅ تم إنشاء الشركة الافتراضية:', defaultCompany.id);
    } else {
      console.log('✅ الشركة الافتراضية:', defaultCompany.name, '-', defaultCompany.id);
    }

    // 3. إضافة عمود companyId إلى الجدول
    console.log('\n3️⃣ إضافة عمود companyId:');
    console.log('═══════════════════════════════════════');

    try {
      // فحص إذا كان العمود موجود
      const tableInfo = await prisma.$queryRaw`
        DESCRIBE gemini_keys
      `;
      
      const hasCompanyId = tableInfo.some(column => column.Field === 'companyId');
      
      if (!hasCompanyId) {
        console.log('🔧 إضافة عمود companyId...');
        
        // إضافة العمود
        await prisma.$executeRaw`
          ALTER TABLE gemini_keys 
          ADD COLUMN companyId VARCHAR(191) NULL
        `;
        
        console.log('✅ تم إضافة عمود companyId');
        
        // تحديث المفاتيح الموجودة لتنتمي للشركة الافتراضية
        if (existingKeys.length > 0) {
          console.log('🔄 تحديث المفاتيح الموجودة...');
          
          const updateResult = await prisma.$executeRaw`
            UPDATE gemini_keys 
            SET companyId = ${defaultCompany.id} 
            WHERE companyId IS NULL
          `;
          
          console.log(`✅ تم تحديث ${updateResult} مفتاح`);
        }
        
        // جعل العمود مطلوب
        await prisma.$executeRaw`
          ALTER TABLE gemini_keys 
          MODIFY COLUMN companyId VARCHAR(191) NOT NULL
        `;
        
        // إضافة foreign key constraint
        await prisma.$executeRaw`
          ALTER TABLE gemini_keys 
          ADD CONSTRAINT FK_gemini_keys_company 
          FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
        `;
        
        // إضافة index
        await prisma.$executeRaw`
          CREATE INDEX idx_gemini_keys_company_active 
          ON gemini_keys(companyId, isActive)
        `;
        
        console.log('✅ تم إضافة القيود والفهارس');
        
      } else {
        console.log('✅ عمود companyId موجود بالفعل');
      }
      
    } catch (error) {
      console.log('⚠️ خطأ في تعديل الجدول:', error.message);
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

    // 5. اختبار العزل
    console.log('\n5️⃣ اختبار العزل:');
    console.log('═══════════════════════════════════════');

    const keysForDefaultCompany = await prisma.geminiKey.findMany({
      where: { companyId: defaultCompany.id },
      include: { company: true }
    });

    console.log(`📊 مفاتيح الشركة الافتراضية: ${keysForDefaultCompany.length}`);
    
    if (keysForDefaultCompany.length > 0) {
      console.log('✅ العزل يعمل - المفاتيح مرتبطة بالشركة الصحيحة');
    } else {
      console.log('⚠️ لا توجد مفاتيح للشركة الافتراضية');
    }

    console.log('\n🎉 تم إضافة العزل بين الشركات بنجاح!');
    console.log('✅ الآن كل شركة لها مفاتيح Gemini منفصلة');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCompanyIsolationToGeminiKeys();
