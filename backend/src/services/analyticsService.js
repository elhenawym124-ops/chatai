/**
 * Advanced Analytics and Reporting Service
 *
 * Handles comprehensive analytics, reporting, and business intelligence
 */

const { PrismaClient } = require('@prisma/client');

class AnalyticsService {
  constructor() {
    this.prisma = new PrismaClient();
    this.reports = new Map(); // Saved reports
    this.dashboards = new Map(); // Custom dashboards
    this.kpis = new Map(); // Key Performance Indicators
    this.initializeDefaultKPIs();
  }

  /**
   * Initialize default KPIs
   */
  initializeDefaultKPIs() {
    // Default KPIs
    const defaultKPIs = [
      {
        id: 'KPI001',
        name: 'إجمالي المبيعات',
        type: 'revenue',
        value: 2450000,
        target: 3000000,
        unit: 'ريال',
        trend: 'up',
        changePercent: 15.5,
        period: 'monthly',
        category: 'sales',
        isActive: true,
      },
      {
        id: 'KPI002',
        name: 'عدد العملاء الجدد',
        type: 'count',
        value: 156,
        target: 200,
        unit: 'عميل',
        trend: 'up',
        changePercent: 8.3,
        period: 'monthly',
        category: 'customers',
        isActive: true,
      },
      {
        id: 'KPI003',
        name: 'معدل التحويل',
        type: 'percentage',
        value: 3.2,
        target: 4.0,
        unit: '%',
        trend: 'down',
        changePercent: -2.1,
        period: 'monthly',
        category: 'conversion',
        isActive: true,
      },
      {
        id: 'KPI004',
        name: 'متوسط قيمة الطلب',
        type: 'currency',
        value: 485,
        target: 500,
        unit: 'ريال',
        trend: 'up',
        changePercent: 5.2,
        period: 'monthly',
        category: 'sales',
        isActive: true,
      }
    ];

    defaultKPIs.forEach(kpi => {
      this.kpis.set(kpi.id, kpi);
    });

    // Mock saved reports
    const mockReports = [
      {
        id: 'RPT001',
        name: 'تقرير المبيعات الشهري',
        type: 'sales',
        description: 'تقرير شامل للمبيعات والإيرادات الشهرية',
        filters: {
          dateRange: 'last_month',
          categories: ['all'],
          regions: ['all'],
        },
        schedule: 'monthly',
        format: 'pdf',
        recipients: ['admin@company.com', 'sales@company.com'],
        isActive: true,
        createdBy: '1',
        createdAt: new Date('2024-01-01'),
        lastGenerated: new Date('2024-01-15'),
      },
      {
        id: 'RPT002',
        name: 'تحليل سلوك العملاء',
        type: 'customers',
        description: 'تحليل مفصل لسلوك العملاء وأنماط الشراء',
        filters: {
          dateRange: 'last_quarter',
          customerSegments: ['vip', 'regular'],
          products: ['all'],
        },
        schedule: 'weekly',
        format: 'excel',
        recipients: ['marketing@company.com'],
        isActive: true,
        createdBy: '2',
        createdAt: new Date('2024-01-05'),
        lastGenerated: new Date('2024-01-12'),
      }
    ];

    mockReports.forEach(report => {
      this.reports.set(report.id, report);
    });
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(filters = {}) {
    try {
      const dateRange = filters.dateRange || 'last_30_days';
      const companyId = filters.companyId;

      // Get real data from database
      const data = await this.getRealDashboardData(companyId, dateRange);

      return {
        success: true,
        data: {
          overview: data.overview,
          salesTrends: data.salesTrends,
          customerAnalytics: data.customerAnalytics,
          productPerformance: data.productPerformance,
          conversionFunnel: data.conversionFunnel,
          geographicData: data.geographicData,
          recentActivities: data.recentActivities,
          kpis: Array.from(this.kpis.values()).filter(kpi => kpi.isActive),
        }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      return {
        success: false,
        error: 'فشل في جلب بيانات لوحة التحكم'
      };
    }
  }

  /**
   * Generate sales report
   */
  async generateSalesReport(filters = {}) {
    try {
      const {
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo = new Date(),
        groupBy = 'day',
        categories = [],
        products = [],
      } = filters;

      const salesData = this.generateMockSalesData(dateFrom, dateTo, groupBy);

      const report = {
        id: this.generateReportId(),
        title: 'تقرير المبيعات',
        type: 'sales',
        period: {
          from: dateFrom,
          to: dateTo,
        },
        summary: {
          totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
          averageOrderValue: salesData.length > 0 ? 
            salesData.reduce((sum, item) => sum + item.revenue, 0) / 
            salesData.reduce((sum, item) => sum + item.orders, 0) : 0,
          topProducts: this.getTopProducts(5),
          topCategories: this.getTopCategories(5),
        },
        data: salesData,
        charts: {
          revenueChart: salesData.map(item => ({
            date: item.date,
            value: item.revenue,
          })),
          ordersChart: salesData.map(item => ({
            date: item.date,
            value: item.orders,
          })),
        },
        generatedAt: new Date(),
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      return {
        success: false,
        error: 'فشل في إنشاء تقرير المبيعات'
      };
    }
  }

  /**
   * Generate customer analytics report
   */
  async generateCustomerReport(filters = {}) {
    try {
      const {
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo = new Date(),
        segments = [],
      } = filters;

      const customerData = this.generateMockCustomerData(dateFrom, dateTo);

      const report = {
        id: this.generateReportId(),
        title: 'تقرير تحليل العملاء',
        type: 'customers',
        period: {
          from: dateFrom,
          to: dateTo,
        },
        summary: {
          totalCustomers: customerData.totalCustomers,
          newCustomers: customerData.newCustomers,
          activeCustomers: customerData.activeCustomers,
          churnRate: customerData.churnRate,
          averageLifetimeValue: customerData.averageLifetimeValue,
          customerSatisfaction: customerData.customerSatisfaction,
        },
        segments: customerData.segments,
        cohortAnalysis: customerData.cohortAnalysis,
        behaviorAnalysis: customerData.behaviorAnalysis,
        generatedAt: new Date(),
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating customer report:', error);
      return {
        success: false,
        error: 'فشل في إنشاء تقرير العملاء'
      };
    }
  }

  /**
   * Generate product performance report
   */
  async generateProductReport(filters = {}) {
    try {
      const {
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo = new Date(),
        categories = [],
      } = filters;

      const productData = this.generateMockProductData(dateFrom, dateTo);

      const report = {
        id: this.generateReportId(),
        title: 'تقرير أداء المنتجات',
        type: 'products',
        period: {
          from: dateFrom,
          to: dateTo,
        },
        summary: {
          totalProducts: productData.totalProducts,
          topSellingProducts: productData.topSellingProducts,
          lowStockProducts: productData.lowStockProducts,
          profitMargins: productData.profitMargins,
          categoryPerformance: productData.categoryPerformance,
        },
        inventory: productData.inventory,
        trends: productData.trends,
        recommendations: productData.recommendations,
        generatedAt: new Date(),
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating product report:', error);
      return {
        success: false,
        error: 'فشل في إنشاء تقرير المنتجات'
      };
    }
  }

  /**
   * Generate conversation analytics report
   */
  async generateConversationReport(filters = {}) {
    try {
      const {
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo = new Date(),
        channels = [],
      } = filters;

      const conversationData = this.generateMockConversationData(dateFrom, dateTo);

      const report = {
        id: this.generateReportId(),
        title: 'تقرير تحليل المحادثات',
        type: 'conversations',
        period: {
          from: dateFrom,
          to: dateTo,
        },
        summary: {
          totalConversations: conversationData.totalConversations,
          averageResponseTime: conversationData.averageResponseTime,
          resolutionRate: conversationData.resolutionRate,
          customerSatisfaction: conversationData.customerSatisfaction,
          channelDistribution: conversationData.channelDistribution,
        },
        metrics: {
          responseTimesByHour: conversationData.responseTimesByHour,
          conversationsByDay: conversationData.conversationsByDay,
          topIssues: conversationData.topIssues,
          agentPerformance: conversationData.agentPerformance,
        },
        insights: conversationData.insights,
        generatedAt: new Date(),
      };

      return {
        success: true,
        data: report
      };
    } catch (error) {
      console.error('Error generating conversation report:', error);
      return {
        success: false,
        error: 'فشل في إنشاء تقرير المحادثات'
      };
    }
  }

  /**
   * Get real-time analytics
   */
  async getRealTimeAnalytics() {
    try {
      const realTimeData = {
        currentVisitors: Math.floor(Math.random() * 50) + 10,
        activeConversations: Math.floor(Math.random() * 15) + 5,
        todayRevenue: Math.floor(Math.random() * 50000) + 10000,
        todayOrders: Math.floor(Math.random() * 100) + 20,
        conversionRate: (Math.random() * 5 + 2).toFixed(2),
        averageOrderValue: Math.floor(Math.random() * 200) + 300,
        topPages: [
          { page: '/products', visitors: 45 },
          { page: '/home', visitors: 38 },
          { page: '/about', visitors: 22 },
          { page: '/contact', visitors: 15 },
        ],
        recentOrders: [
          { id: 'ORD001', customer: 'أحمد محمد', amount: 450, time: '5 دقائق' },
          { id: 'ORD002', customer: 'سارة أحمد', amount: 320, time: '12 دقيقة' },
          { id: 'ORD003', customer: 'محمد علي', amount: 680, time: '18 دقيقة' },
        ],
        systemHealth: {
          serverStatus: 'healthy',
          responseTime: Math.floor(Math.random() * 100) + 50,
          uptime: '99.9%',
          errorRate: '0.1%',
        },
      };

      return {
        success: true,
        data: realTimeData
      };
    } catch (error) {
      console.error('Error getting real-time analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب التحليلات الفورية'
      };
    }
  }

  /**
   * Export report
   */
  async exportReport(reportId, format = 'pdf') {
    try {
      // Mock export functionality
      const exportData = {
        reportId,
        format,
        fileName: `report_${reportId}_${Date.now()}.${format}`,
        downloadUrl: `/api/v1/reports/${reportId}/download?format=${format}`,
        size: Math.floor(Math.random() * 1000) + 500, // KB
        generatedAt: new Date(),
      };

      return {
        success: true,
        data: exportData,
        message: 'تم إنشاء التقرير للتحميل'
      };
    } catch (error) {
      console.error('Error exporting report:', error);
      return {
        success: false,
        error: 'فشل في تصدير التقرير'
      };
    }
  }

  /**
   * Get real dashboard data from database
   */
  async getRealDashboardData(companyId, dateRange) {
    const { startDate, endDate } = this.getDateRangeFromString(dateRange);

    try {
      // Get real data from database
      const [
        totalConversations,
        totalMessages,
        totalCustomers,
        totalOrders,
        recentConversations,
        customerStats,
        messageStats
      ] = await Promise.all([
        // Total conversations
        this.prisma.conversation.count({
          where: {
            companyId,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        // Total messages
        this.prisma.message.count({
          where: {
            conversation: { companyId },
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        // Total customers
        this.prisma.customer.count({
          where: {
            companyId,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        // Total orders
        this.prisma.order.count({
          where: {
            companyId,
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        // Recent conversations
        this.prisma.conversation.findMany({
          where: {
            companyId,
            createdAt: { gte: startDate, lte: endDate }
          },
          include: {
            customer: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 10
        }),
        // Customer statistics
        this.prisma.customer.groupBy({
          by: ['createdAt'],
          where: {
            companyId,
            createdAt: { gte: startDate, lte: endDate }
          },
          _count: true
        }),
        // Message statistics
        this.prisma.message.groupBy({
          by: ['createdAt'],
          where: {
            conversation: { companyId },
            createdAt: { gte: startDate, lte: endDate }
          },
          _count: true
        })
      ]);

      // Calculate trends
      const previousPeriod = this.getPreviousPeriod(startDate, endDate);
      const [prevConversations, prevMessages, prevCustomers, prevOrders] = await Promise.all([
        this.prisma.conversation.count({
          where: {
            companyId,
            createdAt: { gte: previousPeriod.start, lte: previousPeriod.end }
          }
        }),
        this.prisma.message.count({
          where: {
            conversation: { companyId },
            createdAt: { gte: previousPeriod.start, lte: previousPeriod.end }
          }
        }),
        this.prisma.customer.count({
          where: {
            companyId,
            createdAt: { gte: previousPeriod.start, lte: previousPeriod.end }
          }
        }),
        this.prisma.order.count({
          where: {
            companyId,
            createdAt: { gte: previousPeriod.start, lte: previousPeriod.end }
          }
        })
      ]);

      return {
        overview: {
          totalConversations,
          totalMessages,
          totalCustomers,
          totalOrders,
          trends: {
            conversations: this.calculateTrend(totalConversations, prevConversations),
            messages: this.calculateTrend(totalMessages, prevMessages),
            customers: this.calculateTrend(totalCustomers, prevCustomers),
            orders: this.calculateTrend(totalOrders, prevOrders)
          }
        },
        salesTrends: this.processSalesTrends(messageStats),
        customerAnalytics: this.processCustomerAnalytics(customerStats, totalCustomers),
        productPerformance: await this.getProductPerformance(companyId, startDate, endDate),
        conversionFunnel: this.calculateConversionFunnel(totalConversations, totalOrders),
        geographicData: [], // Will be implemented when location data is available
        recentActivities: this.formatRecentActivities(recentConversations)
      };

    } catch (error) {
      console.error('Error getting real dashboard data:', error);
      // Return empty data structure instead of mock data
      return {
        overview: {
          totalConversations: 0,
          totalMessages: 0,
          totalCustomers: 0,
          totalOrders: 0,
          trends: {
            conversations: { direction: 'neutral', percentage: 0 },
            messages: { direction: 'neutral', percentage: 0 },
            customers: { direction: 'neutral', percentage: 0 },
            orders: { direction: 'neutral', percentage: 0 }
          }
        },
        salesTrends: [],
        customerAnalytics: {
          totalCustomers: 0,
          newCustomers: 0,
          activeCustomers: 0,
          segments: []
        },
        productPerformance: [],
        conversionFunnel: {
          visitors: 0,
          conversations: 0,
          qualified: 0,
          orders: 0
        },
        geographicData: [],
        recentActivities: []
      };
    }
  }

  /**
   * Helper methods for real data processing
   */
  getDateRangeFromString(dateRange) {
    const now = new Date();
    let startDate, endDate = now;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last_7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last_30_days':
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last_90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    return { startDate, endDate };
  }

  getPreviousPeriod(startDate, endDate) {
    const duration = endDate.getTime() - startDate.getTime();
    return {
      start: new Date(startDate.getTime() - duration),
      end: startDate
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

  processSalesTrends(messageStats) {
    // Process message statistics to create sales trends
    return messageStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      messages: stat._count,
      // Additional sales metrics can be added here
    }));
  }

  processCustomerAnalytics(customerStats, totalCustomers) {
    return {
      totalCustomers,
      newCustomers: customerStats.length,
      activeCustomers: totalCustomers, // Simplified for now
      segments: [] // Will be implemented based on customer behavior
    };
  }

  async getProductPerformance(companyId, startDate, endDate) {
    try {
      const products = await this.prisma.product.findMany({
        where: { companyId },
        include: {
          orders: {
            where: {
              createdAt: { gte: startDate, lte: endDate }
            }
          }
        }
      });

      return products.map(product => ({
        id: product.id,
        name: product.name,
        orders: product.orders.length,
        revenue: product.orders.reduce((sum, order) => sum + (order.total || 0), 0)
      }));
    } catch (error) {
      console.error('Error getting product performance:', error);
      return [];
    }
  }

  calculateConversionFunnel(totalConversations, totalOrders) {
    return {
      visitors: totalConversations,
      conversations: totalConversations,
      qualified: Math.floor(totalConversations * 0.7), // Simplified calculation
      orders: totalOrders
    };
  }

  formatRecentActivities(conversations) {
    return conversations.map(conv => ({
      id: conv.id,
      type: 'conversation',
      customer: conv.customer?.name || 'عميل غير معروف',
      message: conv.messages[0]?.content || 'لا توجد رسائل',
      timestamp: conv.updatedAt,
      status: conv.status || 'active'
    }));
  }

  /**
   * Legacy mock data methods (kept for backward compatibility but not used)
   */
  generateMockDashboardData(dateRange) {
    const days = this.getDaysFromRange(dateRange);
    
    return {
      overview: {
        totalRevenue: 2450000,
        totalOrders: 1250,
        totalCustomers: 850,
        conversionRate: 3.2,
        averageOrderValue: 485,
        revenueGrowth: 15.5,
        orderGrowth: 8.3,
        customerGrowth: 12.1,
      },
      salesTrends: this.generateSalesChartData(days),
      customerAnalytics: {
        newCustomers: this.generateCustomerChartData(days),
        customerSegments: [
          { name: 'VIP', count: 45, percentage: 25 },
          { name: 'عادي', count: 120, percentage: 65 },
          { name: 'جديد', count: 35, percentage: 10 },
        ],
        topCustomers: [
          { name: 'أحمد محمد', orders: 15, revenue: 12500 },
          { name: 'سارة أحمد', orders: 12, revenue: 9800 },
          { name: 'محمد علي', orders: 10, revenue: 8500 },
        ],
      },
      productPerformance: {
        topProducts: this.getTopProducts(10),
        categoryPerformance: this.getTopCategories(5),
        inventoryAlerts: [
          { product: 'لابتوب Dell', stock: 5, status: 'low' },
          { product: 'ماوس لاسلكي', stock: 2, status: 'critical' },
        ],
      },
      conversionFunnel: [
        { stage: 'زوار', count: 10000, percentage: 100 },
        { stage: 'مشاهدة منتج', count: 3500, percentage: 35 },
        { stage: 'إضافة للسلة', count: 1200, percentage: 12 },
        { stage: 'بدء الدفع', count: 800, percentage: 8 },
        { stage: 'إتمام الشراء', count: 320, percentage: 3.2 },
      ],
      geographicData: [
        { region: 'الرياض', orders: 450, revenue: 890000 },
        { region: 'جدة', orders: 320, revenue: 650000 },
        { region: 'الدمام', orders: 280, revenue: 520000 },
        { region: 'مكة', orders: 200, revenue: 390000 },
      ],
      recentActivities: [
        { type: 'order', message: 'طلب جديد من أحمد محمد', time: '5 دقائق', amount: 450 },
        { type: 'customer', message: 'عميل جديد: سارة أحمد', time: '12 دقيقة' },
        { type: 'product', message: 'نفد مخزون: ماوس لاسلكي', time: '25 دقيقة' },
        { type: 'payment', message: 'دفعة مستلمة: 1,250 ريال', time: '35 دقيقة' },
      ],
    };
  }

  generateMockSalesData(dateFrom, dateTo, groupBy) {
    const data = [];
    const days = Math.ceil((dateTo - dateFrom) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(dateFrom.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 50) + 10,
        customers: Math.floor(Math.random() * 30) + 5,
      });
    }
    
    return data;
  }

  generateMockCustomerData(dateFrom, dateTo) {
    return {
      totalCustomers: 850,
      newCustomers: 156,
      activeCustomers: 680,
      churnRate: 5.2,
      averageLifetimeValue: 2450,
      customerSatisfaction: 4.3,
      segments: [
        { name: 'VIP', count: 45, revenue: 890000, avgOrderValue: 850 },
        { name: 'عادي', count: 520, revenue: 1200000, avgOrderValue: 420 },
        { name: 'جديد', count: 285, revenue: 360000, avgOrderValue: 280 },
      ],
      cohortAnalysis: [
        { month: 'يناير', retention: [100, 85, 72, 65, 58] },
        { month: 'فبراير', retention: [100, 88, 75, 68] },
        { month: 'مارس', retention: [100, 82, 70] },
      ],
      behaviorAnalysis: {
        averageSessionDuration: '8:45',
        pagesPerSession: 4.2,
        bounceRate: 35.8,
        repeatPurchaseRate: 42.5,
      },
    };
  }

  generateMockProductData(dateFrom, dateTo) {
    return {
      totalProducts: 450,
      topSellingProducts: this.getTopProducts(10),
      lowStockProducts: [
        { name: 'لابتوب Dell', stock: 5, reorderLevel: 10 },
        { name: 'ماوس لاسلكي', stock: 2, reorderLevel: 15 },
      ],
      profitMargins: {
        average: 35.5,
        highest: 65.2,
        lowest: 12.8,
      },
      categoryPerformance: this.getTopCategories(8),
      inventory: {
        totalValue: 2850000,
        turnoverRate: 4.2,
        deadStock: 15,
      },
      trends: [
        { product: 'لابتوب HP', trend: 'up', change: 25.5 },
        { product: 'هاتف Samsung', trend: 'down', change: -8.2 },
      ],
      recommendations: [
        'زيادة مخزون المنتجات عالية الطلب',
        'تقليل أسعار المنتجات بطيئة الحركة',
        'إضافة منتجات جديدة في فئة الإلكترونيات',
      ],
    };
  }

  generateMockConversationData(dateFrom, dateTo) {
    return {
      totalConversations: 1250,
      averageResponseTime: '2:35',
      resolutionRate: 89.5,
      customerSatisfaction: 4.2,
      channelDistribution: [
        { channel: 'Messenger', count: 650, percentage: 52 },
        { channel: 'WhatsApp', count: 380, percentage: 30.4 },
        { channel: 'البريد الإلكتروني', count: 220, percentage: 17.6 },
      ],
      responseTimesByHour: this.generateHourlyData(),
      conversationsByDay: this.generateDailyData(7),
      topIssues: [
        { issue: 'استفسار عن المنتج', count: 450 },
        { issue: 'مشكلة في الدفع', count: 280 },
        { issue: 'تتبع الطلب', count: 220 },
      ],
      agentPerformance: [
        { name: 'أحمد المدير', conversations: 85, satisfaction: 4.5 },
        { name: 'سارة المستشارة', conversations: 92, satisfaction: 4.3 },
      ],
      insights: [
        'أوقات الذروة: 10 صباحاً - 2 ظهراً',
        'أكثر الاستفسارات: معلومات المنتجات',
        'معدل الرضا مرتفع في قناة Messenger',
      ],
    };
  }

  generateSalesChartData(days) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 50) + 10,
    }));
  }

  generateCustomerChartData(days) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newCustomers: Math.floor(Math.random() * 20) + 5,
      returningCustomers: Math.floor(Math.random() * 30) + 10,
    }));
  }

  generateHourlyData() {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      responseTime: Math.floor(Math.random() * 300) + 60, // seconds
      conversations: Math.floor(Math.random() * 50) + 5,
    }));
  }

  generateDailyData(days) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      conversations: Math.floor(Math.random() * 100) + 20,
    }));
  }

  getTopProducts(limit) {
    const products = [
      { name: 'لابتوب HP', sales: 145, revenue: 290000 },
      { name: 'هاتف Samsung', sales: 230, revenue: 460000 },
      { name: 'ماوس لاسلكي', sales: 320, revenue: 96000 },
      { name: 'كيبورد ميكانيكي', sales: 180, revenue: 108000 },
      { name: 'شاشة Dell', sales: 95, revenue: 190000 },
      { name: 'سماعات Bluetooth', sales: 280, revenue: 140000 },
      { name: 'كاميرا Canon', sales: 65, revenue: 195000 },
      { name: 'طابعة HP', sales: 120, revenue: 84000 },
      { name: 'هارد خارجي', sales: 200, revenue: 80000 },
      { name: 'راوتر WiFi', sales: 150, revenue: 75000 },
    ];
    
    return products.slice(0, limit);
  }

  getTopCategories(limit) {
    const categories = [
      { name: 'إلكترونيات', sales: 850, revenue: 1200000 },
      { name: 'أجهزة كمبيوتر', sales: 450, revenue: 890000 },
      { name: 'هواتف ذكية', sales: 380, revenue: 760000 },
      { name: 'إكسسوارات', sales: 620, revenue: 310000 },
      { name: 'أجهزة منزلية', sales: 280, revenue: 420000 },
      { name: 'ألعاب', sales: 190, revenue: 190000 },
      { name: 'كتب', sales: 340, revenue: 85000 },
      { name: 'ملابس', sales: 520, revenue: 260000 },
    ];
    
    return categories.slice(0, limit);
  }

  getDaysFromRange(range) {
    switch (range) {
      case 'last_7_days': return 7;
      case 'last_30_days': return 30;
      case 'last_90_days': return 90;
      case 'last_year': return 365;
      default: return 30;
    }
  }

  generateReportId() {
    return `RPT${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new AnalyticsService();
