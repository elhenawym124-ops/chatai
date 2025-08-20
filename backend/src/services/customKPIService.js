/**
 * Custom KPI Service
 * 
 * Handles customizable Key Performance Indicators,
 * metrics definitions, and performance tracking
 */

class CustomKPIService {
  constructor() {
    this.kpiDefinitions = new Map(); // KPI definitions
    this.kpiValues = new Map(); // Current KPI values
    this.kpiTargets = new Map(); // KPI targets
    this.kpiHistory = new Map(); // Historical KPI data
    this.dashboards = new Map(); // Custom KPI dashboards
    this.alerts = new Map(); // KPI alerts
    this.initializeMockData();
  }

  /**
   * Initialize mock data for KPIs
   */
  initializeMockData() {
    // Mock KPI definitions
    const mockKPIDefinitions = [
      {
        id: 'REVENUE_GROWTH',
        name: 'نمو الإيرادات',
        description: 'معدل نمو الإيرادات الشهري',
        category: 'financial',
        type: 'percentage',
        formula: '((current_revenue - previous_revenue) / previous_revenue) * 100',
        unit: '%',
        frequency: 'monthly',
        target: 15,
        threshold: {
          excellent: 20,
          good: 15,
          warning: 10,
          critical: 5,
        },
        dataSources: ['orders', 'revenue'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'CUSTOMER_ACQUISITION_COST',
        name: 'تكلفة اكتساب العميل',
        description: 'متوسط تكلفة اكتساب عميل جديد',
        category: 'marketing',
        type: 'currency',
        formula: 'total_marketing_spend / new_customers_acquired',
        unit: 'ريال',
        frequency: 'monthly',
        target: 100,
        threshold: {
          excellent: 80,
          good: 100,
          warning: 120,
          critical: 150,
        },
        dataSources: ['marketing_spend', 'customers'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'CUSTOMER_LIFETIME_VALUE',
        name: 'قيمة العميل مدى الحياة',
        description: 'متوسط قيمة العميل طوال فترة العلاقة',
        category: 'customer',
        type: 'currency',
        formula: 'average_order_value * purchase_frequency * customer_lifespan',
        unit: 'ريال',
        frequency: 'monthly',
        target: 4000,
        threshold: {
          excellent: 5000,
          good: 4000,
          warning: 3000,
          critical: 2000,
        },
        dataSources: ['orders', 'customers'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'CONVERSION_RATE',
        name: 'معدل التحويل',
        description: 'نسبة الزوار الذين يقومون بالشراء',
        category: 'sales',
        type: 'percentage',
        formula: '(orders / website_visitors) * 100',
        unit: '%',
        frequency: 'daily',
        target: 3.5,
        threshold: {
          excellent: 5,
          good: 3.5,
          warning: 2.5,
          critical: 1.5,
        },
        dataSources: ['orders', 'website_analytics'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'CUSTOMER_SATISFACTION',
        name: 'رضا العملاء',
        description: 'متوسط تقييم رضا العملاء',
        category: 'customer',
        type: 'rating',
        formula: 'sum(satisfaction_ratings) / count(satisfaction_ratings)',
        unit: '/5',
        frequency: 'weekly',
        target: 4.5,
        threshold: {
          excellent: 4.5,
          good: 4.0,
          warning: 3.5,
          critical: 3.0,
        },
        dataSources: ['feedback', 'reviews'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'RESPONSE_TIME',
        name: 'وقت الاستجابة',
        description: 'متوسط وقت الاستجابة للرسائل',
        category: 'support',
        type: 'time',
        formula: 'sum(response_times) / count(messages)',
        unit: 'دقيقة',
        frequency: 'daily',
        target: 5,
        threshold: {
          excellent: 2,
          good: 5,
          warning: 10,
          critical: 15,
        },
        dataSources: ['conversations', 'messages'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'INVENTORY_TURNOVER',
        name: 'دوران المخزون',
        description: 'معدل دوران المخزون السنوي',
        category: 'operations',
        type: 'ratio',
        formula: 'cost_of_goods_sold / average_inventory',
        unit: 'مرة/سنة',
        frequency: 'monthly',
        target: 12,
        threshold: {
          excellent: 15,
          good: 12,
          warning: 8,
          critical: 5,
        },
        dataSources: ['inventory', 'sales'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'RETURN_RATE',
        name: 'معدل المرتجعات',
        description: 'نسبة المنتجات المرتجعة',
        category: 'quality',
        type: 'percentage',
        formula: '(returned_items / total_items_sold) * 100',
        unit: '%',
        frequency: 'monthly',
        target: 5,
        threshold: {
          excellent: 2,
          good: 5,
          warning: 8,
          critical: 12,
        },
        dataSources: ['returns', 'orders'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockKPIDefinitions.forEach(kpi => {
      this.kpiDefinitions.set(kpi.id, kpi);
    });

    // Mock current KPI values
    const mockKPIValues = {
      'REVENUE_GROWTH': { value: 18.5, status: 'excellent', lastUpdated: new Date() },
      'CUSTOMER_ACQUISITION_COST': { value: 95, status: 'excellent', lastUpdated: new Date() },
      'CUSTOMER_LIFETIME_VALUE': { value: 4250, status: 'good', lastUpdated: new Date() },
      'CONVERSION_RATE': { value: 3.2, status: 'warning', lastUpdated: new Date() },
      'CUSTOMER_SATISFACTION': { value: 4.3, status: 'good', lastUpdated: new Date() },
      'RESPONSE_TIME': { value: 3.5, status: 'good', lastUpdated: new Date() },
      'INVENTORY_TURNOVER': { value: 10.2, status: 'warning', lastUpdated: new Date() },
      'RETURN_RATE': { value: 4.1, status: 'good', lastUpdated: new Date() },
    };

    Object.entries(mockKPIValues).forEach(([kpiId, data]) => {
      this.kpiValues.set(kpiId, data);
    });

    // Mock KPI history
    const mockKPIHistory = {
      'REVENUE_GROWTH': this.generateKPIHistory(15, 25, 'percentage'),
      'CUSTOMER_ACQUISITION_COST': this.generateKPIHistory(80, 120, 'currency'),
      'CUSTOMER_LIFETIME_VALUE': this.generateKPIHistory(3500, 4500, 'currency'),
      'CONVERSION_RATE': this.generateKPIHistory(2.5, 4.0, 'percentage'),
      'CUSTOMER_SATISFACTION': this.generateKPIHistory(3.8, 4.6, 'rating'),
      'RESPONSE_TIME': this.generateKPIHistory(2, 8, 'time'),
    };

    Object.entries(mockKPIHistory).forEach(([kpiId, history]) => {
      this.kpiHistory.set(kpiId, history);
    });

    // Mock custom dashboards
    const mockDashboards = [
      {
        id: 'EXECUTIVE_DASHBOARD',
        name: 'لوحة الإدارة التنفيذية',
        description: 'مؤشرات الأداء الرئيسية للإدارة العليا',
        kpis: [
          'REVENUE_GROWTH',
          'CUSTOMER_LIFETIME_VALUE',
          'CUSTOMER_ACQUISITION_COST',
          'CUSTOMER_SATISFACTION',
        ],
        layout: {
          columns: 2,
          rows: 2,
        },
        refreshInterval: 3600, // 1 hour
        isDefault: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'SALES_DASHBOARD',
        name: 'لوحة المبيعات',
        description: 'مؤشرات أداء فريق المبيعات',
        kpis: [
          'CONVERSION_RATE',
          'REVENUE_GROWTH',
          'CUSTOMER_ACQUISITION_COST',
          'RETURN_RATE',
        ],
        layout: {
          columns: 2,
          rows: 2,
        },
        refreshInterval: 1800, // 30 minutes
        isDefault: false,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'OPERATIONS_DASHBOARD',
        name: 'لوحة العمليات',
        description: 'مؤشرات أداء العمليات التشغيلية',
        kpis: [
          'INVENTORY_TURNOVER',
          'RESPONSE_TIME',
          'RETURN_RATE',
          'CUSTOMER_SATISFACTION',
        ],
        layout: {
          columns: 2,
          rows: 2,
        },
        refreshInterval: 900, // 15 minutes
        isDefault: false,
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockDashboards.forEach(dashboard => {
      this.dashboards.set(dashboard.id, dashboard);
    });

    // Mock alerts
    const mockAlerts = [
      {
        id: 'ALERT001',
        kpiId: 'CONVERSION_RATE',
        type: 'threshold',
        condition: 'below',
        threshold: 3.0,
        currentValue: 2.8,
        severity: 'warning',
        message: 'معدل التحويل أقل من المستهدف',
        isActive: true,
        triggeredAt: new Date(),
        companyId: '1',
      },
      {
        id: 'ALERT002',
        kpiId: 'INVENTORY_TURNOVER',
        type: 'trend',
        condition: 'declining',
        threshold: -10, // percentage
        currentTrend: -15,
        severity: 'warning',
        message: 'انخفاض في معدل دوران المخزون',
        isActive: true,
        triggeredAt: new Date(),
        companyId: '1',
      },
    ];

    mockAlerts.forEach(alert => {
      this.alerts.set(alert.id, alert);
    });
  }

  /**
   * Get all KPI definitions
   */
  async getKPIDefinitions(filters = {}) {
    try {
      const { companyId = '1', category, isActive } = filters;

      let kpis = Array.from(this.kpiDefinitions.values());

      // Apply filters
      if (companyId) {
        kpis = kpis.filter(kpi => kpi.companyId === companyId);
      }
      if (category) {
        kpis = kpis.filter(kpi => kpi.category === category);
      }
      if (isActive !== undefined) {
        kpis = kpis.filter(kpi => kpi.isActive === isActive);
      }

      return {
        success: true,
        data: kpis
      };

    } catch (error) {
      console.error('Error getting KPI definitions:', error);
      return {
        success: false,
        error: 'فشل في جلب تعريفات مؤشرات الأداء'
      };
    }
  }

  /**
   * Create custom KPI
   */
  async createCustomKPI(kpiData) {
    try {
      const {
        name,
        description,
        category,
        type,
        formula,
        unit,
        frequency,
        target,
        threshold,
        dataSources,
        companyId,
      } = kpiData;

      const kpi = {
        id: this.generateKPIId(),
        name,
        description,
        category,
        type,
        formula,
        unit,
        frequency,
        target,
        threshold: threshold || this.generateDefaultThreshold(target, type),
        dataSources,
        isActive: true,
        companyId,
        createdAt: new Date(),
      };

      this.kpiDefinitions.set(kpi.id, kpi);

      return {
        success: true,
        data: kpi,
        message: 'تم إنشاء مؤشر الأداء بنجاح'
      };

    } catch (error) {
      console.error('Error creating custom KPI:', error);
      return {
        success: false,
        error: 'فشل في إنشاء مؤشر الأداء'
      };
    }
  }

  /**
   * Get KPI dashboard
   */
  async getKPIDashboard(dashboardId) {
    try {
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        return {
          success: false,
          error: 'لوحة المؤشرات غير موجودة'
        };
      }

      // Get current values for all KPIs in dashboard
      const kpiData = {};
      for (const kpiId of dashboard.kpis) {
        const definition = this.kpiDefinitions.get(kpiId);
        const currentValue = this.kpiValues.get(kpiId);
        const history = this.kpiHistory.get(kpiId) || [];

        if (definition && currentValue) {
          kpiData[kpiId] = {
            definition,
            currentValue,
            history: history.slice(-30), // Last 30 data points
            trend: this.calculateTrend(history),
            performance: this.calculatePerformance(currentValue.value, definition.threshold),
          };
        }
      }

      return {
        success: true,
        data: {
          dashboard,
          kpiData,
          summary: this.generateDashboardSummary(kpiData),
          alerts: this.getActiveAlerts(dashboard.kpis),
        }
      };

    } catch (error) {
      console.error('Error getting KPI dashboard:', error);
      return {
        success: false,
        error: 'فشل في جلب لوحة مؤشرات الأداء'
      };
    }
  }

  /**
   * Update KPI value
   */
  async updateKPIValue(kpiId, value, timestamp = new Date()) {
    try {
      const definition = this.kpiDefinitions.get(kpiId);
      if (!definition) {
        return {
          success: false,
          error: 'مؤشر الأداء غير موجود'
        };
      }

      // Calculate status based on thresholds
      const status = this.calculateStatus(value, definition.threshold);

      // Update current value
      this.kpiValues.set(kpiId, {
        value,
        status,
        lastUpdated: timestamp,
      });

      // Add to history
      let history = this.kpiHistory.get(kpiId) || [];
      history.push({
        value,
        timestamp,
        status,
      });

      // Keep only last 100 entries
      if (history.length > 100) {
        history = history.slice(-100);
      }
      this.kpiHistory.set(kpiId, history);

      // Check for alerts
      this.checkKPIAlerts(kpiId, value, status);

      return {
        success: true,
        data: {
          kpiId,
          value,
          status,
          timestamp,
        },
        message: 'تم تحديث قيمة مؤشر الأداء'
      };

    } catch (error) {
      console.error('Error updating KPI value:', error);
      return {
        success: false,
        error: 'فشل في تحديث قيمة مؤشر الأداء'
      };
    }
  }

  /**
   * Get KPI analytics
   */
  async getKPIAnalytics(filters = {}) {
    try {
      const { companyId = '1', period = 'month', kpiIds } = filters;

      let targetKPIs = kpiIds || Array.from(this.kpiDefinitions.keys());
      
      const analytics = {
        overview: this.calculateKPIOverview(targetKPIs),
        performance: this.calculateKPIPerformance(targetKPIs),
        trends: this.calculateKPITrends(targetKPIs, period),
        correlations: this.calculateKPICorrelations(targetKPIs),
        recommendations: this.generateKPIRecommendations(targetKPIs),
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      console.error('Error getting KPI analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات مؤشرات الأداء'
      };
    }
  }

  /**
   * Helper methods
   */
  generateKPIHistory(min, max, type) {
    const history = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let value;
      if (type === 'percentage') {
        value = Math.random() * (max - min) + min;
      } else if (type === 'currency') {
        value = Math.floor(Math.random() * (max - min) + min);
      } else if (type === 'rating') {
        value = Math.random() * (max - min) + min;
      } else {
        value = Math.random() * (max - min) + min;
      }

      history.push({
        value: Math.round(value * 100) / 100,
        timestamp: date,
        status: this.calculateStatus(value, { excellent: max * 0.9, good: max * 0.7, warning: max * 0.5, critical: max * 0.3 }),
      });
    }
    return history;
  }

  calculateStatus(value, threshold) {
    if (value >= threshold.excellent) return 'excellent';
    if (value >= threshold.good) return 'good';
    if (value >= threshold.warning) return 'warning';
    return 'critical';
  }

  calculateTrend(history) {
    if (history.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = history.slice(-7); // Last 7 data points
    const older = history.slice(-14, -7); // Previous 7 data points
    
    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentage),
    };
  }

  calculatePerformance(value, threshold) {
    const status = this.calculateStatus(value, threshold);
    const targetAchievement = (value / threshold.good) * 100;
    
    return {
      status,
      targetAchievement: Math.round(targetAchievement),
      isOnTarget: status === 'excellent' || status === 'good',
    };
  }

  generateDefaultThreshold(target, type) {
    if (type === 'percentage') {
      return {
        excellent: target * 1.2,
        good: target,
        warning: target * 0.8,
        critical: target * 0.6,
      };
    } else if (type === 'currency' || type === 'time') {
      return {
        excellent: target * 0.8,
        good: target,
        warning: target * 1.2,
        critical: target * 1.5,
      };
    } else {
      return {
        excellent: target * 1.1,
        good: target,
        warning: target * 0.9,
        critical: target * 0.8,
      };
    }
  }

  checkKPIAlerts(kpiId, value, status) {
    const definition = this.kpiDefinitions.get(kpiId);
    if (!definition) return;

    // Check if alert should be triggered
    if (status === 'warning' || status === 'critical') {
      const alertId = `ALERT_${kpiId}_${Date.now()}`;
      const alert = {
        id: alertId,
        kpiId,
        type: 'threshold',
        condition: 'below',
        threshold: definition.threshold.good,
        currentValue: value,
        severity: status,
        message: `${definition.name} ${status === 'critical' ? 'في حالة حرجة' : 'يحتاج انتباه'}`,
        isActive: true,
        triggeredAt: new Date(),
        companyId: definition.companyId,
      };
      
      this.alerts.set(alertId, alert);
    }
  }

  generateKPIId() {
    return `KPI${Date.now().toString(36).toUpperCase()}`;
  }

  calculateKPIOverview(kpiIds) {
    const overview = {
      total: kpiIds.length,
      excellent: 0,
      good: 0,
      warning: 0,
      critical: 0,
    };

    kpiIds.forEach(kpiId => {
      const value = this.kpiValues.get(kpiId);
      if (value) {
        overview[value.status]++;
      }
    });

    return overview;
  }

  generateDashboardSummary(kpiData) {
    const kpis = Object.values(kpiData);
    const totalKPIs = kpis.length;
    const onTargetKPIs = kpis.filter(kpi => kpi.performance.isOnTarget).length;
    
    return {
      totalKPIs,
      onTargetKPIs,
      performanceRate: totalKPIs > 0 ? (onTargetKPIs / totalKPIs) * 100 : 0,
      lastUpdated: new Date(),
    };
  }

  getActiveAlerts(kpiIds) {
    return Array.from(this.alerts.values())
      .filter(alert => alert.isActive && kpiIds.includes(alert.kpiId))
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }
}

module.exports = new CustomKPIService();
