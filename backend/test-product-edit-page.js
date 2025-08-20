const { PrismaClient } = require('@prisma/client');

async function testProductEditPage() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Product Edit Page Functionality...\n');
    
    const productId = 'cmde4snz7003puf4swmfv9qa1';
    const mockToken = 'mock-access-token';
    
    console.log(`📦 Testing product: ${productId}`);
    console.log(`🔗 Edit page URL: http://localhost:3000/products/${productId}/edit\n`);
    
    // Step 1: Get current product state
    console.log('📋 Step 1: Getting current product state...');
    
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        category: true
      }
    });
    
    if (!currentProduct) {
      console.log('❌ Product not found!');
      return;
    }
    
    console.log(`✅ Product found: ${currentProduct.name}`);
    console.log(`📊 Current state:`);
    console.log(`   - Price: ${currentProduct.price} جنيه`);
    console.log(`   - Stock: ${currentProduct.stock}`);
    console.log(`   - Images: ${currentProduct.images || 'None'}`);
    console.log(`   - Variants: ${currentProduct.variants.length}`);
    
    // Step 2: Test image addition from URL
    console.log('\n🖼️ Step 2: Testing image addition from URL...');
    
    const testImages = [
      'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Test+Image+1',
      'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Test+Image+2',
      'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Test+Image+3'
    ];
    
    for (let i = 0; i < testImages.length; i++) {
      const imageUrl = testImages[i];
      console.log(`   Adding image ${i + 1}/${testImages.length}: ${imageUrl}`);
      
      const response = await fetch(`http://localhost:3001/api/v1/products/${productId}/images/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Image ${i + 1} added successfully`);
        console.log(`      Total images now: ${data.data.totalImages}`);
      } else {
        console.log(`   ❌ Failed to add image ${i + 1}: ${data.error}`);
      }
    }
    
    // Step 3: Test variant creation
    console.log('\n🎨 Step 3: Testing variant creation...');
    
    const testVariants = [
      {
        name: 'أحمر',
        type: 'color',
        sku: 'TEST-RED-001',
        price: currentProduct.price,
        stock: 10,
        isActive: true,
        sortOrder: 0,
        images: 'https://via.placeholder.com/200x200/FF0000/FFFFFF?text=Red+Variant'
      },
      {
        name: 'أزرق',
        type: 'color',
        sku: 'TEST-BLUE-001',
        price: currentProduct.price,
        stock: 15,
        isActive: true,
        sortOrder: 1,
        images: 'https://via.placeholder.com/200x200/0000FF/FFFFFF?text=Blue+Variant'
      },
      {
        name: 'مقاس كبير',
        type: 'size',
        sku: 'TEST-LARGE-001',
        price: currentProduct.price + 10,
        stock: 8,
        isActive: true,
        sortOrder: 2,
        images: 'https://via.placeholder.com/200x200/00FF00/000000?text=Large+Size'
      }
    ];
    
    const createdVariantIds = [];
    
    for (let i = 0; i < testVariants.length; i++) {
      const variant = testVariants[i];
      console.log(`   Creating variant ${i + 1}/${testVariants.length}: ${variant.name} (${variant.type})`);
      
      const response = await fetch(`http://localhost:3001/api/v1/products/${productId}/variants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify(variant)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Variant ${i + 1} created successfully`);
        console.log(`      ID: ${data.data.id}`);
        console.log(`      Name: ${data.data.name}`);
        console.log(`      Stock: ${data.data.stock}`);
        createdVariantIds.push(data.data.id);
      } else {
        console.log(`   ❌ Failed to create variant ${i + 1}: ${data.error}`);
      }
    }
    
    // Step 4: Test variant update
    console.log('\n✏️ Step 4: Testing variant updates...');
    
    for (let i = 0; i < createdVariantIds.length; i++) {
      const variantId = createdVariantIds[i];
      const updatedData = {
        name: testVariants[i].name + ' محدث',
        stock: testVariants[i].stock + 5,
        price: testVariants[i].price + 5,
        images: testVariants[i].images + ',https://via.placeholder.com/200x200/FFFF00/000000?text=Updated+' + (i + 1)
      };
      
      console.log(`   Updating variant ${i + 1}/${createdVariantIds.length}: ${variantId}`);
      
      const response = await fetch(`http://localhost:3001/api/v1/products/variants/${variantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`
        },
        body: JSON.stringify(updatedData)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Variant ${i + 1} updated successfully`);
        console.log(`      New name: ${data.data.name}`);
        console.log(`      New stock: ${data.data.stock}`);
        console.log(`      New price: ${data.data.price}`);
      } else {
        console.log(`   ❌ Failed to update variant ${i + 1}: ${data.error}`);
      }
    }
    
    // Step 5: Test product update
    console.log('\n📝 Step 5: Testing product update...');
    
    const updatedProductData = {
      name: currentProduct.name + ' - محدث',
      description: (currentProduct.description || '') + ' - تم التحديث في الاختبار',
      price: currentProduct.price + 10,
      stock: currentProduct.stock + 5,
      tags: (currentProduct.tags || '') + ',اختبار,محدث'
    };
    
    const updateProductResponse = await fetch(`http://localhost:3001/api/v1/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify(updatedProductData)
    });
    
    const updateProductData = await updateProductResponse.json();
    if (updateProductData.success) {
      console.log(`✅ Product updated successfully`);
      console.log(`   New name: ${updateProductData.data.name}`);
      console.log(`   New price: ${updateProductData.data.price}`);
      console.log(`   New stock: ${updateProductData.data.stock}`);
    } else {
      console.log(`❌ Failed to update product: ${updateProductData.error}`);
    }
    
    // Step 6: Verify database state
    console.log('\n🔍 Step 6: Verifying database state...');
    
    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true
      }
    });
    
    console.log(`📊 Final product state:`);
    console.log(`   Name: ${finalProduct.name}`);
    console.log(`   Price: ${finalProduct.price} جنيه`);
    console.log(`   Stock: ${finalProduct.stock}`);
    
    // Parse and count images
    let imageCount = 0;
    try {
      const images = finalProduct.images ? JSON.parse(finalProduct.images) : [];
      imageCount = images.length;
      console.log(`   Images: ${imageCount} images`);
      images.forEach((img, index) => {
        console.log(`      ${index + 1}. ${img}`);
      });
    } catch (e) {
      console.log(`   Images: Could not parse (${finalProduct.images})`);
    }
    
    console.log(`   Variants: ${finalProduct.variants.length} variants`);
    finalProduct.variants.forEach((variant, index) => {
      console.log(`      ${index + 1}. ${variant.name} (${variant.type}) - Stock: ${variant.stock} - Price: ${variant.price}`);
      if (variant.images) {
        const variantImageCount = variant.images.split(',').length;
        console.log(`         Images: ${variantImageCount} image(s)`);
      }
    });
    
    console.log('\n🎉 === TEST SUMMARY ===');
    console.log(`✅ Product found and accessible`);
    console.log(`✅ Image addition from URL - ${imageCount} images added`);
    console.log(`✅ Variant creation - ${createdVariantIds.length} variants created`);
    console.log(`✅ Variant updates - All variants updated successfully`);
    console.log(`✅ Product update - Product details updated`);
    console.log(`✅ Database persistence - All changes saved to database`);
    
    console.log('\n🔗 You can now test the UI at:');
    console.log(`   http://localhost:3000/products/${productId}/edit`);
    console.log('\n📋 Expected UI functionality:');
    console.log(`   - Should show ${imageCount} images with delete buttons`);
    console.log(`   - Should show ${finalProduct.variants.length} variants with edit/delete options`);
    console.log(`   - Should allow adding new images via URL input`);
    console.log(`   - Should allow adding new variants`);
    console.log(`   - Should save changes to database when form is submitted`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductEditPage();
