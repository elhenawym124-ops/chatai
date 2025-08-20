const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simplePasswordUpdate() {
  console.log('🔧 تحديث كلمة مرور المستخدم بطريقة بسيطة...\n');

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

    // 2. نسخ كلمة مرور من مستخدم آخر يعمل
    const workingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (!workingUser) {
      console.log('❌ لم يتم العثور على المستخدم المرجعي');
      return;
    }

    console.log('🔄 نسخ كلمة المرور من المستخدم المرجعي...');

    // نسخ كلمة المرور المشفرة
    await prisma.user.update({
      where: { id: user.id },
      data: { password: workingUser.password }
    });

    console.log('✅ تم تحديث كلمة المرور بنجاح');
    console.log('🔑 كلمة المرور الآن: admin123 (نفس المستخدم المرجعي)');

    // 3. اختبار تسجيل الدخول
    console.log('\n🧪 اختبار تسجيل الدخول...');
    
    const axios = require('axios');
    
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
        email: 'admin58@test.com',
        password: 'admin123'
      });

      console.log('✅ تسجيل الدخول نجح!');
      console.log('🏢 Company ID:', loginResponse.data.data.user.companyId);
      console.log('👤 المستخدم:', loginResponse.data.data.user.firstName, loginResponse.data.data.user.lastName);

    } catch (error) {
      console.log('❌ فشل تسجيل الدخول:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simplePasswordUpdate();
