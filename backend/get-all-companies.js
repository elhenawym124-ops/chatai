const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllCompanies() {
  try {
    console.log('🔍 البحث عن جميع الشركات في النظام...\n');
    
    const companies = await prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        },
        _count: {
          select: {
            users: true,
            customers: true,
            conversations: true
          }
        }
      }
    });

    console.log(`📊 تم العثور على ${companies.length} شركة:\n`);

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      console.log(`${i + 1}. 🏢 ${company.name}`);
      console.log(`   📧 الإيميل: ${company.email}`);
      console.log(`   🆔 ID: ${company.id}`);
      console.log(`   📋 الخطة: ${company.plan}`);
      console.log(`   ✅ نشط: ${company.isActive ? 'نعم' : 'لا'}`);
      console.log(`   👥 المستخدمين: ${company._count.users}`);
      console.log(`   💬 المحادثات: ${company._count.conversations}`);
      console.log(`   📅 تاريخ الإنشاء: ${company.createdAt.toLocaleString('ar-EG')}`);
      
      if (company.users.length > 0) {
        console.log(`   👤 المستخدمين:`);
        company.users.forEach((user, index) => {
          console.log(`      ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
        });
      }
      
      console.log('   ' + '─'.repeat(60));
    }

    console.log('\n🔐 ملخص بيانات تسجيل الدخول:');
    console.log('═'.repeat(70));
    
    companies.forEach((company, index) => {
      if (company.users.length > 0) {
        console.log(`\n${index + 1}. شركة: ${company.name}`);
        company.users.forEach((user, userIndex) => {
          console.log(`   ${userIndex + 1}. الإيميل: ${user.email} | كلمة المرور: admin123`);
        });
      }
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getAllCompanies();
