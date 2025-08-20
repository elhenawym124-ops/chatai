/**
 * Error Handling APIs Testing Script
 * 
 * This script tests error handling and edge cases for APIs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ErrorHandlingChecker {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      errorHandling: {},
      edgeCases: {},
      security: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        overallStatus: 'unknown'
      },
      issues: []
    };
  }

  /**
   * Run complete error handling check
   */
  async runErrorHandlingCheck() {
    console.log('⚠️ بدء فحص معالجة الأخطاء...\n');

    try {
      // Test error handling
      await this.testErrorHandling();
      
      // Test edge cases
      await this.testEdgeCases();
      
      // Test security responses
      await this.testSecurityResponses();
      
      // Generate report
      this.generateErrorHandlingReport();

    } catch (error) {
      console.error('❌ خطأ في فحص معالجة الأخطاء:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Error handling check failed: ${error.message}`
      });
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('🚨 فحص معالجة الأخطاء...');
    
    const errorTests = [
      { 
        name: 'Invalid JSON', 
        test: () => this.testInvalidJSON(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Missing Required Fields', 
        test: () => this.testMissingFields(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Invalid Data Types', 
        test: () => this.testInvalidDataTypes(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Non-existent Resources', 
        test: () => this.testNonExistentResources(),
        expectedStatus: [404]
      },
      { 
        name: 'Unauthorized Access', 
        test: () => this.testUnauthorizedAccess(),
        expectedStatus: [401, 403]
      },
      { 
        name: 'Method Not Allowed', 
        test: () => this.testMethodNotAllowed(),
        expectedStatus: [405]
      },
      { 
        name: 'Large Payload', 
        test: () => this.testLargePayload(),
        expectedStatus: [413, 400]
      }
    ];
    
    for (const errorTest of errorTests) {
      await this.runErrorTest('errorHandling', errorTest);
    }
    
    console.log();
  }

  /**
   * Test edge cases
   */
  async testEdgeCases() {
    console.log('🔍 فحص الحالات الحدية...');
    
    const edgeTests = [
      { 
        name: 'Empty Strings', 
        test: () => this.testEmptyStrings(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Very Long Strings', 
        test: () => this.testVeryLongStrings(),
        expectedStatus: [400, 413]
      },
      { 
        name: 'Special Characters', 
        test: () => this.testSpecialCharacters(),
        expectedStatus: [200, 400]
      },
      { 
        name: 'Unicode Characters', 
        test: () => this.testUnicodeCharacters(),
        expectedStatus: [200, 400]
      },
      { 
        name: 'Null Values', 
        test: () => this.testNullValues(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Negative Numbers', 
        test: () => this.testNegativeNumbers(),
        expectedStatus: [400, 422]
      },
      { 
        name: 'Zero Values', 
        test: () => this.testZeroValues(),
        expectedStatus: [200, 400]
      }
    ];
    
    for (const edgeTest of edgeTests) {
      await this.runErrorTest('edgeCases', edgeTest);
    }
    
    console.log();
  }

  /**
   * Test security responses
   */
  async testSecurityResponses() {
    console.log('🔒 فحص الاستجابات الأمنية...');
    
    const securityTests = [
      { 
        name: 'SQL Injection Attempt', 
        test: () => this.testSQLInjection(),
        expectedStatus: [400, 403]
      },
      { 
        name: 'XSS Attempt', 
        test: () => this.testXSSAttempt(),
        expectedStatus: [400, 403]
      },
      { 
        name: 'Invalid Token', 
        test: () => this.testInvalidToken(),
        expectedStatus: [401, 403]
      },
      { 
        name: 'Expired Token', 
        test: () => this.testExpiredToken(),
        expectedStatus: [401, 403]
      },
      { 
        name: 'Rate Limiting', 
        test: () => this.testRateLimiting(),
        expectedStatus: [429]
      }
    ];
    
    for (const securityTest of securityTests) {
      await this.runErrorTest('security', securityTest);
    }
    
    console.log();
  }

  /**
   * Run individual error test
   */
  async runErrorTest(category, errorTest) {
    try {
      const result = await errorTest.test();
      const passed = errorTest.expectedStatus.includes(result.statusCode);
      
      this.results[category][errorTest.name] = {
        ...result,
        expected: errorTest.expectedStatus,
        passed
      };
      
      this.results.summary.totalTests++;
      
      if (passed) {
        this.results.summary.passedTests++;
        console.log(`  ✅ ${errorTest.name}: ${result.statusCode} (متوقع)`);
      } else {
        this.results.summary.failedTests++;
        console.log(`  ❌ ${errorTest.name}: ${result.statusCode} (متوقع: ${errorTest.expectedStatus.join('/')})`);
        this.results.issues.push({
          type: 'MEDIUM',
          message: `${errorTest.name} returned unexpected status ${result.statusCode}`
        });
      }
      
    } catch (error) {
      this.results[category][errorTest.name] = {
        error: error.message,
        passed: false
      };
      
      this.results.summary.totalTests++;
      this.results.summary.failedTests++;
      
      console.log(`  ❌ ${errorTest.name}: خطأ - ${error.message}`);
      this.results.issues.push({
        type: 'HIGH',
        message: `${errorTest.name} test failed: ${error.message}`
      });
    }
  }

  /**
   * Test invalid JSON
   */
  async testInvalidJSON() {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/customers`,
        '{"invalid": json}',
        {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true
        }
      );

      return {
        statusCode: response.status,
        hasErrorMessage: response.data && response.data.error,
        responseTime: 0
      };
    } catch (error) {
      return {
        statusCode: error.response?.status || 500,
        hasErrorMessage: error.response?.data?.error || error.message,
        responseTime: 0,
        error: error.message
      };
    }
  }

  /**
   * Test missing required fields
   */
  async testMissingFields() {
    const response = await axios.post(`${this.baseURL}/api/v1/test/customers`,
      {},
      { validateStatus: () => true }
    );

    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test invalid data types
   */
  async testInvalidDataTypes() {
    const response = await axios.post(`${this.baseURL}/api/v1/test/customers`,
      { name: 123, email: true, phone: [] },
      { validateStatus: () => true }
    );

    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test non-existent resources
   */
  async testNonExistentResources() {
    const response = await axios.get(`${this.baseURL}/api/v1/customers/999999`, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test unauthorized access
   */
  async testUnauthorizedAccess() {
    const response = await axios.get(`${this.baseURL}/api/v1/customers`, 
      { 
        headers: { 'Authorization': 'Bearer invalid_token' },
        validateStatus: () => true 
      }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test method not allowed
   */
  async testMethodNotAllowed() {
    const response = await axios.delete(`${this.baseURL}/health`, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test large payload
   */
  async testLargePayload() {
    const largeData = {
      name: 'A'.repeat(10000),
      description: 'B'.repeat(50000)
    };
    
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      largeData, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test empty strings
   */
  async testEmptyStrings() {
    const response = await axios.post(`${this.baseURL}/api/v1/test/customers`,
      { name: '', email: '', phone: '' },
      { validateStatus: () => true }
    );

    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test very long strings
   */
  async testVeryLongStrings() {
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      { 
        name: 'A'.repeat(1000),
        email: 'test@' + 'a'.repeat(500) + '.com'
      }, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test special characters
   */
  async testSpecialCharacters() {
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      { 
        name: '!@#$%^&*()_+{}|:"<>?[]\\;\',./',
        email: 'test+special@example.com'
      }, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test unicode characters
   */
  async testUnicodeCharacters() {
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      { 
        name: '测试用户 🚀 مستخدم تجريبي',
        email: 'test@example.com'
      }, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test null values
   */
  async testNullValues() {
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      { name: null, email: null, phone: null }, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test negative numbers
   */
  async testNegativeNumbers() {
    const response = await axios.post(`${this.baseURL}/api/v1/test/products`,
      { name: 'Test Product', price: -100, stock: -5 },
      { validateStatus: () => true }
    );

    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test zero values
   */
  async testZeroValues() {
    const response = await axios.post(`${this.baseURL}/api/v1/test/products`,
      { name: 'Test Product', price: 0, stock: 0 },
      { validateStatus: () => true }
    );

    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test SQL injection
   */
  async testSQLInjection() {
    const response = await axios.get(`${this.baseURL}/api/v1/customers`, 
      { 
        params: { search: "'; DROP TABLE users; --" },
        validateStatus: () => true 
      }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test XSS attempt
   */
  async testXSSAttempt() {
    const response = await axios.post(`${this.baseURL}/api/v1/customers`, 
      { 
        name: '<script>alert("XSS")</script>',
        email: 'test@example.com'
      }, 
      { validateStatus: () => true }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test invalid token
   */
  async testInvalidToken() {
    const response = await axios.get(`${this.baseURL}/api/v1/customers`, 
      { 
        headers: { 'Authorization': 'Bearer totally_invalid_token_12345' },
        validateStatus: () => true 
      }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test expired token
   */
  async testExpiredToken() {
    // Simulate expired token
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
    
    const response = await axios.get(`${this.baseURL}/api/v1/customers`, 
      { 
        headers: { 'Authorization': `Bearer ${expiredToken}` },
        validateStatus: () => true 
      }
    );
    
    return {
      statusCode: response.status,
      hasErrorMessage: response.data && response.data.error,
      responseTime: 0
    };
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    // Make multiple rapid requests
    const promises = Array(20).fill().map(() => 
      axios.get(`${this.baseURL}/api/v1/customers`, { validateStatus: () => true })
    );
    
    const responses = await Promise.all(promises);
    const rateLimitedResponse = responses.find(r => r.status === 429);
    
    return {
      statusCode: rateLimitedResponse ? 429 : responses[0].status,
      hasErrorMessage: rateLimitedResponse && rateLimitedResponse.data && rateLimitedResponse.data.error,
      responseTime: 0
    };
  }

  /**
   * Generate error handling report
   */
  generateErrorHandlingReport() {
    console.log('\n📋 تقرير فحص معالجة الأخطاء');
    console.log('=' * 50);
    
    // Calculate overall status
    const successRate = (this.results.summary.passedTests / this.results.summary.totalTests) * 100;
    this.results.summary.overallStatus = successRate >= 80 ? 'GOOD' : successRate >= 60 ? 'FAIR' : 'POOR';
    
    // Summary
    console.log('\n📊 الملخص:');
    console.log(`  إجمالي الاختبارات: ${this.results.summary.totalTests}`);
    console.log(`  الاختبارات الناجحة: ${this.results.summary.passedTests}`);
    console.log(`  الاختبارات الفاشلة: ${this.results.summary.failedTests}`);
    console.log(`  معدل النجاح: ${successRate.toFixed(1)}%`);
    console.log(`  الحالة العامة: ${this.results.summary.overallStatus}`);
    
    // Category breakdown
    console.log('\n📋 تفصيل حسب الفئة:');
    const categories = ['errorHandling', 'edgeCases', 'security'];
    
    categories.forEach(category => {
      const tests = Object.values(this.results[category]);
      const passed = tests.filter(t => t.passed).length;
      const total = tests.length;
      
      if (total > 0) {
        const categoryRate = (passed / total) * 100;
        const status = categoryRate === 100 ? '✅' : categoryRate >= 80 ? '⚠️' : '❌';
        console.log(`  ${status} ${category}: ${passed}/${total} (${categoryRate.toFixed(1)}%)`);
      }
    });
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ معالجة الأخطاء تعمل بشكل صحيح');
    }
    
    // Save results to file
    this.saveErrorHandlingReport();
  }

  /**
   * Save error handling report to file
   */
  saveErrorHandlingReport() {
    const reportPath = path.join(__dirname, '../reports/api-error-handling-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.summary.overallStatus,
        successRate: (this.results.summary.passedTests / this.results.summary.totalTests) * 100,
        totalTests: this.results.summary.totalTests,
        passedTests: this.results.summary.passedTests,
        failedTests: this.results.summary.failedTests,
        totalIssues: this.results.issues.length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = ErrorHandlingChecker;

// Run if called directly
if (require.main === module) {
  const checker = new ErrorHandlingChecker();
  checker.runErrorHandlingCheck().catch(console.error);
}
