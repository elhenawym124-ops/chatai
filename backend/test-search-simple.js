const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSearchAPI() {
  try {
    console.log('🔍 اختبار البحث الجديد...\n');
    
    const searchTerm = '24283883604576317';
    console.log(`البحث عن: ${searchTerm}`);
    
    // محاكاة نفس الاستعلام المستخدم في API
    const whereCondition = {
      OR: [
        // البحث في اسم العميل
        {
          customer: {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { facebookId: { contains: searchTerm } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm } }
            ]
          }
        },
        // البحث في محتوى الرسائل
        {
          messages: {
            some: {
              content: { contains: searchTerm, mode: 'insensitive' }
            }
          }
        },
        // البحث في آخر رسالة
        {
          lastMessage: { contains: searchTerm, mode: 'insensitive' }
        }
      ]
    };

    const conversations = await prisma.conversation.findMany({
      where: whereCondition,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            facebookId: true,
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    console.log(`✅ تم العثور على ${conversations.length} محادثة`);
    
    if (conversations.length > 0) {
      conversations.forEach((conv, index) => {
        const customerName = `${conv.customer.firstName || ''} ${conv.customer.lastName || ''}`.trim() || 'عميل';
        console.log(`${index + 1}. ${customerName} - ${conv.customer.facebookId}`);
        console.log(`   ID: ${conv.id}`);
        console.log(`   آخر رسالة: ${conv.lastMessage || 'لا توجد'}`);
        console.log('---');
      });
    } else {
      console.log('❌ لم يتم العثور على أي محادثات');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testSearchAPI();
