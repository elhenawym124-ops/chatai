const { PrismaClient } = require('@prisma/client');

async function testImageOperations() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🖼️ Testing Image Operations...\n');
    
    const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // Find a test product
    const testProduct = await prisma.product.findFirst({
      where: {
        companyId: companyId,
        isActive: true
      }
    });
    
    if (!testProduct) {
      console.log('❌ No test product found');
      return;
    }
    
    console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.id})`);
    console.log(`📊 Current product images:`, testProduct.images);
    
    // Test 1: Add image from URL
    console.log('\n🔗 Test 1: Adding image from URL...');
    
    const testImageUrl = 'https://via.placeholder.com/400x400/00FF00/000000?text=Green+Test';
    
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
      console.log(`📋 All images:`, addImageData.data.allImages);
    } else {
      console.log('❌ Failed to add image URL:', addImageData.error);
      return;
    }
    
    // Test 2: Remove the same image
    console.log('\n🗑️ Test 2: Removing the added image...');
    
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
      console.log(`📋 Remaining images:`, removeImageData.data.allImages);
    } else {
      console.log('❌ Failed to remove image:', removeImageData.error);
    }
    
    // Test 3: Try to remove non-existent image
    console.log('\n🔍 Test 3: Trying to remove non-existent image...');
    
    const fakeImageUrl = 'https://fake-image-url.com/nonexistent.jpg';
    
    const removeFakeResponse = await fetch('http://localhost:3001/api/v1/products/' + testProduct.id + '/images', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl: fakeImageUrl })
    });
    
    const removeFakeData = await removeFakeResponse.json();
    console.log('📊 Remove fake image response:', removeFakeData);
    
    if (!removeFakeData.success) {
      console.log('✅ Correctly rejected non-existent image removal');
    } else {
      console.log('⚠️ Unexpectedly succeeded in removing non-existent image');
    }
    
    // Test 4: Add multiple images
    console.log('\n📚 Test 4: Adding multiple images...');
    
    const multipleImages = [
      'https://via.placeholder.com/300x300/FF0000/FFFFFF?text=Red',
      'https://via.placeholder.com/300x300/00FF00/000000?text=Green',
      'https://via.placeholder.com/300x300/0000FF/FFFFFF?text=Blue'
    ];
    
    for (let i = 0; i < multipleImages.length; i++) {
      const imageUrl = multipleImages[i];
      console.log(`   Adding image ${i + 1}/${multipleImages.length}: ${imageUrl}`);
      
      const response = await fetch('http://localhost:3001/api/v1/products/' + testProduct.id + '/images/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Image ${i + 1} added successfully`);
      } else {
        console.log(`   ❌ Failed to add image ${i + 1}:`, data.error);
      }
    }
    
    // Test 5: Check final state
    console.log('\n🔍 Test 5: Checking final state...');
    
    const finalProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });
    
    console.log(`📦 Final product images:`, finalProduct.images);
    
    let finalImages = [];
    try {
      finalImages = finalProduct.images ? JSON.parse(finalProduct.images) : [];
    } catch (e) {
      console.log('⚠️ Could not parse final images');
    }
    
    console.log(`📊 Total images in product: ${finalImages.length}`);
    finalImages.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img}`);
    });
    
    // Test 6: Clean up - remove test images
    console.log('\n🧹 Test 6: Cleaning up test images...');
    
    for (const imageUrl of multipleImages) {
      console.log(`   Removing: ${imageUrl}`);
      
      const response = await fetch('http://localhost:3001/api/v1/products/' + testProduct.id + '/images', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`   ✅ Removed successfully`);
      } else {
        console.log(`   ❌ Failed to remove:`, data.error);
      }
    }
    
    console.log('\n🎉 Image Operations Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageOperations();
