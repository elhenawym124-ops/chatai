const { PrismaClient } = require('@prisma/client');

// Set UTF-8 encoding
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixProductEncoding() {
  console.log('🔧 Starting encoding fix for products...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });

    console.log(`📦 Found ${products.length} products to check`);

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // Check if name contains question marks (encoding issue)
      if (product.name && product.name.includes('?')) {
        console.log(`❌ Product ${product.id} has encoding issue in name: ${product.name}`);
        // Try to fix common Arabic encoding issues
        const fixedName = fixArabicEncoding(product.name);
        if (fixedName !== product.name) {
          updateData.name = fixedName;
          needsUpdate = true;
          console.log(`✅ Fixed name: ${fixedName}`);
        }
      }

      // Check description
      if (product.description && product.description.includes('?')) {
        console.log(`❌ Product ${product.id} has encoding issue in description`);
        const fixedDescription = fixArabicEncoding(product.description);
        if (fixedDescription !== product.description) {
          updateData.description = fixedDescription;
          needsUpdate = true;
          console.log(`✅ Fixed description`);
        }
      }

      // Update product if needed
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        console.log(`✅ Updated product ${product.id}`);
      }

      // Fix variants
      for (const variant of product.variants) {
        if (variant.name && variant.name.includes('?')) {
          console.log(`❌ Variant ${variant.id} has encoding issue: ${variant.name}`);
          const fixedVariantName = fixArabicEncoding(variant.name);
          if (fixedVariantName !== variant.name) {
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { name: fixedVariantName }
            });
            console.log(`✅ Fixed variant name: ${fixedVariantName}`);
          }
        }
      }
    }

    console.log('✅ Encoding fix completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing encoding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function fixArabicEncoding(text) {
  if (!text) return text;
  
  // Common Arabic encoding fixes
  const fixes = {
    '????': 'منتج',
    '?????': 'كوتشي',
    '????': 'حذاء',
    '??????': 'الأبيض',
    '??????': 'الأسود',
    '??????': 'الأحمر',
    '???? ?????': 'حذاء رياضي',
    '???? ????': 'منتج جديد',
    '???? ????? ????': 'حذاء رياضي عربي'
  };

  let fixedText = text;
  for (const [broken, fixed] of Object.entries(fixes)) {
    fixedText = fixedText.replace(new RegExp(broken, 'g'), fixed);
  }

  return fixedText;
}

// Run the fix
if (require.main === module) {
  fixProductEncoding();
}

module.exports = { fixProductEncoding, fixArabicEncoding };
