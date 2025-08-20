const { PrismaClient } = require('@prisma/client');

async function setupDefaultProduct() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up default product...');
    
    // Get company ID
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Create default product
    const defaultProduct = await prisma.product.create({
      data: {
        name: 'منتج مميز من المتجر',
        description: 'منتج عالي الجودة ومناسب لجميع الاحتياجات. يتميز بالجودة العالية والسعر المناسب.',
        price: 99.99,
        sku: 'DEFAULT-PRODUCT-001',
        companyId: companyId,
        categoryId: 'cmdczu43z000914krsyoxllst', // استخدام فئة موجودة
        images: JSON.stringify([
          'https://via.placeholder.com/400x400/28A745/FFFFFF?text=Default+Product',
          'https://via.placeholder.com/400x400/17A2B8/FFFFFF?text=Quality+Product'
        ]),
        isActive: true,
        isFeatured: true,
        stock: 100,
        tags: 'افتراضي,مميز,جودة عالية'
      }
    });
    
    console.log('✅ Default product created:', defaultProduct);
    
    // Update AI settings to use this as default product
    const aiSettings = await prisma.aiSettings.findFirst({
      where: { companyId: companyId }
    });
    
    if (aiSettings) {
      // Update existing settings
      await prisma.aiSettings.update({
        where: { id: aiSettings.id },
        data: {
          defaultProductId: defaultProduct.id,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true
        }
      });

      console.log('✅ AI settings updated with default product');
    } else {
      // Create new AI settings
      await prisma.aiSettings.create({
        data: {
          companyId: companyId,
          autoReplyEnabled: true,
          confidenceThreshold: 0.7,
          defaultProductId: defaultProduct.id,
          autoSuggestProducts: true,
          maxSuggestions: 3,
          includeImages: true
        }
      });

      console.log('✅ New AI settings created with default product');
    }
    
    // Test the default product setup
    console.log('\n🧪 Testing default product setup...');
    
    const testSettings = await prisma.aiSettings.findFirst({
      where: { companyId: companyId }
    });
    
    if (testSettings) {
      console.log('📊 Current AI settings:', {
        autoSuggestProducts: testSettings.autoSuggestProducts,
        maxSuggestions: testSettings.maxSuggestions,
        defaultProductId: testSettings.defaultProductId,
        includeImages: testSettings.includeImages
      });

      if (testSettings.defaultProductId === defaultProduct.id) {
        console.log('✅ Default product is correctly configured!');
      } else {
        console.log('❌ Default product configuration failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up default product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDefaultProduct();
