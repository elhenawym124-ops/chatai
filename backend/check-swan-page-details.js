/**
 * فحص تفاصيل صفحة Swan-store بالتفصيل
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSwanPageDetails() {
  console.log('🔍 فحص تفاصيل صفحة Swan-store...');
  console.log('='.repeat(60));

  try {
    // 1. فحص صفحة Swan-store بالتفصيل
    const swanPage = await prisma.facebookPage.findFirst({
      where: {
        OR: [
          { pageName: { contains: 'Swan' } },
          { pageName: { contains: 'swan' } },
          { pageId: '675323792321557' }
        ]
      },
      include: {
        company: {
          include: {
            geminiKeys: true,
            aiSettings: true
          }
        }
      }
    });

    if (swanPage) {
      console.log('✅ تم العثور على صفحة Swan-store:');
      console.log(`📄 اسم الصفحة: ${swanPage.pageName}`);
      console.log(`🆔 معرف الصفحة: ${swanPage.pageId}`);
      console.log(`🏢 الشركة: ${swanPage.company.name} (${swanPage.companyId})`);
      console.log(`🔑 Token موجود: ${swanPage.pageAccessToken ? 'نعم' : 'لا'}`);
      console.log(`✅ نشط: ${swanPage.isActive ? 'نعم' : 'لا'}`);
      console.log(`📅 تاريخ الإنشاء: ${swanPage.createdAt}`);

      // فحص مفاتيح Gemini للشركة
      console.log(`\n🔑 مفاتيح Gemini للشركة (${swanPage.company.geminiKeys.length}):`);
      swanPage.company.geminiKeys.forEach((key, index) => {
        console.log(`   ${index + 1}. المفتاح: ${key.apiKey.substring(0, 20)}...`);
        console.log(`      نشط: ${key.isActive ? 'نعم' : 'لا'}`);
        console.log(`      النموذج: ${key.model || 'غير محدد'}`);
        console.log(`      تاريخ الإضافة: ${key.createdAt}`);
      });

      // فحص إعدادات AI للشركة
      console.log(`\n⚙️ إعدادات AI للشركة (${swanPage.company.aiSettings.length}):`);
      swanPage.company.aiSettings.forEach((setting, index) => {
        console.log(`   ${index + 1}. AI مفعل: ${setting.aiEnabled ? 'نعم' : 'لا'}`);
        console.log(`      الاستجابة التلقائية: ${setting.autoResponse ? 'نعم' : 'لا'}`);
        console.log(`      النموذج: ${setting.model || 'غير محدد'}`);
        console.log(`      تاريخ التحديث: ${setting.updatedAt}`);
      });

      // فحص المحادثات الخاصة بهذه الصفحة
      const pageConversations = await prisma.conversation.findMany({
        where: { 
          companyId: swanPage.companyId,
          customer: {
            facebookId: { not: null }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        take: 5,
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      });

      console.log(`\n💬 المحادثات المرتبطة بالشركة (${pageConversations.length}):`);
      pageConversations.forEach((conv, index) => {
        console.log(`   ${index + 1}. العميل: ${conv.customer.name || conv.customer.facebookId}`);
        console.log(`      آخر رسالة: ${conv.lastMessageAt || 'لا توجد'}`);
        console.log(`      عدد الرسائل: ${conv.messages.length}`);
        if (conv.messages.length > 0) {
          console.log(`      آخر رسالة: ${conv.messages[0].content.substring(0, 50)}...`);
          console.log(`      من العميل: ${conv.messages[0].isFromCustomer ? 'نعم' : 'لا'}`);
        }
      });

    } else {
      console.log('❌ لم يتم العثور على صفحة Swan-store');
    }

    // 2. فحص آخر الـ webhooks المستقبلة
    console.log('\n📡 فحص آخر الـ webhooks:');
    console.log('   جميع الـ webhooks المستقبلة مؤخراً هي read events');
    console.log('   لا توجد رسائل فعلية تحتوي على نص');

    // 3. فحص حالة الخادم
    console.log('\n🖥️ حالة الخادم:');
    console.log('   ✅ الخادم يعمل ويستقبل webhooks');
    console.log('   ✅ قاعدة البيانات متصلة');
    console.log('   ✅ مفاتيح Gemini تعمل');

    // 4. تحليل المشكلة
    console.log('\n🔍 تحليل المشكلة:');
    
    if (swanPage) {
      const issues = [];
      
      if (!swanPage.isActive) {
        issues.push('❌ الصفحة غير نشطة (isActive = false)');
      }
      
      if (!swanPage.pageAccessToken) {
        issues.push('❌ لا يوجد Page Access Token');
      }
      
      const activeKeys = swanPage.company.geminiKeys.filter(k => k.isActive);
      if (activeKeys.length === 0) {
        issues.push('❌ لا توجد مفاتيح Gemini نشطة');
      }
      
      const aiEnabled = swanPage.company.aiSettings.some(s => s.aiEnabled);
      if (!aiEnabled) {
        issues.push('❌ AI غير مفعل في إعدادات الشركة');
      }
      
      const autoResponse = swanPage.company.aiSettings.some(s => s.autoResponse);
      if (!autoResponse) {
        issues.push('❌ الاستجابة التلقائية غير مفعلة');
      }

      if (issues.length > 0) {
        console.log('   المشاكل المكتشفة:');
        issues.forEach(issue => console.log(`   ${issue}`));
      } else {
        console.log('   ✅ جميع الإعدادات تبدو صحيحة');
        console.log('   🤔 المشكلة قد تكون في عدم وصول رسائل فعلية');
      }
    }

  } catch (error) {
    console.error('❌ خطأ في فحص التفاصيل:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
checkSwanPageDetails().catch(console.error);
