const { PrismaClient } = require('@prisma/client');

async function testProductEditImprovements() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Product Edit Page Improvements...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Find a test product
    const testProduct = await prisma.product.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      },
      include: {
        variants: true
      }
    });
    
    if (!testProduct) {
      console.log('❌ No test product found');
      return;
    }
    
    console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`);
    console.log(`📊 Current product images:`, testProduct.images);
    console.log(`🎨 Current variants: ${testProduct.variants.length}`);
    
    // Test 1: Add image from URL
    console.log('\n🔗 Test 1: Adding image from URL...');
    
    const testImageUrl = 'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Test+Image';
    
    const addImageResponse = await fetch('http://localhost:3001/api/v1/products/' + testProduct.id + '/images/url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: testImageUrl })
    });
    
    const addImageData = await addImageResponse.json();
    console.log('📊 Add image response:', addImageData);
    
    if (addImageData.success) {
      console.log('✅ Image URL added successfully');
      console.log(`📋 Total images now: ${addImageData.data.totalImages}`);
    } else {
      console.log('❌ Failed to add image URL:', addImageData.error);
    }
    
    // Test 2: Remove image
    console.log('\n🗑️ Test 2: Removing image...');
    
    const removeImageResponse = await fetch('http://localhost:3001/api/v1/products/' + testProduct.id + '/images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: testImageUrl })
    });
    
    const removeImageData = await removeImageResponse.json();
    console.log('📊 Remove image response:', removeImageData);
    
    if (removeImageData.success) {
      console.log('✅ Image removed successfully');
      console.log(`📋 Remaining images: ${removeImageData.data.remainingImages}`);
    } else {
      console.log('❌ Failed to remove image:', removeImageData.error);
    }
    
    // Test 3: Create a test variant
    console.log('\n➕ Test 3: Creating test variant...');
    
    const testVariant = {
      name: 'أحمر',
      type: 'color',
      sku: 'TEST-RED-001',
      price: testProduct.price,
      stock: 10,
      isActive: true,
      sortOrder: 0,
      images: 'https://via.placeholder.com/150x150/FF0000/FFFFFF?text=Red'
    };
    
    const createVariantResponse = await fetch(`http://localhost:3001/api/v1/products/${testProduct.id}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testVariant)
    });
    
    const createVariantData = await createVariantResponse.json();
    console.log('📊 Create variant response:', createVariantData);
    
    let createdVariantId = null;
    if (createVariantData.success) {
      console.log('✅ Variant created successfully');
      createdVariantId = createVariantData.data.id;
      console.log(`🆔 Created variant ID: ${createdVariantId}`);
    } else {
      console.log('❌ Failed to create variant:', createVariantData.error);
    }
    
    // Test 4: Update the variant
    if (createdVariantId) {
      console.log('\n✏️ Test 4: Updating variant...');
      
      const updatedVariant = {
        ...testVariant,
        name: 'أحمر داكن',
        stock: 15,
        images: 'https://via.placeholder.com/150x150/8B0000/FFFFFF?text=Dark+Red'
      };
      
      const updateVariantResponse = await fetch(`http://localhost:3001/api/v1/products/variants/${createdVariantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedVariant)
      });
      
      const updateVariantData = await updateVariantResponse.json();
      console.log('📊 Update variant response:', updateVariantData);
      
      if (updateVariantData.success) {
        console.log('✅ Variant updated successfully');
        console.log(`📝 New name: ${updateVariantData.data.name}`);
        console.log(`📦 New stock: ${updateVariantData.data.stock}`);
      } else {
        console.log('❌ Failed to update variant:', updateVariantData.error);
      }
    }
    
    // Test 5: Get all variants
    console.log('\n📋 Test 5: Getting all variants...');
    
    const getVariantsResponse = await fetch(`http://localhost:3001/api/v1/products/${testProduct.id}/variants`);
    const getVariantsData = await getVariantsResponse.json();
    console.log('📊 Get variants response:', getVariantsData);
    
    if (getVariantsData.success) {
      console.log(`✅ Retrieved ${getVariantsData.data.length} variants`);
      getVariantsData.data.forEach((variant, index) => {
        console.log(`   ${index + 1}. ${variant.name} (${variant.type}) - Stock: ${variant.stock}`);
        if (variant.images) {
          console.log(`      Images: ${variant.images}`);
        }
      });
    } else {
      console.log('❌ Failed to get variants:', getVariantsData.error);
    }
    
    // Test 6: Delete the test variant
    if (createdVariantId) {
      console.log('\n🗑️ Test 6: Deleting test variant...');
      
      const deleteVariantResponse = await fetch(`http://localhost:3001/api/v1/products/variants/${createdVariantId}`, {
        method: 'DELETE'
      });
      
      const deleteVariantData = await deleteVariantResponse.json();
      console.log('📊 Delete variant response:', deleteVariantData);
      
      if (deleteVariantData.success) {
        console.log('✅ Variant deleted successfully');
      } else {
        console.log('❌ Failed to delete variant:', deleteVariantData.error);
      }
    }
    
    // Test 7: Verify final state
    console.log('\n🔍 Test 7: Verifying final state...');
    
    const finalProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
      include: { variants: true }
    });
    
    console.log(`📦 Final product images:`, finalProduct.images);
    console.log(`🎨 Final variants count: ${finalProduct.variants.length}`);
    
    console.log('\n🎉 Product Edit Improvements Test Complete!');
    console.log('\n📊 Summary:');
    console.log('✅ Image URL addition - Tested');
    console.log('✅ Image removal - Tested');
    console.log('✅ Variant creation - Tested');
    console.log('✅ Variant update - Tested');
    console.log('✅ Variant listing - Tested');
    console.log('✅ Variant deletion - Tested');
    console.log('✅ Console logging - Active throughout');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductEditImprovements();
