const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔄 Creating test data...');

    // Create company
    const company = await prisma.company.create({
      data: {
        name: 'شركة افتراضية',
        email: 'info@test-company.com',
        plan: 'BASIC',
        currency: 'EGP',
        isActive: true
      }
    });

    console.log('✅ Company created:', company.name);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'أحمد',
        lastName: 'المدير',
        role: 'COMPANY_ADMIN',
        companyId: company.id,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create agent user
    const agentUser = await prisma.user.create({
      data: {
        email: 'agent@test.com',
        password: hashedPassword,
        firstName: 'سارة',
        lastName: 'الوكيل',
        role: 'AGENT',
        companyId: company.id,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log('✅ Agent user created:', agentUser.email);

    // Create some test customers
    for (let i = 1; i <= 5; i++) {
      await prisma.customer.create({
        data: {
          firstName: `عميل ${i}`,
          lastName: 'تجريبي',
          email: `customer${i}@test.com`,
          phone: `+20123456789${i}`,
          status: 'LEAD',
          companyId: company.id
        }
      });
    }

    console.log('✅ Test customers created');

    // Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'كوتشي اسكوتش',
        description: 'كوتشي رياضي عالي الجودة',
        price: 349.00,
        isActive: true,
        companyId: company.id,
        images: JSON.stringify([
          'https://example.com/shoe1.jpg',
          'https://example.com/shoe2.jpg'
        ])
      }
    });

    console.log('✅ Test product created:', product.name);

    console.log('🎉 Test data created successfully!');
    console.log('📧 Admin login: admin@test.com / admin123');
    console.log('📧 Agent login: agent@test.com / admin123');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
