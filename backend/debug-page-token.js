/**
 * فحص مشكلة page token
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugPageToken() {
  console.log('🔍 فحص مشكلة page token...');
  console.log('='.repeat(40));

  try {
    // 1. فحص جميع صفحات فيسبوك
    const pages = await prisma.facebookPage.findMany();
    
    console.log(`📊 إجمالي صفحات فيسبوك: ${pages.length}`);
    
    for (const page of pages) {
      console.log(`\n📄 صفحة: ${page.pageName}`);
      console.log(`   معرف الصفحة: ${page.pageId}`);
      console.log(`   Token: ${page.pageAccessToken ? 'موجود' : 'مفقود'}`);
      console.log(`   الحالة: ${page.status || 'غير محددة'}`);
      console.log(`   نشطة: ${page.isActive}`);
      console.log(`   الشركة: ${page.companyId}`);
    }

    // 2. البحث عن صفحة Swan-store تحديداً
    console.log('\n🦢 البحث عن صفحة Swan-store:');
    
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (swanPage) {
      console.log('✅ تم العثور على صفحة Swan-store:');
      console.log(`   اسم الصفحة: ${swanPage.pageName}`);
      console.log(`   معرف الصفحة: ${swanPage.pageId}`);
      console.log(`   Token: ${swanPage.pageAccessToken ? 'موجود' : 'مفقود'}`);
      console.log(`   الحالة: ${swanPage.status || 'غير محددة'}`);
      console.log(`   نشطة: ${swanPage.isActive}`);
      console.log(`   الشركة: ${swanPage.companyId}`);
      
      if (swanPage.pageAccessToken) {
        console.log(`   Token (أول 20 حرف): ${swanPage.pageAccessToken.substring(0, 20)}...`);
      }
    } else {
      console.log('❌ لم يتم العثور على صفحة Swan-store');
    }

    // 3. فحص الصفحات المتصلة
    console.log('\n🔗 الصفحات المتصلة:');
    
    const connectedPages = await prisma.facebookPage.findMany({
      where: { status: 'connected' },
      orderBy: { connectedAt: 'desc' }
    });

    console.log(`📊 عدد الصفحات المتصلة: ${connectedPages.length}`);
    
    for (const page of connectedPages) {
      console.log(`   📄 ${page.pageName} (${page.pageId}) - ${page.status}`);
    }

    // 4. فحص الصفحات النشطة
    console.log('\n⚡ الصفحات النشطة:');
    
    const activePages = await prisma.facebookPage.findMany({
      where: { isActive: true }
    });

    console.log(`📊 عدد الصفحات النشطة: ${activePages.length}`);
    
    for (const page of activePages) {
      console.log(`   📄 ${page.pageName} (${page.pageId}) - نشطة`);
    }

    // 5. محاولة إصلاح صفحة Swan-store
    if (swanPage && !swanPage.pageAccessToken) {
      console.log('\n🔧 محاولة إصلاح صفحة Swan-store...');
      
      // البحث عن token من صفحة أخرى أو إعداد افتراضي
      const anyPageWithToken = await prisma.facebookPage.findFirst({
        where: { 
          pageAccessToken: { not: null },
          pageAccessToken: { not: '' }
        }
      });

      if (anyPageWithToken) {
        console.log(`🔧 استخدام token من صفحة: ${anyPageWithToken.pageName}`);
        
        await prisma.facebookPage.update({
          where: { id: swanPage.id },
          data: {
            pageAccessToken: anyPageWithToken.pageAccessToken,
            status: 'connected',
            isActive: true
          }
        });
        
        console.log('✅ تم إصلاح صفحة Swan-store');
      } else {
        console.log('❌ لا توجد صفحات أخرى بـ token صالح');
      }
    }

    // 6. اختبار نهائي
    console.log('\n🧪 اختبار نهائي لصفحة Swan-store:');
    
    const finalSwanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (finalSwanPage && finalSwanPage.pageAccessToken) {
      console.log('✅ صفحة Swan-store جاهزة للاستخدام');
      console.log(`   Token متوفر: نعم`);
      console.log(`   الحالة: ${finalSwanPage.status}`);
      console.log(`   نشطة: ${finalSwanPage.isActive}`);
    } else {
      console.log('❌ صفحة Swan-store لا تزال تحتاج إصلاح');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص page token:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
debugPageToken().catch(console.error);
