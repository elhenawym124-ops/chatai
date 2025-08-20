const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('👑 إنشاء حساب Super Admin...');

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingSuperAdmin) {
      console.log('⚠️ يوجد حساب Super Admin بالفعل:', existingSuperAdmin.email);
      return;
    }

    // Create a system company for super admin
    let systemCompany = await prisma.company.findFirst({
      where: { email: 'system@admin.com' }
    });

    if (!systemCompany) {
      systemCompany = await prisma.company.create({
        data: {
          name: 'إدارة النظام',
          email: 'system@admin.com',
          plan: 'ENTERPRISE',
          currency: 'EGP',
          isActive: true
        }
      });
      console.log('✅ تم إنشاء شركة النظام');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('superadmin123', 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@system.com',
        password: hashedPassword,
        firstName: 'مدير',
        lastName: 'النظام',
        role: 'SUPER_ADMIN',
        companyId: systemCompany.id,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('🎉 تم إنشاء حساب Super Admin بنجاح!');
    console.log('📧 البريد الإلكتروني: superadmin@system.com');
    console.log('🔑 كلمة المرور: superadmin123');
    console.log('🆔 معرف المستخدم:', superAdmin.id);

  } catch (error) {
    console.error('❌ خطأ في إنشاء Super Admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
