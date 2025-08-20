/**
 * نظام اكتشاف الأنماط التلقائي
 * Automatic Pattern Detection System
 */

const PatternDetector = require('./src/services/patternDetector');

class AutoPatternDetector {
  constructor() {
    this.detector = new PatternDetector();
    this.companyId = 'cme4yvrco002kuftceydlrwdi';
    this.isRunning = false;
    this.intervalId = null;
    this.detectionInterval = 60 * 60 * 1000; // كل ساعة
    this.lastDetection = null;
    
    console.log('🤖 [AutoDetector] Automatic Pattern Detection System initialized');
  }

  /**
   * بدء النظام التلقائي
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ [AutoDetector] System is already running');
      return;
    }

    console.log('🚀 [AutoDetector] Starting automatic pattern detection...');
    console.log(`⏰ [AutoDetector] Detection interval: ${this.detectionInterval / 1000 / 60} minutes`);
    
    this.isRunning = true;
    
    // تشغيل فوري
    this.detectPatterns();
    
    // جدولة التشغيل التلقائي
    this.intervalId = setInterval(() => {
      this.detectPatterns();
    }, this.detectionInterval);

    console.log('✅ [AutoDetector] Automatic detection started successfully');
  }

  /**
   * إيقاف النظام التلقائي
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ [AutoDetector] System is not running');
      return;
    }

    console.log('🛑 [AutoDetector] Stopping automatic pattern detection...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    console.log('✅ [AutoDetector] Automatic detection stopped');
  }

  /**
   * اكتشاف الأنماط
   */
  async detectPatterns() {
    const startTime = new Date();
    console.log(`\n🔍 [AutoDetector] Starting pattern detection at ${startTime.toLocaleString('ar-EG')}`);

    try {
      // اكتشاف الأنماط الجديدة
      const result = await this.detector.detectNewPatterns(this.companyId, 7);
      
      const endTime = new Date();
      const duration = endTime - startTime;
      
      console.log(`⏱️ [AutoDetector] Detection completed in ${duration}ms`);
      console.log(`📊 [AutoDetector] Results:`);
      console.log(`   - Success: ${result.success}`);
      console.log(`   - Patterns found: ${result.patterns?.length || 0}`);
      console.log(`   - Total detected: ${result.metadata?.totalDetected || 0}`);
      console.log(`   - Significant: ${result.metadata?.significantCount || 0}`);

      if (result.success && result.patterns && result.patterns.length > 0) {
        console.log('🎉 [AutoDetector] New patterns detected!');
        
        // عرض الأنماط الجديدة
        result.patterns.forEach((pattern, index) => {
          console.log(`   ${index + 1}. ${pattern.description.substring(0, 80)}...`);
          console.log(`      💪 Strength: ${(pattern.strength * 100).toFixed(0)}%`);
          console.log(`      🔍 Needs approval: ${!pattern.isApproved ? 'Yes' : 'No'}`);
        });

        // إشعار (يمكن إضافة إشعارات حقيقية هنا)
        this.notifyNewPatterns(result.patterns);
      } else {
        console.log('📭 [AutoDetector] No new patterns detected');
      }

      this.lastDetection = {
        timestamp: endTime,
        success: result.success,
        patternsCount: result.patterns?.length || 0,
        duration: duration
      };

    } catch (error) {
      console.error('❌ [AutoDetector] Error during pattern detection:', error.message);
      
      this.lastDetection = {
        timestamp: new Date(),
        success: false,
        error: error.message,
        duration: new Date() - startTime
      };
    }
  }

  /**
   * إشعار بالأنماط الجديدة
   */
  notifyNewPatterns(patterns) {
    console.log(`\n📢 [AutoDetector] NOTIFICATION: ${patterns.length} new patterns detected!`);
    console.log('🔗 [AutoDetector] Check them at: http://localhost:3000/pattern-management');
    console.log('✅ [AutoDetector] Patterns are waiting for your approval');
    
    // يمكن إضافة إشعارات حقيقية هنا:
    // - إرسال إيميل
    // - إشعار في الواجهة
    // - رسالة واتساب
    // - إلخ...
  }

  /**
   * حالة النظام
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      detectionInterval: this.detectionInterval,
      lastDetection: this.lastDetection,
      nextDetection: this.isRunning && this.lastDetection ? 
        new Date(this.lastDetection.timestamp.getTime() + this.detectionInterval) : null
    };
  }

  /**
   * تغيير فترة الاكتشاف
   */
  setInterval(minutes) {
    const newInterval = minutes * 60 * 1000;
    
    console.log(`⏰ [AutoDetector] Changing detection interval from ${this.detectionInterval / 1000 / 60} to ${minutes} minutes`);
    
    this.detectionInterval = newInterval;
    
    if (this.isRunning) {
      console.log('🔄 [AutoDetector] Restarting with new interval...');
      this.stop();
      this.start();
    }
  }

  /**
   * إحصائيات النظام
   */
  getStats() {
    const status = this.getStatus();
    
    console.log('\n📊 [AutoDetector] System Statistics:');
    console.log(`   🔄 Status: ${status.isRunning ? 'Running' : 'Stopped'}`);
    console.log(`   ⏰ Interval: ${status.detectionInterval / 1000 / 60} minutes`);
    
    if (status.lastDetection) {
      console.log(`   📅 Last detection: ${status.lastDetection.timestamp.toLocaleString('ar-EG')}`);
      console.log(`   ✅ Last success: ${status.lastDetection.success}`);
      console.log(`   🎯 Last patterns: ${status.lastDetection.patternsCount || 0}`);
      console.log(`   ⏱️ Last duration: ${status.lastDetection.duration}ms`);
    }
    
    if (status.nextDetection) {
      console.log(`   ⏭️ Next detection: ${status.nextDetection.toLocaleString('ar-EG')}`);
    }
    
    return status;
  }
}

// إنشاء instance عام
const autoDetector = new AutoPatternDetector();

// معالجة إشارات النظام للإغلاق الآمن
process.on('SIGINT', () => {
  console.log('\n🛑 [AutoDetector] Received SIGINT, shutting down gracefully...');
  autoDetector.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 [AutoDetector] Received SIGTERM, shutting down gracefully...');
  autoDetector.stop();
  process.exit(0);
});

// إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  console.log('🤖 Starting Automatic Pattern Detection System...\n');
  
  // عرض التعليمات
  console.log('📋 Available commands:');
  console.log('   - start: بدء النظام التلقائي');
  console.log('   - stop: إيقاف النظام');
  console.log('   - status: عرض حالة النظام');
  console.log('   - detect: اكتشاف فوري');
  console.log('   - interval <minutes>: تغيير فترة الاكتشاف');
  console.log('   - exit: إنهاء البرنامج\n');

  // بدء النظام تلقائياً
  autoDetector.start();

  // واجهة تفاعلية بسيطة
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', async (input) => {
    const [command, ...args] = input.trim().split(' ');
    
    switch (command.toLowerCase()) {
      case 'start':
        autoDetector.start();
        break;
      case 'stop':
        autoDetector.stop();
        break;
      case 'status':
        autoDetector.getStats();
        break;
      case 'detect':
        await autoDetector.detectPatterns();
        break;
      case 'interval':
        const minutes = parseInt(args[0]);
        if (minutes && minutes > 0) {
          autoDetector.setInterval(minutes);
        } else {
          console.log('❌ Please provide valid minutes (e.g., interval 30)');
        }
        break;
      case 'exit':
        autoDetector.stop();
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Unknown command. Available: start, stop, status, detect, interval, exit');
    }
  });
}

module.exports = AutoPatternDetector;
