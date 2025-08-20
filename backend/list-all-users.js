const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    console.log('👥 قائمة جميع المستخدمين في النظام...\n');

    // جلب جميع المستخدمين مع معلومات الشركات
    const users = await prisma.user.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ لا يوجد مستخدمين في النظام');
      return;
    }

    console.log(`📊 إجمالي المستخدمين: ${users.length}\n`);

    // تجميع المستخدمين حسب الشركة
    const usersByCompany = {};
    
    users.forEach(user => {
      const companyId = user.company?.id || 'no-company';
      const companyName = user.company?.name || 'بدون شركة';
      
      if (!usersByCompany[companyId]) {
        usersByCompany[companyId] = {
          company: user.company,
          users: []
        };
      }
      
      usersByCompany[companyId].users.push(user);
    });

    // عرض المستخدمين مجمعين حسب الشركة
    let companyIndex = 1;
    for (const [companyId, data] of Object.entries(usersByCompany)) {
      console.log(`${companyIndex}. 🏢 ${data.company?.name || 'بدون شركة'}`);
      if (data.company) {
        console.log(`   📧 إيميل الشركة: ${data.company.email}`);
        console.log(`   🆔 Company ID: ${data.company.id}`);
        console.log(`   ✅ نشطة: ${data.company.isActive ? 'نعم' : 'لا'}`);
      }
      console.log(`   👥 عدد المستخدمين: ${data.users.length}`);
      console.log('   ' + '─'.repeat(40));
      
      // عرض المستخدمين
      data.users.forEach((user, userIndex) => {
        console.log(`   ${userIndex + 1}. 👤 ${user.firstName} ${user.lastName}`);
        console.log(`      📧 الإيميل: ${user.email}`);
        console.log(`      🏷️ الدور: ${user.role}`);
        console.log(`      ✅ نشط: ${user.isActive ? 'نعم' : 'لا'}`);
        console.log(`      📅 تاريخ الإنشاء: ${user.createdAt.toLocaleString('ar-EG')}`);
        
        // محاولة فحص كلمة المرور
        console.log(`      🔑 كلمة المرور المحتملة: admin123`);
        console.log('      ' + '·'.repeat(30));
      });
      
      console.log('   ' + '═'.repeat(50));
      companyIndex++;
    }

    // ملخص بيانات تسجيل الدخول
    console.log('\n📋 ملخص بيانات تسجيل الدخول السريع:');
    console.log('═'.repeat(80));
    
    let loginIndex = 1;
    for (const [companyId, data] of Object.entries(usersByCompany)) {
      if (data.company && data.users.length > 0) {
        console.log(`\n🏢 ${data.company.name}:`);
        data.users.forEach(user => {
          console.log(`   ${loginIndex}. الإيميل: ${user.email} | كلمة المرور: admin123`);
          loginIndex++;
        });
      }
    }

    // إحصائيات
    console.log('\n📊 الإحصائيات:');
    console.log('═'.repeat(40));
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    const admins = users.filter(u => u.role === 'COMPANY_ADMIN').length;
    const agents = users.filter(u => u.role === 'AGENT').length;
    
    console.log(`👥 إجمالي المستخدمين: ${users.length}`);
    console.log(`✅ المستخدمين النشطين: ${activeUsers}`);
    console.log(`❌ المستخدمين غير النشطين: ${inactiveUsers}`);
    console.log(`👑 المديرين: ${admins}`);
    console.log(`🎧 الوكلاء: ${agents}`);
    console.log(`🏢 الشركات: ${Object.keys(usersByCompany).length}`);

  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
listAllUsers();
