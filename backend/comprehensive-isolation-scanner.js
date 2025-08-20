const fs = require('fs');
const path = require('path');

console.log('🔍 سكريبت كشف العزل الشامل - فحص جميع أنواع انتهاكات العزل\n');

class IsolationScanner {
  constructor() {
    this.results = {
      criticalIssues: [],
      warningIssues: [],
      suspiciousPatterns: [],
      goodPractices: [],
      filesScanned: 0,
      totalIssues: 0
    };
    
    // أنماط خطيرة تحتاج عزل فوري
    this.criticalPatterns = [
      {
        pattern: /await\s+\w*prisma\w*\.\w+\.(findMany|updateMany|deleteMany|count)\s*\(\s*\{[^}]*where\s*:\s*\{[^}]*\}/g,
        description: 'عمليات bulk بدون فحص companyId',
        severity: 'CRITICAL',
        check: (match, content, lineNum) => {
          const whereClause = match[0];
          return !whereClause.includes('companyId') && !whereClause.includes('company.');
        }
      },
      {
        pattern: /\$queryRaw`[^`]*`/g,
        description: 'استعلامات SQL خام بدون عزل',
        severity: 'CRITICAL',
        check: (match, content, lineNum) => {
          const query = match[0];
          return !query.includes('SELECT 1') && !query.includes('connection_test') && !query.includes('health_check');
        }
      },
      {
        pattern: /\$executeRaw`[^`]*`/g,
        description: 'تنفيذ SQL خام بدون عزل',
        severity: 'CRITICAL',
        check: (match, content, lineNum) => {
          const query = match[0];
          return !query.includes('FOREIGN_KEY_CHECKS') && !query.includes('TRUNCATE');
        }
      }
    ];
    
    // أنماط تحذيرية
    this.warningPatterns = [
      {
        pattern: /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*['"`]\s*,\s*(?!.*requireAuth|.*authenticate|.*companyIsolation)/g,
        description: 'API route بدون middleware عزل',
        severity: 'WARNING'
      },
      {
        pattern: /companyId\s*:\s*['"`][a-zA-Z0-9_-]+['"`]/g,
        description: 'companyId مُثبت في الكود',
        severity: 'WARNING'
      },
      {
        pattern: /findFirst\s*\(\s*\{[^}]*where[^}]*\}/g,
        description: 'findFirst بدون فحص companyId',
        severity: 'WARNING',
        check: (match, content, lineNum) => {
          const whereClause = match[0];
          return !whereClause.includes('companyId') && !whereClause.includes('company.');
        }
      }
    ];
    
    // أنماط مشبوهة
    this.suspiciousPatterns = [
      {
        pattern: /\.findUnique\s*\(\s*\{[^}]*where[^}]*id\s*:/g,
        description: 'findUnique بـ ID فقط - قد يحتاج عزل',
        severity: 'SUSPICIOUS'
      },
      {
        pattern: /req\.user\.companyId/g,
        description: 'استخدام companyId من المستخدم - جيد',
        severity: 'GOOD_PRACTICE'
      },
      {
        pattern: /where\s*:\s*\{[^}]*companyId/g,
        description: 'استخدام companyId في where - ممتاز',
        severity: 'GOOD_PRACTICE'
      }
    ];
  }
  
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.results.filesScanned++;
      
      // فحص الأنماط الخطيرة
      this.criticalPatterns.forEach(patternObj => {
        const matches = [...content.matchAll(patternObj.pattern)];
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          const lineContent = lines[lineNum - 1]?.trim();
          
          if (!patternObj.check || patternObj.check(match, content, lineNum)) {
            this.results.criticalIssues.push({
              file: relativePath,
              line: lineNum,
              content: lineContent,
              description: patternObj.description,
              severity: patternObj.severity,
              match: match[0].substring(0, 100)
            });
            this.results.totalIssues++;
          }
        });
      });
      
      // فحص أنماط التحذير
      this.warningPatterns.forEach(patternObj => {
        const matches = [...content.matchAll(patternObj.pattern)];
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          const lineContent = lines[lineNum - 1]?.trim();
          
          if (!patternObj.check || patternObj.check(match, content, lineNum)) {
            this.results.warningIssues.push({
              file: relativePath,
              line: lineNum,
              content: lineContent,
              description: patternObj.description,
              severity: patternObj.severity,
              match: match[0].substring(0, 100)
            });
            this.results.totalIssues++;
          }
        });
      });
      
      // فحص الأنماط المشبوهة والممارسات الجيدة
      this.suspiciousPatterns.forEach(patternObj => {
        const matches = [...content.matchAll(patternObj.pattern)];
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          const lineContent = lines[lineNum - 1]?.trim();
          
          if (patternObj.severity === 'GOOD_PRACTICE') {
            this.results.goodPractices.push({
              file: relativePath,
              line: lineNum,
              content: lineContent,
              description: patternObj.description,
              match: match[0].substring(0, 100)
            });
          } else {
            this.results.suspiciousPatterns.push({
              file: relativePath,
              line: lineNum,
              content: lineContent,
              description: patternObj.description,
              severity: patternObj.severity,
              match: match[0].substring(0, 100)
            });
          }
        });
      });
      
    } catch (error) {
      console.error(`❌ خطأ في فحص الملف ${filePath}:`, error.message);
    }
  }
  
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }
  
  scanDirectory(dirPath, extensions = ['.js', '.ts', '.jsx', '.tsx']) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // تجاهل مجلدات معينة
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          this.scanDirectory(fullPath, extensions);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          this.scanFile(fullPath);
        }
      }
    });
  }
  
  generateReport() {
    console.log('📊 تقرير فحص العزل الشامل');
    console.log('═'.repeat(70));
    console.log(`📁 ملفات مفحوصة: ${this.results.filesScanned}`);
    console.log(`🔴 مشاكل خطيرة: ${this.results.criticalIssues.length}`);
    console.log(`🟡 تحذيرات: ${this.results.warningIssues.length}`);
    console.log(`🟠 أنماط مشبوهة: ${this.results.suspiciousPatterns.length}`);
    console.log(`🟢 ممارسات جيدة: ${this.results.goodPractices.length}`);
    console.log(`📈 إجمالي المشاكل: ${this.results.totalIssues}`);
    
    // حساب نسبة الأمان
    const totalChecks = this.results.criticalIssues.length + this.results.warningIssues.length + this.results.goodPractices.length;
    const safetyScore = totalChecks > 0 ? Math.round((this.results.goodPractices.length / totalChecks) * 100) : 100;
    
    console.log(`🛡️  نسبة الأمان: ${safetyScore}%`);
    
    // عرض المشاكل الخطيرة
    if (this.results.criticalIssues.length > 0) {
      console.log('\n🔴 المشاكل الخطيرة:');
      console.log('═'.repeat(50));
      this.results.criticalIssues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. 📄 ${issue.file}:${issue.line}`);
        console.log(`   ❌ ${issue.description}`);
        console.log(`   💻 ${issue.content}`);
        console.log('   ' + '─'.repeat(60));
      });
      
      if (this.results.criticalIssues.length > 10) {
        console.log(`   ... و ${this.results.criticalIssues.length - 10} مشكلة أخرى`);
      }
    }
    
    // عرض التحذيرات
    if (this.results.warningIssues.length > 0) {
      console.log('\n🟡 التحذيرات:');
      console.log('═'.repeat(50));
      this.results.warningIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. 📄 ${issue.file}:${issue.line}`);
        console.log(`   ⚠️  ${issue.description}`);
        console.log(`   💻 ${issue.content}`);
        console.log('   ' + '─'.repeat(60));
      });
      
      if (this.results.warningIssues.length > 5) {
        console.log(`   ... و ${this.results.warningIssues.length - 5} تحذير آخر`);
      }
    }
    
    // عرض الممارسات الجيدة
    if (this.results.goodPractices.length > 0) {
      console.log('\n🟢 الممارسات الجيدة:');
      console.log('═'.repeat(50));
      console.log(`✅ تم العثور على ${this.results.goodPractices.length} ممارسة جيدة للعزل`);
    }
    
    return {
      safetyScore,
      criticalCount: this.results.criticalIssues.length,
      warningCount: this.results.warningIssues.length,
      goodPracticesCount: this.results.goodPractices.length,
      recommendation: this.getRecommendation(safetyScore, this.results.criticalIssues.length)
    };
  }
  
  getRecommendation(safetyScore, criticalCount) {
    if (criticalCount === 0 && safetyScore >= 90) {
      return '🟢 النظام آمن وجاهز للإنتاج';
    } else if (criticalCount <= 2 && safetyScore >= 80) {
      return '🟡 النظام آمن نسبياً - يحتاج إصلاحات بسيطة';
    } else if (criticalCount <= 5 && safetyScore >= 60) {
      return '🟠 النظام يحتاج إصلاحات متوسطة قبل الإنتاج';
    } else {
      return '🔴 النظام يحتاج إصلاحات جوهرية قبل الإنتاج';
    }
  }
  
  saveReport() {
    const reportPath = path.join(__dirname, 'reports', 'comprehensive-isolation-scan.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: this.results.filesScanned,
        criticalIssues: this.results.criticalIssues.length,
        warningIssues: this.results.warningIssues.length,
        suspiciousPatterns: this.results.suspiciousPatterns.length,
        goodPractices: this.results.goodPractices.length,
        totalIssues: this.results.totalIssues
      },
      details: this.results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 تم حفظ التقرير المفصل: ${reportPath}`);
    
    return reportPath;
  }
}

// تشغيل الفحص
const scanner = new IsolationScanner();

console.log('🔍 بدء فحص المجلدات...\n');

// فحص المجلدات الرئيسية
const foldersToScan = [
  'src',
  'routes',
  'services',
  'controllers',
  'middleware'
];

foldersToScan.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`📁 فحص مجلد: ${folder}`);
    scanner.scanDirectory(folderPath);
  }
});

// إنشاء التقرير
const summary = scanner.generateReport();
const reportPath = scanner.saveReport();

console.log('\n🎯 التوصية النهائية:');
console.log('═'.repeat(50));
console.log(summary.recommendation);

if (summary.criticalCount > 0) {
  console.log('\n🚨 إجراءات مطلوبة فوراً:');
  console.log('1. إصلاح المشاكل الخطيرة');
  console.log('2. إضافة companyId للعمليات المفقودة');
  console.log('3. إعادة الفحص بعد الإصلاح');
} else {
  console.log('\n✅ النظام آمن من ناحية العزل!');
}

process.exit(summary.criticalCount > 0 ? 1 : 0);
