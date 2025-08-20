const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user and company...');

    // إنشاء شركة تجريبية
    const company = await prisma.company.upsert({
      where: { id: 'test-company-id' },
      update: {},
      create: {
        id: 'test-company-id',
        name: 'شركة تجريبية',
        email: 'test@company.com',
        phone: '123456789',
        plan: 'PRO',
        isActive: true,
        settings: JSON.stringify({
          maxUsers: 10,
          maxConversations: 1000,
          features: ['chat', 'analytics', 'integrations']
        })
      }
    });

    console.log('✅ Company created:', company.name);

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // إنشاء مستخدم تجريبي
    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'مدير',
        lastName: 'النظام',
        role: 'COMPANY_ADMIN',
        isActive: true,
        companyId: company.id
      }
    });

    console.log('✅ User created:', user.email);

    // حذف العملاء الموجودين أولاً
    await prisma.customer.deleteMany({
      where: { companyId: company.id }
    });

    // إنشاء بعض العملاء التجريبيين
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          firstName: 'أحمد',
          lastName: 'محمد',
          email: 'customer1@example.com',
          phone: '01234567890',
          companyId: company.id
        }
      }),
      prisma.customer.create({
        data: {
          firstName: 'فاطمة',
          lastName: 'علي',
          email: 'customer2@example.com',
          phone: '01234567891',
          companyId: company.id
        }
      })
    ]);

    console.log('✅ Customers created:', customers.length);

    // حذف المحادثات الموجودة أولاً
    await prisma.conversation.deleteMany({
      where: { companyId: company.id }
    });

    // إنشاء محادثات تجريبية
    const conversations = await Promise.all([
      prisma.conversation.create({
        data: {
          customerId: customers[0].id,
          companyId: company.id,
          status: 'ACTIVE',
          channel: 'WHATSAPP',
          lastMessageAt: new Date()
        }
      }),
      prisma.conversation.create({
        data: {
          customerId: customers[1].id,
          companyId: company.id,
          status: 'ACTIVE',
          channel: 'FACEBOOK',
          lastMessageAt: new Date()
        }
      })
    ]);

    console.log('✅ Conversations created:', conversations.length);

    // حذف الرسائل الموجودة أولاً (عبر المحادثات)
    await prisma.message.deleteMany({
      where: {
        conversation: {
          companyId: company.id
        }
      }
    });

    // إنشاء رسائل تجريبية
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          conversationId: conversations[0].id,
          senderId: null, // العميل لا يحتاج senderId
          isFromCustomer: true,
          content: 'مرحباً، أريد الاستفسار عن منتجاتكم',
          type: 'TEXT'
        }
      }),
      prisma.message.create({
        data: {
          conversationId: conversations[0].id,
          senderId: user.id,
          isFromCustomer: false,
          content: 'أهلاً وسهلاً! كيف يمكنني مساعدتك؟',
          type: 'TEXT'
        }
      }),
      prisma.message.create({
        data: {
          conversationId: conversations[1].id,
          senderId: null, // العميل لا يحتاج senderId
          isFromCustomer: true,
          content: 'هل يمكنني معرفة أسعار الخدمات؟',
          type: 'TEXT'
        }
      })
    ]);

    console.log('✅ Messages created:', messages.length);

    console.log('\n🎉 Test data created successfully!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('🏢 Company: شركة تجريبية');
    console.log('👥 Customers: 2');
    console.log('💬 Conversations: 2');
    console.log('📝 Messages: 3');
    console.log('═══════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
