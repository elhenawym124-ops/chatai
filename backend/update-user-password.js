const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updateUserPassword() {
  console.log('🔧 تحديث كلمة مرور المستخدم...\n');

  try {
    // 1. البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email: 'admin58@test.com' }
    });

    if (!user) {
      console.log('❌ لم يتم العثور على المستخدم');
      return;
    }

    console.log('✅ وجدت المستخدم:', user.firstName, user.lastName);
    console.log('📧 البريد:', user.email);
    console.log('🏢 Company ID:', user.companyId);

    // 2. تحديث كلمة المرور
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    console.log('✅ تم تحديث كلمة المرور بنجاح');
    console.log('🔑 كلمة المرور الجديدة:', newPassword);

    // 3. اختبار تسجيل الدخول
    console.log('\n🧪 اختبار تسجيل الدخول...');
    
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
        email: 'admin58@test.com',
        password: newPassword
      });

      console.log('✅ تسجيل الدخول نجح!');
      console.log('🏢 Company ID:', loginResponse.data.data.user.companyId);
      console.log('🎫 Token متاح');

    } catch (error) {
      console.log('❌ فشل تسجيل الدخول:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword();
