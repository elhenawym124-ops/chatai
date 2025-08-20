const AdvancedProductService = require('./src/services/advancedProductService');

async function testProductSuggestions() {
  const advancedProductService = new AdvancedProductService();
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib';
  
  console.log('🧪 Testing Product Suggestions for Different Messages...\n');
  
  const testMessages = [
    'قولي الموديلات',
    'عايزة كوتشي',
    'ايه المنتجات اللي عندك',
    'انصحيني بحاجة حلوة',
    'عندك ايه جديد',
    'أريد أشتري حذاء'
  ];
  
  for (const message of testMessages) {
    console.log(`🔍 Testing: "${message}"`);
    
    try {
      const result = await advancedProductService.recommendProducts(companyId, message, 'test-customer');
      
      if (result.success) {
        console.log(`✅ Success: Found ${result.data.recommendations.length} recommendations`);
        result.data.recommendations.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.productName || product.name} - ${product.price} جنيه`);
          console.log(`      السبب: ${product.reason}`);
        });
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testProductSuggestions();
