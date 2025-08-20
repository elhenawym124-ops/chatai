const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTestCompanyConversations() {
  try {
    console.log('🔍 فحص محادثات شركة "شركة تجريبية"...\n');

    // البحث عن شركة "شركة تجريبية"
    const testCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: 'شركة تجريبية' } },
          { id: 'test-company-id' },
          { email: 'test@company.com' }
        ]
      }
    });

    if (!testCompany) {
      console.log('❌ لم يتم العثور على شركة "شركة تجريبية"');
      return;
    }

    console.log(`✅ تم العثور على الشركة:`);
    console.log(`   🏢 الاسم: ${testCompany.name}`);
    console.log(`   🆔 ID: ${testCompany.id}`);
    console.log(`   📧 الإيميل: ${testCompany.email}`);
    console.log(`   📅 تاريخ الإنشاء: ${testCompany.createdAt.toLocaleString('ar-EG')}\n`);

    // البحث عن جميع المحادثات المرتبطة بهذه الشركة
    const conversations = await prisma.conversation.findMany({
      where: {
        companyId: testCompany.id
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            facebookId: true,
            createdAt: true
          }
        },
        messages: {
          select: {
            id: true,
            content: true,
            isFromCustomer: true,
            createdAt: true,
            metadata: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 إجمالي المحادثات: ${conversations.length}\n`);

    if (conversations.length === 0) {
      console.log('✅ لا توجد محادثات مرتبطة بهذه الشركة - البيانات نظيفة');
      return;
    }

    // تحليل المحادثات
    let realConversations = 0;
    let testConversations = 0;
    let suspiciousConversations = 0;

    conversations.forEach((conv, index) => {
      const customerName = `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() || 'غير محدد';
      
      console.log(`\n${index + 1}. 💬 المحادثة ${conv.id}:`);
      console.log(`   👤 العميل: ${customerName}`);
      console.log(`   📧 الإيميل: ${conv.customer.email || 'غير محدد'}`);
      console.log(`   📱 الهاتف: ${conv.customer.phone || 'غير محدد'}`);
      console.log(`   🆔 معرف فيسبوك: ${conv.customer.facebookId || 'غير محدد'}`);
      console.log(`   📅 تاريخ إنشاء العميل: ${conv.customer.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   📅 تاريخ المحادثة: ${conv.createdAt.toLocaleString('ar-EG')}`);
      console.log(`   📝 عدد الرسائل: ${conv._count.messages}`);
      console.log(`   📡 القناة: ${conv.channel}`);
      console.log(`   📊 الحالة: ${conv.status}`);

      // تحليل طبيعة المحادثة
      let isTestData = false;
      let reasons = [];

      // فحص أسماء العملاء التجريبية
      if (customerName.includes('تجريبي') || customerName.includes('test') || customerName.includes('Test')) {
        isTestData = true;
        reasons.push('اسم العميل يحتوي على كلمات تجريبية');
      }

      // فحص الإيميلات التجريبية
      if (conv.customer.email && (
        conv.customer.email.includes('test') || 
        conv.customer.email.includes('example') ||
        conv.customer.email.includes('demo')
      )) {
        isTestData = true;
        reasons.push('الإيميل يحتوي على كلمات تجريبية');
      }

      // فحص أرقام الهواتف التجريبية
      if (conv.customer.phone && (
        conv.customer.phone.includes('111111') ||
        conv.customer.phone.includes('123456') ||
        conv.customer.phone === '01111111111'
      )) {
        isTestData = true;
        reasons.push('رقم الهاتف يبدو تجريبياً');
      }

      // فحص معرفات فيسبوك التجريبية
      if (conv.customer.facebookId && (
        conv.customer.facebookId.includes('test') ||
        conv.customer.facebookId.includes('demo')
      )) {
        isTestData = true;
        reasons.push('معرف فيسبوك يحتوي على كلمات تجريبية');
      }

      // فحص محتوى الرسائل
      if (conv.messages.length > 0) {
        console.log(`   📋 آخر الرسائل:`);
        conv.messages.forEach((msg, msgIndex) => {
          const preview = msg.content.substring(0, 100);
          console.log(`      ${msgIndex + 1}. ${msg.isFromCustomer ? '👤' : '🤖'} ${preview}${msg.content.length > 100 ? '...' : ''}`);
          
          // فحص محتوى تجريبي في الرسائل
          if (msg.content.includes('اختبار') || 
              msg.content.includes('test') || 
              msg.content.includes('تجريب') ||
              msg.content.includes('demo')) {
            isTestData = true;
            if (!reasons.includes('محتوى الرسائل يحتوي على كلمات تجريبية')) {
              reasons.push('محتوى الرسائل يحتوي على كلمات تجريبية');
            }
          }
        });
      }

      // تصنيف المحادثة
      if (isTestData) {
        testConversations++;
        console.log(`   🧪 التصنيف: بيانات تجريبية`);
        console.log(`   📝 الأسباب: ${reasons.join(', ')}`);
      } else if (conv.customer.facebookId && conv.customer.facebookId.length > 10) {
        realConversations++;
        console.log(`   ✅ التصنيف: محادثة حقيقية محتملة`);
      } else {
        suspiciousConversations++;
        console.log(`   ⚠️ التصنيف: مشكوك فيها (لا يوجد معرف فيسبوك صحيح)`);
      }

      console.log('   ' + '─'.repeat(50));
    });

    // ملخص التحليل
    console.log('\n📊 ملخص التحليل:');
    console.log('═'.repeat(50));
    console.log(`🧪 محادثات تجريبية: ${testConversations}`);
    console.log(`✅ محادثات حقيقية محتملة: ${realConversations}`);
    console.log(`⚠️ محادثات مشكوك فيها: ${suspiciousConversations}`);
    console.log(`📊 إجمالي المحادثات: ${conversations.length}`);

    if (testConversations > 0) {
      console.log('\n⚠️ تحذير: تم العثور على بيانات تجريبية في شركة "شركة تجريبية"');
      console.log('💡 يُنصح بحذف هذه البيانات أو نقلها إلى بيئة اختبار منفصلة');
    } else {
      console.log('\n✅ جميع المحادثات تبدو حقيقية');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
checkTestCompanyConversations();
