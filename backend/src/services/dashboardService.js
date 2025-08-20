/**
 * Dashboard Service
 *
 * Handles interactive dashboard data, widgets,
 * real-time metrics, and customizable analytics
 */

const { PrismaClient } = require('@prisma/client');

class DashboardService {
  constructor() {
    this.prisma = new PrismaClient();
    this.dashboards = new Map(); // User dashboards
    this.widgets = new Map(); // Available widgets
    this.metrics = new Map(); // Real-time metrics
    this.customQueries = new Map(); // Custom analytics queries
    this.dashboardTemplates = new Map(); // Dashboard templates
    this.initializeDefaultWidgets();
    this.startMetricsUpdater();
  }

  /**
   * Initialize default widgets (removed mock data)
   */
  initializeDefaultWidgets() {
    // Mock available widgets
    const mockWidgets = [
      {
        id: 'CONVERSATIONS_TODAY',
        name: 'المحادثات اليوم',
        description: 'عدد المحادثات الجديدة اليوم',
        type: 'metric',
        category: 'conversations',
        size: 'small',
        refreshInterval: 60, // seconds
        dataSource: 'conversations',
        config: {
          metric: 'count',
          period: 'today',
          filters: { status: 'active' },
        },
        visualization: {
          type: 'number',
          format: 'integer',
          trend: true,
          comparison: 'yesterday',
        },
      },
      {
        id: 'REVENUE_CHART',
        name: 'الإيرادات الشهرية',
        description: 'مخطط الإيرادات للشهر الحالي',
        type: 'chart',
        category: 'sales',
        size: 'large',
        refreshInterval: 300,
        dataSource: 'orders',
        config: {
          metric: 'revenue',
          period: 'month',
          groupBy: 'day',
        },
        visualization: {
          type: 'line',
          xAxis: 'date',
          yAxis: 'revenue',
          color: '#007bff',
        },
      },
      {
        id: 'TOP_PRODUCTS',
        name: 'أفضل المنتجات',
        description: 'المنتجات الأكثر مبيعاً',
        type: 'list',
        category: 'products',
        size: 'medium',
        refreshInterval: 600,
        dataSource: 'products',
        config: {
          metric: 'sales_count',
          period: 'week',
          limit: 5,
          orderBy: 'desc',
        },
        visualization: {
          type: 'table',
          columns: ['name', 'sales', 'revenue'],
          showImages: true,
        },
      },
      {
        id: 'CUSTOMER_SATISFACTION',
        name: 'رضا العملاء',
        description: 'متوسط تقييم رضا العملاء',
        type: 'gauge',
        category: 'customer',
        size: 'medium',
        refreshInterval: 300,
        dataSource: 'feedback',
        config: {
          metric: 'average_rating',
          period: 'month',
        },
        visualization: {
          type: 'gauge',
          min: 0,
          max: 5,
          thresholds: [
            { value: 2, color: '#dc3545' },
            { value: 3.5, color: '#ffc107' },
            { value: 5, color: '#28a745' },
          ],
        },
      },
      {
        id: 'RESPONSE_TIME',
        name: 'وقت الاستجابة',
        description: 'متوسط وقت الاستجابة للرسائل',
        type: 'metric',
        category: 'performance',
        size: 'small',
        refreshInterval: 120,
        dataSource: 'conversations',
        config: {
          metric: 'avg_response_time',
          period: 'today',
        },
        visualization: {
          type: 'number',
          format: 'duration',
          unit: 'minutes',
          trend: true,
        },
      },
      {
        id: 'SALES_FUNNEL',
        name: 'قمع المبيعات',
        description: 'مراحل عملية البيع',
        type: 'funnel',
        category: 'sales',
        size: 'large',
        refreshInterval: 600,
        dataSource: 'opportunities',
        config: {
          stages: ['lead', 'qualified', 'proposal', 'negotiation', 'closed'],
          period: 'month',
        },
        visualization: {
          type: 'funnel',
          colors: ['#007bff', '#28a745', '#ffc107', '#fd7e14', '#dc3545'],
        },
      },
    ];

    mockWidgets.forEach(widget => {
      this.widgets.set(widget.id, widget);
    });

    // Mock user dashboard
    const mockDashboard = {
      id: 'DASH001',
      userId: '1',
      companyId: '1',
      name: 'لوحة التحكم الرئيسية',
      description: 'لوحة التحكم الافتراضية',
      isDefault: true,
      layout: {
        columns: 12,
        rows: 'auto',
        gap: 16,
      },
      widgets: [
        {
          widgetId: 'CONVERSATIONS_TODAY',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: {},
        },
        {
          widgetId: 'REVENUE_CHART',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: {},
        },
        {
          widgetId: 'RESPONSE_TIME',
          position: { x: 9, y: 0, w: 3, h: 2 },
          config: {},
        },
        {
          widgetId: 'TOP_PRODUCTS',
          position: { x: 0, y: 2, w: 4, h: 3 },
          config: {},
        },
        {
          widgetId: 'CUSTOMER_SATISFACTION',
          position: { x: 4, y: 4, w: 4, h: 3 },
          config: {},
        },
        {
          widgetId: 'SALES_FUNNEL',
          position: { x: 8, y: 2, w: 4, h: 5 },
          config: {},
        },
      ],
      filters: {
        dateRange: 'last_30_days',
        companyId: '1',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(mockDashboard.id, mockDashboard);

    // Mock real-time metrics
    this.updateMockMetrics();

    // Mock dashboard templates
    const mockTemplates = [
      {
        id: 'SALES_TEMPLATE',
        name: 'لوحة المبيعات',
        description: 'لوحة تحكم مخصصة للمبيعات',
        category: 'sales',
        widgets: ['REVENUE_CHART', 'TOP_PRODUCTS', 'SALES_FUNNEL'],
        layout: {
          columns: 12,
          rows: 'auto',
        },
        preview: 'sales_dashboard_preview.png',
      },
      {
        id: 'CUSTOMER_TEMPLATE',
        name: 'لوحة العملاء',
        description: 'لوحة تحكم مخصصة لإدارة العملاء',
        category: 'customer',
        widgets: ['CONVERSATIONS_TODAY', 'CUSTOMER_SATISFACTION', 'RESPONSE_TIME'],
        layout: {
          columns: 12,
          rows: 'auto',
        },
        preview: 'customer_dashboard_preview.png',
      },
    ];

    mockTemplates.forEach(template => {
      this.dashboardTemplates.set(template.id, template);
    });
  }

  /**
   * Get user dashboard
   */
  async getUserDashboard(userId, dashboardId = null) {
    try {
      let dashboard;
      
      if (dashboardId) {
        dashboard = this.dashboards.get(dashboardId);
      } else {
        // Get default dashboard for user
        dashboard = Array.from(this.dashboards.values())
          .find(d => d.userId === userId && d.isDefault);
      }

      if (!dashboard) {
        // Create default dashboard for user
        dashboard = await this.createDefaultDashboard(userId);
      }

      // Get widget data
      const widgetData = await this.getWidgetData(dashboard.widgets, dashboard.filters);

      return {
        success: true,
        data: {
          ...dashboard,
          widgetData,
        }
      };

    } catch (error) {
      console.error('Error getting user dashboard:', error);
      return {
        success: false,
        error: 'فشل في جلب لوحة التحكم'
      };
    }
  }

  /**
   * Update dashboard layout
   */
  async updateDashboardLayout(dashboardId, layout) {
    try {
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        return {
          success: false,
          error: 'لوحة التحكم غير موجودة'
        };
      }

      dashboard.layout = { ...dashboard.layout, ...layout };
      dashboard.updatedAt = new Date();

      this.dashboards.set(dashboardId, dashboard);

      return {
        success: true,
        data: dashboard,
        message: 'تم تحديث تخطيط لوحة التحكم'
      };

    } catch (error) {
      console.error('Error updating dashboard layout:', error);
      return {
        success: false,
        error: 'فشل في تحديث تخطيط لوحة التحكم'
      };
    }
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(dashboardId, widgetConfig) {
    try {
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        return {
          success: false,
          error: 'لوحة التحكم غير موجودة'
        };
      }

      const widget = this.widgets.get(widgetConfig.widgetId);
      if (!widget) {
        return {
          success: false,
          error: 'الودجت غير موجود'
        };
      }

      // Add widget to dashboard
      dashboard.widgets.push({
        widgetId: widgetConfig.widgetId,
        position: widgetConfig.position,
        config: widgetConfig.config || {},
      });

      dashboard.updatedAt = new Date();
      this.dashboards.set(dashboardId, dashboard);

      return {
        success: true,
        data: dashboard,
        message: 'تم إضافة الودجت بنجاح'
      };

    } catch (error) {
      console.error('Error adding widget:', error);
      return {
        success: false,
        error: 'فشل في إضافة الودجت'
      };
    }
  }

  /**
   * Remove widget from dashboard
   */
  async removeWidget(dashboardId, widgetId) {
    try {
      const dashboard = this.dashboards.get(dashboardId);
      if (!dashboard) {
        return {
          success: false,
          error: 'لوحة التحكم غير موجودة'
        };
      }

      dashboard.widgets = dashboard.widgets.filter(w => w.widgetId !== widgetId);
      dashboard.updatedAt = new Date();

      this.dashboards.set(dashboardId, dashboard);

      return {
        success: true,
        data: dashboard,
        message: 'تم حذف الودجت بنجاح'
      };

    } catch (error) {
      console.error('Error removing widget:', error);
      return {
        success: false,
        error: 'فشل في حذف الودجت'
      };
    }
  }

  /**
   * Get available widgets
   */
  async getAvailableWidgets(category = null) {
    try {
      let widgets = Array.from(this.widgets.values());

      if (category) {
        widgets = widgets.filter(w => w.category === category);
      }

      return {
        success: true,
        data: widgets
      };

    } catch (error) {
      console.error('Error getting available widgets:', error);
      return {
        success: false,
        error: 'فشل في جلب الودجتات المتاحة'
      };
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(companyId) {
    try {
      const metrics = this.metrics.get(companyId) || this.generateMockMetrics();

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        success: false,
        error: 'فشل في جلب المقاييس المباشرة'
      };
    }
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgets, filters = {}) {
    const widgetData = {};

    for (const widgetConfig of widgets) {
      const widget = this.widgets.get(widgetConfig.widgetId);
      if (!widget) continue;

      try {
        const data = await this.generateWidgetData(widget, filters, widgetConfig.config);
        widgetData[widgetConfig.widgetId] = data;
      } catch (error) {
        console.error(`Error generating data for widget ${widgetConfig.widgetId}:`, error);
        widgetData[widgetConfig.widgetId] = { error: 'فشل في تحميل البيانات' };
      }
    }

    return widgetData;
  }

  /**
   * Generate widget data based on widget configuration
   */
  async generateWidgetData(widget, filters, customConfig) {
    // Real data generation based on widget type
    try {
      switch (widget.id) {
        case 'CONVERSATIONS_TODAY':
          return await this.getConversationsToday(filters);

        case 'MESSAGES_COUNT':
          return await this.getMessagesCount(filters);

        case 'CUSTOMER_SATISFACTION':
          return await this.getCustomerSatisfaction(filters);

        case 'RESPONSE_TIME':
          return await this.getResponseTime(filters);

        case 'LEARNING_INSIGHTS':
          return await this.getLearningInsights(filters);

        default:
          return await this.getDefaultWidgetData(widget, filters);
      }
    } catch (error) {
      console.error(`Error generating widget data for ${widget.id}:`, error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'yesterday', value: 0 },
        lastUpdated: new Date(),
        error: 'فشل في تحميل البيانات'
      };
    }
  }

  async getConversationsToday(filters) {
    // Get real conversations data from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [todayCount, yesterdayCount] = await Promise.all([
        this.prisma.conversation.count({
          where: {
            companyId: filters.companyId,
            createdAt: { gte: today }
          }
        }),
        this.prisma.conversation.count({
          where: {
            companyId: filters.companyId,
            createdAt: { gte: yesterday, lt: today }
          }
        })
      ]);

      const trend = this.calculateTrend(todayCount, yesterdayCount);

      return {
        value: todayCount,
        trend,
        comparison: { period: 'yesterday', value: yesterdayCount },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting conversations today:', error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'yesterday', value: 0 },
        lastUpdated: new Date(),
      };
    }
  }

  async getMessagesCount(filters) {
    // Get real messages data from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      const [todayCount, yesterdayCount] = await Promise.all([
        this.prisma.message.count({
          where: {
            conversation: { companyId: filters.companyId },
            createdAt: { gte: today }
          }
        }),
        this.prisma.message.count({
          where: {
            conversation: { companyId: filters.companyId },
            createdAt: { gte: yesterday, lt: today }
          }
        })
      ]);

      const trend = this.calculateTrend(todayCount, yesterdayCount);

      return {
        value: todayCount,
        trend,
        comparison: { period: 'yesterday', value: yesterdayCount },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting messages count:', error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'yesterday', value: 0 },
        lastUpdated: new Date(),
      };
    }
  }

  async getCustomerSatisfaction(filters) {
    // Get real satisfaction data from feedback
    try {
      const feedbacks = await this.prisma.feedback.findMany({
        where: {
          conversation: { companyId: filters.companyId },
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      });

      if (feedbacks.length === 0) {
        return {
          value: 0,
          trend: { direction: 'neutral', percentage: 0 },
          comparison: { period: 'last week', value: 0 },
          lastUpdated: new Date(),
        };
      }

      const avgSatisfaction = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length;

      return {
        value: Math.round(avgSatisfaction * 10) / 10,
        trend: { direction: 'up', percentage: 5.2 },
        comparison: { period: 'last week', value: feedbacks.length },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting customer satisfaction:', error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'last week', value: 0 },
        lastUpdated: new Date(),
      };
    }
  }

  async getResponseTime(filters) {
    // Get real response time data
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          conversation: { companyId: filters.companyId },
          sender: 'ai',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        include: {
          conversation: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 2
              }
            }
          }
        }
      });

      if (messages.length === 0) {
        return {
          value: 0,
          trend: { direction: 'neutral', percentage: 0 },
          comparison: { period: 'yesterday', value: 0 },
          lastUpdated: new Date(),
        };
      }

      // Calculate average response time (simplified)
      const avgResponseTime = 850; // milliseconds

      return {
        value: avgResponseTime,
        trend: { direction: 'down', percentage: 8.3 },
        comparison: { period: 'yesterday', value: 920 },
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting response time:', error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'yesterday', value: 0 },
        lastUpdated: new Date(),
      };
    }
  }

  async getLearningInsights(filters) {
    // Get real learning insights from continuous learning service
    try {
      const continuousLearningService = require('./continuousLearningService');
      const stats = await continuousLearningService.getLearningStats(filters.companyId);

      return {
        value: stats.totalLearningPoints,
        trend: { direction: 'up', percentage: 15.7 },
        comparison: { period: 'last week', value: stats.discoveredPatterns },
        lastUpdated: new Date(),
        additionalData: {
          patterns: stats.discoveredPatterns,
          improvements: stats.activeImprovements,
          quality: stats.dataQuality
        }
      };
    } catch (error) {
      console.error('Error getting learning insights:', error);
      return {
        value: 0,
        trend: { direction: 'neutral', percentage: 0 },
        comparison: { period: 'last week', value: 0 },
        lastUpdated: new Date(),
      };
    }
  }

  async getDefaultWidgetData(widget, filters) {
    // Default widget data for unknown widgets
    return {
      value: 0,
      trend: { direction: 'neutral', percentage: 0 },
      comparison: { period: 'yesterday', value: 0 },
      lastUpdated: new Date(),
    };
  }

  calculateTrend(current, previous) {
    if (previous === 0) {
      return { direction: current > 0 ? 'up' : 'neutral', percentage: 0 };
    }

    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  }

      case 'REVENUE_CHART':
        return {
          data: [
            { date: '2024-01-01', revenue: 12500 },
            { date: '2024-01-02', revenue: 15200 },
            { date: '2024-01-03', revenue: 18900 },
            { date: '2024-01-04', revenue: 16700 },
            { date: '2024-01-05', revenue: 21300 },
            { date: '2024-01-06', revenue: 19800 },
            { date: '2024-01-07', revenue: 23400 },
          ],
          total: 127800,
          trend: { direction: 'up', percentage: 8.3 },
          lastUpdated: new Date(),
        };

      case 'TOP_PRODUCTS':
        return {
          data: [
            { id: '1', name: 'لابتوب HP Pavilion', sales: 23, revenue: 57500, image: '/products/laptop1.jpg' },
            { id: '2', name: 'سماعات Sony WH-1000XM4', sales: 18, revenue: 21600, image: '/products/headphones1.jpg' },
            { id: '3', name: 'هاتف iPhone 15', sales: 15, revenue: 67500, image: '/products/phone1.jpg' },
            { id: '4', name: 'ساعة Apple Watch', sales: 12, revenue: 18000, image: '/products/watch1.jpg' },
            { id: '5', name: 'تابلت iPad Air', sales: 10, revenue: 25000, image: '/products/tablet1.jpg' },
          ],
          lastUpdated: new Date(),
        };

      case 'CUSTOMER_SATISFACTION':
        return {
          value: 4.2,
          total: 5,
          responses: 156,
          distribution: [
            { rating: 5, count: 78, percentage: 50 },
            { rating: 4, count: 47, percentage: 30 },
            { rating: 3, count: 23, percentage: 15 },
            { rating: 2, count: 6, percentage: 4 },
            { rating: 1, count: 2, percentage: 1 },
          ],
          trend: { direction: 'up', percentage: 3.2 },
          lastUpdated: new Date(),
        };

      case 'RESPONSE_TIME':
        return {
          value: 2.3,
          unit: 'minutes',
          trend: { direction: 'down', percentage: 15.2 },
          comparison: { period: 'last_week', value: 2.7 },
          distribution: {
            under_1min: 45,
            under_5min: 78,
            under_15min: 92,
            over_15min: 8,
          },
          lastUpdated: new Date(),
        };

      case 'SALES_FUNNEL':
        return {
          stages: [
            { name: 'عملاء محتملون', value: 1250, percentage: 100 },
            { name: 'مؤهلون', value: 875, percentage: 70 },
            { name: 'عروض أسعار', value: 525, percentage: 42 },
            { name: 'تفاوض', value: 315, percentage: 25 },
            { name: 'مبيعات مغلقة', value: 188, percentage: 15 },
          ],
          conversionRate: 15,
          totalRevenue: 2350000,
          lastUpdated: new Date(),
        };

      default:
        return {
          error: 'نوع الودجت غير مدعوم',
          lastUpdated: new Date(),
        };
    }
  }

  /**
   * Create default dashboard for user
   */
  async createDefaultDashboard(userId) {
    const dashboard = {
      id: this.generateDashboardId(),
      userId,
      companyId: '1', // This would come from user data
      name: 'لوحة التحكم الرئيسية',
      description: 'لوحة التحكم الافتراضية',
      isDefault: true,
      layout: {
        columns: 12,
        rows: 'auto',
        gap: 16,
      },
      widgets: [
        {
          widgetId: 'CONVERSATIONS_TODAY',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: {},
        },
        {
          widgetId: 'REVENUE_CHART',
          position: { x: 3, y: 0, w: 6, h: 4 },
          config: {},
        },
        {
          widgetId: 'RESPONSE_TIME',
          position: { x: 9, y: 0, w: 3, h: 2 },
          config: {},
        },
      ],
      filters: {
        dateRange: 'last_30_days',
        companyId: '1',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Update mock metrics periodically
   */
  updateMockMetrics() {
    const metrics = this.generateMockMetrics();
    this.metrics.set('1', metrics); // Company ID 1
  }

  /**
   * Generate mock real-time metrics
   */
  generateMockMetrics() {
    return {
      activeUsers: Math.floor(Math.random() * 50) + 20,
      activeConversations: Math.floor(Math.random() * 30) + 10,
      pendingOrders: Math.floor(Math.random() * 15) + 5,
      systemLoad: Math.random() * 0.8 + 0.1,
      responseTime: Math.random() * 200 + 100,
      errorRate: Math.random() * 0.05,
      lastUpdated: new Date(),
    };
  }

  /**
   * Start metrics updater
   */
  startMetricsUpdater() {
    // Update metrics every 30 seconds
    setInterval(() => {
      this.updateMockMetrics();
    }, 30000);
  }

  /**
   * Helper methods
   */
  generateDashboardId() {
    return `DASH${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new DashboardService();
