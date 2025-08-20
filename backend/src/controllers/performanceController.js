const { performanceMonitor } = require('../services/performanceMonitor');
const { cacheService } = require('../services/cacheService');

/**
 * Controller لمراقبة الأداء والإحصائيات
 */
class PerformanceController {
  /**
   * الحصول على ملخص الأداء
   */
  async getPerformanceSummary(req, res) {
    try {
      const summary = performanceMonitor.getPerformanceSummary();
      
      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب ملخص الأداء:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب ملخص الأداء',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على الإحصائيات المفصلة
   */
  async getDetailedMetrics(req, res) {
    try {
      const metrics = performanceMonitor.getMetrics();
      
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات المفصلة:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب الإحصائيات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على إحصائيات Cache
   */
  async getCacheStats(req, res) {
    try {
      const cacheStats = cacheService.getStats();
      
      res.json({
        success: true,
        data: {
          cache: cacheStats,
          performance: {
            hits: performanceMonitor.metrics.cache.hits,
            misses: performanceMonitor.metrics.cache.misses,
            hitRate: performanceMonitor.metrics.cache.hitRate.toFixed(2) + '%'
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات Cache:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب إحصائيات Cache',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * مسح Cache
   */
  async clearCache(req, res) {
    try {
      cacheService.clear();
      
      res.json({
        success: true,
        message: 'تم مسح Cache بنجاح',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في مسح Cache:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في مسح Cache',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * إعادة تعيين الإحصائيات
   */
  async resetMetrics(req, res) {
    try {
      performanceMonitor.resetMetrics();
      
      res.json({
        success: true,
        message: 'تم إعادة تعيين الإحصائيات بنجاح',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في إعادة تعيين الإحصائيات:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في إعادة تعيين الإحصائيات',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * الحصول على تقرير الصحة العامة للنظام
   */
  async getHealthReport(req, res) {
    try {
      const metrics = performanceMonitor.getMetrics();
      const cacheStats = cacheService.getStats();
      
      // تحديد حالة النظام
      const successRate = (metrics.requests.successful / metrics.requests.total) * 100;
      const avgResponseTime = metrics.requests.averageResponseTime;
      
      let healthStatus = 'healthy';
      let healthScore = 100;
      
      // تقليل النقاط بناءً على المشاكل
      if (successRate < 95) {
        healthStatus = 'warning';
        healthScore -= (95 - successRate) * 2;
      }
      
      if (avgResponseTime > 5000) {
        healthStatus = 'warning';
        healthScore -= 20;
      }
      
      if (avgResponseTime > 10000) {
        healthStatus = 'critical';
        healthScore -= 30;
      }
      
      if (successRate < 80) {
        healthStatus = 'critical';
        healthScore -= 30;
      }
      
      healthScore = Math.max(0, Math.min(100, healthScore));
      
      const healthReport = {
        status: healthStatus,
        score: Math.round(healthScore),
        summary: {
          totalRequests: metrics.requests.total,
          successRate: successRate.toFixed(2) + '%',
          averageResponseTime: Math.round(avgResponseTime) + 'ms',
          cacheHitRate: metrics.cache.hitRate.toFixed(2) + '%',
          uptime: Math.round(process.uptime()) + 's',
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
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
            toolsUsed: Object.keys(metrics.systems.advanced.toolUsage).length
          }
        },
        cache: {
          size: cacheStats.size,
          memoryUsage: cacheStats.memoryUsage.kb + 'KB',
          hitRate: metrics.cache.hitRate.toFixed(2) + '%'
        },
        recentErrors: metrics.errors.slice(-3),
        recommendations: performanceMonitor.generateRecommendations()
      };
      
      res.json({
        success: true,
        data: healthReport,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في جلب تقرير الصحة:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في جلب تقرير الصحة',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * اختبار الأداء
   */
  async performanceTest(req, res) {
    try {
      const { iterations = 10, message = 'اختبار الأداء' } = req.body;
      
      console.log(`🧪 بدء اختبار الأداء: ${iterations} تكرار`);
      
      const results = {
        iterations,
        results: [],
        summary: {
          averageTime: 0,
          minTime: Infinity,
          maxTime: 0,
          successCount: 0,
          failureCount: 0
        }
      };
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        try {
          // محاكاة طلب
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          results.results.push({
            iteration: i + 1,
            responseTime,
            success: true
          });
          
          results.summary.successCount++;
          results.summary.minTime = Math.min(results.summary.minTime, responseTime);
          results.summary.maxTime = Math.max(results.summary.maxTime, responseTime);
          
        } catch (error) {
          results.results.push({
            iteration: i + 1,
            responseTime: 0,
            success: false,
            error: error.message
          });
          
          results.summary.failureCount++;
        }
      }
      
      // حساب المتوسط
      const totalTime = results.results.reduce((sum, result) => sum + result.responseTime, 0);
      results.summary.averageTime = totalTime / iterations;
      results.summary.successRate = (results.summary.successCount / iterations) * 100;
      
      console.log(`✅ انتهى اختبار الأداء: ${results.summary.averageTime.toFixed(2)}ms متوسط`);
      
      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ خطأ في اختبار الأداء:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في اختبار الأداء',
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = PerformanceController;
