const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreData() {
  try {
    console.log('🔄 استعادة البيانات من الملفات المحفوظة...\n');
    
    // 1. استعادة الشركات
    console.log('1️⃣ استعادة الشركات...');
    const companiesFile = path.join(__dirname, 'data', 'companies.json');
    if (fs.existsSync(companiesFile)) {
      const companiesData = JSON.parse(fs.readFileSync(companiesFile, 'utf8'));
      console.log(`📊 وجدت ${companiesData.length} شركة`);
      
      for (const [id, company] of companiesData) {
        try {
          const cleanCompany = {
            id: company.id,
            name: company.name,
            email: company.email || 'info@company.com',
            phone: company.phone || '',
            website: company.website || '',
            logo: company.logo || '',
            address: company.address || '',
            currency: company.currency || 'EGP',
            plan: company.plan || 'BASIC',
            isActive: company.isActive !== false,
            settings: company.settings ? JSON.stringify(company.settings) : null,
            createdAt: company.createdAt ? new Date(company.createdAt) : new Date(),
            updatedAt: company.updatedAt ? new Date(company.updatedAt) : new Date()
          };

          await prisma.company.upsert({
            where: { id: cleanCompany.id },
            update: cleanCompany,
            create: cleanCompany
          });
        } catch (e) {
          console.log(`⚠️ تخطي شركة ${company.name}: ${e.message}`);
        }
      }
      console.log('✅ تم استعادة الشركات');
    }
    
    // 2. استعادة المنتجات
    console.log('\n2️⃣ استعادة المنتجات...');
    const productsFile = path.join(__dirname, 'data', 'products.json');
    if (fs.existsSync(productsFile)) {
      const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
      console.log(`📦 وجدت ${productsData.length} منتج`);
      
      for (const [id, product] of productsData) {
        try {
          // تنظيف البيانات
          const cleanProduct = {
            id: product.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price) || 0,
            images: product.images || [],
            isActive: product.isActive !== false,
            companyId: product.companyId || 'cmdkj6coz0000uf0cyscco6lr',
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
          };
          
          await prisma.product.upsert({
            where: { id: cleanProduct.id },
            update: cleanProduct,
            create: cleanProduct
          });
        } catch (e) {
          console.log(`⚠️ تخطي منتج ${product.name}: ${e.message}`);
        }
      }
      console.log('✅ تم استعادة المنتجات');
    }
    
    // 3. استعادة المحادثات
    console.log('\n3️⃣ استعادة المحادثات...');
    const conversationsFile = path.join(__dirname, 'data', 'conversations.json');
    if (fs.existsSync(conversationsFile)) {
      const conversationsData = JSON.parse(fs.readFileSync(conversationsFile, 'utf8'));
      console.log(`💬 وجدت ${conversationsData.length} محادثة`);
      
      for (const [id, conversation] of conversationsData) {
        try {
          // إنشاء العميل أولاً
          const customer = await prisma.customer.upsert({
            where: {
              facebookId: conversation.senderId
            },
            update: {},
            create: {
              id: `customer_${conversation.senderId}`,
              firstName: conversation.senderName ? conversation.senderName.split(' ')[0] : 'Facebook',
              lastName: conversation.senderName ? conversation.senderName.split(' ').slice(1).join(' ') || 'User' : 'User',
              email: `facebook_${conversation.senderId}@example.com`,
              phone: '',
              facebookId: conversation.senderId,
              companyId: 'cmdkj6coz0000uf0cyscco6lr'
            }
          });
          
          // إنشاء المحادثة
          await prisma.conversation.upsert({
            where: { id: conversation.id },
            update: {
              customerId: customer.id,
              companyId: 'cmdkj6coz0000uf0cyscco6lr',
              status: 'active',
              createdAt: new Date(conversation.createdAt),
              updatedAt: new Date(conversation.lastMessageAt)
            },
            create: {
              id: conversation.id,
              customerId: customer.id,
              companyId: 'cmdkj6coz0000uf0cyscco6lr',
              status: 'active',
              createdAt: new Date(conversation.createdAt),
              updatedAt: new Date(conversation.lastMessageAt)
            }
          });
        } catch (e) {
          console.log(`⚠️ تخطي محادثة ${conversation.id}: ${e.message}`);
        }
      }
      console.log('✅ تم استعادة المحادثات');
    }
    
    // 4. استعادة الرسائل
    console.log('\n4️⃣ استعادة الرسائل...');
    const messagesFile = path.join(__dirname, 'data', 'messages.json');
    if (fs.existsSync(messagesFile)) {
      const messagesData = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
      console.log(`📨 وجدت ${messagesData.length} رسالة`);
      
      for (const [id, message] of messagesData) {
        try {
          await prisma.message.upsert({
            where: { id: message.id },
            update: {
              conversationId: message.conversationId,
              content: message.content,
              isFromCustomer: message.isFromCustomer,
              createdAt: new Date(message.timestamp)
            },
            create: {
              id: message.id,
              conversationId: message.conversationId,
              content: message.content,
              isFromCustomer: message.isFromCustomer,
              createdAt: new Date(message.timestamp)
            }
          });
        } catch (e) {
          console.log(`⚠️ تخطي رسالة ${message.id}: ${e.message}`);
        }
      }
      console.log('✅ تم استعادة الرسائل');
    }
    
    // 5. إحصائيات نهائية
    console.log('\n📊 إحصائيات الاستعادة:');
    const totalCompanies = await prisma.company.count();
    const totalProducts = await prisma.product.count();
    const totalCustomers = await prisma.customer.count();
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    
    console.log(`  - الشركات: ${totalCompanies}`);
    console.log(`  - المنتجات: ${totalProducts}`);
    console.log(`  - العملاء: ${totalCustomers}`);
    console.log(`  - المحادثات: ${totalConversations}`);
    console.log(`  - الرسائل: ${totalMessages}`);
    
    console.log('\n🎉 تم استعادة البيانات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في استعادة البيانات:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreData();
