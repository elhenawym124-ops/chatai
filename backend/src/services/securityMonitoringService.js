/**
 * Security Monitoring Service
 * نظام مراقبة الأمان الشامل
 */

class SecurityMonitoringService {
  constructor() {
    this.alerts = [];
    this.metrics = {
      totalRequests: 0,
      failedAuthentications: 0,
      suspiciousActivities: 0,
      blockedRequests: 0,
      companyCrossAccess: 0,
      adminAccessAttempts: 0
    };
    this.startTime = Date.now();
  }

  /**
   * تسجيل محاولة مصادقة فاشلة
   */
  logFailedAuthentication(ip, userAgent, endpoint) {
    this.metrics.failedAuthentications++;
    
    const alert = {
      type: 'FAILED_AUTHENTICATION',
      severity: 'MEDIUM',
      timestamp: new Date().toISOString(),
      details: { ip, userAgent, endpoint },
      message: `محاولة مصادقة فاشلة من ${ip}`
    };

    this.addAlert(alert);
    console.log(`🚨 [AUTH-FAIL] ${alert.message}`, alert.details);
  }

  /**
   * تسجيل نشاط مشبوه
   */
  logSuspiciousActivity(type, ip, details) {
    this.metrics.suspiciousActivities++;
    
    const alert = {
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      details: { ip, type, ...details },
      message: `نشاط مشبوه: ${type} من ${ip}`
    };

    this.addAlert(alert);
    console.log(`🚨 [SUSPICIOUS] ${alert.message}`, alert.details);
  }

  /**
   * تسجيل محاولة وصول لشركة أخرى
   */
  logCrossCompanyAccess(userId, userCompanyId, requestedCompanyId, endpoint) {
    this.metrics.companyCrossAccess++;
    
    const alert = {
      type: 'CROSS_COMPANY_ACCESS',
      severity: 'HIGH',
      timestamp: new Date().toISOString(),
      details: { userId, userCompanyId, requestedCompanyId, endpoint },
      message: `محاولة وصول لشركة أخرى من المستخدم ${userId}`
    };

    this.addAlert(alert);
    console.log(`🚨 [CROSS-ACCESS] ${alert.message}`, alert.details);
  }

  /**
   * تسجيل محاولة وصول إداري غير مصرح به
   */
  logUnauthorizedAdminAccess(userId, role, endpoint, ip) {
    this.metrics.adminAccessAttempts++;
    
    const alert = {
      type: 'UNAUTHORIZED_ADMIN_ACCESS',
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      details: { userId, role, endpoint, ip },
      message: `محاولة وصول إداري غير مصرح به من المستخدم ${userId} (${role})`
    };

    this.addAlert(alert);
    console.log(`🚨 [ADMIN-UNAUTHORIZED] ${alert.message}`, alert.details);
  }

  /**
   * تسجيل طلب محظور
   */
  logBlockedRequest(reason, ip, endpoint, details = {}) {
    this.metrics.blockedRequests++;
    
    const alert = {
      type: 'BLOCKED_REQUEST',
      severity: 'MEDIUM',
      timestamp: new Date().toISOString(),
      details: { reason, ip, endpoint, ...details },
      message: `طلب محظور: ${reason} من ${ip}`
    };

    this.addAlert(alert);
    console.log(`🚫 [BLOCKED] ${alert.message}`, alert.details);
  }

  /**
   * إضافة تنبيه جديد
   */
  addAlert(alert) {
    this.alerts.push(alert);
    
    // الاحتفاظ بآخر 1000 تنبيه فقط
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }

    // إرسال تنبيهات فورية للتنبيهات الحرجة
    if (alert.severity === 'CRITICAL') {
      this.sendCriticalAlert(alert);
    }
  }

  /**
   * إرسال تنبيه حرج
   */
  sendCriticalAlert(alert) {
    // يمكن إضافة إرسال email أو webhook هنا
    console.log(`🚨🚨 [CRITICAL ALERT] ${alert.message}`);
    
    // في بيئة الإنتاج، يمكن إرسال تنبيه لـ Slack أو email
    // await this.sendSlackAlert(alert);
    // await this.sendEmailAlert(alert);
  }

  /**
   * الحصول على إحصائيات الأمان
   */
  getSecurityStats() {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    return {
      uptime: {
        milliseconds: uptime,
        formatted: `${uptimeHours}h ${uptimeMinutes}m`
      },
      metrics: { ...this.metrics },
      recentAlerts: this.alerts.slice(-10),
      alertsByType: this.getAlertsByType(),
      securityScore: this.calculateSecurityScore()
    };
  }

  /**
   * تجميع التنبيهات حسب النوع
   */
  getAlertsByType() {
    const alertsByType = {};
    
    this.alerts.forEach(alert => {
      if (!alertsByType[alert.type]) {
        alertsByType[alert.type] = 0;
      }
      alertsByType[alert.type]++;
    });

    return alertsByType;
  }

  /**
   * حساب نقاط الأمان
   */
  calculateSecurityScore() {
    const totalRequests = this.metrics.totalRequests || 1;
    const securityIssues = 
      this.metrics.failedAuthentications +
      this.metrics.suspiciousActivities +
      this.metrics.companyCrossAccess +
      this.metrics.adminAccessAttempts;

    const issueRate = securityIssues / totalRequests;
    const score = Math.max(0, Math.min(100, 100 - (issueRate * 1000)));

    let level = 'ممتاز';
    if (score < 95) level = 'جيد جداً';
    if (score < 85) level = 'جيد';
    if (score < 75) level = 'متوسط';
    if (score < 60) level = 'ضعيف';

    return {
      score: Math.round(score),
      level,
      issueRate: Math.round(issueRate * 10000) / 100 + '%'
    };
  }

  /**
   * تنظيف التنبيهات القديمة
   */
  cleanupOldAlerts(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;
    
    this.alerts = this.alerts.filter(alert => {
      return new Date(alert.timestamp).getTime() > cutoff;
    });
  }

  /**
   * الحصول على تقرير أمني يومي
   */
  getDailySecurityReport() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const dailyAlerts = this.alerts.filter(alert => {
      return new Date(alert.timestamp) > yesterday;
    });

    const criticalAlerts = dailyAlerts.filter(alert => alert.severity === 'CRITICAL');
    const highAlerts = dailyAlerts.filter(alert => alert.severity === 'HIGH');
    const mediumAlerts = dailyAlerts.filter(alert => alert.severity === 'MEDIUM');

    return {
      period: {
        from: yesterday.toISOString(),
        to: now.toISOString()
      },
      summary: {
        totalAlerts: dailyAlerts.length,
        critical: criticalAlerts.length,
        high: highAlerts.length,
        medium: mediumAlerts.length
      },
      metrics: { ...this.metrics },
      topThreats: this.getTopThreats(dailyAlerts),
      recommendations: this.getSecurityRecommendations()
    };
  }

  /**
   * الحصول على أهم التهديدات
   */
  getTopThreats(alerts) {
    const threatCounts = {};
    
    alerts.forEach(alert => {
      const key = `${alert.type}_${alert.details.ip || 'unknown'}`;
      if (!threatCounts[key]) {
        threatCounts[key] = { count: 0, type: alert.type, ip: alert.details.ip };
      }
      threatCounts[key].count++;
    });

    return Object.values(threatCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * الحصول على توصيات أمنية
   */
  getSecurityRecommendations() {
    const recommendations = [];
    
    if (this.metrics.failedAuthentications > 10) {
      recommendations.push('تفعيل 2FA للمستخدمين');
      recommendations.push('تقليل محاولات تسجيل الدخول المسموحة');
    }

    if (this.metrics.companyCrossAccess > 0) {
      recommendations.push('مراجعة صلاحيات المستخدمين');
      recommendations.push('تعزيز عزل البيانات');
    }

    if (this.metrics.suspiciousActivities > 5) {
      recommendations.push('تفعيل WAF (Web Application Firewall)');
      recommendations.push('إضافة IP blocking للعناوين المشبوهة');
    }

    if (recommendations.length === 0) {
      recommendations.push('النظام آمن - استمر في المراقبة الدورية');
    }

    return recommendations;
  }

  /**
   * تسجيل طلب عادي
   */
  logRequest() {
    this.metrics.totalRequests++;
  }
}

// إنشاء instance واحد للخدمة
const securityMonitor = new SecurityMonitoringService();

module.exports = {
  SecurityMonitoringService,
  securityMonitor
};
