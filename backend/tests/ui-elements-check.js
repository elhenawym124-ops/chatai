/**
 * UI Elements and Buttons Comprehensive Check
 * 
 * فحص شامل لجميع العناصر والأزرار التفاعلية
 * يتحقق من وجود الأزرار والنماذج والعناصر التفاعلية في جميع الصفحات
 */

const axios = require('axios');

class UIElementsCheck {
  constructor() {
    this.frontendURL = 'http://localhost:3000';
    this.results = {
      pages: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        totalElements: 0,
        foundElements: 0
      }
    };
  }

  async checkPageElements(pagePath, expectedElements = []) {
    console.log(`🔍 فحص عناصر الصفحة: ${pagePath}`);
    
    try {
      const response = await axios.get(`${this.frontendURL}${pagePath}`, {
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const pageResult = {
        path: pagePath,
        status: response.status,
        accessible: response.status === 200,
        elements: [],
        buttons: [],
        forms: [],
        interactive: []
      };
      
      if (response.data && response.status === 200) {
        const content = response.data.toLowerCase();
        
        // فحص الأزرار الأساسية
        const basicButtons = [
          'button', 'btn', 'submit', 'save', 'cancel', 'delete', 'edit',
          'add', 'create', 'update', 'search', 'filter', 'export', 'print'
        ];
        
        basicButtons.forEach(button => {
          const found = content.includes(`${button}`) || 
                       content.includes(`class="${button}"`) ||
                       content.includes(`class=".*${button}.*"`);
          pageResult.buttons.push({
            element: button,
            found,
            type: 'button'
          });
        });
        
        // فحص النماذج
        const formElements = [
          'form', 'input', 'textarea', 'select', 'option', 'checkbox', 'radio'
        ];
        
        formElements.forEach(element => {
          const found = content.includes(`<${element}`) || content.includes(`${element}`);
          pageResult.forms.push({
            element,
            found,
            type: 'form'
          });
        });
        
        // فحص العناصر التفاعلية
        const interactiveElements = [
          'onclick', 'onchange', 'onsubmit', 'href', 'link', 'modal', 
          'dropdown', 'tab', 'accordion', 'tooltip', 'popup'
        ];
        
        interactiveElements.forEach(element => {
          const found = content.includes(element);
          pageResult.interactive.push({
            element,
            found,
            type: 'interactive'
          });
        });
        
        // فحص العناصر المخصصة للصفحة
        expectedElements.forEach(element => {
          const found = content.includes(element.toLowerCase());
          pageResult.elements.push({
            element,
            found,
            type: 'expected'
          });
        });
      }
      
      // حساب النتائج
      const allElements = [
        ...pageResult.buttons,
        ...pageResult.forms,
        ...pageResult.interactive,
        ...pageResult.elements
      ];
      
      const foundElements = allElements.filter(e => e.found).length;
      const totalElements = allElements.length;
      const successRate = totalElements > 0 ? (foundElements / totalElements) * 100 : 0;
      
      pageResult.successRate = successRate;
      pageResult.totalElements = totalElements;
      pageResult.foundElements = foundElements;
      pageResult.passed = pageResult.accessible && successRate >= 30; // 30% threshold for basic functionality
      
      console.log(`   ${pageResult.passed ? '✅' : '❌'} ${pagePath}: ${foundElements}/${totalElements} عناصر (${successRate.toFixed(1)}%)`);
      
      if (pageResult.passed) {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
      
      this.results.summary.totalElements += totalElements;
      this.results.summary.foundElements += foundElements;
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
        passed: false,
        totalElements: 0,
        foundElements: 0
      };
      
      this.results.pages.push(pageResult);
      this.results.summary.total++;
      this.results.summary.failed++;
      
      return pageResult;
    }
  }

  async runUIElementsCheck() {
    console.log('🔍 بدء فحص العناصر والأزرار الشامل...\n');
    
    // قائمة الصفحات مع العناصر المتوقعة
    const pagesToCheck = [
      {
        path: '/dashboard',
        elements: ['إحصائيات', 'رسوم بيانية', 'نشاط حديث', 'مؤشرات أداء']
      },
      {
        path: '/customers',
        elements: ['إضافة عميل', 'بحث', 'فلترة', 'تصدير', 'جدول العملاء']
      },
      {
        path: '/conversations',
        elements: ['رسائل', 'محادثات', 'إرسال', 'مرفقات', 'ردود سريعة']
      },
      {
        path: '/products',
        elements: ['إضافة منتج', 'فئات', 'مخزون', 'أسعار', 'صور']
      },
      {
        path: '/orders',
        elements: ['طلبات', 'حالة', 'شحن', 'دفع', 'فواتير']
      },
      {
        path: '/reports',
        elements: ['تقارير', 'إحصائيات', 'تحليل', 'تصدير', 'فترة زمنية']
      },
      {
        path: '/analytics',
        elements: ['تحليلات', 'مؤشرات', 'اتجاهات', 'مقارنات', 'رسوم بيانية']
      },
      {
        path: '/prompts',
        elements: ['برومبت', 'إعدادات', 'تخصيص', 'حفظ', 'اختبار']
      },
      {
        path: '/smart-responses',
        elements: ['ردود ذكية', 'تلقائي', 'تفعيل', 'إعدادات', 'قوالب']
      },
      {
        path: '/sentiment',
        elements: ['تحليل المشاعر', 'إيجابي', 'سلبي', 'محايد', 'تقييم']
      },
      {
        path: '/recommendations',
        elements: ['اقتراحات', 'منتجات', 'خوارزمية', 'تخصيص', 'فعالية']
      },
      {
        path: '/learning',
        elements: ['تعلم مستمر', 'تحسين', 'بيانات', 'نماذج', 'أداء']
      },
      {
        path: '/training',
        elements: ['تدريب', 'نماذج', 'بيانات', 'دقة', 'تحديث']
      },
      {
        path: '/appointments',
        elements: ['مواعيد', 'جدولة', 'تقويم', 'تذكير', 'إلغاء']
      },
      {
        path: '/tasks',
        elements: ['مهام', 'إنجاز', 'أولوية', 'موعد نهائي', 'تعيين']
      },
      {
        path: '/reminders',
        elements: ['تذكيرات', 'جدولة', 'تكرار', 'إشعار', 'متابعة']
      },
      {
        path: '/notification-settings',
        elements: ['إعدادات إشعارات', 'تخصيص', 'قنوات', 'تفضيلات', 'تفعيل']
      },
      {
        path: '/settings',
        elements: ['إعدادات', 'حفظ', 'إعادة تعيين', 'تخصيص', 'تفضيلات']
      }
    ];
    
    // فحص كل صفحة
    for (const pageInfo of pagesToCheck) {
      await this.checkPageElements(pageInfo.path, pageInfo.elements);
    }
    
    console.log('');
    this.generateUIElementsReport();
  }

  generateUIElementsReport() {
    console.log('🔍 تقرير فحص العناصر والأزرار:');
    console.log('=' * 60);
    
    const successRate = (this.results.summary.passed / this.results.summary.total) * 100;
    const elementsRate = (this.results.summary.foundElements / this.results.summary.totalElements) * 100;
    
    console.log(`إجمالي الصفحات: ${this.results.summary.total}`);
    console.log(`الصفحات الناجحة: ${this.results.summary.passed}`);
    console.log(`الصفحات الفاشلة: ${this.results.summary.failed}`);
    console.log(`معدل نجاح الصفحات: ${successRate.toFixed(1)}%`);
    console.log(`إجمالي العناصر: ${this.results.summary.totalElements}`);
    console.log(`العناصر الموجودة: ${this.results.summary.foundElements}`);
    console.log(`معدل وجود العناصر: ${elementsRate.toFixed(1)}%`);
    
    // تفاصيل الصفحات
    console.log('\n📄 تفاصيل الصفحات:');
    this.results.pages.forEach(page => {
      const status = page.passed ? '✅' : '❌';
      console.log(`   ${status} ${page.path}: ${page.foundElements || 0}/${page.totalElements || 0} عناصر (${page.successRate?.toFixed(1) || 0}%)`);
    });
    
    // أفضل الصفحات
    console.log('\n🏆 أفضل الصفحات (أعلى معدل عناصر):');
    const topPages = this.results.pages
      .filter(p => p.passed)
      .sort((a, b) => (b.successRate || 0) - (a.successRate || 0))
      .slice(0, 5);
    
    topPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.path}: ${page.successRate?.toFixed(1) || 0}%`);
    });
    
    // الصفحات التي تحتاج تحسين
    console.log('\n⚠️ الصفحات التي تحتاج تحسين:');
    const needImprovement = this.results.pages
      .filter(p => !p.passed || (p.successRate && p.successRate < 50))
      .sort((a, b) => (a.successRate || 0) - (b.successRate || 0));
    
    if (needImprovement.length > 0) {
      needImprovement.forEach(page => {
        console.log(`   - ${page.path}: ${page.successRate?.toFixed(1) || 0}%`);
      });
    } else {
      console.log('   لا توجد صفحات تحتاج تحسين! 🎉');
    }
    
    // التقييم العام
    console.log('\n🎯 التقييم العام:');
    if (successRate >= 90 && elementsRate >= 70) {
      console.log('🎉 ممتاز! جميع العناصر والأزرار تعمل بشكل مثالي');
    } else if (successRate >= 75 && elementsRate >= 50) {
      console.log('✅ جيد جداً، معظم العناصر موجودة وتعمل');
    } else if (successRate >= 60 && elementsRate >= 30) {
      console.log('⚠️ مقبول، يحتاج بعض التحسينات في العناصر');
    } else {
      console.log('❌ يحتاج عمل كبير لتحسين العناصر والأزرار');
    }
    
    // التوصيات
    console.log('\n💡 التوصيات:');
    if (successRate < 90) {
      console.log('   - إصلاح الصفحات غير المتاحة');
    }
    if (elementsRate < 70) {
      console.log('   - إضافة المزيد من العناصر التفاعلية');
      console.log('   - تحسين واجهة المستخدم والأزرار');
    }
    if (successRate >= 80 && elementsRate >= 60) {
      console.log('   - تحسين تجربة المستخدم للعناصر الموجودة');
      console.log('   - إضافة المزيد من الميزات التفاعلية');
      console.log('   - تحسين التصميم والاستجابة');
    }
    
    // حفظ التقرير
    const reportPath = `ui-elements-check-${Date.now()}.json`;
    require('fs').writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 تم حفظ التقرير في: ${reportPath}`);
  }
}

// تشغيل الفحص
if (require.main === module) {
  const checker = new UIElementsCheck();
  checker.runUIElementsCheck().catch(console.error);
}

module.exports = UIElementsCheck;
