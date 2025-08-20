const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enhanceProductResponses() {
  console.log('🔧 Enhancing Product Response System...\n');
  
  try {
    // 1. فحص المنتجات الحالية
    console.log('📦 Checking current products...');
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true
      }
    });
    
    console.log(`Found ${products.length} active products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Price: ${product.price} EGP`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Description: ${product.description?.substring(0, 50)}...`);
      console.log('');
    });
    
    // 2. إنشاء رد مثالي للمنتجات
    const idealProductResponse = `🛍️ **المنتجات المتوفرة في متجرنا:**

${products.map((product, index) => {
  const images = product.images ? JSON.parse(product.images) : [];
  return `**${index + 1}. ${product.name}**
💰 السعر: ${product.price} جنيه
📦 المخزون: ${product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'غير متوفر'}
📝 الوصف: ${product.description || 'لا يوجد وصف'}
${images.length > 0 ? '📸 متوفر صور' : ''}`;
}).join('\n\n')}

🎯 **لطلب أي منتج أو الاستفسار عن التفاصيل، فقط اكتب اسم المنتج!**

💬 يمكنك أيضاً السؤال عن:
• الأسعار والعروض
• المقاسات المتاحة  
• طرق الدفع والشحن
• صور إضافية للمنتجات`;

    console.log('\n📝 Ideal product response:');
    console.log('=====================================');
    console.log(idealProductResponse);
    console.log('=====================================');
    
    // 3. إنشاء كلمات مفتاحية محسنة
    console.log('\n🔧 Adding enhanced keywords...');
    
    const productKeywords = [
      'منتجات', 'متوفر', 'عندكم', 'ايه', 'اللي', 'موجود',
      'كوتشي', 'حذاء', 'أحذية', 'رياضي', 'نسائي', 'رجالي',
      'اعرض', 'شوف', 'أرني', 'ورني', 'كتالوج', 'قائمة'
    ];
    
    for (const product of products) {
      const enhancedDescription = `${product.description} ${productKeywords.join(' ')} للبيع متجر أحذية كوتشيات رياضية`;
      
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          description: enhancedDescription
        }
      });
      
      console.log(`✅ Enhanced keywords for: ${product.name}`);
    }
    
    // 4. إنشاء FAQ للمنتجات
    console.log('\n📋 Creating product FAQs...');
    
    const company = await prisma.company.findFirst();
    
    const productFAQs = [
      {
        question: 'ايه المنتجات المتوفرة عندكم؟',
        answer: idealProductResponse,
        category: 'منتجات',
        isActive: true,
        companyId: company.id
      },
      {
        question: 'عندكم ايه من الكوتشيات؟',
        answer: `🏃‍♂️ **كوتشيات متوفرة:**\n\n${products.filter(p => p.name.includes('كوتشي')).map(p => `• ${p.name} - ${p.price} جنيه`).join('\n')}`,
        category: 'منتجات',
        isActive: true,
        companyId: company.id
      },
      {
        question: 'اعرض عليا المنتجات',
        answer: idealProductResponse,
        category: 'منتجات',
        isActive: true,
        companyId: company.id
      }
    ];
    
    for (const faq of productFAQs) {
      try {
        await prisma.fAQ.create({
          data: faq
        });
        console.log(`✅ Created FAQ: ${faq.question}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ FAQ already exists: ${faq.question}`);
        } else {
          console.log(`❌ Error creating FAQ: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Product response system enhanced!');
    console.log('');
    console.log('🔄 Changes made:');
    console.log('1. Enhanced product descriptions with keywords');
    console.log('2. Created comprehensive product FAQs');
    console.log('3. Improved search terms matching');
    console.log('');
    console.log('🚀 Please restart the server to reload RAG knowledge base');
    
  } catch (error) {
    console.error('❌ Error enhancing product responses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enhanceProductResponses();
