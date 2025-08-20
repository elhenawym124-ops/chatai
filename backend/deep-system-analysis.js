/**
 * فحص عميق للنظام لاكتشاف المشكلة الحقيقية
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepSystemAnalysis() {
  console.log('🔬 فحص عميق للنظام...');
  console.log('='.repeat(60));

  try {
    // 1. فحص الواجهة الأمامية - ما يراه المستخدم
    console.log('🖥️ فحص ما تظهره الواجهة الأمامية:');
    
    // فحص جميع الشركات وإعداداتها كما تظهر للمستخدم
    const companies = await prisma.company.findMany({
      include: {
        facebookPages: true,
        geminiKeys: true,
        aiSettings: true,
        users: true
      }
    });

    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. شركة: ${company.name} (${company.id})`);
      console.log(`   المستخدمين: ${company.users.length}`);
      console.log(`   الصفحات: ${company.facebookPages.length}`);
      company.facebookPages.forEach(page => {
        console.log(`     - ${page.pageName} (نشط: ${page.isActive})`);
      });
      console.log(`   مفاتيح Gemini: ${company.geminiKeys.length}`);
      company.geminiKeys.forEach(key => {
        console.log(`     - ${key.keyName || 'بدون اسم'} (نشط: ${key.isActive})`);
      });
      console.log(`   إعدادات AI: ${company.aiSettings.length}`);
      company.aiSettings.forEach(setting => {
        console.log(`     - AI: ${setting.aiEnabled}, Auto: ${setting.autoResponse}`);
      });
    });

    // 2. فحص معالجة الـ webhooks بالتفصيل
    console.log('\n📡 فحص معالجة الـ webhooks:');
    
    // فحص آخر webhook تم استقباله مع رسالة فعلية
    const lastRealMessage = await prisma.message.findFirst({
      where: {
        isFromCustomer: true,
        content: { not: '' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        conversation: {
          include: {
            customer: true,
            company: {
              include: {
                facebookPages: true,
                geminiKeys: true,
                aiSettings: true
              }
            }
          }
        }
      }
    });

    if (lastRealMessage) {
      console.log('📨 آخر رسالة حقيقية من عميل:');
      console.log(`   التاريخ: ${lastRealMessage.createdAt}`);
      console.log(`   المحتوى: ${lastRealMessage.content.substring(0, 100)}...`);
      console.log(`   الشركة: ${lastRealMessage.conversation.company.name}`);
      console.log(`   العميل: ${lastRealMessage.conversation.customer.facebookId}`);
      
      // فحص إذا كان هناك رد من البوت
      const botResponse = await prisma.message.findFirst({
        where: {
          conversationId: lastRealMessage.conversationId,
          isFromCustomer: false,
          createdAt: { gt: lastRealMessage.createdAt }
        },
        orderBy: { createdAt: 'asc' }
      });

      console.log(`   رد البوت: ${botResponse ? 'موجود' : 'غير موجود ❌'}`);
      if (botResponse) {
        console.log(`   محتوى الرد: ${botResponse.content.substring(0, 50)}...`);
      }

      // فحص إعدادات الشركة لهذه الرسالة
      const company = lastRealMessage.conversation.company;
      console.log(`\n🔧 إعدادات الشركة للرسالة الأخيرة:`);
      console.log(`   الصفحات النشطة: ${company.facebookPages.filter(p => p.isActive).length}`);
      console.log(`   مفاتيح Gemini النشطة: ${company.geminiKeys.filter(k => k.isActive).length}`);
      console.log(`   AI مفعل: ${company.aiSettings.some(s => s.aiEnabled)}`);
      console.log(`   الاستجابة التلقائية: ${company.aiSettings.some(s => s.autoResponse)}`);
    }

    // 3. فحص سجل الأخطاء والمشاكل
    console.log('\n🚨 فحص الأخطاء المحتملة:');
    
    // فحص الرسائل التي لم يتم الرد عليها
    const unansweredMessages = await prisma.message.findMany({
      where: {
        isFromCustomer: true,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // آخر 24 ساعة
      },
      include: {
        conversation: {
          include: {
            messages: {
              where: { isFromCustomer: false },
              orderBy: { createdAt: 'desc' },
              take: 1
            },
            company: true
          }
        }
      }
    });

    console.log(`📊 رسائل العملاء في آخر 24 ساعة: ${unansweredMessages.length}`);
    
    let unansweredCount = 0;
    unansweredMessages.forEach(msg => {
      const hasResponse = msg.conversation.messages.length > 0 && 
                         msg.conversation.messages[0].createdAt > msg.createdAt;
      if (!hasResponse) {
        unansweredCount++;
      }
    });

    console.log(`📊 رسائل بدون رد: ${unansweredCount}`);
    console.log(`📊 معدل الرد: ${((unansweredMessages.length - unansweredCount) / unansweredMessages.length * 100).toFixed(1)}%`);

    // 4. فحص حالة الخدمات
    console.log('\n⚙️ فحص حالة الخدمات:');
    
    // فحص إذا كان هناك مشكلة في معالجة الرسائل
    const recentConversations = await prisma.conversation.findMany({
      where: {
        lastMessageAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } // آخر ساعة
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        company: {
          include: {
            aiSettings: true,
            geminiKeys: true
          }
        }
      }
    });

    console.log(`💬 محادثات نشطة في آخر ساعة: ${recentConversations.length}`);
    
    recentConversations.forEach((conv, index) => {
      const customerMessages = conv.messages.filter(m => m.isFromCustomer);
      const botMessages = conv.messages.filter(m => !m.isFromCustomer);
      
      console.log(`   ${index + 1}. الشركة: ${conv.company.name}`);
      console.log(`      رسائل العميل: ${customerMessages.length}`);
      console.log(`      رسائل البوت: ${botMessages.length}`);
      console.log(`      AI مفعل: ${conv.company.aiSettings.some(s => s.aiEnabled)}`);
      console.log(`      مفاتيح نشطة: ${conv.company.geminiKeys.filter(k => k.isActive).length}`);
    });

    // 5. فحص مشكلة محددة - Swan-store
    console.log('\n🦢 فحص Swan-store بالتفصيل:');
    
    const swanPage = await prisma.facebookPage.findFirst({
      where: { pageId: '675323792321557' }
    });

    if (swanPage) {
      // فحص آخر رسالة لـ Swan-store
      const swanMessages = await prisma.message.findMany({
        where: {
          conversation: {
            companyId: swanPage.companyId
          },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // آخر أسبوع
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          conversation: {
            include: { customer: true }
          }
        }
      });

      console.log(`📨 رسائل Swan-store في آخر أسبوع: ${swanMessages.length}`);
      
      const customerMsgs = swanMessages.filter(m => m.isFromCustomer);
      const botMsgs = swanMessages.filter(m => !m.isFromCustomer);
      
      console.log(`   من العملاء: ${customerMsgs.length}`);
      console.log(`   من البوت: ${botMsgs.length}`);
      
      if (customerMsgs.length > 0 && botMsgs.length === 0) {
        console.log('   🚨 مشكلة مؤكدة: يوجد رسائل من العملاء بدون ردود!');
      }
    }

    // 6. اختبار مباشر للنظام
    console.log('\n🧪 اختبار مباشر للنظام:');
    console.log('   سيتم إرسال webhook تجريبي...');

  } catch (error) {
    console.error('❌ خطأ في الفحص العميق:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الفحص
deepSystemAnalysis().catch(console.error);
