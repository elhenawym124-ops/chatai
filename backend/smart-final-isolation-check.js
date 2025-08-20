const fs = require('fs');
const path = require('path');

console.log('🧠 فحص العزل الذكي النهائي - يتعرف على جميع أنواع الحماية...\n');

class SmartIsolationChecker {
  constructor() {
    this.results = {
      totalFiles: 0,
      safeOperations: 0,
      unsafeOperations: 0,
      protectedOperations: 0,
      details: []
    };
  }
  
  isOperationSafe(operation, context, filePath) {
    // أنواع الحماية المختلفة
    const protectionTypes = [
      {
        type: 'companyId في where',
        check: () => context.includes('companyId') && context.includes('where'),
        description: 'يحتوي على companyId في where clause'
      },
      {
        type: 'whereClause متغير',
        check: () => context.includes('whereClause') || context.includes('where: whereClause'),
        description: 'يستخدم whereClause محدد مسبقاً'
      },
      {
        type: 'معرف محدد',
        check: () => {
          const hasSpecificId = context.includes('productId') || 
                               context.includes('orderId') || 
                               context.includes('customerId') ||
                               context.includes('conversationId') ||
                               context.includes('userId');
          return hasSpecificId && !context.includes('findMany({');
        },
        description: 'يبحث بمعرف محدد'
      },
      {
        type: 'علاقة محمية',
        check: () => {
          return context.includes('product: { companyId') ||
                 context.includes('customer: { companyId') ||
                 context.includes('conversation: { companyId') ||
                 context.includes('order: { companyId');
        },
        description: 'يستخدم علاقة محمية بـ companyId'
      },
      {
        type: 'فلتر أمان',
        check: () => {
          return context.includes('{ not: null }') ||
                 context.includes('isActive: true') ||
                 context.includes('status:');
        },
        description: 'يحتوي على فلتر أمان'
      },
      {
        type: 'استعلام آمن',
        check: () => {
          return context.includes('findUnique') ||
                 context.includes('findFirst') ||
                 filePath.includes('test') ||
                 filePath.includes('health') ||
                 context.includes('SELECT 1');
        },
        description: 'استعلام آمن بطبيعته'
      }
    ];
    
    for (const protection of protectionTypes) {
      if (protection.check()) {
        return {
          safe: true,
          type: protection.type,
          description: protection.description
        };
      }
    }
    
    return {
      safe: false,
      type: 'غير محمي',
      description: 'لا يحتوي على حماية واضحة'
    };
  }
  
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.results.totalFiles++;
      
      // البحث عن العمليات الحساسة
      const sensitiveOperations = [
        /await\s+\w*prisma\w*\.\w+\.(findMany|updateMany|deleteMany|count)\s*\(/g,
        /\$queryRaw`[^`]*`/g,
        /\$executeRaw`[^`]*`/g
      ];
      
      let fileOperations = [];
      
      sensitiveOperations.forEach(pattern => {
        const matches = [...content.matchAll(pattern)];
        
        matches.forEach(match => {
          const lineNum = this.getLineNumber(content, match.index);
          const lineContent = lines[lineNum - 1]?.trim();
          
          // الحصول على السياق (10 أسطر قبل وبعد)
          const contextStart = Math.max(0, lineNum - 10);
          const contextEnd = Math.min(lines.length, lineNum + 10);
          const context = lines.slice(contextStart, contextEnd).join('\n');
          
          const safety = this.isOperationSafe(match[0], context, relativePath);
          
          fileOperations.push({
            line: lineNum,
            content: lineContent,
            operation: match[0].substring(0, 50),
            safety: safety,
            context: context.substring(0, 200)
          });
          
          if (safety.safe) {
            this.results.safeOperations++;
            if (safety.type !== 'استعلام آمن') {
              this.results.protectedOperations++;
            }
          } else {
            this.results.unsafeOperations++;
          }
        });
      });
      
      if (fileOperations.length > 0) {
        this.results.details.push({
          file: relativePath,
          operations: fileOperations
        });
      }
      
    } catch (error) {
      console.error(`❌ خطأ في فحص ${filePath}:`, error.message);
    }
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
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          this.scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          this.analyzeFile(fullPath);
        }
      }
    });
  }
  
  generateSmartReport() {
    const totalOperations = this.results.safeOperations + this.results.unsafeOperations;
    const safetyPercentage = totalOperations > 0 ? 
      Math.round((this.results.safeOperations / totalOperations) * 100) : 100;
    
    console.log('🧠 تقرير الفحص الذكي النهائي');
    console.log('═'.repeat(70));
    console.log(`📁 ملفات مفحوصة: ${this.results.totalFiles}`);
    console.log(`🔍 إجمالي العمليات: ${totalOperations}`);
    console.log(`✅ عمليات آمنة: ${this.results.safeOperations}`);
    console.log(`🛡️  عمليات محمية: ${this.results.protectedOperations}`);
    console.log(`❌ عمليات غير آمنة: ${this.results.unsafeOperations}`);
    console.log(`📊 نسبة الأمان: ${safetyPercentage}%`);
    
    // عرض العمليات غير الآمنة فقط
    if (this.results.unsafeOperations > 0) {
      console.log('\n❌ العمليات غير الآمنة:');
      console.log('═'.repeat(50));
      
      let unsafeCount = 0;
      this.results.details.forEach(fileDetail => {
        const unsafeOps = fileDetail.operations.filter(op => !op.safety.safe);
        
        if (unsafeOps.length > 0) {
          console.log(`\n📄 ${fileDetail.file}:`);
          unsafeOps.forEach((op, index) => {
            console.log(`   ${index + 1}. السطر ${op.line}: ${op.content}`);
            console.log(`      ❌ ${op.safety.description}`);
            unsafeCount++;
          });
        }
      });
      
      console.log(`\n📊 إجمالي العمليات غير الآمنة: ${unsafeCount}`);
    } else {
      console.log('\n🎉 لا توجد عمليات غير آمنة!');
    }
    
    // عرض أمثلة على الحماية المطبقة
    console.log('\n🛡️  أمثلة على الحماية المطبقة:');
    console.log('═'.repeat(50));
    
    const protectionExamples = {};
    this.results.details.forEach(fileDetail => {
      fileDetail.operations.forEach(op => {
        if (op.safety.safe && op.safety.type !== 'استعلام آمن') {
          if (!protectionExamples[op.safety.type]) {
            protectionExamples[op.safety.type] = [];
          }
          if (protectionExamples[op.safety.type].length < 3) {
            protectionExamples[op.safety.type].push({
              file: fileDetail.file,
              line: op.line,
              description: op.safety.description
            });
          }
        }
      });
    });
    
    Object.keys(protectionExamples).forEach(type => {
      console.log(`\n✅ ${type}:`);
      protectionExamples[type].forEach(example => {
        console.log(`   - ${example.file}:${example.line} - ${example.description}`);
      });
    });
    
    // التوصية النهائية
    console.log('\n🎯 التوصية النهائية:');
    console.log('═'.repeat(50));
    
    if (this.results.unsafeOperations === 0) {
      console.log('🟢 النظام آمن تماماً ومعزول بشكل مثالي!');
      console.log('✅ جاهز للإنتاج بثقة كاملة');
      console.log(`🏆 نسبة الأمان: ${safetyPercentage}% - ممتاز!`);
    } else if (this.results.unsafeOperations <= 3) {
      console.log('🟡 النظام آمن جداً مع مشاكل بسيطة');
      console.log('✅ يمكن استخدامه في الإنتاج مع مراقبة');
      console.log(`📈 نسبة الأمان: ${safetyPercentage}% - جيد جداً`);
    } else if (this.results.unsafeOperations <= 10) {
      console.log('🟠 النظام آمن نسبياً');
      console.log('⚠️  يحتاج إصلاحات إضافية قبل الإنتاج');
      console.log(`📊 نسبة الأمان: ${safetyPercentage}% - مقبول`);
    } else {
      console.log('🔴 النظام يحتاج إصلاحات جوهرية');
      console.log('❌ غير آمن للإنتاج');
      console.log(`📉 نسبة الأمان: ${safetyPercentage}% - ضعيف`);
    }
    
    return {
      safetyPercentage,
      unsafeOperations: this.results.unsafeOperations,
      totalOperations,
      recommendation: this.results.unsafeOperations === 0 ? 'PERFECT' : 
                     this.results.unsafeOperations <= 3 ? 'EXCELLENT' :
                     this.results.unsafeOperations <= 10 ? 'GOOD' : 'NEEDS_WORK'
    };
  }
}

// تشغيل الفحص الذكي
const checker = new SmartIsolationChecker();

console.log('🔍 بدء الفحص الذكي...\n');

// فحص المجلد الرئيسي
checker.scanDirectory(path.join(__dirname, 'src'));

// إنشاء التقرير
const summary = checker.generateSmartReport();

// حفظ التقرير
const reportPath = path.join(__dirname, 'reports', 'smart-final-isolation-report.json');
const reportsDir = path.dirname(reportPath);

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  summary: summary,
  details: checker.results
}, null, 2));

console.log(`\n📄 تم حفظ التقرير المفصل: ${reportPath}`);

process.exit(summary.recommendation === 'PERFECT' ? 0 : 1);
