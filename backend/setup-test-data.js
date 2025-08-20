/**
 * إعداد بيانات تجريبية لاختبار نظام التعلم المستمر
 */

const { PrismaClient } = require('@prisma/client');

async function setupTestData() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 إعداد البيانات التجريبية...');

    // إنشاء شركة تجريبية
    const testCompany = await prisma.company.upsert({
      where: { id: 'test_company_123' },
      update: {},
      create: {
        id: 'test_company_123',
        name: 'شركة اختبار التعلم المستمر',
        email: 'test@learning.com',
        phone: '01234567890',
        plan: 'BASIC',
        isActive: true
      }
    });

    console.log('✅ تم إنشاء الشركة التجريبية:', testCompany.name);

    // إنشاء مستخدم تجريبي
    const testUser = await prisma.user.upsert({
      where: { email: 'test@learning.com' },
      update: {},
      create: {
        email: 'test@learning.com',
        password: 'hashed_password',
        firstName: 'مستخدم',
        lastName: 'تجريبي',
        role: 'AGENT',
        companyId: testCompany.id,
        isActive: true,
        isEmailVerified: true
      }
    });

    console.log('✅ تم إنشاء المستخدم التجريبي:', testUser.firstName, testUser.lastName);

    // إنشاء عميل تجريبي
    const testCustomer = await prisma.customer.upsert({
      where: { id: 'customer_123' },
      update: {},
      create: {
        id: 'customer_123',
        firstName: 'عميل',
        lastName: 'تجريبي',
        phone: '01111111111',
        email: 'customer@test.com',
        companyId: testCompany.id
      }
    });

    console.log('✅ تم إنشاء العميل التجريبي:', testCustomer.name);

    // إنشاء محادثة تجريبية
    const testConversation = await prisma.conversation.upsert({
      where: { id: 'conv_123' },
      update: {},
      create: {
        id: 'conv_123',
        customerId: testCustomer.id,
        companyId: testCompany.id,
        status: 'ACTIVE',
        channel: 'FACEBOOK'
      }
    });

    console.log('✅ تم إنشاء المحادثة التجريبية');

    console.log('\n🎉 تم إعداد جميع البيانات التجريبية بنجاح!');
    console.log('يمكنك الآن تشغيل اختبارات التعلم المستمر.');

  } catch (error) {
    console.error('❌ خطأ في إعداد البيانات التجريبية:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل الإعداد
if (require.main === module) {
  setupTestData().catch(console.error);
}

module.exports = setupTestData;
