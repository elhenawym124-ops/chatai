const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProductImages() {
  console.log('📸 Adding Product Images to Database...\n');
  
  try {
    // إضافة منتجات مع صور
    const products = [
      {
        name: 'كوتشي نايك اير فورس 1 أبيض',
        description: 'حذاء رياضي كلاسيكي من نايك، مريح وأنيق للاستخدام اليومي',
        price: 320,
        stock: 150,
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
        ],
        category: 'أحذية رياضية',
        brand: 'Nike',
        sizes: ['37', '38', '39', '40', '41', '42', '43'],
        colors: ['أبيض', 'أسود']
      },
      {
        name: 'كوتشي أديداس ستان سميث',
        description: 'حذاء رياضي كلاسيكي من أديداس، تصميم عصري ومريح',
        price: 280,
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop'
        ],
        category: 'أحذية رياضية',
        brand: 'Adidas',
        sizes: ['37', '38', '39', '40', '41', '42'],
        colors: ['أبيض', 'أخضر']
      },
      {
        name: 'كوتشي بوما سويد كلاسيك',
        description: 'حذاء رياضي من الجلد الطبيعي، تصميم ريترو أنيق',
        price: 250,
        stock: 80,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'
        ],
        category: 'أحذية رياضية',
        brand: 'Puma',
        sizes: ['38', '39', '40', '41', '42', '43'],
        colors: ['أزرق', 'أحمر', 'أسود']
      },
      {
        name: 'حذاء رياضي نسائي',
        description: 'حذاء رياضي نسائي أنيق ومريح، مناسب للرياضة والاستخدام اليومي',
        price: 310,
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop'
        ],
        category: 'أحذية نسائية',
        brand: 'Nike',
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: ['وردي', 'أبيض', 'بيج']
      }
    ];

    // الحصول على الشركة الأولى
    const company = await prisma.company.findFirst();
    if (!company) {
      console.log('❌ No company found in database');
      return;
    }

    console.log(`🏢 Adding products for company: ${company.name}`);

    // إضافة المنتجات
    for (const productData of products) {
      try {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            images: JSON.stringify(productData.images),
            metadata: JSON.stringify({
              category: productData.category,
              brand: productData.brand,
              sizes: productData.sizes,
              colors: productData.colors
            }),
            companyId: company.id,
            isActive: true
          }
        });

        console.log(`✅ Added product: ${product.name} (${product.images ? JSON.parse(product.images).length : 0} images)`);
      } catch (error) {
        console.log(`⚠️ Error adding product ${productData.name}:`, error.message);
      }
    }

    // تحديث RAG Service لتحميل المنتجات الجديدة
    console.log('\n🔄 Updating RAG knowledge base...');
    
    const allProducts = await prisma.product.findMany({
      where: { companyId: company.id, isActive: true }
    });

    console.log(`📦 Total products in database: ${allProducts.length}`);
    
    // عرض المنتجات مع الصور
    console.log('\n📋 Products with images:');
    allProducts.forEach((product, index) => {
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Price: ${product.price} EGP`);
        console.log(`   Stock: ${product.stock} pieces`);
        console.log(`   Images: ${images.length} image(s)`);
        if (images.length > 0) {
          console.log(`   First image: ${images[0]}`);
        }
        console.log('');
      } catch (error) {
        console.log(`${index + 1}. ${product.name} - Error parsing images`);
      }
    });

    console.log('🎉 Product images added successfully!');
    console.log('🔄 Please restart the server to reload RAG knowledge base');
    console.log('');
    console.log('🧪 To test image sending:');
    console.log('1. Send a message like "أريد أن أرى الكوتشيات المتاحة"');
    console.log('2. Or "عندكم صور للأحذية؟"');
    console.log('3. AI will respond with text + product images');

  } catch (error) {
    console.error('❌ Error adding product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductImages();
