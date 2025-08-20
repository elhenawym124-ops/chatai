/**
 * Reports Pages Comprehensive Check
 * 
 * فحص شامل لصفحات التقارير والتحليلات المتقدمة
 * يتحقق من وجود جميع العناصر والمكونات والبيانات
 */

const axios = require('axios');

class ReportsPagesCheck {
  constructor() {
    this.frontendURL = 'http://localhost:3000';
    this.backendURL = 'http://localhost:3002';
    this.results = {
      pages: [],
      components: [],
      dataFlow: [],
      apis: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  async checkReportsPage(pagePath, expectedElements = []) {
    console.log(`📊 فحص صفحة التقارير: ${pagePath}`);
    
    try {
      const response = await axios.get(`${this.frontendURL}${pagePath}`, {
        timeout: 15000,
        validateStatus: () => true
      });
      
      const pageResult = {
        path: pagePath,
        status: response.status,
        accessible: response.status === 200,
        hasContent: response.data && response.data.length > 0,
        contentLength: response.data ? response.data.length : 0,
        elements: []
      };
      
      // فحص العناصر المتوقعة في المحتوى
      if (response.data) {
        const content = response.data.toLowerCase();
        
        // العناصر الأساسية للتقارير
        const basicElements = [
          'تقارير', 'إحصائيات', 'chart', 'graph', 'dashboard',
          'مبيعات', 'عملاء', 'محادثات', 'منتجات', 'أداء'
        ];
        
        basicElements.forEach(element => {
          const found = content.includes(element.toLowerCase());
          pageResult.elements.push({
            element,
            found,
            type: 'basic'
          });
        });
        
        // العناصر المخصصة
        expectedElements.forEach(element => {
          const found = content.includes(element.toLowerCase());
          pageResult.elements.push({
            element,
            found,
            type: 'expected'
          });
        });
      }
      
      const foundElements = pageResult.elements.filter(e => e.found).length;
      const totalElements = pageResult.elements.length;
      const successRate = totalElements > 0 ? (foundElements / totalElements) * 100 : 0;
      
      pageResult.successRate = successRate;
      pageResult.passed = pageResult.accessible && successRate >= 70;
      
      console.log(`   ${pageResult.passed ? '✅' : '❌'} ${pagePath}: ${response.status} (${successRate.toFixed(1)}% عناصر)`);
      
      if (pageResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.pages.push(pageResult);
      this.results.summary.total++;
      
      return pageResult;
    } catch (error) {
      console.log(`   ❌ خطأ في فحص ${pagePath}: ${error.message}`);
      
      const pageResult = {
        path: pagePath,
        status: 'error',
        accessible: false,
        error: error.message,
        passed: false
      };
      
      this.results.pages.push(pageResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return pageResult;
    }
  }

  async checkReportsAPI(endpoint, name, expectedFields = []) {
    console.log(`🔗 فحص API التقارير: ${name}`);
    
    try {
      const response = await axios.get(`${this.backendURL}${endpoint}`, {
        timeout: 10000,
        validateStatus: () => true
      });
      
      const apiResult = {
        name,
        endpoint,
        status: response.status,
        accessible: response.status === 200,
        hasData: response.data && Object.keys(response.data).length > 0,
        dataStructure: {},
        fields: []
      };
      
      if (response.data) {
        // فحص بنية البيانات
        apiResult.dataStructure = {
          hasSuccess: !!response.data.success,
          hasData: !!response.data.data,
          hasError: !!response.data.error,
          dataType: Array.isArray(response.data.data) ? 'array' : typeof response.data.data
        };
        
        // فحص الحقول المتوقعة
        expectedFields.forEach(field => {
          const found = this.hasNestedProperty(response.data, field);
          apiResult.fields.push({
            field,
            found,
            type: 'expected'
          });
        });
      }
      
      const foundFields = apiResult.fields.filter(f => f.found).length;
      const totalFields = apiResult.fields.length;
      const fieldSuccessRate = totalFields > 0 ? (foundFields / totalFields) * 100 : 100;
      
      apiResult.fieldSuccessRate = fieldSuccessRate;
      apiResult.passed = apiResult.accessible && fieldSuccessRate >= 80;
      
      console.log(`   ${apiResult.passed ? '✅' : '❌'} ${name}: ${response.status} (${fieldSuccessRate.toFixed(1)}% حقول)`);
      
      if (apiResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.apis.push(apiResult);
      this.results.summary.total++;
      
      return apiResult;
    } catch (error) {
      console.log(`   ❌ خطأ في API ${name}: ${error.message}`);
      
      const apiResult = {
        name,
        endpoint,
        status: 'error',
        accessible: false,
        error: error.message,
        passed: false
      };
      
      this.results.apis.push(apiResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return apiResult;
    }
  }

  async checkReportsDataFlow(name, description, testFunction) {
    console.log(`📈 فحص تدفق بيانات التقارير: ${name}`);
    
    try {
      const result = await testFunction();
      
      const dataFlowResult = {
        name,
        description,
        passed: result.success,
        details: result.details || {},
        message: result.message || ''
      };
      
      console.log(`   ${dataFlowResult.passed ? '✅' : '❌'} ${name}: ${result.message}`);
      
      if (dataFlowResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.dataFlow.push(dataFlowResult);
      this.results.summary.total++;
      
      return dataFlowResult;
    } catch (error) {
      console.log(`   ❌ خطأ في تدفق البيانات ${name}: ${error.message}`);
      
      const dataFlowResult = {
        name,
        description,
        passed: false,
        error: error.message
      };
      
      this.results.dataFlow.push(dataFlowResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return dataFlowResult;
    }
  }

  hasNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj) !== undefined;
  }

  async runReportsCheck() {
    console.log('📊 بدء فحص صفحات التقارير الشامل...\n');
    
    // 1. فحص صفحات التقارير
    console.log('📄 فحص صفحات التقارير:');
    
    await this.checkReportsPage('/reports', [
      'تقرير المبيعات', 'تقرير العملاء', 'تقرير المحادثات', 
      'تقرير المنتجات', 'تقرير الأداء', 'تحليل', 'إحصائيات'
    ]);
    
    await this.checkReportsPage('/reports/advanced', [
      'تحليل متقدم', 'مؤشرات الأداء', 'تحليل المشاعر', 
      'سلوك العملاء', 'تحليل البيانات', 'kpi', 'analytics'
    ]);
    
    console.log('');
    
    // 2. فحص APIs التقارير
    console.log('🔗 فحص APIs التقارير:');
    
    await this.checkReportsAPI('/api/v1/reports/sales', 'تقارير المبيعات', [
      'success', 'data', 'data.revenue', 'data.orders', 'data.growth'
    ]);
    
    await this.checkReportsAPI('/api/v1/reports/customers', 'تقارير العملاء', [
      'success', 'data', 'data.newCustomers', 'data.segments', 'data.retention'
    ]);
    
    await this.checkReportsAPI('/api/v1/reports/conversations', 'تقارير المحادثات', [
      'success', 'data', 'data.totalConversations', 'data.responseTime', 'data.satisfaction'
    ]);
    
    await this.checkReportsAPI('/api/v1/reports/products', 'تقارير المنتجات', [
      'success', 'data', 'data.topProducts', 'data.categories', 'data.inventory'
    ]);
    
    await this.checkReportsAPI('/api/v1/analytics/dashboard', 'لوحة التحليلات', [
      'success', 'data', 'data.overview', 'data.trends', 'data.kpis'
    ]);
    
    console.log('');
    
    // 3. فحص تدفق بيانات التقارير
    console.log('📈 فحص تدفق بيانات التقارير:');
    
    await this.checkReportsDataFlow('بيانات المبيعات', 'فحص اكتمال بيانات المبيعات', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/reports/sales`);
      
      const hasCompleteData = response.data && 
                             response.data.success && 
                             response.data.data &&
                             response.data.data.revenue !== undefined &&
                             response.data.data.orders !== undefined;
      
      return {
        success: hasCompleteData,
        message: hasCompleteData ? 'بيانات المبيعات مكتملة' : 'بيانات المبيعات ناقصة',
        details: {
          hasRevenue: response.data?.data?.revenue !== undefined,
          hasOrders: response.data?.data?.orders !== undefined,
          hasGrowth: response.data?.data?.growth !== undefined
        }
      };
    });
    
    await this.checkReportsDataFlow('تحليل العملاء', 'فحص تحليل بيانات العملاء', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/reports/customers`);
      
      const hasAnalytics = response.data && 
                          response.data.success && 
                          response.data.data &&
                          response.data.data.segments;
      
      return {
        success: hasAnalytics,
        message: hasAnalytics ? 'تحليل العملاء متوفر' : 'تحليل العملاء غير متوفر',
        details: {
          hasSegments: !!response.data?.data?.segments,
          hasRetention: !!response.data?.data?.retention,
          hasNewCustomers: !!response.data?.data?.newCustomers
        }
      };
    });
    
    await this.checkReportsDataFlow('مؤشرات الأداء', 'فحص مؤشرات الأداء الرئيسية', async () => {
      const response = await axios.get(`${this.backendURL}/api/v1/analytics/dashboard`);
      
      const hasKPIs = response.data && 
                     response.data.success && 
                     response.data.data &&
                     response.data.data.kpis;
      
      return {
        success: hasKPIs,
        message: hasKPIs ? 'مؤشرات الأداء متوفرة' : 'مؤشرات الأداء غير متوفرة',
        details: {
          hasKPIs: !!response.data?.data?.kpis,
          hasOverview: !!response.data?.data?.overview,
          hasTrends: !!response.data?.data?.trends
        }
      };
    });
    
    console.log('');
    
    // 4. إنشاء التقرير
    this.generateReportsReport();
  }

  generateReportsReport() {
    console.log('📊 تقرير فحص صفحات التقارير:');
    console.log('=' * 50);
    
    const successRate = (this.results.summary.passed / this.results.summary.total) * 100;
    
    console.log(`إجمالي الفحوصات: ${this.results.summary.total}`);
    console.log(`الفحوصات الناجحة: ${this.results.summary.passed}`);
    console.log(`الفحوصات الفاشلة: ${this.results.summary.failed}`);
    console.log(`معدل النجاح: ${successRate.toFixed(1)}%`);
    
    // تفاصيل الصفحات
    console.log('\n📄 الصفحات:');
    const workingPages = this.results.pages.filter(p => p.passed).length;
    console.log(`   الصفحات العاملة: ${workingPages}/${this.results.pages.length}`);
    
    // تفاصيل APIs
    console.log('\n🔗 APIs التقارير:');
    const workingAPIs = this.results.apis.filter(a => a.passed).length;
    console.log(`   APIs العاملة: ${workingAPIs}/${this.results.apis.length}`);
    
    // تفاصيل تدفق البيانات
    console.log('\n📈 تدفق البيانات:');
    const workingDataFlow = this.results.dataFlow.filter(d => d.passed).length;
    console.log(`   تدفق البيانات العامل: ${workingDataFlow}/${this.results.dataFlow.length}`);
    
    // التقييم العام
    console.log('\n🎯 التقييم العام:');
    if (successRate >= 90) {
      console.log('🎉 ممتاز! صفحات التقارير تعمل بشكل مثالي');
    } else if (successRate >= 75) {
      console.log('✅ جيد جداً، مع بعض المشاكل البسيطة');
    } else if (successRate >= 60) {
      console.log('⚠️ مقبول، يحتاج بعض التحسينات');
    } else {
      console.log('❌ يحتاج عمل كبير لتحسين صفحات التقارير');
    }
    
    // حفظ التقرير
    const reportPath = `reports-check-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الفحص
if (require.main === module) {
  const checker = new ReportsPagesCheck();
  checker.runReportsCheck().catch(console.error);
}

module.exports = ReportsPagesCheck;
