const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSimpleUsers() {
  try {
    console.log('🚀 إنشاء المستخدمين التجريبيين...');

    // إنشاء شركة تجريبية بسيطة
    const company = await prisma.company.upsert({
      where: { email: 'demo@smartchat.com' },
      update: {},
      create: {
        name: 'Smart Chat Demo Company',
        email: 'demo@smartchat.com',
        phone: '+20123456789',
        address: 'القاهرة، مصر',
        plan: 'PRO',
        currency: 'EGP',
        isActive: true,
        settings: JSON.stringify({
          aiEnabled: true,
          autoReply: true,
          personalityPrompt: 'انت اسمك محمد، الشحن 70، لغة رسمية'
        })
      }
    });

    console.log('✅ تم إنشاء الشركة:', company.name);

    // كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // إنشاء مدير النظام
    const admin = await prisma.user.upsert({
      where: { email: 'admin@smartchat.com' },
      update: {
        isActive: true,
        lastLoginAt: new Date()
      },
      create: {
        email: 'admin@smartchat.com',
        password: hashedPassword,
        firstName: 'أحمد',
        lastName: 'محمد',
        role: 'COMPANY_ADMIN',
        isActive: true,
        isEmailVerified: true,
        companyId: company.id
      }
    });

    // إنشاء موظف خدمة العملاء
    const agent = await prisma.user.upsert({
      where: { email: 'agent@smartchat.com' },
      update: {
        isActive: true,
        lastLoginAt: new Date()
      },
      create: {
        email: 'agent@smartchat.com',
        password: hashedPassword,
        firstName: 'فاطمة',
        lastName: 'علي',
        role: 'AGENT',
        isActive: true,
        isEmailVerified: true,
        companyId: company.id
      }
    });

    console.log('✅ تم إنشاء المستخدمين بنجاح!');
    console.log('');
    console.log('📋 الحسابات التجريبية:');
    console.log('===================');
    console.log('👨‍💼 مدير النظام:');
    console.log('   📧 admin@smartchat.com');
    console.log('   🔑 admin123');
    console.log('');
    console.log('👤 موظف خدمة العملاء:');
    console.log('   📧 agent@smartchat.com');
    console.log('   🔑 admin123');
    console.log('');
    console.log('🔗 رابط تسجيل الدخول: http://localhost:3000/auth/login');

    return { company, admin, agent };

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الـ script
createSimpleUsers()
  .then(() => {
    console.log('✅ تم الانتهاء بنجاح');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ فشل:', error.message);
    process.exit(1);
  });
