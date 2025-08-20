/**
 * Database Structure and Data Check Script
 * 
 * This script checks the database structure and verifies
 * that all required tables and data exist
 */

const fs = require('fs');
const path = require('path');

class DatabaseChecker {
  constructor() {
    this.results = {
      tables: {},
      mockData: {},
      relationships: {},
      issues: [],
      summary: {
        totalTables: 0,
        existingTables: 0,
        missingTables: 0,
        dataStatus: 'unknown'
      }
    };
    
    // Expected tables based on the system design
    this.expectedTables = [
      'users',
      'companies', 
      'customers',
      'conversations',
      'messages',
      'products',
      'categories',
      'orders',
      'order_items',
      'leads',
      'opportunities',
      'interactions',
      'notifications',
      'templates',
      'automations',
      'reports',
      'analytics',
      'ai_models',
      'prompts',
      'escalation_rules',
      'follow_ups',
      'campaigns',
      'scenarios',
      'distributions',
      'admin_tasks'
    ];
  }

  /**
   * Run complete database check
   */
  async runDatabaseCheck() {
    console.log('🔍 بدء فحص قاعدة البيانات...\n');

    try {
      // Check if we're using mock data or real database
      await this.checkDatabaseType();
      
      // Check table structure
      await this.checkTableStructure();
      
      // Check mock data availability
      await this.checkMockData();
      
      // Check service files
      await this.checkServiceFiles();
      
      // Generate report
      this.generateDatabaseReport();

    } catch (error) {
      console.error('❌ خطأ في فحص قاعدة البيانات:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Database check failed: ${error.message}`
      });
    }
  }

  /**
   * Check database type (Mock vs Real)
   */
  async checkDatabaseType() {
    console.log('📊 فحص نوع قاعدة البيانات...');
    
    // Check for Prisma schema
    const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
    const hasPrismaSchema = fs.existsSync(prismaSchemaPath);
    
    // Check for database config
    const dbConfigPath = path.join(__dirname, '../src/config/database.js');
    const hasDbConfig = fs.existsSync(dbConfigPath);
    
    // Check for mock data services
    const mockServicesPath = path.join(__dirname, '../src/services');
    const hasMockServices = fs.existsSync(mockServicesPath);
    
    this.results.databaseType = {
      hasPrismaSchema,
      hasDbConfig,
      hasMockServices,
      type: hasMockServices ? 'MOCK_SERVICES' : 'UNKNOWN'
    };
    
    if (hasMockServices) {
      console.log('  ✅ النظام يستخدم Mock Services للبيانات');
      this.results.dataStatus = 'MOCK_SERVICES';
    } else if (hasPrismaSchema) {
      console.log('  ✅ تم العثور على Prisma Schema');
      this.results.dataStatus = 'PRISMA_SCHEMA';
    } else {
      console.log('  ⚠️ لم يتم العثور على إعداد قاعدة بيانات واضح');
      this.results.issues.push({
        type: 'WARNING',
        message: 'No clear database setup found'
      });
    }
  }

  /**
   * Check table structure through service files
   */
  async checkTableStructure() {
    console.log('\n🏗️ فحص هيكل الجداول من خلال الخدمات...');
    
    const servicesPath = path.join(__dirname, '../src/services');
    
    if (!fs.existsSync(servicesPath)) {
      this.results.issues.push({
        type: 'CRITICAL',
        message: 'Services directory not found'
      });
      return;
    }
    
    const serviceFiles = fs.readdirSync(servicesPath)
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''));
    
    console.log(`  📁 تم العثور على ${serviceFiles.length} ملف خدمة`);
    
    // Map service files to expected tables
    this.expectedTables.forEach(table => {
      const relatedServices = serviceFiles.filter(service => 
        service.toLowerCase().includes(table.toLowerCase()) ||
        table.toLowerCase().includes(service.toLowerCase().replace('service', ''))
      );
      
      this.results.tables[table] = {
        expected: true,
        relatedServices,
        status: relatedServices.length > 0 ? 'FOUND_SERVICE' : 'MISSING_SERVICE'
      };
      
      if (relatedServices.length > 0) {
        this.results.summary.existingTables++;
        console.log(`    ✅ ${table}: ${relatedServices.join(', ')}`);
      } else {
        this.results.summary.missingTables++;
        console.log(`    ❌ ${table}: لا توجد خدمة مرتبطة`);
      }
    });
    
    this.results.summary.totalTables = this.expectedTables.length;
    
    // Check for additional services
    const additionalServices = serviceFiles.filter(service => 
      !this.expectedTables.some(table => 
        service.toLowerCase().includes(table.toLowerCase()) ||
        table.toLowerCase().includes(service.toLowerCase().replace('service', ''))
      )
    );
    
    if (additionalServices.length > 0) {
      console.log(`\n  📋 خدمات إضافية موجودة: ${additionalServices.join(', ')}`);
      this.results.additionalServices = additionalServices;
    }
  }

  /**
   * Check mock data in services
   */
  async checkMockData() {
    console.log('\n📦 فحص البيانات التجريبية...');
    
    const servicesPath = path.join(__dirname, '../src/services');
    const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));
    
    for (const serviceFile of serviceFiles) {
      const servicePath = path.join(servicesPath, serviceFile);
      const serviceContent = fs.readFileSync(servicePath, 'utf8');
      
      // Check for mock data patterns
      const hasMockData = serviceContent.includes('mockData') || 
                         serviceContent.includes('mock') ||
                         serviceContent.includes('sample') ||
                         serviceContent.includes('test data');
      
      const hasInitializeMethod = serviceContent.includes('initialize') ||
                                 serviceContent.includes('init');
      
      const serviceName = serviceFile.replace('.js', '');
      
      this.results.mockData[serviceName] = {
        hasMockData,
        hasInitializeMethod,
        fileSize: fs.statSync(servicePath).size,
        status: hasMockData ? 'HAS_MOCK_DATA' : 'NO_MOCK_DATA'
      };
      
      if (hasMockData) {
        console.log(`    ✅ ${serviceName}: يحتوي على بيانات تجريبية`);
      } else {
        console.log(`    ⚠️ ${serviceName}: لا يحتوي على بيانات تجريبية`);
      }
    }
  }

  /**
   * Check service files for completeness
   */
  async checkServiceFiles() {
    console.log('\n🔧 فحص اكتمال ملفات الخدمات...');
    
    const servicesPath = path.join(__dirname, '../src/services');
    const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));
    
    const criticalServices = [
      'customerService.js',
      'conversationService.js', 
      'productService.js',
      'orderService.js',
      'authService.js',
      'notificationService.js'
    ];
    
    criticalServices.forEach(criticalService => {
      if (serviceFiles.includes(criticalService)) {
        console.log(`    ✅ ${criticalService}: موجود`);
      } else {
        console.log(`    ❌ ${criticalService}: مفقود`);
        this.results.issues.push({
          type: 'HIGH',
          message: `Critical service missing: ${criticalService}`
        });
      }
    });
    
    console.log(`\n  📊 إجمالي ملفات الخدمات: ${serviceFiles.length}`);
    this.results.summary.totalServices = serviceFiles.length;
  }

  /**
   * Generate database report
   */
  generateDatabaseReport() {
    console.log('\n📋 تقرير فحص قاعدة البيانات');
    console.log('=' * 50);
    
    // Summary
    console.log('\n📊 الملخص:');
    console.log(`  إجمالي الجداول المتوقعة: ${this.results.summary.totalTables}`);
    console.log(`  الجداول الموجودة (خدمات): ${this.results.summary.existingTables}`);
    console.log(`  الجداول المفقودة: ${this.results.summary.missingTables}`);
    console.log(`  إجمالي ملفات الخدمات: ${this.results.summary.totalServices || 0}`);
    console.log(`  نوع قاعدة البيانات: ${this.results.dataStatus}`);
    
    // Coverage percentage
    const coverage = (this.results.summary.existingTables / this.results.summary.totalTables) * 100;
    console.log(`  نسبة التغطية: ${coverage.toFixed(1)}%`);
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في قاعدة البيانات');
    }
    
    // Recommendations
    console.log('\n💡 التوصيات:');
    if (coverage < 80) {
      console.log('  🔧 إضافة الخدمات المفقودة للجداول الأساسية');
    }
    if (this.results.dataStatus === 'MOCK_SERVICES') {
      console.log('  📦 النظام يعتمد على Mock Services - مناسب للتطوير والاختبار');
    }
    if (this.results.issues.length > 0) {
      console.log('  ⚠️ معالجة المشاكل المكتشفة قبل الإنتاج');
    }
    
    // Save results to file
    this.saveDatabaseReport();
  }

  /**
   * Save database report to file
   */
  saveDatabaseReport() {
    const reportPath = path.join(__dirname, '../reports/database-check-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.issues.length === 0 ? 'PASSED' : 'ISSUES_FOUND',
        coverage: (this.results.summary.existingTables / this.results.summary.totalTables) * 100,
        totalIssues: this.results.issues.length,
        criticalIssues: this.results.issues.filter(i => i.type === 'CRITICAL').length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = DatabaseChecker;

// Run if called directly
if (require.main === module) {
  const checker = new DatabaseChecker();
  checker.runDatabaseCheck().catch(console.error);
}
