/**
 * إصلاح صفحات فيسبوك
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFacebookPages() {
  console.log('📄 إصلاح صفحات فيسبوك...');
  console.log('='.repeat(40));

  try {
    // 1. فحص الصفحات الحالية
    const pages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    console.log(`📊 إجمالي صفحات فيسبوك: ${pages.length}`);

    // 2. تفعيل جميع الصفحات
    for (const page of pages) {
      console.log(`\n📄 صفحة: ${page.pageName} (${page.pageId})`);
      console.log(`   الشركة: ${page.company?.name || 'غير محددة'}`);
      console.log(`   الحالة الحالية: isActive = ${page.isActive}`);

      if (page.isActive !== true) {
        console.log('   🔧 تفعيل الصفحة...');
        
        await prisma.facebookPage.update({
          where: { id: page.id },
          data: { isActive: true }
        });
        
        console.log('   ✅ تم تفعيل الصفحة');
      } else {
        console.log('   ✅ الصفحة نشطة بالفعل');
      }
    }

    // 3. فحص نهائي
    console.log('\n📊 فحص نهائي للصفحات:');
    const updatedPages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    let activePages = 0;
    for (const page of updatedPages) {
      const isActive = page.isActive === true;
      console.log(`   ${page.pageName}: ${isActive ? '✅ نشط' : '❌ غير نشط'}`);
      if (isActive) activePages++;
    }

    console.log(`\n🎯 النتيجة: ${activePages}/${updatedPages.length} صفحة نشطة`);

    if (activePages === updatedPages.length) {
      console.log('🎉 جميع صفحات فيسبوك نشطة الآن!');
    } else {
      console.log('⚠️ بعض الصفحات لا تزال غير نشطة');
    }

  } catch (error) {
    console.error('❌ خطأ في إصلاح صفحات فيسبوك:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح
fixFacebookPages().catch(console.error);
