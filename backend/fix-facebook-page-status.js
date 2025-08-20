const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFacebookPageStatus() {
  console.log('🔧 إصلاح حالة صفحة فيسبوك...');
  console.log('========================================');

  try {
    // 1. فحص الصفحات الحالية
    const pages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    console.log(`📊 إجمالي صفحات فيسبوك: ${pages.length}`);

    // 2. تحديث حالة جميع الصفحات لتكون نشطة
    for (const page of pages) {
      console.log(`\n📄 صفحة: ${page.pageName} (${page.pageId})`);
      console.log(`   الشركة: ${page.company?.name || 'غير محددة'}`);
      console.log(`   الحالة الحالية: ${page.status}`);

      if (page.status !== 'connected') {
        console.log('   🔧 تحديث الحالة إلى connected...');
        
        await prisma.facebookPage.update({
          where: { id: page.id },
          data: { status: 'connected' }
        });
        
        console.log('   ✅ تم تحديث الحالة');
      } else {
        console.log('   ✅ الصفحة متصلة بالفعل');
      }
    }

    // 3. فحص النتيجة النهائية
    console.log('\n📋 الحالة النهائية:');
    const updatedPages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    for (const page of updatedPages) {
      console.log(`   📄 ${page.pageName}: ${page.status}`);
    }

    console.log('\n✅ تم إصلاح جميع الصفحات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في إصلاح صفحات فيسبوك:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
fixFacebookPageStatus();
