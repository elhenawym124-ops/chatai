/**
 * Quick Error Handling Test
 * 
 * Simple test to verify error handling improvements
 */

const axios = require('axios');

class QuickErrorTest {
  constructor() {
    this.baseURL = 'http://localhost:3002';
    this.results = [];
  }

  async runQuickTest() {
    console.log('🔧 بدء الاختبار السريع للأخطاء...\n');

    // Test 1: Invalid JSON
    await this.testInvalidJSON();
    
    // Test 2: Missing fields
    await this.testMissingFields();
    
    // Test 3: 404 Resource
    await this.test404Resource();
    
    // Test 4: Method not allowed
    await this.testMethodNotAllowed();
    
    // Test 5: Unauthorized access
    await this.testUnauthorized();
    
    // Test 6: Negative numbers
    await this.testNegativeNumbers();
    
    // Test 7: SQL Injection
    await this.testSQLInjection();
    
    // Generate summary
    this.generateSummary();
  }

  async testInvalidJSON() {
    console.log('1️⃣ اختبار JSON غير صحيح...');
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
        '{"invalid": json}', 
        { 
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true 
        }
      );
      
      const passed = response.status === 400;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 400)`);
      
      this.results.push({
        test: 'Invalid JSON',
        status: response.status,
        expected: 400,
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'Invalid JSON',
        status: 'ERROR',
        expected: 400,
        passed: false,
        error: error.message
      });
    }
  }

  async testMissingFields() {
    console.log('2️⃣ اختبار الحقول المفقودة...');
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/test/customers`,
        {},
        {
          validateStatus: () => true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const passed = response.status === 422 || response.status === 400;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 422 أو 400)`);
      if (response.data) {
        console.log(`   📝 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }

      this.results.push({
        test: 'Missing Fields',
        status: response.status,
        expected: '422 or 400',
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'Missing Fields',
        status: 'ERROR',
        expected: '422 or 400',
        passed: false,
        error: error.message
      });
    }
  }

  async test404Resource() {
    console.log('3️⃣ اختبار مورد غير موجود...');
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/customers/999999`, 
        { validateStatus: () => true }
      );
      
      const passed = response.status === 404;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 404)`);
      
      this.results.push({
        test: '404 Resource',
        status: response.status,
        expected: 404,
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: '404 Resource',
        status: 'ERROR',
        expected: 404,
        passed: false,
        error: error.message
      });
    }
  }

  async testMethodNotAllowed() {
    console.log('4️⃣ اختبار Method Not Allowed...');
    try {
      const response = await axios.delete(`${this.baseURL}/health`, 
        { validateStatus: () => true }
      );
      
      const passed = response.status === 405;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 405)`);
      
      this.results.push({
        test: 'Method Not Allowed',
        status: response.status,
        expected: 405,
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'Method Not Allowed',
        status: 'ERROR',
        expected: 405,
        passed: false,
        error: error.message
      });
    }
  }

  async testUnauthorized() {
    console.log('5️⃣ اختبار Unauthorized Access...');
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/conversations`, 
        { 
          headers: { 'Authorization': 'Bearer invalid_token' },
          validateStatus: () => true 
        }
      );
      
      const passed = response.status === 401;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 401)`);
      
      this.results.push({
        test: 'Unauthorized Access',
        status: response.status,
        expected: 401,
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'Unauthorized Access',
        status: 'ERROR',
        expected: 401,
        passed: false,
        error: error.message
      });
    }
  }

  async testNegativeNumbers() {
    console.log('6️⃣ اختبار الأرقام السالبة...');
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/test/products`, 
        { name: 'Test Product', price: -100, stock: -5 }, 
        { validateStatus: () => true }
      );
      
      const passed = response.status === 422 || response.status === 400;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 422 أو 400)`);
      
      this.results.push({
        test: 'Negative Numbers',
        status: response.status,
        expected: '422 or 400',
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'Negative Numbers',
        status: 'ERROR',
        expected: '422 or 400',
        passed: false,
        error: error.message
      });
    }
  }

  async testSQLInjection() {
    console.log('7️⃣ اختبار SQL Injection...');
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/customers`, 
        { 
          params: { search: "'; DROP TABLE users; --" },
          validateStatus: () => true 
        }
      );
      
      const passed = response.status === 403 || response.status === 400;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${response.status} (متوقع: 403 أو 400)`);
      
      this.results.push({
        test: 'SQL Injection',
        status: response.status,
        expected: '403 or 400',
        passed
      });
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      this.results.push({
        test: 'SQL Injection',
        status: 'ERROR',
        expected: '403 or 400',
        passed: false,
        error: error.message
      });
    }
  }

  generateSummary() {
    console.log('\n📊 ملخص النتائج:');
    console.log('=' * 50);
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;
    
    console.log(`إجمالي الاختبارات: ${totalTests}`);
    console.log(`الاختبارات الناجحة: ${passedTests}`);
    console.log(`الاختبارات الفاشلة: ${failedTests}`);
    console.log(`معدل النجاح: ${successRate.toFixed(1)}%`);
    
    console.log('\n📋 تفاصيل النتائج:');
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${result.test}: ${result.status} (متوقع: ${result.expected})`);
    });
    
    console.log('\n💡 التقييم:');
    if (successRate >= 80) {
      console.log('🎉 ممتاز! معالجة الأخطاء تعمل بشكل جيد');
    } else if (successRate >= 60) {
      console.log('⚠️ جيد، لكن يحتاج تحسين');
    } else {
      console.log('❌ يحتاج عمل كبير لتحسين معالجة الأخطاء');
    }
  }
}

// Run the test
if (require.main === module) {
  const tester = new QuickErrorTest();
  tester.runQuickTest().catch(console.error);
}
