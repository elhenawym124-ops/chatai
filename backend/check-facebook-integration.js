const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFacebookIntegration() {
  console.log('🔍 فحص تكامل فيسبوك...\n');
  
  try {
    // فحص صفحات فيسبوك المتصلة
    console.log('📄 فحص صفحات فيسبوك المتصلة:');
    const facebookPages = await prisma.facebookPage.findMany({
      include: {
        company: true
      }
    });
    
    if (facebookPages.length === 0) {
      console.log('❌ لا توجد صفحات فيسبوك متصلة!');
      console.log('💡 يجب ربط صفحة فيسبوك أولاً من الواجهة الأمامية');
    } else {
      console.log(`✅ تم العثور على ${facebookPages.length} صفحة متصلة:`);
      
      facebookPages.forEach((page, index) => {
        console.log(`\n${index + 1}. صفحة: ${page.pageName}`);
        console.log(`   🆔 Page ID: ${page.pageId}`);
        console.log(`   🏢 الشركة: ${page.company?.name || 'غير محدد'}`);
        console.log(`   ✅ نشطة: ${page.isActive ? 'نعم' : 'لا'}`);
        console.log(`   🔑 لديها Access Token: ${page.pageAccessToken ? 'نعم' : 'لا'}`);
        console.log(`   📅 تاريخ الإنشاء: ${page.createdAt}`);
      });
    }
    
    // فحص الشركات
    console.log('\n🏢 فحص الشركات:');
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
      console.log('❌ لا توجد شركات مُسجلة!');
      console.log('💡 يجب إنشاء شركة أولاً');
    } else {
      console.log(`✅ تم العثور على ${companies.length} شركة:`);
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. الشركة: ${company.name}`);
        console.log(`   🆔 Company ID: ${company.id}`);
        console.log(`   📅 تاريخ الإنشاء: ${company.createdAt}`);
      });
    }
    
    // فحص المحادثات
    console.log('\n💬 فحص المحادثات:');
    const conversations = await prisma.conversation.findMany({
      where: {
        channel: 'FACEBOOK'
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (conversations.length === 0) {
      console.log('❌ لا توجد محادثات فيسبوك!');
      console.log('💡 هذا يعني أن الرسائل لا تصل للنظام');
    } else {
      console.log(`✅ تم العثور على ${conversations.length} محادثة فيسبوك:`);
      
      conversations.forEach((conv, index) => {
        console.log(`\n${index + 1}. المحادثة: ${conv.title}`);
        console.log(`   🆔 ID: ${conv.id}`);
        console.log(`   📊 الحالة: ${conv.status}`);
        console.log(`   📅 آخر تحديث: ${conv.updatedAt}`);
        console.log(`   💬 عدد الرسائل: ${conv.messages.length > 0 ? 'يوجد رسائل' : 'لا توجد رسائل'}`);
      });
    }
    
    // فحص العملاء
    console.log('\n👥 فحص العملاء:');
    const customers = await prisma.customer.findMany({
      where: {
        facebookId: {
          not: null
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    
    if (customers.length === 0) {
      console.log('❌ لا توجد عملاء من فيسبوك!');
    } else {
      console.log(`✅ تم العثور على ${customers.length} عميل من فيسبوك:`);
      
      customers.forEach((customer, index) => {
        console.log(`\n${index + 1}. العميل: ${customer.firstName} ${customer.lastName}`);
        console.log(`   📱 Facebook ID: ${customer.facebookId}`);
        console.log(`   📞 الهاتف: ${customer.phone || 'غير محدد'}`);
        console.log(`   📅 تاريخ التسجيل: ${customer.createdAt}`);
      });
    }
    
    // اختبار webhook endpoint
    console.log('\n🔗 اختبار webhook endpoint:');
    try {
      const response = await fetch('http://localhost:3001/webhook', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Webhook endpoint متاح - Status: ${response.status}`);
    } catch (error) {
      console.log(`❌ Webhook endpoint غير متاح: ${error.message}`);
    }
    
    console.log('\n📋 ملخص التشخيص:');
    console.log('='.repeat(50));
    console.log(`📄 صفحات فيسبوك: ${facebookPages.length}`);
    console.log(`🏢 الشركات: ${companies.length}`);
    console.log(`💬 محادثات فيسبوك: ${conversations.length}`);
    console.log(`👥 عملاء فيسبوك: ${customers.length}`);
    
    if (facebookPages.length === 0) {
      console.log('\n🚨 المشكلة الرئيسية: لا توجد صفحات فيسبوك متصلة!');
      console.log('💡 الحل: اذهب للواجهة الأمامية وقم بربط صفحة فيسبوك');
    } else if (conversations.length === 0) {
      console.log('\n🚨 المشكلة الرئيسية: الرسائل لا تصل للنظام!');
      console.log('💡 الحل: تحقق من إعدادات webhook في فيسبوك');
    } else {
      console.log('\n✅ التكامل يبدو سليماً، المشكلة قد تكون في شيء آخر');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص التكامل:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFacebookIntegration();
