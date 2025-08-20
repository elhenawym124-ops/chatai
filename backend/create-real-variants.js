const { PrismaClient } = require('@prisma/client');

async function createRealVariants() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Creating real variants for هاف كوتشي');
    
    // Get the product
    const product = await prisma.product.findFirst({
      where: { name: { contains: 'هاف كوتشي' } }
    });
    
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('✅ Product found:', product.name);
    console.log('📦 Product ID:', product.id);
    
    // Create variant 1: أحمر
    const variant1 = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'أحمر',
        type: 'color',
        sku: 'HALF-KOTCHI-RED-001',
        price: 1010,
        comparePrice: 1100,
        cost: 800,
        stock: 15,
        isActive: true,
        sortOrder: 1,
        images: JSON.stringify([
          'https://picsum.photos/200/200?random=1',
          'https://picsum.photos/200/200?random=2'
        ]),
        metadata: JSON.stringify({
          color_code: '#FF0000',
          material: 'leather',
          size_range: '38-45'
        })
      }
    });
    
    console.log('✅ Created variant 1:', variant1.name);
    
    // Create variant 2: أزرق
    const variant2 = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'أزرق',
        type: 'color',
        sku: 'HALF-KOTCHI-BLUE-001',
        price: 1005,
        comparePrice: 1080,
        cost: 790,
        stock: 8,
        isActive: true,
        sortOrder: 2,
        images: JSON.stringify([
          'https://picsum.photos/200/200?random=3',
          'https://picsum.photos/200/200?random=4'
        ]),
        metadata: JSON.stringify({
          color_code: '#0000FF',
          material: 'leather',
          size_range: '38-45'
        })
      }
    });
    
    console.log('✅ Created variant 2:', variant2.name);
    
    // Verify creation
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log('\n📊 Verification:');
    console.log(`   Product: ${updatedProduct.name}`);
    console.log(`   Variants count: ${updatedProduct.variants.length}`);
    
    updatedProduct.variants.forEach((variant, index) => {
      console.log(`   Variant ${index + 1}: ${variant.name} - ${variant.price} EGP - ${variant.stock} stock`);
    });
    
    console.log('\n🎉 Real variants created successfully!');
    console.log('✅ Frontend will now show real data from database');
    
  } catch (error) {
    console.error('❌ Error creating variants:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createRealVariants();
