const fs = require('fs');
const path = require('path');

console.log('🔬 فحص عميق متقدم للعزل - تحليل شامل لكل التفاصيل...\n');

class DeepIsolationAuditor {
  constructor() {
    this.results = {
      totalFiles: 0,
      criticalIssues: [],
      suspiciousPatterns: [],
      potentialLeaks: [],
      unsafeRoutes: [],
      databaseOperations: [],
      authenticationGaps: [],
      configurationIssues: [],
      codeSmells: []
    };
    
    this.companyRelatedTables = [
      'company', 'user', 'customer', 'conversation', 'message', 'product', 
      'order', 'category', 'notification', 'aiSettings', 'geminiKey', 
      'inventory', 'payment', 'subscription', 'invoice'
    ];
  }
  
  // فحص عميق للملف
  deepAnalyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.results.totalFiles++;
      
      // 1. فحص العمليات الخطيرة
      this.checkCriticalOperations(content, lines, relativePath);
      
      // 2. فحص الأنماط المشبوهة
      this.checkSuspiciousPatterns(content, lines, relativePath);
      
      // 3. فحص تسريب البيانات المحتمل
      this.checkPotentialDataLeaks(content, lines, relativePath);
      
      // 4. فحص Routes غير الآمنة
      this.checkUnsafeRoutes(content, lines, relativePath);
      
      // 5. فحص عمليات قاعدة البيانات
      this.checkDatabaseOperations(content, lines, relativePath);
      
      // 6. فحص ثغرات المصادقة
      this.checkAuthenticationGaps(content, lines, relativePath);
      
      // 7. فحص مشاكل التكوين
      this.checkConfigurationIssues(content, lines, relativePath);
      
      // 8. فحص Code Smells
      this.checkCodeSmells(content, lines, relativePath);
      
    } catch (error) {
      console.error(`❌ خطأ في فحص ${filePath}:`, error.message);
    }
  }
  
  // 1. فحص العمليات الخطيرة
  checkCriticalOperations(content, lines, filePath) {
    const criticalPatterns = [
      {
        pattern: /await\s+prisma\.\w+\.findMany\(\s*\)/g,
        severity: 'CRITICAL',
        description: 'findMany بدون أي فلتر - خطر تسريب جميع البيانات',
        category: 'DATA_LEAK'
      },
      {
        pattern: /await\s+prisma\.\w+\.deleteMany\(\s*\)/g,
        severity: 'CRITICAL',
        description: 'deleteMany بدون فلتر - خطر حذف جميع البيانات',
        category: 'DATA_DESTRUCTION'
      },
      {
        pattern: /await\s+prisma\.\w+\.updateMany\(\s*\)/g,
        severity: 'CRITICAL',
        description: 'updateMany بدون فلتر - خطر تعديل جميع البيانات',
        category: 'DATA_CORRUPTION'
      },
      {
        pattern: /\$queryRaw`[^`]*DELETE[^`]*`/gi,
        severity: 'CRITICAL',
        description: 'استعلام SQL خام للحذف - خطر جداً',
        category: 'RAW_SQL_DANGER'
      },
      {
        pattern: /\$executeRaw`[^`]*DROP[^`]*`/gi,
        severity: 'CRITICAL',
        description: 'استعلام SQL خام لحذف الجداول - خطر كارثي',
        category: 'CATASTROPHIC_DANGER'
      }
    ];
    
    criticalPatterns.forEach(patternObj => {
      const matches = [...content.matchAll(patternObj.pattern)];
      matches.forEach(match => {
        const lineNum = this.getLineNumber(content, match.index);
        this.results.criticalIssues.push({
          file: filePath,
          line: lineNum,
          content: lines[lineNum - 1]?.trim(),
          severity: patternObj.severity,
          description: patternObj.description,
          category: patternObj.category,
          match: match[0]
        });
      });
    });
  }
  
  // 2. فحص الأنماط المشبوهة
  checkSuspiciousPatterns(content, lines, filePath) {
    const suspiciousPatterns = [
      {
        pattern: /companyId\s*:\s*['"`][a-zA-Z0-9_-]+['"`]/g,
        description: 'companyId مُثبت في الكود - خطر أمني',
        severity: 'HIGH'
      },
      {
        pattern: /req\.params\.companyId/g,
        description: 'استخدام companyId من URL parameters - خطر تلاعب',
        severity: 'HIGH'
      },
      {
        pattern: /req\.query\.companyId/g,
        description: 'استخدام companyId من query parameters - خطر تلاعب',
        severity: 'HIGH'
      },
      {
        pattern: /findMany\(\s*\{\s*where\s*:\s*\{\s*\}\s*\}/g,
        description: 'where clause فارغ - يجلب جميع البيانات',
        severity: 'MEDIUM'
      },
      {
        pattern: /\.findMany\(\s*\{\s*include/g,
        description: 'include بدون where - قد يجلب بيانات إضافية',
        severity: 'MEDIUM'
      }
    ];
    
    suspiciousPatterns.forEach(patternObj => {
      const matches = [...content.matchAll(patternObj.pattern)];
      matches.forEach(match => {
        const lineNum = this.getLineNumber(content, match.index);
        this.results.suspiciousPatterns.push({
          file: filePath,
          line: lineNum,
          content: lines[lineNum - 1]?.trim(),
          description: patternObj.description,
          severity: patternObj.severity,
          match: match[0]
        });
      });
    });
  }
  
  // 3. فحص تسريب البيانات المحتمل
  checkPotentialDataLeaks(content, lines, filePath) {
    this.companyRelatedTables.forEach(table => {
      // فحص استعلامات بدون companyId
      const patterns = [
        new RegExp(`await\\s+prisma\\.${table}\\.findMany\\(\\{[^}]*\\}\\)`, 'g'),
        new RegExp(`await\\s+prisma\\.${table}\\.count\\(\\{[^}]*\\}\\)`, 'g')
      ];
      
      patterns.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach(match => {
          const matchText = match[0];
          if (!matchText.includes('companyId') && !matchText.includes('where: whereClause')) {
            const lineNum = this.getLineNumber(content, match.index);
            this.results.potentialLeaks.push({
              file: filePath,
              line: lineNum,
              table: table,
              content: lines[lineNum - 1]?.trim(),
              description: `استعلام ${table} بدون عزل companyId`,
              severity: 'HIGH',
              match: matchText
            });
          }
        });
      });
    });
  }
  
  // 4. فحص Routes غير الآمنة
  checkUnsafeRoutes(content, lines, filePath) {
    if (filePath.includes('routes') || filePath.includes('router')) {
      const routePatterns = [
        {
          pattern: /router\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*['"`]\s*,\s*(?!.*auth|.*requireAuth|.*authenticate)/g,
          description: 'Route بدون middleware مصادقة',
          severity: 'HIGH'
        },
        {
          pattern: /app\.(get|post|put|delete|patch)\s*\(\s*['"`][^'"`]*['"`]\s*,\s*(?!.*auth|.*requireAuth|.*authenticate)/g,
          description: 'App route بدون middleware مصادقة',
          severity: 'HIGH'
        }
      ];
      
      routePatterns.forEach(patternObj => {
        const matches = [...content.matchAll(patternObj.pattern)];
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          this.results.unsafeRoutes.push({
            file: filePath,
            line: lineNum,
            content: lines[lineNum - 1]?.trim(),
            description: patternObj.description,
            severity: patternObj.severity,
            match: match[0]
          });
        });
      });
    }
  }
  
  // 5. فحص عمليات قاعدة البيانات
  checkDatabaseOperations(content, lines, filePath) {
    const dbPatterns = [
      {
        pattern: /\$queryRaw/g,
        description: 'استعلام SQL خام - يحتاج مراجعة أمنية',
        severity: 'MEDIUM'
      },
      {
        pattern: /\$executeRaw/g,
        description: 'تنفيذ SQL خام - يحتاج مراجعة أمنية',
        severity: 'MEDIUM'
      },
      {
        pattern: /prisma\.\$transaction/g,
        description: 'معاملة قاعدة بيانات - تحقق من العزل',
        severity: 'LOW'
      }
    ];
    
    dbPatterns.forEach(patternObj => {
      const matches = [...content.matchAll(patternObj.pattern)];
      matches.forEach(match => {
        const lineNum = this.getLineNumber(content, match.index);
        this.results.databaseOperations.push({
          file: filePath,
          line: lineNum,
          content: lines[lineNum - 1]?.trim(),
          description: patternObj.description,
          severity: patternObj.severity,
          match: match[0]
        });
      });
    });
  }
  
  // 6. فحص ثغرات المصادقة
  checkAuthenticationGaps(content, lines, filePath) {
    const authPatterns = [
      {
        pattern: /req\.user\s*\?\s*req\.user\.companyId\s*:\s*['"`][^'"`]*['"`]/g,
        description: 'fallback companyId مُثبت - خطر أمني',
        severity: 'HIGH'
      },
      {
        pattern: /req\.user\s*\|\|\s*\{[^}]*companyId[^}]*\}/g,
        description: 'user object افتراضي مع companyId - خطر',
        severity: 'HIGH'
      },
      {
        pattern: /companyId\s*=\s*req\.user\s*\?\s*req\.user\.companyId\s*:\s*null/g,
        description: 'companyId يمكن أن يكون null - خطر',
        severity: 'MEDIUM'
      }
    ];
    
    authPatterns.forEach(patternObj => {
      const matches = [...content.matchAll(patternObj.pattern)];
      matches.forEach(match => {
        const lineNum = this.getLineNumber(content, match.index);
        this.results.authenticationGaps.push({
          file: filePath,
          line: lineNum,
          content: lines[lineNum - 1]?.trim(),
          description: patternObj.description,
          severity: patternObj.severity,
          match: match[0]
        });
      });
    });
  }
  
  // 7. فحص مشاكل التكوين
  checkConfigurationIssues(content, lines, filePath) {
    if (filePath.includes('config') || filePath.includes('.env') || filePath.includes('settings')) {
      const configPatterns = [
        {
          pattern: /DATABASE_URL\s*=\s*['"`][^'"`]*['"`]/g,
          description: 'رابط قاعدة البيانات في الكود - خطر أمني',
          severity: 'HIGH'
        },
        {
          pattern: /password\s*[:=]\s*['"`][^'"`]*['"`]/gi,
          description: 'كلمة مرور في الكود - خطر أمني',
          severity: 'CRITICAL'
        },
        {
          pattern: /secret\s*[:=]\s*['"`][^'"`]*['"`]/gi,
          description: 'مفتاح سري في الكود - خطر أمني',
          severity: 'CRITICAL'
        }
      ];
      
      configPatterns.forEach(patternObj => {
        const matches = [...content.matchAll(patternObj.pattern)];
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          this.results.configurationIssues.push({
            file: filePath,
            line: lineNum,
            content: lines[lineNum - 1]?.trim(),
            description: patternObj.description,
            severity: patternObj.severity,
            match: match[0]
          });
        });
      });
    }
  }
  
  // 8. فحص Code Smells
  checkCodeSmells(content, lines, filePath) {
    const smellPatterns = [
      {
        pattern: /console\.log\(/g,
        description: 'console.log في الكود - قد يكشف معلومات حساسة',
        severity: 'LOW'
      },
      {
        pattern: /TODO|FIXME|HACK/gi,
        description: 'تعليقات TODO/FIXME - قد تشير لمشاكل أمنية',
        severity: 'LOW'
      },
      {
        pattern: /eval\(/g,
        description: 'استخدام eval() - خطر أمني',
        severity: 'HIGH'
      }
    ];
    
    smellPatterns.forEach(patternObj => {
      const matches = [...content.matchAll(patternObj.pattern)];
      matches.forEach(match => {
        const lineNum = this.getLineNumber(content, match.index);
        this.results.codeSmells.push({
          file: filePath,
          line: lineNum,
          content: lines[lineNum - 1]?.trim(),
          description: patternObj.description,
          severity: patternObj.severity,
          match: match[0]
        });
      });
    });
  }
  
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }
  
  scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          this.scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.env'].includes(ext)) {
          this.deepAnalyzeFile(fullPath);
        }
      }
    });
  }
  
  generateDeepReport() {
    console.log('🔬 تقرير الفحص العميق للعزل');
    console.log('═'.repeat(80));
    console.log(`📁 ملفات مفحوصة: ${this.results.totalFiles}`);
    
    const totalIssues = this.results.criticalIssues.length + 
                       this.results.suspiciousPatterns.length + 
                       this.results.potentialLeaks.length + 
                       this.results.unsafeRoutes.length + 
                       this.results.authenticationGaps.length + 
                       this.results.configurationIssues.length;
    
    console.log(`🚨 إجمالي المشاكل المكتشفة: ${totalIssues}`);
    
    // عرض المشاكل الخطيرة
    if (this.results.criticalIssues.length > 0) {
      console.log('\n🚨 مشاكل خطيرة:');
      console.log('═'.repeat(50));
      this.results.criticalIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. 📄 ${issue.file}:${issue.line}`);
        console.log(`   ❌ ${issue.description}`);
        console.log(`   💻 ${issue.content}`);
        console.log(`   🏷️  ${issue.category}`);
        console.log('   ' + '─'.repeat(60));
      });
    }
    
    // عرض تسريب البيانات المحتمل
    if (this.results.potentialLeaks.length > 0) {
      console.log('\n💧 تسريب بيانات محتمل:');
      console.log('═'.repeat(50));
      this.results.potentialLeaks.slice(0, 5).forEach((leak, index) => {
        console.log(`${index + 1}. 📄 ${leak.file}:${leak.line}`);
        console.log(`   💧 ${leak.description}`);
        console.log(`   📊 جدول: ${leak.table}`);
        console.log(`   💻 ${leak.content}`);
        console.log('   ' + '─'.repeat(60));
      });
    }
    
    // عرض Routes غير الآمنة
    if (this.results.unsafeRoutes.length > 0) {
      console.log('\n🛣️  Routes غير آمنة:');
      console.log('═'.repeat(50));
      this.results.unsafeRoutes.slice(0, 5).forEach((route, index) => {
        console.log(`${index + 1}. 📄 ${route.file}:${route.line}`);
        console.log(`   🛣️  ${route.description}`);
        console.log(`   💻 ${route.content}`);
        console.log('   ' + '─'.repeat(60));
      });
    }
    
    // عرض ثغرات المصادقة
    if (this.results.authenticationGaps.length > 0) {
      console.log('\n🔐 ثغرات المصادقة:');
      console.log('═'.repeat(50));
      this.results.authenticationGaps.slice(0, 5).forEach((gap, index) => {
        console.log(`${index + 1}. 📄 ${gap.file}:${gap.line}`);
        console.log(`   🔐 ${gap.description}`);
        console.log(`   💻 ${gap.content}`);
        console.log('   ' + '─'.repeat(60));
      });
    }
    
    // التقييم النهائي
    console.log('\n🎯 التقييم العميق النهائي:');
    console.log('═'.repeat(50));
    
    const criticalCount = this.results.criticalIssues.length;
    const highSeverityCount = this.results.suspiciousPatterns.filter(p => p.severity === 'HIGH').length +
                             this.results.potentialLeaks.filter(p => p.severity === 'HIGH').length +
                             this.results.authenticationGaps.filter(p => p.severity === 'HIGH').length;
    
    if (criticalCount === 0 && highSeverityCount === 0) {
      console.log('🟢 النظام آمن تماماً من الناحية العميقة!');
      console.log('✅ لا توجد مشاكل خطيرة أو عالية الخطورة');
      console.log('🏆 العزل مثالي ومطابق لأعلى معايير الأمان');
    } else if (criticalCount === 0 && highSeverityCount <= 3) {
      console.log('🟡 النظام آمن مع مشاكل بسيطة');
      console.log(`⚠️  ${highSeverityCount} مشكلة عالية الخطورة تحتاج انتباه`);
      console.log('📈 يمكن استخدامه في الإنتاج مع مراقبة');
    } else {
      console.log('🔴 النظام يحتاج إصلاحات أمنية');
      console.log(`❌ ${criticalCount} مشكلة خطيرة`);
      console.log(`⚠️  ${highSeverityCount} مشكلة عالية الخطورة`);
      console.log('🛠️  يحتاج إصلاحات قبل الإنتاج');
    }
    
    return {
      totalIssues,
      criticalCount,
      highSeverityCount,
      recommendation: criticalCount === 0 && highSeverityCount === 0 ? 'PERFECT_SECURITY' :
                     criticalCount === 0 && highSeverityCount <= 3 ? 'GOOD_SECURITY' : 'NEEDS_SECURITY_FIXES'
    };
  }
}

// تشغيل الفحص العميق
const auditor = new DeepIsolationAuditor();

console.log('🔍 بدء الفحص العميق المتقدم...\n');

// فحص المجلد الرئيسي
auditor.scanDirectory(path.join(__dirname, 'src'));

// إنشاء التقرير العميق
const summary = auditor.generateDeepReport();

// حفظ التقرير
const reportPath = path.join(__dirname, 'reports', 'deep-isolation-audit.json');
const reportsDir = path.dirname(reportPath);

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: summary,
  details: auditor.results
}, null, 2));

console.log(`\n📄 تم حفظ التقرير العميق: ${reportPath}`);

process.exit(summary.recommendation === 'PERFECT_SECURITY' ? 0 : 1);
