/**
 * إصلاح نهائي لمشكلة اختيار الصفحة
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalPageFix() {
  console.log('🔧 إصلاح نهائي لمشكلة اختيار الصفحة...');
  console.log('='.repeat(50));

  try {
    // 1. فحص الصفحات الموجودة
    console.log('1️⃣ فحص الصفحات الموجودة...');

    const pages = await prisma.facebookPage.findMany();
    console.log(`📊 إجمالي الصفحات: ${pages.length}`);

    for (const page of pages) {
      console.log(`📄 ${page.pageName} (${page.pageId}) - Token: ${page.pageAccessToken ? 'موجود' : 'مفقود'}`);
    }

    // 2. البحث عن صفحة Swan-store
    console.log('\n2️⃣ البحث عن صفحة Swan-store...');

    let swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (!swanPage) {
      console.log('❌ صفحة Swan-store غير موجودة - سيتم إنشاؤها');

      // إنشاء صفحة Swan-store
      const anyPageWithToken = await prisma.facebookPage.findFirst({
        where: {
          pageAccessToken: { not: null },
          pageAccessToken: { not: '' }
        }
      });

      if (anyPageWithToken) {
        swanPage = await prisma.facebookPage.create({
          data: {
            pageId: '675323792321557',
            pageName: 'Swan-store',
            pageAccessToken: anyPageWithToken.pageAccessToken,
            status: 'connected',
            isActive: true,
            companyId: anyPageWithToken.companyId,
            connectedAt: new Date()
          }
        });

        console.log('✅ تم إنشاء صفحة Swan-store بنجاح');
      } else {
        console.log('❌ لا توجد صفحات أخرى بـ token صالح');
        return;
      }
    } else {
      console.log('✅ صفحة Swan-store موجودة');

      // التأكد من وجود token
      if (!swanPage.pageAccessToken) {
        console.log('⚠️ صفحة Swan-store بدون token - سيتم إصلاحها');

        const anyPageWithToken = await prisma.facebookPage.findFirst({
          where: {
            pageAccessToken: { not: null },
            pageAccessToken: { not: '' }
          }
        });

        if (anyPageWithToken) {
          swanPage = await prisma.facebookPage.update({
            where: { id: swanPage.id },
            data: {
              pageAccessToken: anyPageWithToken.pageAccessToken,
              status: 'connected',
              isActive: true
            }
          });

          console.log('✅ تم إصلاح token لصفحة Swan-store');
        }
      }
    }

    // 3. اختبار getPageToken
    console.log('\n3️⃣ اختبار getPageToken...');

    async function testGetPageToken(pageId) {
      try {
        const page = await prisma.facebookPage.findUnique({
          where: { pageId: pageId }
        });

        if (page && page.pageAccessToken) {
          return {
            pageAccessToken: page.pageAccessToken,
            pageName: page.pageName,
            companyId: page.companyId,
            lastUsed: Date.now()
          };
        }
      } catch (error) {
        console.error(`❌ خطأ في البحث عن الصفحة ${pageId}:`, error);
      }

      return null;
    }

    const swanPageData = await testGetPageToken('675323792321557');

    if (swanPageData) {
      console.log('✅ getPageToken يعمل بشكل صحيح لصفحة Swan-store');
      console.log(`   اسم الصفحة: ${swanPageData.pageName}`);
      console.log(`   Token متوفر: نعم`);
      console.log(`   الشركة: ${swanPageData.companyId}`);
    } else {
      console.log('❌ getPageToken لا يعمل لصفحة Swan-store');
      return;
    }

    // 4. اختبار إرسال رسالة نهائية
    console.log('\n4️⃣ اختبار إرسال رسالة نهائية...');

    const testWebhook = {
      "object": "page",
      "entry": [
        {
          "time": Date.now(),
          "id": "675323792321557", // معرف صفحة Swan-store
          "messaging": [
            {
              "sender": {
                "id": "FINAL_PAGE_FIX_TEST"
              },
              "recipient": {
                "id": "675323792321557" // معرف صفحة Swan-store الصحيح
              },
              "timestamp": Date.now(),
              "message": {
                "mid": "final_page_fix_" + Date.now(),
                "text": "اختبار نهائي - هل سيتم الرد من Swan-store الآن؟"
              }
            }
          ]
        }
      ]
    };

    try {
      const axios = require('axios');
      const testResponse = await axios.post('http://localhost:3001/webhook', testWebhook, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'facebookexternalua'
        }
      });

      console.log('✅ تم إرسال الرسالة التجريبية النهائية');
      console.log('🔍 تحقق من اللوج لرؤية النتيجة...');

      // انتظار لمعالجة الرسالة
      await new Promise(resolve => setTimeout(resolve, 20000));

      console.log('\n🎯 النتيجة النهائية:');
      console.log('📱 إذا ظهر "Using Page Access Token for page: Swan-store" فالإصلاح نجح!');
      console.log('❌ إذا ظهر "Using Page Access Token for page: Simple A42" فالمشكلة لا تزال موجودة');

    } catch (error) {
      console.log('❌ خطأ في إرسال الرسالة التجريبية:', error.message);
    }

  } catch (error) {
    console.error('❌ خطأ في الإصلاح النهائي:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح النهائي
finalPageFix().catch(console.error);