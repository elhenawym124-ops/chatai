const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findUserPassword() {
  try {
    console.log('🔍 البحث عن المستخدم المرتبط بشركة info@company.com...\n');

    // 1. البحث عن الشركة
    const company = await prisma.company.findFirst({
      where: {
        email: 'info@company.com'
      }
    });

    if (!company) {
      console.log('❌ لم يتم العثور على شركة بالإيميل info@company.com');
      return;
    }

    console.log('✅ تم العثور على الشركة:');
    console.log(`   🏢 الاسم: ${company.name}`);
    console.log(`   🆔 ID: ${company.id}`);
    console.log(`   📧 الإيميل: ${company.email}`);
    console.log(`   📅 تاريخ الإنشاء: ${company.createdAt.toLocaleString('ar-EG')}\n`);

    // 2. البحث عن المستخدمين المرتبطين بهذه الشركة
    const users = await prisma.user.findMany({
      where: {
        companyId: company.id
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        password: true // نحتاج كلمة المرور لفحصها
      }
    });

    if (users.length === 0) {
      console.log('❌ لا يوجد مستخدمين مرتبطين بهذه الشركة');
      
      // إنشاء مستخدم جديد
      console.log('\n🔧 إنشاء مستخدم جديد للشركة...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const newUser = await prisma.user.create({
        data: {
          email: 'admin@company.com',
          password: hashedPassword,
          firstName: 'مدير',
          lastName: 'الشركة',
          role: 'COMPANY_ADMIN',
          companyId: company.id,
          isActive: true,
          isEmailVerified: true,
          emailVerifiedAt: new Date()
        }
      });

      console.log('✅ تم إنشاء مستخدم جديد:');
      console.log(`   📧 الإيميل: ${newUser.email}`);
      console.log(`   🔑 كلمة المرور: admin123`);
      console.log(`   👤 الاسم: ${newUser.firstName} ${newUser.lastName}`);
      console.log(`   🏢 الدور: ${newUser.role}`);
      
      return;
    }

    console.log(`📊 تم العثور على ${users.length} مستخدم مرتبط بالشركة:\n`);

    // 3. عرض معلومات المستخدمين
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`${i + 1}. 👤 ${user.firstName} ${user.lastName}`);
      console.log(`   📧 الإيميل: ${user.email}`);
      console.log(`   🏷️ الدور: ${user.role}`);
      console.log(`   ✅ نشط: ${user.isActive ? 'نعم' : 'لا'}`);
      console.log(`   📅 تاريخ الإنشاء: ${user.createdAt.toLocaleString('ar-EG')}`);
      
      // محاولة فحص كلمة المرور
      const bcrypt = require('bcryptjs');
      const commonPasswords = ['admin123', 'password123', '123456', 'admin', 'password'];
      
      let foundPassword = false;
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          if (isMatch) {
            console.log(`   🔑 كلمة المرور: ${testPassword}`);
            foundPassword = true;
            break;
          }
        } catch (error) {
          // تجاهل الأخطاء
        }
      }
      
      if (!foundPassword) {
        console.log(`   🔑 كلمة المرور: غير معروفة (مشفرة)`);
        console.log(`   💡 يمكنك إعادة تعيين كلمة المرور باستخدام: admin123`);
        
        // إعادة تعيين كلمة المرور
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        console.log(`   ✅ تم إعادة تعيين كلمة المرور إلى: admin123`);
      }
      
      console.log('   ' + '─'.repeat(50));
    }

    // 4. ملخص بيانات تسجيل الدخول
    console.log('\n📋 ملخص بيانات تسجيل الدخول:');
    console.log('═'.repeat(60));
    console.log(`🏢 الشركة: ${company.name}`);
    console.log(`📧 إيميل الشركة: ${company.email}`);
    console.log(`👥 عدد المستخدمين: ${users.length}`);
    console.log('\n🔐 بيانات تسجيل الدخول المتاحة:');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. الإيميل: ${user.email} | كلمة المرور: admin123`);
    });

  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل السكريبت
findUserPassword();
