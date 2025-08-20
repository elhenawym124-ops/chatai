const { PrismaClient } = require('@prisma/client');

console.log('🔍 فحص schema جدول facebookPage...\n');

async function checkFacebookPageSchema() {
  const prisma = new PrismaClient();
  
  try {
    // فحص schema الجدول
    console.log('📋 فحص أعمدة جدول facebookPage:');
    const columns = await prisma.$queryRaw`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'facebook_pages'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log(`✅ تم العثور على ${columns.length} عمود:`);
    columns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.COLUMN_NAME} (${col.DATA_TYPE}) - ${col.IS_NULLABLE === 'YES' ? 'nullable' : 'not null'}`);
    });
    
    // فحص البيانات الحالية
    console.log('\n📊 البيانات الحالية:');
    const pages = await prisma.facebookPage.findMany();
    
    console.log(`📱 عدد الصفحات: ${pages.length}`);
    pages.forEach((page, index) => {
      console.log(`\n${index + 1}. 📄 "${page.pageName}"`);
      console.log(`   🆔 Page ID: ${page.pageId}`);
      console.log(`   🏢 Company ID: ${page.companyId || 'غير محدد'}`);
      console.log(`   🔗 الحالة: ${page.status || 'غير محدد'}`);
      console.log(`   ✅ نشطة: ${page.isActive}`);
    });
    
    // إضافة عمود companyId إذا لم يكن موجود
    const hasCompanyId = columns.some(col => col.COLUMN_NAME === 'companyId');
    
    if (!hasCompanyId) {
      console.log('\n🔧 إضافة عمود companyId...');
      
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD COLUMN companyId VARCHAR(191) NULL
      `;
      
      console.log('✅ تم إضافة عمود companyId');
      
      // إضافة foreign key
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD CONSTRAINT fk_facebook_pages_company 
        FOREIGN KEY (companyId) REFERENCES companies(id) 
        ON DELETE SET NULL ON UPDATE CASCADE
      `;
      
      console.log('✅ تم إضافة foreign key constraint');
    } else {
      console.log('\n✅ عمود companyId موجود بالفعل');
    }
    
    // تحديث صفحة سولا 132
    console.log('\n🔧 تحديث صفحة سولا 132...');
    
    const solaPage = await prisma.facebookPage.findFirst({
      where: { pageId: '250528358137901' }
    });
    
    if (solaPage) {
      console.log(`📱 تم العثور على صفحة سولا 132: ${solaPage.pageName}`);
      
      // العثور على شركة الحلو
      const correctCompany = await prisma.company.findFirst({
        where: { name: 'شركة الحلو' }
      });
      
      if (correctCompany) {
        console.log(`🏢 تم العثور على شركة الحلو: ${correctCompany.id}`);
        
        // تحديث الصفحة
        const updated = await prisma.facebookPage.update({
          where: { id: solaPage.id },
          data: { 
            companyId: correctCompany.id
          }
        });
        
        console.log('✅ تم تحديث صفحة سولا 132 بنجاح');
        console.log(`   🏢 الشركة الجديدة: ${correctCompany.id}`);
        
        // التحقق من التحديث
        const verified = await prisma.facebookPage.findFirst({
          where: { pageId: '250528358137901' },
          include: { company: true }
        });
        
        if (verified && verified.company) {
          console.log('\n✅ التحقق من التحديث:');
          console.log(`   📱 الصفحة: "${verified.pageName}"`);
          console.log(`   🏢 الشركة: ${verified.company.name} (${verified.company.id})`);
        }
        
      } else {
        console.log('❌ لم يتم العثور على شركة الحلو');
      }
    } else {
      console.log('❌ لم يتم العثور على صفحة سولا 132');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFacebookPageSchema();
