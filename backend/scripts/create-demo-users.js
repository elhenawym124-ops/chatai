const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUsers() {
  try {
    console.log('🚀 إنشاء المستخدمين التجريبيين...');

    // إنشاء شركة تجريبية
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
        settings: {
          aiEnabled: true,
          autoReply: true,
          workingHours: {
            start: '09:00',
            end: '18:00'
          },
          personalityPrompt: 'انت اسمك محمد، الشحن 70، لغة رسمية، مفيش نرونه ف التعامل بياع صارم'
        }
      }
    });

    console.log('✅ تم إنشاء الشركة التجريبية:', company.name);

    // كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // إنشاء المستخدمين التجريبيين
    const demoUsers = [
      {
        email: 'admin@smartchat.com',
        firstName: 'أحمد',
        lastName: 'محمد',
        role: 'COMPANY_ADMIN',
        description: 'مدير النظام - صلاحيات كاملة'
      },
      {
        email: 'agent@smartchat.com',
        firstName: 'فاطمة',
        lastName: 'علي',
        role: 'AGENT',
        description: 'موظف خدمة العملاء'
      },
      {
        email: 'manager@smartchat.com',
        firstName: 'محمد',
        lastName: 'حسن',
        role: 'MANAGER',
        description: 'مدير المبيعات'
      }
    ];

    for (const userData of demoUsers) {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          isActive: true,
          lastLoginAt: new Date()
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true,
          isEmailVerified: true,
          companyId: company.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ تم إنشاء المستخدم: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      console.log(`   📧 البريد: ${userData.email}`);
      console.log(`   🔑 كلمة المرور: admin123`);
      console.log(`   👤 الدور: ${userData.role}`);
      console.log(`   📝 الوصف: ${userData.description}`);
      console.log('');
    }

    console.log('🎉 تم إنشاء جميع المستخدمين التجريبيين بنجاح!');
    console.log('');
    console.log('📋 ملخص الحسابات التجريبية:');
    console.log('================================');
    console.log('👨‍💼 مدير النظام:');
    console.log('   📧 admin@smartchat.com');
    console.log('   🔑 admin123');
    console.log('');
    console.log('👤 موظف خدمة العملاء:');
    console.log('   📧 agent@smartchat.com');
    console.log('   🔑 admin123');
    console.log('');
    console.log('👨‍💼 مدير المبيعات:');
    console.log('   📧 manager@smartchat.com');
    console.log('   🔑 admin123');
    console.log('');
    console.log('🔗 يمكنك الآن تسجيل الدخول على: http://localhost:3000/auth/login');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدمين التجريبيين:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الـ script
if (require.main === module) {
  createDemoUsers()
    .then(() => {
      console.log('✅ تم الانتهاء من إنشاء المستخدمين التجريبيين');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل في إنشاء المستخدمين التجريبيين:', error);
      process.exit(1);
    });
}

module.exports = { createDemoUsers };
