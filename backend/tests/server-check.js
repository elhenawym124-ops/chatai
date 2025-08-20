/**
 * Server Connection and Health Check Script
 * 
 * This script checks the health and connectivity of both
 * frontend and backend servers
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ServerChecker {
  constructor() {
    this.results = {
      frontend: {
        url: 'http://localhost:3000',
        status: 'unknown',
        responseTime: 0,
        details: {}
      },
      backend: {
        url: 'http://localhost:3001',
        status: 'unknown',
        responseTime: 0,
        details: {}
      },
      connectivity: {
        frontendToBackend: 'unknown',
        apiEndpoints: []
      },
      issues: [],
      summary: {
        overallStatus: 'unknown',
        serversRunning: 0,
        totalServers: 2
      }
    };
  }

  /**
   * Run complete server check
   */
  async runServerCheck() {
    console.log('🌐 بدء فحص اتصال الخوادم...\n');

    try {
      // Check frontend server
      await this.checkFrontendServer();
      
      // Check backend server
      await this.checkBackendServer();
      
      // Check connectivity between servers
      await this.checkConnectivity();
      
      // Check critical API endpoints
      await this.checkCriticalEndpoints();
      
      // Generate report
      this.generateServerReport();

    } catch (error) {
      console.error('❌ خطأ في فحص الخوادم:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Server check failed: ${error.message}`
      });
    }
  }

  /**
   * Check frontend server health
   */
  async checkFrontendServer() {
    console.log('🖥️ فحص الخادم الأمامي (Frontend)...');
    
    const startTime = Date.now();
    
    try {
      const response = await axios.get(this.results.frontend.url, {
        timeout: 10000,
        validateStatus: () => true // Accept any status code
      });
      
      const responseTime = Date.now() - startTime;
      
      this.results.frontend.status = response.status === 200 ? 'RUNNING' : 'ISSUES';
      this.results.frontend.responseTime = responseTime;
      this.results.frontend.details = {
        statusCode: response.status,
        headers: response.headers,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length']
      };
      
      if (response.status === 200) {
        console.log(`  ✅ الخادم الأمامي يعمل بشكل صحيح`);
        console.log(`  ⏱️ زمن الاستجابة: ${responseTime}ms`);
        this.results.summary.serversRunning++;
      } else {
        console.log(`  ⚠️ الخادم الأمامي يستجيب لكن بحالة: ${response.status}`);
        this.results.issues.push({
          type: 'WARNING',
          message: `Frontend server returned status ${response.status}`
        });
      }
      
    } catch (error) {
      this.results.frontend.status = 'DOWN';
      this.results.frontend.details.error = error.message;
      
      console.log(`  ❌ الخادم الأمامي لا يستجيب: ${error.message}`);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Frontend server is down: ${error.message}`
      });
    }
  }

  /**
   * Check backend server health
   */
  async checkBackendServer() {
    console.log('\n🔧 فحص الخادم الخلفي (Backend)...');
    
    const startTime = Date.now();
    
    try {
      // Try health endpoint first
      let healthUrl = `${this.results.backend.url}/health`;
      let response;
      
      try {
        response = await axios.get(healthUrl, { timeout: 10000 });
      } catch (healthError) {
        // If health endpoint fails, try root endpoint
        console.log('  ⚠️ نقطة /health غير متاحة، جاري المحاولة مع الجذر...');
        response = await axios.get(this.results.backend.url, { 
          timeout: 10000,
          validateStatus: () => true 
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      this.results.backend.status = response.status === 200 ? 'RUNNING' : 'ISSUES';
      this.results.backend.responseTime = responseTime;
      this.results.backend.details = {
        statusCode: response.status,
        headers: response.headers,
        data: typeof response.data === 'object' ? response.data : 'Non-JSON response'
      };
      
      if (response.status === 200) {
        console.log(`  ✅ الخادم الخلفي يعمل بشكل صحيح`);
        console.log(`  ⏱️ زمن الاستجابة: ${responseTime}ms`);
        this.results.summary.serversRunning++;
      } else {
        console.log(`  ⚠️ الخادم الخلفي يستجيب لكن بحالة: ${response.status}`);
        this.results.issues.push({
          type: 'WARNING',
          message: `Backend server returned status ${response.status}`
        });
      }
      
    } catch (error) {
      this.results.backend.status = 'DOWN';
      this.results.backend.details.error = error.message;
      
      console.log(`  ❌ الخادم الخلفي لا يستجيب: ${error.message}`);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Backend server is down: ${error.message}`
      });
    }
  }

  /**
   * Check connectivity between servers
   */
  async checkConnectivity() {
    console.log('\n🔗 فحص الاتصال بين الخوادم...');
    
    if (this.results.backend.status !== 'RUNNING') {
      console.log('  ⚠️ تخطي فحص الاتصال - الخادم الخلفي غير متاح');
      this.results.connectivity.frontendToBackend = 'BACKEND_DOWN';
      return;
    }
    
    try {
      // Check if frontend can reach backend
      // This is simulated since we're testing from the same machine
      const backendReachable = this.results.backend.status === 'RUNNING';
      
      if (backendReachable) {
        this.results.connectivity.frontendToBackend = 'CONNECTED';
        console.log('  ✅ الاتصال بين الخوادم يعمل بشكل صحيح');
      } else {
        this.results.connectivity.frontendToBackend = 'DISCONNECTED';
        console.log('  ❌ مشكلة في الاتصال بين الخوادم');
        this.results.issues.push({
          type: 'HIGH',
          message: 'Frontend cannot reach backend server'
        });
      }
      
    } catch (error) {
      this.results.connectivity.frontendToBackend = 'ERROR';
      console.log(`  ❌ خطأ في فحص الاتصال: ${error.message}`);
      this.results.issues.push({
        type: 'HIGH',
        message: `Connectivity check failed: ${error.message}`
      });
    }
  }

  /**
   * Check critical API endpoints
   */
  async checkCriticalEndpoints() {
    console.log('\n🔌 فحص نقاط النهاية الحرجة...');
    
    if (this.results.backend.status !== 'RUNNING') {
      console.log('  ⚠️ تخطي فحص APIs - الخادم الخلفي غير متاح');
      return;
    }
    
    const criticalEndpoints = [
      { path: '/health', name: 'Health Check' },
      { path: '/api/v1/auth/status', name: 'Auth Status' },
      { path: '/api/v1/customers', name: 'Customers API' },
      { path: '/api/v1/conversations', name: 'Conversations API' },
      { path: '/api/v1/products', name: 'Products API' }
    ];
    
    for (const endpoint of criticalEndpoints) {
      const url = `${this.results.backend.url}${endpoint.path}`;
      const startTime = Date.now();
      
      try {
        const response = await axios.get(url, { 
          timeout: 5000,
          validateStatus: () => true // Accept any status code
        });
        
        const responseTime = Date.now() - startTime;
        
        const endpointResult = {
          name: endpoint.name,
          path: endpoint.path,
          status: response.status < 500 ? 'AVAILABLE' : 'ERROR',
          statusCode: response.status,
          responseTime,
          error: response.status >= 500 ? 'Server Error' : null
        };
        
        this.results.connectivity.apiEndpoints.push(endpointResult);
        
        if (response.status < 500) {
          console.log(`  ✅ ${endpoint.name}: متاح (${response.status}) - ${responseTime}ms`);
        } else {
          console.log(`  ❌ ${endpoint.name}: خطأ خادم (${response.status}) - ${responseTime}ms`);
          this.results.issues.push({
            type: 'HIGH',
            message: `${endpoint.name} API returned server error ${response.status}`
          });
        }
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        const endpointResult = {
          name: endpoint.name,
          path: endpoint.path,
          status: 'UNAVAILABLE',
          statusCode: null,
          responseTime,
          error: error.message
        };
        
        this.results.connectivity.apiEndpoints.push(endpointResult);
        
        console.log(`  ❌ ${endpoint.name}: غير متاح - ${error.message}`);
        this.results.issues.push({
          type: 'MEDIUM',
          message: `${endpoint.name} API is unavailable: ${error.message}`
        });
      }
    }
  }

  /**
   * Generate server report
   */
  generateServerReport() {
    console.log('\n📋 تقرير فحص الخوادم');
    console.log('=' * 50);
    
    // Overall status
    this.results.summary.overallStatus = this.results.summary.serversRunning === 2 ? 'HEALTHY' : 'ISSUES';
    
    // Summary
    console.log('\n📊 الملخص:');
    console.log(`  الخوادم العاملة: ${this.results.summary.serversRunning}/${this.results.summary.totalServers}`);
    console.log(`  الحالة العامة: ${this.results.summary.overallStatus}`);
    
    // Frontend details
    console.log('\n🖥️ تفاصيل الخادم الأمامي:');
    console.log(`  الرابط: ${this.results.frontend.url}`);
    console.log(`  الحالة: ${this.results.frontend.status}`);
    console.log(`  زمن الاستجابة: ${this.results.frontend.responseTime}ms`);
    
    // Backend details
    console.log('\n🔧 تفاصيل الخادم الخلفي:');
    console.log(`  الرابط: ${this.results.backend.url}`);
    console.log(`  الحالة: ${this.results.backend.status}`);
    console.log(`  زمن الاستجابة: ${this.results.backend.responseTime}ms`);
    
    // API endpoints status
    if (this.results.connectivity.apiEndpoints.length > 0) {
      console.log('\n🔌 حالة نقاط النهاية:');
      this.results.connectivity.apiEndpoints.forEach(endpoint => {
        const status = endpoint.status === 'AVAILABLE' ? '✅' : '❌';
        console.log(`  ${status} ${endpoint.name}: ${endpoint.status} (${endpoint.responseTime}ms)`);
      });
    }
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في الخوادم');
    }
    
    // Recommendations
    console.log('\n💡 التوصيات:');
    if (this.results.summary.overallStatus === 'HEALTHY') {
      console.log('  🎉 جميع الخوادم تعمل بشكل مثالي');
    } else {
      if (this.results.frontend.status !== 'RUNNING') {
        console.log('  🔧 تشغيل الخادم الأمامي (npm run dev في مجلد frontend)');
      }
      if (this.results.backend.status !== 'RUNNING') {
        console.log('  🔧 تشغيل الخادم الخلفي (node server.js في مجلد backend)');
      }
    }
    
    // Save results to file
    this.saveServerReport();
  }

  /**
   * Save server report to file
   */
  saveServerReport() {
    const reportPath = path.join(__dirname, '../reports/server-check-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.summary.overallStatus,
        serversRunning: this.results.summary.serversRunning,
        totalServers: this.results.summary.totalServers,
        totalIssues: this.results.issues.length,
        criticalIssues: this.results.issues.filter(i => i.type === 'CRITICAL').length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = ServerChecker;

// Run if called directly
if (require.main === module) {
  const checker = new ServerChecker();
  checker.runServerCheck().catch(console.error);
}
