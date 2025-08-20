/**
 * Environment Variables and Configuration Check Script
 * 
 * This script checks all environment variables and configuration
 * settings required for the platform to work properly
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class EnvironmentChecker {
  constructor() {
    this.results = {
      envFiles: {},
      requiredVars: {},
      optionalVars: {},
      configFiles: {},
      issues: [],
      summary: {
        totalRequired: 0,
        foundRequired: 0,
        missingRequired: 0,
        configStatus: 'unknown'
      }
    };
    
    // Required environment variables
    this.requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'JWT_SECRET',
      'DB_HOST',
      'DB_PORT',
      'DB_NAME',
      'DB_USERNAME',
      'DB_PASSWORD'
    ];
    
    // Optional environment variables
    this.optionalEnvVars = [
      'REDIS_HOST',
      'REDIS_PORT',
      'REDIS_PASSWORD',
      'EMAIL_HOST',
      'EMAIL_PORT',
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'SMS_API_KEY',
      'GEMINI_API_KEY',
      'ENCRYPTION_KEY',
      'LOG_LEVEL',
      'CORS_ORIGIN'
    ];
    
    // Configuration files to check
    this.configFiles = [
      'package.json',
      '.env',
      '.env.example',
      'src/config/database.js',
      'src/config/app.js'
    ];
  }

  /**
   * Run complete environment check
   */
  async runEnvironmentCheck() {
    console.log('⚙️ بدء فحص متغيرات البيئة...\n');

    try {
      // Check environment files
      await this.checkEnvironmentFiles();
      
      // Check required variables
      await this.checkRequiredVariables();
      
      // Check optional variables
      await this.checkOptionalVariables();
      
      // Check configuration files
      await this.checkConfigurationFiles();
      
      // Validate configuration values
      await this.validateConfiguration();
      
      // Generate report
      this.generateEnvironmentReport();

    } catch (error) {
      console.error('❌ خطأ في فحص البيئة:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Environment check failed: ${error.message}`
      });
    }
  }

  /**
   * Check environment files
   */
  async checkEnvironmentFiles() {
    console.log('📁 فحص ملفات البيئة...');
    
    const envFiles = ['.env', '.env.example', '.env.local', '.env.development', '.env.production'];
    
    for (const envFile of envFiles) {
      const filePath = path.join(__dirname, '..', envFile);
      const exists = fs.existsSync(filePath);
      
      this.results.envFiles[envFile] = {
        exists,
        path: filePath,
        size: exists ? fs.statSync(filePath).size : 0,
        content: exists ? this.parseEnvFile(filePath) : null
      };
      
      if (exists) {
        console.log(`  ✅ ${envFile}: موجود (${this.results.envFiles[envFile].size} bytes)`);
      } else {
        console.log(`  ❌ ${envFile}: غير موجود`);
        if (envFile === '.env') {
          this.results.issues.push({
            type: 'HIGH',
            message: '.env file is missing'
          });
        }
      }
    }
  }

  /**
   * Parse environment file
   */
  parseEnvFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const vars = {};
      
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          if (key && valueParts.length > 0) {
            vars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      
      return vars;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check required environment variables
   */
  async checkRequiredVariables() {
    console.log('\n🔑 فحص المتغيرات المطلوبة...');
    
    this.results.summary.totalRequired = this.requiredEnvVars.length;
    
    for (const varName of this.requiredEnvVars) {
      const value = process.env[varName];
      const isSet = value !== undefined && value !== '';
      
      this.results.requiredVars[varName] = {
        required: true,
        isSet,
        value: isSet ? (varName.includes('PASSWORD') || varName.includes('SECRET') ? '[HIDDEN]' : value) : null,
        source: this.findVariableSource(varName)
      };
      
      if (isSet) {
        console.log(`  ✅ ${varName}: مُعرَّف`);
        this.results.summary.foundRequired++;
      } else {
        console.log(`  ❌ ${varName}: غير مُعرَّف`);
        this.results.summary.missingRequired++;
        this.results.issues.push({
          type: 'HIGH',
          message: `Required environment variable ${varName} is not set`
        });
      }
    }
  }

  /**
   * Check optional environment variables
   */
  async checkOptionalVariables() {
    console.log('\n🔧 فحص المتغيرات الاختيارية...');
    
    for (const varName of this.optionalEnvVars) {
      const value = process.env[varName];
      const isSet = value !== undefined && value !== '';
      
      this.results.optionalVars[varName] = {
        required: false,
        isSet,
        value: isSet ? (varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('KEY') ? '[HIDDEN]' : value) : null,
        source: this.findVariableSource(varName)
      };
      
      if (isSet) {
        console.log(`  ✅ ${varName}: مُعرَّف`);
      } else {
        console.log(`  ⚠️ ${varName}: غير مُعرَّف (اختياري)`);
      }
    }
  }

  /**
   * Find variable source
   */
  findVariableSource(varName) {
    // Check in .env files
    for (const [fileName, fileData] of Object.entries(this.results.envFiles)) {
      if (fileData.exists && fileData.content && fileData.content[varName]) {
        return fileName;
      }
    }
    
    // Check if set in system environment
    if (process.env[varName]) {
      return 'system';
    }
    
    return 'not_found';
  }

  /**
   * Check configuration files
   */
  async checkConfigurationFiles() {
    console.log('\n📋 فحص ملفات التكوين...');
    
    for (const configFile of this.configFiles) {
      const filePath = path.join(__dirname, '..', configFile);
      const exists = fs.existsSync(filePath);
      
      this.results.configFiles[configFile] = {
        exists,
        path: filePath,
        size: exists ? fs.statSync(filePath).size : 0,
        isValid: false
      };
      
      if (exists) {
        console.log(`  ✅ ${configFile}: موجود`);
        
        // Validate specific config files
        if (configFile === 'package.json') {
          this.validatePackageJson(filePath);
        } else if (configFile.endsWith('.js')) {
          this.validateJsConfig(filePath);
        }
        
      } else {
        console.log(`  ❌ ${configFile}: غير موجود`);
        if (configFile === 'package.json') {
          this.results.issues.push({
            type: 'CRITICAL',
            message: 'package.json file is missing'
          });
        }
      }
    }
  }

  /**
   * Validate package.json
   */
  validatePackageJson(filePath) {
    try {
      const packageData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      this.results.configFiles['package.json'].isValid = true;
      this.results.configFiles['package.json'].data = {
        name: packageData.name,
        version: packageData.version,
        scripts: Object.keys(packageData.scripts || {}),
        dependencies: Object.keys(packageData.dependencies || {}),
        devDependencies: Object.keys(packageData.devDependencies || {})
      };
      
      // Check for required scripts
      const requiredScripts = ['start', 'dev'];
      const missingScripts = requiredScripts.filter(script => !packageData.scripts || !packageData.scripts[script]);
      
      if (missingScripts.length > 0) {
        this.results.issues.push({
          type: 'MEDIUM',
          message: `Missing required scripts in package.json: ${missingScripts.join(', ')}`
        });
      }
      
    } catch (error) {
      this.results.configFiles['package.json'].isValid = false;
      this.results.issues.push({
        type: 'HIGH',
        message: `Invalid package.json: ${error.message}`
      });
    }
  }

  /**
   * Validate JavaScript config files
   */
  validateJsConfig(filePath) {
    try {
      // Basic syntax check by reading the file
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for basic structure
      if (content.includes('module.exports') || content.includes('export')) {
        this.results.configFiles[path.basename(filePath)].isValid = true;
      } else {
        this.results.issues.push({
          type: 'MEDIUM',
          message: `Config file ${path.basename(filePath)} may not be properly structured`
        });
      }
      
    } catch (error) {
      this.results.configFiles[path.basename(filePath)].isValid = false;
      this.results.issues.push({
        type: 'MEDIUM',
        message: `Cannot read config file ${path.basename(filePath)}: ${error.message}`
      });
    }
  }

  /**
   * Validate configuration values
   */
  async validateConfiguration() {
    console.log('\n✅ التحقق من صحة القيم...');
    
    // Validate PORT
    const port = process.env.PORT;
    if (port) {
      const portNum = parseInt(port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        this.results.issues.push({
          type: 'HIGH',
          message: `Invalid PORT value: ${port}`
        });
        console.log(`  ❌ PORT: قيمة غير صحيحة (${port})`);
      } else {
        console.log(`  ✅ PORT: صحيح (${port})`);
      }
    }
    
    // Validate NODE_ENV
    const nodeEnv = process.env.NODE_ENV;
    const validEnvs = ['development', 'production', 'test'];
    if (nodeEnv && !validEnvs.includes(nodeEnv)) {
      this.results.issues.push({
        type: 'MEDIUM',
        message: `Invalid NODE_ENV value: ${nodeEnv}`
      });
      console.log(`  ❌ NODE_ENV: قيمة غير صحيحة (${nodeEnv})`);
    } else if (nodeEnv) {
      console.log(`  ✅ NODE_ENV: صحيح (${nodeEnv})`);
    }
    
    // Validate JWT_SECRET length
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
      this.results.issues.push({
        type: 'HIGH',
        message: 'JWT_SECRET should be at least 32 characters long'
      });
      console.log(`  ❌ JWT_SECRET: قصير جداً (${jwtSecret.length} أحرف)`);
    } else if (jwtSecret) {
      console.log(`  ✅ JWT_SECRET: طول مناسب (${jwtSecret.length} أحرف)`);
    }
  }

  /**
   * Generate environment report
   */
  generateEnvironmentReport() {
    console.log('\n📋 تقرير فحص البيئة');
    console.log('=' * 50);
    
    // Summary
    const requiredCoverage = (this.results.summary.foundRequired / this.results.summary.totalRequired) * 100;
    this.results.summary.configStatus = requiredCoverage >= 80 ? 'GOOD' : 'NEEDS_ATTENTION';
    
    console.log('\n📊 الملخص:');
    console.log(`  المتغيرات المطلوبة: ${this.results.summary.foundRequired}/${this.results.summary.totalRequired}`);
    console.log(`  نسبة التغطية: ${requiredCoverage.toFixed(1)}%`);
    console.log(`  حالة التكوين: ${this.results.summary.configStatus}`);
    
    // Environment files status
    console.log('\n📁 ملفات البيئة:');
    Object.entries(this.results.envFiles).forEach(([fileName, fileData]) => {
      const status = fileData.exists ? '✅' : '❌';
      const varsCount = fileData.content ? Object.keys(fileData.content).length : 0;
      console.log(`  ${status} ${fileName}: ${fileData.exists ? `${varsCount} متغير` : 'غير موجود'}`);
    });
    
    // Configuration files status
    console.log('\n📋 ملفات التكوين:');
    Object.entries(this.results.configFiles).forEach(([fileName, fileData]) => {
      const status = fileData.exists ? (fileData.isValid ? '✅' : '⚠️') : '❌';
      console.log(`  ${status} ${fileName}: ${fileData.exists ? (fileData.isValid ? 'صحيح' : 'يحتاج مراجعة') : 'غير موجود'}`);
    });
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في البيئة');
    }
    
    // Recommendations
    console.log('\n💡 التوصيات:');
    if (this.results.summary.configStatus === 'GOOD') {
      console.log('  🎉 إعدادات البيئة جيدة');
    } else {
      console.log('  🔧 إضافة المتغيرات المطلوبة المفقودة');
      console.log('  📝 مراجعة ملف .env.example للمرجع');
    }
    
    if (!this.results.envFiles['.env'].exists) {
      console.log('  📄 إنشاء ملف .env من .env.example');
    }
    
    // Save results to file
    this.saveEnvironmentReport();
  }

  /**
   * Save environment report to file
   */
  saveEnvironmentReport() {
    const reportPath = path.join(__dirname, '../reports/environment-check-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.summary.configStatus,
        requiredCoverage: (this.results.summary.foundRequired / this.results.summary.totalRequired) * 100,
        totalIssues: this.results.issues.length,
        criticalIssues: this.results.issues.filter(i => i.type === 'CRITICAL').length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = EnvironmentChecker;

// Run if called directly
if (require.main === module) {
  const checker = new EnvironmentChecker();
  checker.runEnvironmentCheck().catch(console.error);
}
