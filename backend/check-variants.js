const { PrismaClient } = require('@prisma/client');

async function checkVariants() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking variants for product: هاف كوتشي');
    
    // Get product with variants
    const product = await prisma.product.findFirst({
      where: { name: { contains: 'هاف كوتشي' } },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    if (!product) {
      console.log('❌ Product not found');
      return;
    }
    
    console.log('✅ Product found:', product.name);
    console.log('📊 Variants in database:', product.variants.length);
    
    product.variants.forEach((variant, index) => {
      console.log(`\n   Variant ${index + 1}:`);
      console.log(`     ID: ${variant.id}`);
      console.log(`     Name: ${variant.name}`);
      console.log(`     Type: ${variant.type}`);
      console.log(`     SKU: ${variant.sku || 'Not set'}`);
      console.log(`     Price: ${variant.price || 'Not set'}`);
      console.log(`     Stock: ${variant.stock}`);
      console.log(`     Active: ${variant.isActive}`);
      console.log(`     Images: ${variant.images || 'Not set'}`);
      console.log(`     Created: ${variant.createdAt}`);
    });
    
    // Compare with what's shown in frontend
    console.log('\n🔍 Frontend vs Database Comparison:');
    console.log('====================================');
    
    const frontendVariants = [
      { name: 'أحمر', type: 'color', stock: 15, price: 1010 },
      { name: 'أزرق', type: 'color', stock: 8, price: 1005 }
    ];
    
    frontendVariants.forEach((frontendVar, index) => {
      const dbVariant = product.variants.find(v => v.name === frontendVar.name);
      
      console.log(`\nVariant ${index + 1}: ${frontendVar.name}`);
      console.log(`  Frontend: ${frontendVar.name}, ${frontendVar.type}, ${frontendVar.stock} stock, ${frontendVar.price} EGP`);
      
      if (dbVariant) {
        console.log(`  Database: ${dbVariant.name}, ${dbVariant.type}, ${dbVariant.stock} stock, ${dbVariant.price} EGP`);
        
        // Check matches
        const matches = {
          name: dbVariant.name === frontendVar.name,
          type: dbVariant.type === frontendVar.type,
          stock: dbVariant.stock === frontendVar.stock,
          price: parseFloat(dbVariant.price) === frontendVar.price
        };
        
        console.log(`  Matches: Name(${matches.name ? '✅' : '❌'}), Type(${matches.type ? '✅' : '❌'}), Stock(${matches.stock ? '✅' : '❌'}), Price(${matches.price ? '✅' : '❌'})`);
      } else {
        console.log(`  Database: ❌ Not found`);
      }
    });
    
    console.log('\n📋 Summary:');
    console.log(`   Database variants: ${product.variants.length}`);
    console.log(`   Frontend variants: ${frontendVariants.length}`);
    console.log(`   Match: ${product.variants.length === frontendVariants.length ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
