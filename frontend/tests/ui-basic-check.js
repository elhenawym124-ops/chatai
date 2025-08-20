/**
 * UI Basic Check
 * 
 * فحص أساسي للواجهات باستخدام fetch API
 * يتحقق من تحميل الصفحات والاستجابة الأساسية
 */

const axios = require('axios');

class UIBasicCheck {
  constructor() {
    this.frontendURL = 'http://localhost:3000';
    this.backendURL = 'http://localhost:3002';
    this.results = {
      frontend: {
        status: 'unknown',
        loadTime: 0,
        accessible: false
      },
      backend: {
        status: 'unknown',
        loadTime: 0,
        accessible: false
      },
      pages: [],
      apiConnections: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async checkServerStatus(url, name) {
    console.log(`🔍 فحص ${name}...`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(url, { 
        timeout: 10000,
        validateStatus: () => true 
      });
      const loadTime = Date.now() - startTime;
      
      const accessible = response.status === 200;
      
      console.log(`   ${accessible ? '✅' : '❌'} ${name}: ${response.status} (${loadTime}ms)`);
      
      return {
        status: response.status,
        loadTime,
        accessible
      };
    } catch (error) {
      console.log(`   ❌ ${name}: خطأ في الاتصال - ${error.message}`);
      return {
        status: 'error',
        loadTime: 0,
        accessible: false,
        error: error.message
      };
    }
  }

  async checkPageAccessibility(path, expectedTitle = null) {
    console.log(`📄 فحص صفحة: ${path}`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.frontendURL}${path}`, {
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      const loadTime = Date.now() - startTime;
      
      const pageResult = {
        path,
        status: response.status,
        loadTime,
        accessible: response.status === 200,
        hasContent: response.data && response.data.length > 0,
        contentLength: response.data ? response.data.length : 0
      };
      
      // فحص المحتوى الأساسي
      if (response.data) {
        pageResult.hasReact = response.data.includes('react') || response.data.includes('React');
        pageResult.hasVite = response.data.includes('vite') || response.data.includes('Vite');
        pageResult.hasTitle = response.data.includes('<title>');
        
        if (expectedTitle) {
          pageResult.hasExpectedTitle = response.data.includes(expectedTitle);
        }
      }
      
      const passed = pageResult.accessible && pageResult.hasContent;
      console.log(`   ${passed ? '✅' : '❌'} Status: ${pageResult.status}, Content: ${pageResult.contentLength} bytes`);
      
      if (passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.pages.push(pageResult);
      this.results.summary.total++;
      
      return pageResult;
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
      
      const pageResult = {
        path,
        status: 'error',
        loadTime: 0,
        accessible: false,
        error: error.message
      };
      
      this.results.pages.push(pageResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return pageResult;
    }
  }

  async checkAPIConnection(endpoint, method = 'GET', data = null) {
    console.log(`🔗 فحص API: ${method} ${endpoint}`);
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${this.backendURL}${endpoint}`,
        timeout: 10000,
        validateStatus: () => true
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const startTime = Date.now();
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      const apiResult = {
        endpoint,
        method,
        status: response.status,
        responseTime,
        accessible: response.status < 500,
        hasData: response.data && Object.keys(response.data).length > 0
      };
      
      console.log(`   ${apiResult.accessible ? '✅' : '❌'} ${method} ${endpoint}: ${response.status} (${responseTime}ms)`);
      
      this.results.apiConnections.push(apiResult);
      return apiResult;
    } catch (error) {
      console.log(`   ❌ API Error: ${error.message}`);
      
      const apiResult = {
        endpoint,
        method,
        status: 'error',
        responseTime: 0,
        accessible: false,
        error: error.message
      };
      
      this.results.apiConnections.push(apiResult);
      return apiResult;
    }
  }

  async runBasicCheck() {
    console.log('🚀 بدء الفحص الأساسي للواجهات...\n');
    
    // 1. فحص حالة الخوادم
    console.log('📡 فحص حالة الخوادم:');
    this.results.frontend = await this.checkServerStatus(this.frontendURL, 'Frontend Server');
    this.results.backend = await this.checkServerStatus(`${this.backendURL}/health`, 'Backend Server');
    console.log('');
    
    // 2. فحص الصفحات الأساسية
    console.log('📄 فحص الصفحات الأساسية:');
    const pagesToCheck = [
      { path: '/', title: 'منصة التواصل' },
      { path: '/dashboard', title: 'لوحة التحكم' },
      { path: '/customers', title: 'العملاء' },
      { path: '/conversations', title: 'المحادثات' },
      { path: '/products', title: 'المنتجات' },
      { path: '/orders', title: 'الطلبات' },
      { path: '/reports', title: 'التقارير' },
      { path: '/settings', title: 'الإعدادات' }
    ];
    
    for (const page of pagesToCheck) {
      await this.checkPageAccessibility(page.path, page.title);
    }
    console.log('');
    
    // 3. فحص اتصالات API
    console.log('🔗 فحص اتصالات API:');
    const apiEndpoints = [
      { endpoint: '/health', method: 'GET' },
      { endpoint: '/api/v1/customers', method: 'GET' },
      { endpoint: '/api/v1/conversations', method: 'GET' },
      { endpoint: '/api/v1/products', method: 'GET' },
      { endpoint: '/api/v1/test/customers', method: 'POST', data: {} }
    ];
    
    for (const api of apiEndpoints) {
      await this.checkAPIConnection(api.endpoint, api.method, api.data);
    }
    console.log('');
    
    // 4. إنشاء التقرير
    this.generateSummary();
  }

  generateSummary() {
    console.log('📊 ملخص فحص الواجهات:');
    console.log('=' * 50);
    
    // حالة الخوادم
    console.log('🖥️ حالة الخوادم:');
    console.log(`   Frontend: ${this.results.frontend.accessible ? '✅ متاح' : '❌ غير متاح'} (${this.results.frontend.loadTime}ms)`);
    console.log(`   Backend: ${this.results.backend.accessible ? '✅ متاح' : '❌ غير متاح'} (${this.results.backend.loadTime}ms)`);
    
    // الصفحات
    console.log('\n📄 الصفحات:');
    const accessiblePages = this.results.pages.filter(p => p.accessible).length;
    const totalPages = this.results.pages.length;
    console.log(`   الصفحات المتاحة: ${accessiblePages}/${totalPages}`);
    console.log(`   معدل النجاح: ${((accessiblePages / totalPages) * 100).toFixed(1)}%`);
    
    // API
    console.log('\n🔗 اتصالات API:');
    const workingAPIs = this.results.apiConnections.filter(a => a.accessible).length;
    const totalAPIs = this.results.apiConnections.length;
    console.log(`   APIs العاملة: ${workingAPIs}/${totalAPIs}`);
    console.log(`   معدل النجاح: ${((workingAPIs / totalAPIs) * 100).toFixed(1)}%`);
    
    // التقييم العام
    console.log('\n🎯 التقييم العام:');
    const overallScore = (
      (this.results.frontend.accessible ? 25 : 0) +
      (this.results.backend.accessible ? 25 : 0) +
      ((accessiblePages / totalPages) * 25) +
      ((workingAPIs / totalAPIs) * 25)
    );
    
    console.log(`النتيجة الإجمالية: ${overallScore.toFixed(1)}/100`);
    
    if (overallScore >= 90) {
      console.log('🎉 ممتاز! الواجهات تعمل بشكل مثالي');
    } else if (overallScore >= 70) {
      console.log('✅ جيد، مع بعض المشاكل البسيطة');
    } else if (overallScore >= 50) {
      console.log('⚠️ يحتاج تحسين، هناك مشاكل متوسطة');
    } else {
      console.log('❌ يحتاج عمل كبير، مشاكل جدية');
    }
    
    // التوصيات
    console.log('\n💡 التوصيات:');
    if (!this.results.frontend.accessible) {
      console.log('   - تشغيل Frontend server');
    }
    if (!this.results.backend.accessible) {
      console.log('   - تشغيل Backend server');
    }
    if (accessiblePages < totalPages) {
      console.log('   - إصلاح الصفحات غير المتاحة');
    }
    if (workingAPIs < totalAPIs) {
      console.log('   - إصلاح اتصالات API المعطلة');
    }
    
    // حفظ التقرير
    const reportPath = `ui-basic-report-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الفحص
if (require.main === module) {
  const checker = new UIBasicCheck();
  checker.runBasicCheck().catch(console.error);
}

module.exports = UIBasicCheck;
