/**
 * نظام مراقبة الأداء
 * Performance Monitoring System
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      },
      systems: {
        traditional: {
          requests: 0,
          averageTime: 0,
          successRate: 0
        },
        advanced: {
          requests: 0,
          averageTime: 0,
          successRate: 0,
          toolUsage: {}
        }
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      errors: []
    };
    
    // حفظ الإحصائيات كل 5 دقائق
    setInterval(() => {
      this.saveMetrics();
    }, 5 * 60 * 1000);
  }

  /**
   * تسجيل طلب جديد
   */
  recordRequest(systemType, responseTime, success, toolsUsed = []) {
    const timestamp = new Date();
    
    // إحصائيات عامة
    this.metrics.requests.total++;
    this.metrics.requests.responseTimes.push(responseTime);
    
    if (success) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }
    
    // حساب متوسط وقت الاستجابة
    this.metrics.requests.averageResponseTime = 
      this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / 
      this.metrics.requests.responseTimes.length;
    
    // إحصائيات النظام المحدد
    const system = this.metrics.systems[systemType];
    if (system) {
      system.requests++;
      
      // حساب متوسط الوقت للنظام
      if (!system.times) system.times = [];
      system.times.push(responseTime);
      system.averageTime = system.times.reduce((a, b) => a + b, 0) / system.times.length;
      
      // حساب معدل النجاح
      if (!system.successes) system.successes = 0;
      if (success) system.successes++;
      system.successRate = (system.successes / system.requests) * 100;
      
      // تسجيل استخدام الأدوات (للنظام المتقدم)
      if (systemType === 'advanced' && toolsUsed.length > 0) {
        toolsUsed.forEach(tool => {
          if (!system.toolUsage[tool]) {
            system.toolUsage[tool] = 0;
          }
          system.toolUsage[tool]++;
        });
      }
    }
    
    console.log(`📊 Performance: ${systemType} - ${responseTime}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
  }

  /**
   * تسجيل استخدام Cache
   */
  recordCacheUsage(hit) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
    
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = (this.metrics.cache.hits / total) * 100;
  }

  /**
   * تسجيل خطأ
   */
  recordError(error, context = {}) {
    const errorRecord = {
      timestamp: new Date(),
      message: error.message,
      stack: error.stack,
      context
    };
    
    this.metrics.errors.push(errorRecord);
    
    // الاحتفاظ بآخر 100 خطأ فقط
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }
    
    console.error(`📊 Error recorded:`, errorRecord);
  }

  /**
   * الحصول على الإحصائيات الحالية
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * الحصول على ملخص الأداء
   */
  getPerformanceSummary() {
    const metrics = this.getMetrics();
    
    return {
      overview: {
        totalRequests: metrics.requests.total,
        successRate: ((metrics.requests.successful / metrics.requests.total) * 100).toFixed(2) + '%',
        averageResponseTime: Math.round(metrics.requests.averageResponseTime) + 'ms',
        cacheHitRate: metrics.cache.hitRate.toFixed(2) + '%'
      },
      systems: {
        traditional: {
          requests: metrics.systems.traditional.requests,
          averageTime: Math.round(metrics.systems.traditional.averageTime) + 'ms',
          successRate: metrics.systems.traditional.successRate.toFixed(2) + '%'
        },
        advanced: {
          requests: metrics.systems.advanced.requests,
          averageTime: Math.round(metrics.systems.advanced.averageTime) + 'ms',
          successRate: metrics.systems.advanced.successRate.toFixed(2) + '%',
          mostUsedTools: this.getMostUsedTools()
        }
      },
      recentErrors: metrics.errors.slice(-5),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * الحصول على أكثر الأدوات استخداماً
   */
  getMostUsedTools() {
    const toolUsage = this.metrics.systems.advanced.toolUsage;
    
    return Object.entries(toolUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tool, count]) => ({ tool, count }));
  }

  /**
   * توليد توصيات للتحسين
   */
  generateRecommendations() {
    const recommendations = [];
    const metrics = this.metrics;
    
    // توصيات بناءً على وقت الاستجابة
    if (metrics.requests.averageResponseTime > 5000) {
      recommendations.push({
        type: 'performance',
        message: 'متوسط وقت الاستجابة مرتفع (>5s). فكر في تحسين الاستعلامات أو زيادة Cache.',
        priority: 'high'
      });
    }
    
    // توصيات بناءً على معدل النجاح
    const successRate = (metrics.requests.successful / metrics.requests.total) * 100;
    if (successRate < 95) {
      recommendations.push({
        type: 'reliability',
        message: 'معدل النجاح منخفض (<95%). راجع الأخطاء الأخيرة.',
        priority: 'high'
      });
    }
    
    // توصيات بناءً على Cache
    if (metrics.cache.hitRate < 50) {
      recommendations.push({
        type: 'cache',
        message: 'معدل إصابة Cache منخفض (<50%). راجع استراتيجية التخزين المؤقت.',
        priority: 'medium'
      });
    }
    
    // توصيات بناءً على مقارنة الأنظمة
    const traditionalTime = metrics.systems.traditional.averageTime;
    const advancedTime = metrics.systems.advanced.averageTime;
    
    if (traditionalTime > 0 && advancedTime > 0) {
      if (advancedTime > traditionalTime * 2) {
        recommendations.push({
          type: 'system',
          message: 'النظام المتقدم أبطأ بكثير من التقليدي. راجع استخدام الأدوات.',
          priority: 'medium'
        });
      } else if (traditionalTime > advancedTime * 1.5) {
        recommendations.push({
          type: 'system',
          message: 'النظام المتقدم أسرع من التقليدي. فكر في التبديل الكامل.',
          priority: 'low'
        });
      }
    }
    
    return recommendations;
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  resetMetrics() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        responseTimes: []
      },
      systems: {
        traditional: {
          requests: 0,
          averageTime: 0,
          successRate: 0
        },
        advanced: {
          requests: 0,
          averageTime: 0,
          successRate: 0,
          toolUsage: {}
        }
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0
      },
      errors: []
    };
    
    console.log('📊 Performance metrics reset');
  }

  /**
   * حفظ الإحصائيات (مستقبلياً في قاعدة البيانات)
   */
  async saveMetrics() {
    try {
      // مستقبلياً: حفظ في قاعدة البيانات
      const summary = this.getPerformanceSummary();
      console.log('📊 Performance summary:', summary.overview);
    } catch (error) {
      console.error('❌ Error saving metrics:', error);
    }
  }
}

// إنشاء instance مشترك
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor
};
