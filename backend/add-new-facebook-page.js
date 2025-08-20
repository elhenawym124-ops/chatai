const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addNewFacebookPage() {
  console.log('🔧 إضافة صفحة فيسبوك جديدة...');
  console.log('========================================');

  try {
    // معرف الصفحة التي ترسل منها الرسائل
    const pageId = '114497159957743';
    const pageName = 'صفحة المراسلة الرئيسية';
    // الحصول على معرف شركة الحلو ديناميكياً
  const company = await prisma.company.findFirst({
    where: { name: { contains: 'الحلو' } }
  });
  
  if (!company) {
    console.error('❌ لم يتم العثور على شركة الحلو');
    process.exit(1);
  }
  
  const companyId = company.id;
  console.log(`🏢 تم العثور على شركة الحلو: ${company.name} (${companyId})`);
    
    console.log(`📄 إضافة صفحة: ${pageName}`);
    console.log(`   Page ID: ${pageId}`);
    console.log(`   Company ID: ${companyId}`);

    // فحص إذا كانت الصفحة موجودة بالفعل
    const existingPage = await prisma.facebookPage.findUnique({
      where: { pageId: pageId }
    });

    if (existingPage) {
      console.log('⚠️ الصفحة موجودة بالفعل، سيتم تحديثها...');
      
      const updatedPage = await prisma.facebookPage.update({
        where: { pageId: pageId },
        data: {
          pageName: pageName,
          companyId: companyId,
          status: 'connected',
          connectedAt: new Date()
        }
      });
      
      console.log('✅ تم تحديث الصفحة بنجاح');
      console.log(`   ID: ${updatedPage.id}`);
    } else {
      console.log('➕ إنشاء صفحة جديدة...');
      
      const newPage = await prisma.facebookPage.create({
        data: {
          pageId: pageId,
          pageAccessToken: 'PLACEHOLDER_TOKEN', // سيتم تحديثه لاحقاً
          pageName: pageName,
          companyId: companyId,
          status: 'connected',
          connectedAt: new Date()
        }
      });
      
      console.log('✅ تم إنشاء الصفحة بنجاح');
      console.log(`   ID: ${newPage.id}`);
    }

    // فحص النتيجة النهائية
    console.log('\n📋 الصفحات المتصلة الآن:');
    const allPages = await prisma.facebookPage.findMany({
      include: { company: true }
    });

    for (const page of allPages) {
      console.log(`   📄 ${page.pageName} (${page.pageId})`);
      console.log(`      الشركة: ${page.company?.name || 'غير محددة'}`);
      console.log(`      الحالة: ${page.status}`);
    }

    console.log('\n✅ تم إضافة الصفحة بنجاح!');
    console.log('💡 الآن يمكنك إرسال رسائل لهذه الصفحة وستظهر في النظام');

  } catch (error) {
    console.error('❌ خطأ في إضافة صفحة فيسبوك:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
addNewFacebookPage();
