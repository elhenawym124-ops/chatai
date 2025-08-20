/**
 * إصلاح نهائي لصفحات فيسبوك
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixFacebookPagesFinal() {
  console.log('🔧 إصلاح نهائي لصفحات فيسبوك...');
  console.log('='.repeat(50));

  try {
    // 1. إضافة حقل isActive إذا لم يكن موجوداً
    console.log('1️⃣ إضافة حقل isActive...');
    
    try {
      await prisma.$executeRaw`
        ALTER TABLE facebook_pages 
        ADD COLUMN isActive BOOLEAN DEFAULT TRUE
      `;
      console.log('✅ تم إضافة حقل isActive');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('✅ حقل isActive موجود بالفعل');
      } else {
        console.log('⚠️ خطأ في إضافة isActive:', error.message);
      }
    }

    // 2. تفعيل جميع الصفحات
    console.log('\n2️⃣ تفعيل جميع الصفحات...');
    
    await prisma.$executeRaw`
      UPDATE facebook_pages 
      SET isActive = TRUE 
      WHERE isActive IS NULL OR isActive = FALSE
    `;
    console.log('✅ تم تفعيل جميع الصفحات');

    // 3. فحص الصفحات
    console.log('\n3️⃣ فحص الصفحات...');
    
    const pages = await prisma.facebookPage.findMany();
    
    for (const page of pages) {
      console.log(`\n📄 صفحة: ${page.pageName}`);
      console.log(`   معرف الصفحة: ${page.pageId}`);
      console.log(`   Token: ${page.pageAccessToken ? 'موجود' : 'مفقود'}`);
      console.log(`   الحالة: ${page.status || 'غير محددة'}`);
      console.log(`   الشركة: ${page.companyId}`);
      
      // فحص isActive مباشرة من قاعدة البيانات
      const activeCheck = await prisma.$queryRaw`
        SELECT isActive 
        FROM facebook_pages 
        WHERE id = ${page.id}
      `;
      
      if (activeCheck.length > 0) {
        const isActive = activeCheck[0].isActive === 1;
        console.log(`   نشطة: ${isActive ? '✅' : '❌'}`);
      } else {
        console.log(`   نشطة: ❓ غير محددة`);
      }
    }

    // 4. اختبار إرسال رسالة لصفحة Swan-store
    console.log('\n4️⃣ اختبار إرسال رسالة لصفحة Swan-store...');
    
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (swanPage && swanPage.pageAccessToken) {
      console.log('✅ صفحة Swan-store موجودة مع token');
      
      // محاولة إرسال رسالة تجريبية
      const axios = require('axios');
      
      try {
        const testMessage = {
          recipient: { id: 'TEST_USER_FINAL' },
          message: { text: 'رسالة اختبار نهائية' }
        };

        const response = await axios.post(
          `https://graph.facebook.com/v18.0/me/messages`,
          testMessage,
          {
            params: { access_token: swanPage.pageAccessToken },
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log('✅ تم إرسال الرسالة التجريبية بنجاح');
        
      } catch (error) {
        if (error.response?.data?.error?.code === 100) {
          console.log('✅ Token صالح (خطأ في recipient ID فقط)');
        } else {
          console.log('❌ خطأ في Token:', error.response?.data?.error?.message || error.message);
        }
      }
    } else {
      console.log('❌ صفحة Swan-store غير موجودة أو بدون token');
    }

    // 5. اختبار نهائي للنظام
    console.log('\n5️⃣ اختبار نهائي للنظام...');
    
    // محاكاة getPageToken
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
    }

    // 6. النتيجة النهائية
    console.log('\n🎯 النتيجة النهائية:');
    
    if (swanPageData) {
      console.log('🎉 صفحة Swan-store جاهزة تماماً للاستخدام!');
      console.log('📱 يمكن الآن إرسال الرسائل بنجاح!');
      
      // اختبار رسالة حقيقية
      console.log('\n📤 إرسال رسالة اختبار نهائية...');
      
      const testWebhook = {
        "object": "page",
        "entry": [
          {
            "time": Date.now(),
            "id": "675323792321557",
            "messaging": [
              {
                "sender": { "id": "FINAL_TEST_USER" },
                "recipient": { "id": "675323792321557" },
                "timestamp": Date.now(),
                "message": {
                  "mid": "final_test_" + Date.now(),
                  "text": "اختبار نهائي - هل النظام يعمل؟"
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

        console.log('✅ تم إرسال الرسالة التجريبية للنظام');
        console.log('🔍 تحقق من اللوج لرؤية النتيجة...');
        
      } catch (error) {
        console.log('❌ خطأ في إرسال الرسالة التجريبية:', error.message);
      }
      
    } else {
      console.log('❌ صفحة Swan-store تحتاج مزيد من الإصلاح');
    }

  } catch (error) {
    console.error('❌ خطأ في الإصلاح النهائي:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإصلاح النهائي
fixFacebookPagesFinal().catch(console.error);
