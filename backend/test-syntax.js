// Test syntax of advancedProductService.js
try {
  const AdvancedProductService = require('./src/services/advancedProductService.js');
  console.log('✅ Syntax is correct');
} catch (error) {
  console.error('❌ Syntax error:', error.message);
  console.error('Stack:', error.stack);
}
