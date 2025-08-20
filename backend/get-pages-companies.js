const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getPagesAndCompanies() {
  try {
    console.log('🔍 جاري البحث عن الصفحات والشركات...\n');

    // جلب جميع الصفحات مع معلومات الشركات
    const pagesWithCompanies = await prisma.facebookPage.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (pagesWithCompanies.length === 0) {
      console.log('❌ لا توجد صفحات مربوطة بأي شركة');
      return;
    }

    console.log(`✅ تم العثور على ${pagesWithCompanies.length} صفحة:\n`);
    console.log('═'.repeat(80));

    pagesWithCompanies.forEach((page, index) => {
      console.log(`\n${index + 1}. 📄 اسم الصفحة: ${page.pageName}`);
      console.log(`   🆔 Page ID: ${page.pageId}`);
      console.log(`   📊 الحالة: ${page.status}`);
      console.log(`   📅 تاريخ الربط: ${page.connectedAt.toLocaleDateString('ar-EG')}`);
      
      if (page.company) {
        console.log(`   🏢 الشركة المربوطة: ${page.company.name}`);
        console.log(`   📧 إيميل الشركة: ${page.company.email}`);
        console.log(`   ✅ الشركة نشطة: ${page.company.isActive ? 'نعم' : 'لا'}`);
        console.log(`   🆔 Company ID: ${page.company.id}`);
      } else {
        console.log(`   ❌ غير مربوطة بأي شركة`);
      }
      
      console.log('─'.repeat(60));
    });

    // إحصائيات إضافية
    console.log('\n📊 إحصائيات:');
    console.log('═'.repeat(40));
    
    const connectedPages = pagesWithCompanies.filter(p => p.company);
    const disconnectedPages = pagesWithCompanies.filter(p => !p.company);
    const activePages = pagesWithCompanies.filter(p => p.status === 'connected');
    
    console.log(`📄 إجمالي الصفحات: ${pagesWithCompanies.length}`);
    console.log(`🔗 صفحات مربوطة بشركات: ${connectedPages.length}`);
    console.log(`❌ صفحات غير مربوطة: ${disconnectedPages.length}`);
    console.log(`✅ صفحات نشطة: ${activePages.length}`);

    // جلب الشركات التي لديها صفحات
    const companiesWithPages = await prisma.company.findMany({
      where: {
        facebookPages: {
          some: {}
        }
      },
      include: {
        facebookPages: {
          select: {
            id: true,
            pageName: true,
            pageId: true,
            status: true,
            connectedAt: true
          }
        },
        _count: {
          select: {
            facebookPages: true
          }
        }
      }
    });

    if (companiesWithPages.length > 0) {
      console.log('\n🏢 الشركات التي لديها صفحات:');
      console.log('═'.repeat(50));
      
      companiesWithPages.forEach((company, index) => {
        console.log(`\n${index + 1}. 🏢 ${company.name}`);
        console.log(`   🆔 Company ID: ${company.id}`);
        console.log(`   📄 عدد الصفحات: ${company._count.facebookPages}`);
        console.log(`   📧 الإيميل: ${company.email}`);
        
        if (company.facebookPages.length > 0) {
          console.log(`   📋 الصفحات:`);
          company.facebookPages.forEach((page, pageIndex) => {
            console.log(`      ${pageIndex + 1}. ${page.pageName} (${page.status})`);
          });
        }
      });
    }

  } catch (error) {
    console.error('❌ خطأ في جلب البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
getPagesAndCompanies();
