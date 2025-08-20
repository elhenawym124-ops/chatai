/**
 * فحص مشكلة عدم الرد على صفحة Swan-store
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugSwanStoreIssue() {
  console.log('🔍 فحص مشكلة عدم الرد على صفحة Swan-store...');
  console.log('='.repeat(60));

  try {
    // 1. فحص الصفحات المتصلة
    console.log('\n📄 فحص الصفحات المتصلة:');
    const facebookPages = await prisma.facebookPage.findMany({
      include: {
        company: true
      }
    });

    console.log(`📊 إجمالي الصفحات: ${facebookPages.length}`);
    facebookPages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.pageName} (${page.pageId})`);
      console.log(`   الشركة: ${page.company.name} (${page.companyId})`);
      console.log(`   Token: ${page.pageAccessToken ? 'موجود' : 'مفقود'}`);
      console.log(`   نشط: ${page.isActive ? 'نعم' : 'لا'}`);
    });

    // 2. فحص مفاتيح Gemini
    console.log('\n🔑 فحص مفاتيح Gemini:');
    const geminiKeys = await prisma.geminiKey.findMany({
      include: {
        company: true
      }
    });

    console.log(`📊 إجمالي المفاتيح: ${geminiKeys.length}`);
    geminiKeys.forEach((key, index) => {
      console.log(`${index + 1}. ${key.keyName || 'بدون اسم'}`);
      console.log(`   الشركة: ${key.company.name} (${key.companyId})`);
      console.log(`   المفتاح: ${key.apiKey.substring(0, 20)}...`);
      console.log(`   نشط: ${key.isActive ? 'نعم' : 'لا'}`);
      console.log(`   النموذج: ${key.model || 'غير محدد'}`);
    });

    // 3. فحص إعدادات AI
    console.log('\n⚙️ فحص إعدادات AI:');
    const aiSettings = await prisma.aiSettings.findMany({
      include: {
        company: true
      }
    });

    console.log(`📊 إجمالي الإعدادات: ${aiSettings.length}`);
    aiSettings.forEach((setting, index) => {
      console.log(`${index + 1}. الشركة: ${setting.company.name}`);
      console.log(`   AI مفعل: ${setting.aiEnabled ? 'نعم' : 'لا'}`);
      console.log(`   الاستجابة التلقائية: ${setting.autoResponse ? 'نعم' : 'لا'}`);
      console.log(`   النموذج: ${setting.model || 'غير محدد'}`);
    });

    // 4. فحص آخر الرسائل الواردة
    console.log('\n📨 فحص آخر الرسائل الواردة:');
    const recentMessages = await prisma.message.findMany({
      where: {
        isFromCustomer: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        conversation: {
          include: {
            customer: true,
            company: true
          }
        }
      }
    });

    console.log(`📊 آخر ${recentMessages.length} رسائل من العملاء:`);
    recentMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.createdAt.toISOString()}] ${msg.conversation.company.name}`);
      console.log(`   العميل: ${msg.conversation.customer.name || msg.conversation.customer.facebookId}`);
      console.log(`   الرسالة: ${msg.content.substring(0, 50)}...`);
    });

    // 5. فحص الشركة المحددة (Swan-store)
    console.log('\n🦢 فحص شركة Swan-store بالتفصيل:');
    
    // البحث عن الشركة
    const swanCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: 'Swan' } },
          { name: { contains: 'swan' } },
          { name: { contains: 'SWAN' } }
        ]
      },
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true
      }
    });

    if (swanCompany) {
      console.log(`✅ تم العثور على شركة Swan: ${swanCompany.name} (${swanCompany.id})`);
      
      // فحص الصفحات
      console.log(`📄 الصفحات المتصلة: ${swanCompany.facebookPages.length}`);
      swanCompany.facebookPages.forEach((page, index) => {
        console.log(`   ${index + 1}. ${page.pageName} (${page.pageId})`);
        console.log(`      Token: ${page.pageAccessToken ? 'موجود' : 'مفقود'}`);
        console.log(`      نشط: ${page.isActive ? 'نعم' : 'لا'}`);
      });

      // فحص مفاتيح Gemini
      console.log(`🔑 مفاتيح Gemini: ${swanCompany.geminiKeys.length}`);
      swanCompany.geminiKeys.forEach((key, index) => {
        console.log(`   ${index + 1}. ${key.keyName || 'بدون اسم'}`);
        console.log(`      المفتاح: ${key.apiKey.substring(0, 20)}...`);
        console.log(`      نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`      النموذج: ${key.model || 'غير محدد'}`);
      });

      // فحص إعدادات AI
      console.log(`⚙️ إعدادات AI: ${swanCompany.aiSettings.length}`);
      swanCompany.aiSettings.forEach((setting, index) => {
        console.log(`   ${index + 1}. AI مفعل: ${setting.aiEnabled ? 'نعم' : 'لا'}`);
        console.log(`      الاستجابة التلقائية: ${setting.autoResponse ? 'نعم' : 'لا'}`);
        console.log(`      النموذج: ${setting.model || 'غير محدد'}`);
      });

      // فحص آخر المحادثات
      const swanConversations = await prisma.conversation.findMany({
        where: { companyId: swanCompany.id },
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 2
          }
        }
      });

      console.log(`💬 آخر المحادثات: ${swanConversations.length}`);
      swanConversations.forEach((conv, index) => {
        console.log(`   ${index + 1}. العميل: ${conv.customer.name || conv.customer.facebookId}`);
        console.log(`      آخر رسالة: ${conv.lastMessageAt}`);
        console.log(`      عدد الرسائل: ${conv.messages.length}`);
        if (conv.messages.length > 0) {
          console.log(`      آخر رسالة: ${conv.messages[0].content.substring(0, 30)}...`);
        }
      });

    } else {
      console.log('❌ لم يتم العثور على شركة Swan-store');
      
      // عرض جميع الشركات المتاحة
      const allCompanies = await prisma.company.findMany({
        select: { id: true, name: true }
      });
      
      console.log('\n📋 جميع الشركات المتاحة:');
      allCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} (${company.id})`);
      });
    }

    // 6. اختبار مفتاح Gemini الجديد
    console.log('\n🧪 اختبار مفتاح Gemini الجديد:');
    const latestKey = await prisma.geminiKey.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { company: true }
    });

    if (latestKey) {
      console.log(`🔑 آخر مفتاح مضاف:`);
      console.log(`   الشركة: ${latestKey.company.name}`);
      console.log(`   المفتاح: ${latestKey.apiKey.substring(0, 20)}...`);
      console.log(`   نشط: ${latestKey.isActive ? 'نعم' : 'لا'}`);
      console.log(`   النموذج: ${latestKey.model || 'غير محدد'}`);
      console.log(`   تاريخ الإضافة: ${latestKey.createdAt}`);

      // اختبار المفتاح
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(latestKey.apiKey);
        const model = genAI.getGenerativeModel({ model: latestKey.model || 'gemini-1.5-flash' });

        console.log('\n🧪 اختبار المفتاح...');
        const result = await model.generateContent('مرحبا، هذا اختبار بسيط');
        const response = await result.response;
        const text = response.text();

        console.log('✅ المفتاح يعمل بنجاح!');
        console.log(`📝 الاستجابة: ${text.substring(0, 100)}...`);

      } catch (error) {
        console.log('❌ المفتاح لا يعمل:');
        console.log(`   الخطأ: ${error.message}`);
      }
    }

    // 7. فحص webhook الأخير
    console.log('\n📡 فحص آخر webhook مستقبل:');
    console.log('   معظم الـ webhooks المستقبلة هي read events وليس رسائل فعلية');
    console.log('   هذا يعني أن Facebook يرسل إشعارات قراءة فقط');
    console.log('   لاختبار الرد، يجب إرسال رسالة فعلية تحتوي على نص');

  } catch (error) {
    console.error('❌ خطأ في فحص المشكلة:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
debugSwanStoreIssue().catch(console.error);
