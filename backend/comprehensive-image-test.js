const { PrismaClient } = require('@prisma/client');
const aiAgentService = require('./src/services/aiAgentService');
const ragService = require('./src/services/ragService');

const prisma = new PrismaClient();

async function comprehensiveImageTest() {
  console.log('📸 Comprehensive Image System Test\n');
  console.log('=====================================\n');
  
  try {
    // 1. فحص قاعدة البيانات أولاً
    console.log('🗄️ Database Analysis:');
    console.log('=====================================');
    
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: { 
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        category: true
      }
    });
    
    console.log(`📦 Found ${products.length} active products\n`);
    
    for (const product of products) {
      console.log(`📋 Product: ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Category: ${product.category?.name || 'None'}`);
      console.log(`   Price: ${product.price} EGP`);
      console.log(`   Stock: ${product.stock}`);
      
      // فحص صور المنتج الأساسية
      let productImages = [];
      if (product.images) {
        try {
          productImages = JSON.parse(product.images);
          console.log(`   📸 Product Images: ${productImages.length}`);
          productImages.forEach((img, index) => {
            console.log(`      ${index + 1}. ${img.substring(0, 60)}...`);
          });
        } catch (error) {
          console.log(`   ❌ Product Images Error: ${error.message}`);
        }
      } else {
        console.log(`   📸 Product Images: 0 (No images field)`);
      }
      
      // فحص متغيرات المنتج
      console.log(`   🔄 Variants: ${product.variants.length}`);
      for (const variant of product.variants) {
        console.log(`      📋 Variant: ${variant.name}`);
        console.log(`         Color: ${variant.color || 'Not specified'}`);
        console.log(`         Size: ${variant.size || 'Not specified'}`);
        console.log(`         Price: ${variant.price} EGP`);
        console.log(`         Stock: ${variant.stock}`);
        
        // فحص صور المتغير
        let variantImages = [];
        if (variant.images) {
          try {
            variantImages = JSON.parse(variant.images);
            console.log(`         📸 Variant Images: ${variantImages.length}`);
            variantImages.forEach((img, index) => {
              console.log(`            ${index + 1}. ${img.substring(0, 50)}...`);
            });
          } catch (error) {
            console.log(`         ❌ Variant Images Error: ${error.message}`);
          }
        } else {
          console.log(`         📸 Variant Images: 0`);
        }
      }
      console.log('');
    }
    
    // 2. اختبار نظام الصور الحالي
    console.log('\n📸 Current Image System Test:');
    console.log('=====================================');
    
    const testQueries = [
      {
        message: 'أريد أن أرى صور كوتشي اسكوتش',
        expectedProduct: 'كوتشي اسكوتش',
        expectedBehavior: 'Should show all product images + variant images'
      },
      {
        message: 'ورني صور كوتشي اسكوتش الأبيض',
        expectedProduct: 'كوتشي اسكوتش',
        expectedColor: 'أبيض',
        expectedBehavior: 'Should show only white variant images'
      },
      {
        message: 'عايز أشوف جميع صور أديداس',
        expectedProduct: 'كوتشي أديداس ستان سميث',
        expectedBehavior: 'Should show all Adidas product + variant images'
      },
      {
        message: 'صور نايك مقاس 40',
        expectedProduct: 'كوتشي نايك اير فورس 1 أبيض',
        expectedSize: '40',
        expectedBehavior: 'Should show size 40 variant images'
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n📝 Test: "${test.message}"`);
      console.log(`   Expected Product: ${test.expectedProduct}`);
      if (test.expectedColor) console.log(`   Expected Color: ${test.expectedColor}`);
      if (test.expectedSize) console.log(`   Expected Size: ${test.expectedSize}`);
      console.log(`   Expected Behavior: ${test.expectedBehavior}`);
      
      try {
        // محاكاة RAG
        await new Promise(resolve => setTimeout(resolve, 2000)); // انتظار RAG
        const relevantData = await ragService.retrieveRelevantData(test.message, 'product_inquiry', 'test');
        
        console.log(`   🔍 RAG Results: ${relevantData.length}`);
        
        if (relevantData.length > 0) {
          // اختبار نظام الصور
          const images = await aiAgentService.findRelevantProductImages(test.message, 'product_inquiry', relevantData);
          
          console.log(`   📸 Images Found: ${images.length}`);
          images.forEach((img, index) => {
            console.log(`      ${index + 1}. ${img.title}`);
            console.log(`         URL: ${img.payload?.url?.substring(0, 50)}...`);
            console.log(`         Subtitle: ${img.subtitle}`);
          });
          
          // مقارنة مع قاعدة البيانات
          const expectedProduct = products.find(p => p.name.includes(test.expectedProduct.split(' ')[1]));
          if (expectedProduct) {
            console.log(`\n   📊 Database Comparison:`);
            
            // حساب العدد المتوقع للصور
            let expectedImageCount = 0;
            
            // صور المنتج الأساسية
            if (expectedProduct.images) {
              try {
                const productImages = JSON.parse(expectedProduct.images);
                expectedImageCount += productImages.length;
                console.log(`      Product Images in DB: ${productImages.length}`);
              } catch (error) {
                console.log(`      Product Images Error: ${error.message}`);
              }
            }
            
            // صور المتغيرات
            let variantImageCount = 0;
            for (const variant of expectedProduct.variants) {
              if (variant.images) {
                try {
                  const variantImages = JSON.parse(variant.images);
                  variantImageCount += variantImages.length;
                } catch (error) {
                  console.log(`      Variant ${variant.name} Images Error: ${error.message}`);
                }
              }
            }
            console.log(`      Variant Images in DB: ${variantImageCount}`);
            console.log(`      Total Expected Images: ${expectedImageCount + variantImageCount}`);
            console.log(`      Actually Sent: ${images.length}`);
            
            // تحليل النتيجة
            if (images.length === expectedImageCount + variantImageCount) {
              console.log(`      ✅ Perfect Match!`);
            } else if (images.length > 0) {
              console.log(`      ⚠️ Partial Match - Missing some images`);
            } else {
              console.log(`      ❌ No images sent - System failure`);
            }
          }
        } else {
          console.log(`   ❌ No relevant data from RAG`);
        }
        
      } catch (error) {
        console.log(`   ❌ Test Error: ${error.message}`);
      }
    }
    
    // 3. تحليل المشاكل والحلول
    console.log('\n\n🔧 Issues and Solutions:');
    console.log('=====================================');
    
    console.log('📋 Current Issues Identified:');
    console.log('1. System sends only 1 image per product (not all images)');
    console.log('2. Variant images are not being sent');
    console.log('3. No distinction between product images and variant images');
    console.log('4. Color/size filtering not working for variants');
    
    console.log('\n💡 Proposed Solutions:');
    console.log('1. Modify findRelevantProductImages to include all product images');
    console.log('2. Add variant image support');
    console.log('3. Implement smart image selection based on request');
    console.log('4. Add fallback: if no product images, send variant images');
    
    console.log('\n📊 Recommended Image Strategy:');
    console.log('• General product request: Send ALL product images + variant images');
    console.log('• Specific color request: Send product images + matching color variant images');
    console.log('• Specific size request: Send product images + matching size variant images');
    console.log('• No product images: Send one image from each variant');
    
  } catch (error) {
    console.error('❌ Comprehensive test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveImageTest();
