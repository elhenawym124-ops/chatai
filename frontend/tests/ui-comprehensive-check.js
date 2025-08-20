/**
 * UI Comprehensive Check
 * 
 * فحص شامل لجميع صفحات الواجهة الأمامية
 * يتحقق من وجود العناصر الأساسية والتنقل والوظائف
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class UIComprehensiveCheck {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.results = {
      pages: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      },
      issues: []
    };
  }

  async init() {
    console.log('🚀 بدء فحص الواجهات الشامل...\n');
    
    this.browser = await puppeteer.launch({
      headless: false, // عرض المتصفح للمراقبة
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // إعداد معالج الأخطاء
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    this.page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });
  }

  async checkPage(pageName, url, expectedElements = []) {
    console.log(`📄 فحص صفحة: ${pageName}`);
    
    const pageResult = {
      name: pageName,
      url: url,
      status: 'unknown',
      loadTime: 0,
      elements: [],
      issues: [],
      screenshot: null
    };

    try {
      const startTime = Date.now();
      
      // الانتقال للصفحة
      await this.page.goto(`${this.baseURL}${url}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      pageResult.loadTime = Date.now() - startTime;
      
      // انتظار تحميل React
      await this.page.waitForSelector('body', { timeout: 10000 });
      await this.page.waitForTimeout(2000); // انتظار إضافي للتأكد
      
      // فحص العناصر الأساسية
      const basicElements = [
        'header', 'nav', 'main', 'body',
        '[data-testid]', '.container', '.page-content'
      ];
      
      for (const selector of basicElements) {
        try {
          const element = await this.page.$(selector);
          pageResult.elements.push({
            selector,
            found: !!element,
            type: 'basic'
          });
        } catch (error) {
          pageResult.elements.push({
            selector,
            found: false,
            type: 'basic',
            error: error.message
          });
        }
      }
      
      // فحص العناصر المخصصة للصفحة
      for (const selector of expectedElements) {
        try {
          const element = await this.page.$(selector);
          pageResult.elements.push({
            selector,
            found: !!element,
            type: 'expected'
          });
          
          if (!element) {
            pageResult.issues.push(`عنصر مفقود: ${selector}`);
          }
        } catch (error) {
          pageResult.elements.push({
            selector,
            found: false,
            type: 'expected',
            error: error.message
          });
          pageResult.issues.push(`خطأ في العنصر ${selector}: ${error.message}`);
        }
      }
      
      // فحص الأخطاء في الكونسول
      const logs = await this.page.evaluate(() => {
        return window.console.errors || [];
      });
      
      if (logs.length > 0) {
        pageResult.issues.push(`أخطاء في الكونسول: ${logs.length}`);
      }
      
      // أخذ لقطة شاشة
      const screenshotPath = `screenshots/${pageName.replace(/\s+/g, '-')}.png`;
      await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      pageResult.screenshot = screenshotPath;
      
      // تحديد حالة الصفحة
      const foundElements = pageResult.elements.filter(e => e.found).length;
      const totalElements = pageResult.elements.length;
      const successRate = (foundElements / totalElements) * 100;
      
      if (successRate >= 90) {
        pageResult.status = 'passed';
        this.results.summary.passed++;
      } else if (successRate >= 70) {
        pageResult.status = 'warning';
        this.results.summary.warnings++;
      } else {
        pageResult.status = 'failed';
        this.results.summary.failed++;
      }
      
      console.log(`   ✅ تم تحميل الصفحة في ${pageResult.loadTime}ms`);
      console.log(`   📊 العناصر الموجودة: ${foundElements}/${totalElements} (${successRate.toFixed(1)}%)`);
      
      if (pageResult.issues.length > 0) {
        console.log(`   ⚠️ مشاكل: ${pageResult.issues.length}`);
        pageResult.issues.forEach(issue => console.log(`      - ${issue}`));
      }
      
    } catch (error) {
      pageResult.status = 'failed';
      pageResult.issues.push(`خطأ في تحميل الصفحة: ${error.message}`);
      this.results.summary.failed++;
      console.log(`   ❌ فشل في تحميل الصفحة: ${error.message}`);
    }
    
    this.results.pages.push(pageResult);
    this.results.summary.total++;
    console.log('');
  }

  async runComprehensiveCheck() {
    await this.init();
    
    // إنشاء مجلد لقطات الشاشة
    const screenshotsDir = 'screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // قائمة الصفحات للفحص
    const pagesToCheck = [
      {
        name: 'لوحة التحكم',
        url: '/dashboard',
        elements: [
          '.stat-card', '.chart-container', '.recent-activity',
          'h1', '.welcome-header', '.stats-grid'
        ]
      },
      {
        name: 'إدارة العملاء',
        url: '/customers',
        elements: [
          '.customer-list', '.search-input', '.filter-button',
          '.add-customer-btn', '.customer-card', 'table'
        ]
      },
      {
        name: 'المحادثات',
        url: '/conversations',
        elements: [
          '.conversation-list', '.chat-window', '.message-input',
          '.send-button', '.conversation-item', '.message-bubble'
        ]
      },
      {
        name: 'إدارة المنتجات',
        url: '/products',
        elements: [
          '.product-grid', '.product-card', '.add-product-btn',
          '.search-input', '.filter-options', '.product-image'
        ]
      },
      {
        name: 'الطلبات',
        url: '/orders',
        elements: [
          '.orders-table', '.order-status', '.order-details',
          '.filter-dropdown', '.export-button'
        ]
      },
      {
        name: 'التقارير',
        url: '/reports',
        elements: [
          '.report-card', '.chart-container', '.date-picker',
          '.export-options', '.kpi-widget'
        ]
      },
      {
        name: 'الإعدادات',
        url: '/settings',
        elements: [
          '.settings-nav', '.settings-form', '.save-button',
          '.settings-section', '.toggle-switch'
        ]
      }
    ];
    
    // فحص كل صفحة
    for (const pageInfo of pagesToCheck) {
      await this.checkPage(pageInfo.name, pageInfo.url, pageInfo.elements);
      await this.page.waitForTimeout(1000); // انتظار بين الصفحات
    }
    
    await this.generateReport();
    await this.cleanup();
  }

  async generateReport() {
    console.log('📊 إنشاء التقرير الشامل...\n');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      pages: this.results.pages,
      recommendations: this.generateRecommendations()
    };
    
    // حفظ التقرير
    const reportPath = `ui-comprehensive-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // طباعة الملخص
    console.log('🎯 ملخص فحص الواجهات:');
    console.log('=' * 50);
    console.log(`إجمالي الصفحات: ${this.results.summary.total}`);
    console.log(`الصفحات الناجحة: ${this.results.summary.passed}`);
    console.log(`تحذيرات: ${this.results.summary.warnings}`);
    console.log(`فشل: ${this.results.summary.failed}`);
    
    const successRate = (this.results.summary.passed / this.results.summary.total) * 100;
    console.log(`معدل النجاح: ${successRate.toFixed(1)}%`);
    
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.failed > 0) {
      recommendations.push('إصلاح الصفحات الفاشلة أولوية عالية');
    }
    
    if (this.results.summary.warnings > 0) {
      recommendations.push('مراجعة الصفحات التي تحتوي على تحذيرات');
    }
    
    // فحص أوقات التحميل
    const slowPages = this.results.pages.filter(p => p.loadTime > 3000);
    if (slowPages.length > 0) {
      recommendations.push(`تحسين أداء ${slowPages.length} صفحة بطيئة التحميل`);
    }
    
    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// تشغيل الفحص
if (require.main === module) {
  const checker = new UIComprehensiveCheck();
  checker.runComprehensiveCheck().catch(console.error);
}

module.exports = UIComprehensiveCheck;
