const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProductsAPI() {
  console.log('🔍 Debugging Products API Error...\n');
  
  try {
    // 1. فحص قاعدة البيانات مباشرة
    console.log('📊 Database Check:');
    console.log('==================');
    
    const products = await prisma.product.findMany({
      include: {
        category: true,
        company: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${products.length} products in database`);
    
    // فحص JSON fields
    for (const product of products) {
      console.log(`\n📋 Product: ${product.name}`);
      
      // فحص images
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        console.log(`   📸 Images: ${images.length} (Valid JSON)`);
      } catch (error) {
        console.log(`   ❌ Images JSON Error: ${error.message}`);
        console.log(`   Raw: ${product.images?.substring(0, 100)}...`);
      }
      
      // فحص tags
      try {
        const tags = product.tags ? JSON.parse(product.tags) : [];
        console.log(`   🏷️ Tags: ${tags.length} (Valid JSON)`);
      } catch (error) {
        console.log(`   ❌ Tags JSON Error: ${error.message}`);
      }
      
      // فحص dimensions
      try {
        const dimensions = product.dimensions ? JSON.parse(product.dimensions) : null;
        console.log(`   📏 Dimensions: ${dimensions ? 'Valid JSON' : 'null'}`);
      } catch (error) {
        console.log(`   ❌ Dimensions JSON Error: ${error.message}`);
      }
      
      // فحص variants
      console.log(`   🔄 Variants: ${product.variants.length}`);
      for (const variant of product.variants) {
        try {
          const variantImages = variant.images ? JSON.parse(variant.images) : [];
          console.log(`      ${variant.name}: ${variantImages.length} images`);
        } catch (error) {
          console.log(`      ${variant.name}: ❌ JSON Error - ${error.message}`);
        }
      }
    }
    
    // 2. اختبار API مباشرة
    console.log('\n\n🌐 API Test:');
    console.log('=============');
    
    try {
      const response = await axios.get('http://localhost:3001/api/v1/products', {
        headers: {
          'Authorization': 'Bearer mock-access-token'
        }
      });
      
      console.log('✅ API Response Success');
      console.log(`📊 Products returned: ${response.data.data?.length || 0}`);
      
    } catch (error) {
      console.log('❌ API Error:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.error || error.message}`);
      console.log(`   Details: ${error.response?.data?.details || 'No details'}`);
      
      if (error.response?.data) {
        console.log('   Full Response:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // 3. اختبار بدون authentication
    console.log('\n🔓 Testing without auth:');
    try {
      const response = await axios.get('http://localhost:3001/api/v1/products');
      console.log('✅ No auth required - Success');
    } catch (error) {
      console.log(`❌ No auth test failed: ${error.response?.status} - ${error.response?.data?.error}`);
    }
    
    // 4. فحص server logs
    console.log('\n📋 Check server logs for detailed error information');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProductsAPI();
