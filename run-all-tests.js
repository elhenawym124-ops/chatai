#!/usr/bin/env node

/**
 * تشغيل جميع اختبارات نظام التعلم المستمر
 * 
 * يشغل جميع الاختبارات ويقدم تقرير شامل عن النتائج
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ألوان للتقرير
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, total: 0, time: 0 },
      frontend: { passed: 0, failed: 0, total: 0, time: 0 },
      performance: { passed: 0, failed: 0, total: 0, time: 0 },
      integration: { passed: 0, failed: 0, total: 0, time: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const child = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          code,
          stdout,
          stderr,
          duration
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  parseTestResults(output) {
    const results = { passed: 0, failed: 0, total: 0 };
    
    // تحليل نتائج Jest
    const jestMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (jestMatch) {
      results.failed = parseInt(jestMatch[1]);
      results.passed = parseInt(jestMatch[2]);
      results.total = parseInt(jestMatch[3]);
      return results;
    }

    // تحليل نتائج أخرى
    const passedMatch = output.match(/(\d+)\s+passing/);
    const failedMatch = output.match(/(\d+)\s+failing/);
    
    if (passedMatch) results.passed = parseInt(passedMatch[1]);
    if (failedMatch) results.failed = parseInt(failedMatch[1]);
    results.total = results.passed + results.failed;

    return results;
  }

  async runBackendTests() {
    this.log('\n🔧 تشغيل اختبارات Backend...', 'blue');
    
    try {
      const result = await this.runCommand('npm', ['test'], './backend');
      const testResults = this.parseTestResults(result.stdout);
      
      this.results.backend = {
        ...testResults,
        time: result.duration
      };

      if (result.code === 0) {
        this.log(`✅ اختبارات Backend مكتملة: ${testResults.passed}/${testResults.total} نجح`, 'green');
      } else {
        this.log(`❌ اختبارات Backend فشلت: ${testResults.failed}/${testResults.total} فشل`, 'red');
      }
    } catch (error) {
      this.log(`❌ خطأ في تشغيل اختبارات Backend: ${error.message}`, 'red');
      this.results.backend.failed = 1;
      this.results.backend.total = 1;
    }
  }

  async runFrontendTests() {
    this.log('\n💻 تشغيل اختبارات Frontend...', 'blue');
    
    try {
      const result = await this.runCommand('npm', ['test', '--', '--watchAll=false'], './frontend');
      const testResults = this.parseTestResults(result.stdout);
      
      this.results.frontend = {
        ...testResults,
        time: result.duration
      };

      if (result.code === 0) {
        this.log(`✅ اختبارات Frontend مكتملة: ${testResults.passed}/${testResults.total} نجح`, 'green');
      } else {
        this.log(`❌ اختبارات Frontend فشلت: ${testResults.failed}/${testResults.total} فشل`, 'red');
      }
    } catch (error) {
      this.log(`❌ خطأ في تشغيل اختبارات Frontend: ${error.message}`, 'red');
      this.results.frontend.failed = 1;
      this.results.frontend.total = 1;
    }
  }

  async runPerformanceTests() {
    this.log('\n🚀 تشغيل اختبارات الأداء...', 'blue');
    
    try {
      const result = await this.runCommand('npm', ['run', 'test:performance'], './backend');
      const testResults = this.parseTestResults(result.stdout);
      
      this.results.performance = {
        ...testResults,
        time: result.duration
      };

      if (result.code === 0) {
        this.log(`✅ اختبارات الأداء مكتملة: ${testResults.passed}/${testResults.total} نجح`, 'green');
      } else {
        this.log(`❌ اختبارات الأداء فشلت: ${testResults.failed}/${testResults.total} فشل`, 'red');
      }
    } catch (error) {
      this.log(`❌ خطأ في تشغيل اختبارات الأداء: ${error.message}`, 'red');
      this.results.performance.failed = 1;
      this.results.performance.total = 1;
    }
  }

  async runIntegrationTests() {
    this.log('\n🔗 تشغيل اختبارات التكامل...', 'blue');
    
    try {
      const result = await this.runCommand('npm', ['run', 'test:integration'], './backend');
      const testResults = this.parseTestResults(result.stdout);
      
      this.results.integration = {
        ...testResults,
        time: result.duration
      };

      if (result.code === 0) {
        this.log(`✅ اختبارات التكامل مكتملة: ${testResults.passed}/${testResults.total} نجح`, 'green');
      } else {
        this.log(`❌ اختبارات التكامل فشلت: ${testResults.failed}/${testResults.total} فشل`, 'red');
      }
    } catch (error) {
      this.log(`❌ خطأ في تشغيل اختبارات التكامل: ${error.message}`, 'red');
      this.results.integration.failed = 1;
      this.results.integration.total = 1;
    }
  }

  generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    
    this.log('\n' + '='.repeat(60), 'cyan');
    this.log('📊 تقرير الاختبارات الشامل - نظام التعلم المستمر', 'cyan');
    this.log('='.repeat(60), 'cyan');

    // حساب الإجماليات
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;

    Object.values(this.results).forEach(result => {
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
    });

    // عرض النتائج لكل فئة
    this.log('\n📋 نتائج الاختبارات:', 'bright');
    
    Object.entries(this.results).forEach(([category, result]) => {
      const categoryName = {
        backend: 'Backend API',
        frontend: 'Frontend UI',
        performance: 'الأداء',
        integration: 'التكامل'
      }[category];

      const status = result.failed === 0 ? '✅' : '❌';
      const color = result.failed === 0 ? 'green' : 'red';
      
      this.log(`${status} ${categoryName}: ${result.passed}/${result.total} نجح (${(result.time/1000).toFixed(1)}s)`, color);
    });

    // الملخص العام
    this.log('\n📊 الملخص العام:', 'bright');
    this.log(`إجمالي الاختبارات: ${totalTests}`, 'cyan');
    this.log(`نجح: ${totalPassed}`, 'green');
    this.log(`فشل: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
    this.log(`معدل النجاح: ${totalTests > 0 ? ((totalPassed/totalTests)*100).toFixed(1) : 0}%`, totalFailed === 0 ? 'green' : 'yellow');
    this.log(`الوقت الإجمالي: ${(totalTime/1000).toFixed(1)} ثانية`, 'cyan');

    // التوصيات
    this.log('\n💡 التوصيات:', 'bright');
    
    if (totalFailed === 0) {
      this.log('🎉 ممتاز! جميع الاختبارات نجحت. النظام جاهز للنشر.', 'green');
    } else {
      this.log('⚠️  يوجد اختبارات فاشلة. يرجى مراجعة الأخطاء قبل النشر.', 'yellow');
      
      Object.entries(this.results).forEach(([category, result]) => {
        if (result.failed > 0) {
          this.log(`   - راجع اختبارات ${category}`, 'red');
        }
      });
    }

    // معلومات إضافية
    this.log('\n📈 إحصائيات الأداء:', 'bright');
    this.log(`متوسط وقت الاختبار: ${(totalTime/4/1000).toFixed(1)} ثانية لكل فئة`, 'cyan');
    
    if (this.results.performance.total > 0) {
      this.log(`اختبارات الأداء: ${this.results.performance.passed}/${this.results.performance.total}`, 'cyan');
    }

    this.log('\n' + '='.repeat(60), 'cyan');
    
    return totalFailed === 0;
  }

  async run() {
    this.log('🚀 بدء تشغيل جميع اختبارات نظام التعلم المستمر...', 'bright');
    this.log(`⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`, 'cyan');

    // تشغيل جميع الاختبارات
    await this.runBackendTests();
    await this.runFrontendTests();
    await this.runPerformanceTests();
    await this.runIntegrationTests();

    // إنشاء التقرير
    const allPassed = this.generateReport();

    // حفظ التقرير في ملف
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        totalPassed: Object.values(this.results).reduce((sum, r) => sum + r.passed, 0),
        totalFailed: Object.values(this.results).reduce((sum, r) => sum + r.failed, 0),
        totalTests: Object.values(this.results).reduce((sum, r) => sum + r.total, 0),
        totalTime: Date.now() - this.startTime,
        allPassed
      }
    };

    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    this.log('\n💾 تم حفظ التقرير في test-report.json', 'cyan');

    // إنهاء البرنامج
    process.exit(allPassed ? 0 : 1);
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('❌ خطأ في تشغيل الاختبارات:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
