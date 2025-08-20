/**
 * Response Statistics Service
 * 
 * Handles response time tracking, performance metrics, and conversation analytics
 */

class ResponseStatsService {
  constructor() {
    this.responseMetrics = new Map(); // Response time metrics
    this.conversationMetrics = new Map(); // Conversation performance metrics
    this.agentPerformance = new Map(); // Agent performance data
    this.dailyStats = new Map(); // Daily statistics
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock response metrics
    const mockMetrics = [
      {
        id: 'METRIC001',
        conversationId: 'CONV001',
        customerId: '1',
        customerName: 'أحمد محمد',
        agentId: '1',
        agentName: 'أحمد المدير',
        platform: 'messenger',
        firstResponseTime: 120, // seconds
        averageResponseTime: 95,
        totalMessages: 8,
        agentMessages: 4,
        customerMessages: 4,
        conversationDuration: 1800, // seconds (30 minutes)
        resolutionTime: 1800,
        isResolved: true,
        satisfactionRating: 5,
        tags: ['منتج', 'استفسار'],
        category: 'استفسارات عامة',
        priority: 'medium',
        createdAt: new Date('2024-01-15T10:00:00'),
        resolvedAt: new Date('2024-01-15T10:30:00'),
      },
      {
        id: 'METRIC002',
        conversationId: 'CONV002',
        customerId: '2',
        customerName: 'سارة أحمد',
        agentId: '2',
        agentName: 'سارة المستشارة',
        platform: 'whatsapp',
        firstResponseTime: 45,
        averageResponseTime: 67,
        totalMessages: 12,
        agentMessages: 6,
        customerMessages: 6,
        conversationDuration: 900, // 15 minutes
        resolutionTime: 900,
        isResolved: true,
        satisfactionRating: 4,
        tags: ['مشكلة', 'تقني'],
        category: 'مشاكل تقنية',
        priority: 'high',
        createdAt: new Date('2024-01-15T14:00:00'),
        resolvedAt: new Date('2024-01-15T14:15:00'),
      },
      {
        id: 'METRIC003',
        conversationId: 'CONV003',
        customerId: '3',
        customerName: 'محمد علي',
        agentId: '1',
        agentName: 'أحمد المدير',
        platform: 'messenger',
        firstResponseTime: 300, // 5 minutes
        averageResponseTime: 180,
        totalMessages: 6,
        agentMessages: 3,
        customerMessages: 3,
        conversationDuration: 2400, // 40 minutes
        resolutionTime: null,
        isResolved: false,
        satisfactionRating: null,
        tags: ['شكوى', 'خدمة'],
        category: 'شكاوى',
        priority: 'urgent',
        createdAt: new Date('2024-01-15T16:00:00'),
        resolvedAt: null,
      }
    ];

    mockMetrics.forEach(metric => {
      this.responseMetrics.set(metric.id, metric);
    });

    // Mock agent performance
    const mockAgentPerformance = [
      {
        agentId: '1',
        agentName: 'أحمد المدير',
        date: '2024-01-15',
        totalConversations: 15,
        resolvedConversations: 13,
        averageFirstResponseTime: 145,
        averageResponseTime: 98,
        averageResolutionTime: 1650,
        customerSatisfactionAvg: 4.3,
        totalMessages: 120,
        workingHours: 8,
        onlineTime: 7.5, // hours
        responseRate: 95.2, // percentage
        resolutionRate: 86.7, // percentage
      },
      {
        agentId: '2',
        agentName: 'سارة المستشارة',
        date: '2024-01-15',
        totalConversations: 12,
        resolvedConversations: 11,
        averageFirstResponseTime: 89,
        averageResponseTime: 76,
        averageResolutionTime: 1200,
        customerSatisfactionAvg: 4.6,
        totalMessages: 96,
        workingHours: 8,
        onlineTime: 7.8,
        responseRate: 98.1,
        resolutionRate: 91.7,
      }
    ];

    mockAgentPerformance.forEach(performance => {
      this.agentPerformance.set(`${performance.agentId}_${performance.date}`, performance);
    });

    // Mock daily stats
    const mockDailyStats = [
      {
        date: '2024-01-15',
        totalConversations: 27,
        resolvedConversations: 24,
        averageFirstResponseTime: 120,
        averageResponseTime: 89,
        averageResolutionTime: 1450,
        customerSatisfactionAvg: 4.4,
        totalMessages: 216,
        uniqueCustomers: 25,
        newCustomers: 8,
        returningCustomers: 17,
        platformDistribution: {
          messenger: 15,
          whatsapp: 8,
          telegram: 4,
        },
        categoryDistribution: {
          'استفسارات عامة': 12,
          'مشاكل تقنية': 6,
          'طلبات شراء': 5,
          'شكاوى': 4,
        },
        hourlyDistribution: {
          '09': 3, '10': 4, '11': 5, '12': 3,
          '13': 2, '14': 4, '15': 3, '16': 2, '17': 1,
        },
      }
    ];

    mockDailyStats.forEach(stats => {
      this.dailyStats.set(stats.date, stats);
    });
  }

  /**
   * Record response time
   */
  async recordResponseTime(responseData) {
    try {
      const {
        conversationId,
        customerId,
        customerName,
        agentId,
        agentName,
        platform,
        responseTime,
        messageType = 'agent', // agent, customer
        isFirstResponse = false,
      } = responseData;

      let metric = Array.from(this.responseMetrics.values())
        .find(m => m.conversationId === conversationId);

      if (!metric) {
        // Create new metric record
        metric = {
          id: this.generateMetricId(),
          conversationId,
          customerId,
          customerName,
          agentId,
          agentName,
          platform,
          firstResponseTime: isFirstResponse ? responseTime : null,
          averageResponseTime: responseTime,
          totalMessages: 1,
          agentMessages: messageType === 'agent' ? 1 : 0,
          customerMessages: messageType === 'customer' ? 1 : 0,
          conversationDuration: 0,
          resolutionTime: null,
          isResolved: false,
          satisfactionRating: null,
          tags: [],
          category: null,
          priority: 'medium',
          createdAt: new Date(),
          resolvedAt: null,
        };

        this.responseMetrics.set(metric.id, metric);
      } else {
        // Update existing metric
        if (isFirstResponse && !metric.firstResponseTime) {
          metric.firstResponseTime = responseTime;
        }

        if (messageType === 'agent') {
          // Update average response time for agent messages
          const totalAgentResponseTime = metric.averageResponseTime * metric.agentMessages;
          metric.agentMessages++;
          metric.averageResponseTime = (totalAgentResponseTime + responseTime) / metric.agentMessages;
        } else {
          metric.customerMessages++;
        }

        metric.totalMessages++;
        metric.conversationDuration = Math.floor((new Date() - new Date(metric.createdAt)) / 1000);
      }

      return {
        success: true,
        data: metric,
        message: 'تم تسجيل وقت الاستجابة'
      };
    } catch (error) {
      console.error('Error recording response time:', error);
      return {
        success: false,
        error: 'فشل في تسجيل وقت الاستجابة'
      };
    }
  }

  /**
   * Mark conversation as resolved
   */
  async markConversationResolved(conversationId, satisfactionRating = null, tags = [], category = null) {
    try {
      const metric = Array.from(this.responseMetrics.values())
        .find(m => m.conversationId === conversationId);

      if (!metric) {
        return {
          success: false,
          error: 'بيانات المحادثة غير موجودة'
        };
      }

      metric.isResolved = true;
      metric.resolvedAt = new Date();
      metric.resolutionTime = Math.floor((metric.resolvedAt - new Date(metric.createdAt)) / 1000);
      metric.satisfactionRating = satisfactionRating;
      metric.tags = tags;
      metric.category = category;

      this.responseMetrics.set(metric.id, metric);

      return {
        success: true,
        data: metric,
        message: 'تم تحديث حالة المحادثة'
      };
    } catch (error) {
      console.error('Error marking conversation resolved:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة المحادثة'
      };
    }
  }

  /**
   * Get response statistics
   */
  async getResponseStats(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        agentId,
        platform,
        category,
        period = 'today' // today, week, month, custom
      } = filters;

      let metrics = Array.from(this.responseMetrics.values());

      // Apply date filter
      const dateRange = this.getDateRange(period, startDate, endDate);
      metrics = metrics.filter(m => {
        const metricDate = new Date(m.createdAt);
        return metricDate >= dateRange.start && metricDate <= dateRange.end;
      });

      // Apply other filters
      if (agentId) {
        metrics = metrics.filter(m => m.agentId === agentId);
      }

      if (platform) {
        metrics = metrics.filter(m => m.platform === platform);
      }

      if (category) {
        metrics = metrics.filter(m => m.category === category);
      }

      // Calculate statistics
      const stats = this.calculateStats(metrics);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting response stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الاستجابة'
      };
    }
  }

  /**
   * Get agent performance
   */
  async getAgentPerformance(agentId = null, period = 'today') {
    try {
      let performance = Array.from(this.agentPerformance.values());

      // Filter by date range
      const dateRange = this.getDateRange(period);
      performance = performance.filter(p => {
        const performanceDate = new Date(p.date);
        return performanceDate >= dateRange.start && performanceDate <= dateRange.end;
      });

      // Filter by agent
      if (agentId) {
        performance = performance.filter(p => p.agentId === agentId);
      }

      // Calculate aggregated performance if multiple days
      const aggregatedPerformance = this.aggregatePerformance(performance);

      return {
        success: true,
        data: aggregatedPerformance
      };
    } catch (error) {
      console.error('Error getting agent performance:', error);
      return {
        success: false,
        error: 'فشل في جلب أداء الموظفين'
      };
    }
  }

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(filters = {}) {
    try {
      const { period = 'week' } = filters;
      
      let metrics = Array.from(this.responseMetrics.values());

      // Apply date filter
      const dateRange = this.getDateRange(period);
      metrics = metrics.filter(m => {
        const metricDate = new Date(m.createdAt);
        return metricDate >= dateRange.start && metricDate <= dateRange.end;
      });

      const analytics = {
        overview: this.calculateOverviewStats(metrics),
        trends: this.calculateTrends(metrics, period),
        distributions: this.calculateDistributions(metrics),
        performance: this.calculatePerformanceMetrics(metrics),
        satisfaction: this.calculateSatisfactionMetrics(metrics),
        comparisons: this.calculateComparisons(metrics),
      };

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Error getting conversation analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات المحادثات'
      };
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const todayMetrics = Array.from(this.responseMetrics.values())
        .filter(m => m.createdAt.toISOString().split('T')[0] === today);

      const realTimeStats = {
        activeConversations: todayMetrics.filter(m => !m.isResolved).length,
        totalConversationsToday: todayMetrics.length,
        averageResponseTimeToday: this.calculateAverageResponseTime(todayMetrics),
        pendingResponses: todayMetrics.filter(m => 
          !m.isResolved && 
          (new Date() - new Date(m.createdAt)) > 300000 // 5 minutes
        ).length,
        agentsOnline: 2, // Mock data
        currentLoad: this.calculateCurrentLoad(todayMetrics),
        satisfactionToday: this.calculateTodaySatisfaction(todayMetrics),
        responseTimeTarget: 120, // 2 minutes target
        resolutionTimeTarget: 1800, // 30 minutes target
      };

      return {
        success: true,
        data: realTimeStats
      };
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        success: false,
        error: 'فشل في جلب المقاييس الفورية'
      };
    }
  }

  /**
   * Helper methods
   */
  calculateStats(metrics) {
    const resolvedMetrics = metrics.filter(m => m.isResolved);
    const totalMetrics = metrics.length;

    return {
      totalConversations: totalMetrics,
      resolvedConversations: resolvedMetrics.length,
      resolutionRate: totalMetrics > 0 ? (resolvedMetrics.length / totalMetrics * 100).toFixed(1) : 0,
      averageFirstResponseTime: this.calculateAverageFirstResponseTime(metrics),
      averageResponseTime: this.calculateAverageResponseTime(metrics),
      averageResolutionTime: this.calculateAverageResolutionTime(resolvedMetrics),
      customerSatisfactionAvg: this.calculateAverageSatisfaction(resolvedMetrics),
      totalMessages: metrics.reduce((sum, m) => sum + m.totalMessages, 0),
      platformDistribution: this.getPlatformDistribution(metrics),
      categoryDistribution: this.getCategoryDistribution(metrics),
      priorityDistribution: this.getPriorityDistribution(metrics),
      hourlyDistribution: this.getHourlyDistribution(metrics),
      responseTimeDistribution: this.getResponseTimeDistribution(metrics),
    };
  }

  calculateAverageFirstResponseTime(metrics) {
    const validMetrics = metrics.filter(m => m.firstResponseTime);
    if (validMetrics.length === 0) return 0;
    
    const total = validMetrics.reduce((sum, m) => sum + m.firstResponseTime, 0);
    return Math.round(total / validMetrics.length);
  }

  calculateAverageResponseTime(metrics) {
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.averageResponseTime, 0);
    return Math.round(total / metrics.length);
  }

  calculateAverageResolutionTime(metrics) {
    const validMetrics = metrics.filter(m => m.resolutionTime);
    if (validMetrics.length === 0) return 0;
    
    const total = validMetrics.reduce((sum, m) => sum + m.resolutionTime, 0);
    return Math.round(total / validMetrics.length);
  }

  calculateAverageSatisfaction(metrics) {
    const validMetrics = metrics.filter(m => m.satisfactionRating);
    if (validMetrics.length === 0) return 0;
    
    const total = validMetrics.reduce((sum, m) => sum + m.satisfactionRating, 0);
    return (total / validMetrics.length).toFixed(1);
  }

  getPlatformDistribution(metrics) {
    const distribution = {};
    metrics.forEach(m => {
      distribution[m.platform] = (distribution[m.platform] || 0) + 1;
    });
    return distribution;
  }

  getCategoryDistribution(metrics) {
    const distribution = {};
    metrics.forEach(m => {
      if (m.category) {
        distribution[m.category] = (distribution[m.category] || 0) + 1;
      }
    });
    return distribution;
  }

  getPriorityDistribution(metrics) {
    const distribution = {};
    metrics.forEach(m => {
      distribution[m.priority] = (distribution[m.priority] || 0) + 1;
    });
    return distribution;
  }

  getHourlyDistribution(metrics) {
    const distribution = {};
    metrics.forEach(m => {
      const hour = new Date(m.createdAt).getHours().toString().padStart(2, '0');
      distribution[hour] = (distribution[hour] || 0) + 1;
    });
    return distribution;
  }

  getResponseTimeDistribution(metrics) {
    const distribution = {
      'أقل من دقيقة': 0,
      '1-3 دقائق': 0,
      '3-5 دقائق': 0,
      '5-10 دقائق': 0,
      'أكثر من 10 دقائق': 0,
    };

    metrics.forEach(m => {
      if (m.firstResponseTime) {
        const minutes = m.firstResponseTime / 60;
        if (minutes < 1) distribution['أقل من دقيقة']++;
        else if (minutes < 3) distribution['1-3 دقائق']++;
        else if (minutes < 5) distribution['3-5 دقائق']++;
        else if (minutes < 10) distribution['5-10 دقائق']++;
        else distribution['أكثر من 10 دقائق']++;
      }
    });

    return distribution;
  }

  getDateRange(period, startDate = null, endDate = null) {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
        break;
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        end = now;
    }

    return { start, end };
  }

  calculateOverviewStats(metrics) {
    return {
      totalConversations: metrics.length,
      resolvedConversations: metrics.filter(m => m.isResolved).length,
      averageResponseTime: this.calculateAverageResponseTime(metrics),
      customerSatisfaction: this.calculateAverageSatisfaction(metrics.filter(m => m.isResolved)),
    };
  }

  calculateTrends(metrics, period) {
    // Mock trend calculation - in production, group by time periods
    return {
      conversationsTrend: [
        { period: 'يوم 1', value: 12 },
        { period: 'يوم 2', value: 15 },
        { period: 'يوم 3', value: 18 },
        { period: 'يوم 4', value: 14 },
        { period: 'يوم 5', value: 20 },
      ],
      responseTimeTrend: [
        { period: 'يوم 1', value: 145 },
        { period: 'يوم 2', value: 132 },
        { period: 'يوم 3', value: 128 },
        { period: 'يوم 4', value: 135 },
        { period: 'يوم 5', value: 120 },
      ],
    };
  }

  calculateDistributions(metrics) {
    return {
      platform: this.getPlatformDistribution(metrics),
      category: this.getCategoryDistribution(metrics),
      priority: this.getPriorityDistribution(metrics),
      hourly: this.getHourlyDistribution(metrics),
      responseTime: this.getResponseTimeDistribution(metrics),
    };
  }

  calculatePerformanceMetrics(metrics) {
    return {
      averageFirstResponseTime: this.calculateAverageFirstResponseTime(metrics),
      averageResponseTime: this.calculateAverageResponseTime(metrics),
      averageResolutionTime: this.calculateAverageResolutionTime(metrics.filter(m => m.isResolved)),
      resolutionRate: metrics.length > 0 ? (metrics.filter(m => m.isResolved).length / metrics.length * 100).toFixed(1) : 0,
    };
  }

  calculateSatisfactionMetrics(metrics) {
    const ratedMetrics = metrics.filter(m => m.satisfactionRating);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratedMetrics.forEach(m => {
      distribution[m.satisfactionRating]++;
    });

    return {
      averageRating: this.calculateAverageSatisfaction(ratedMetrics),
      totalRatings: ratedMetrics.length,
      distribution,
    };
  }

  calculateComparisons(metrics) {
    // Mock comparison data - in production, compare with previous periods
    return {
      conversationsChange: '+12%',
      responseTimeChange: '-8%',
      satisfactionChange: '+5%',
      resolutionRateChange: '+3%',
    };
  }

  aggregatePerformance(performanceArray) {
    if (performanceArray.length === 0) return {};

    const totals = performanceArray.reduce((acc, p) => {
      acc.totalConversations += p.totalConversations;
      acc.resolvedConversations += p.resolvedConversations;
      acc.totalMessages += p.totalMessages;
      acc.workingHours += p.workingHours;
      acc.onlineTime += p.onlineTime;
      return acc;
    }, {
      totalConversations: 0,
      resolvedConversations: 0,
      totalMessages: 0,
      workingHours: 0,
      onlineTime: 0,
    });

    const averages = {
      averageFirstResponseTime: performanceArray.reduce((sum, p) => sum + p.averageFirstResponseTime, 0) / performanceArray.length,
      averageResponseTime: performanceArray.reduce((sum, p) => sum + p.averageResponseTime, 0) / performanceArray.length,
      averageResolutionTime: performanceArray.reduce((sum, p) => sum + p.averageResolutionTime, 0) / performanceArray.length,
      customerSatisfactionAvg: performanceArray.reduce((sum, p) => sum + p.customerSatisfactionAvg, 0) / performanceArray.length,
      responseRate: performanceArray.reduce((sum, p) => sum + p.responseRate, 0) / performanceArray.length,
      resolutionRate: performanceArray.reduce((sum, p) => sum + p.resolutionRate, 0) / performanceArray.length,
    };

    return {
      ...totals,
      ...averages,
      period: performanceArray.length > 1 ? `${performanceArray.length} أيام` : 'يوم واحد',
    };
  }

  calculateCurrentLoad(metrics) {
    const activeConversations = metrics.filter(m => !m.isResolved).length;
    const totalAgents = 2; // Mock data
    return Math.round(activeConversations / totalAgents);
  }

  calculateTodaySatisfaction(metrics) {
    const ratedMetrics = metrics.filter(m => m.satisfactionRating && m.isResolved);
    return this.calculateAverageSatisfaction(ratedMetrics);
  }

  generateMetricId() {
    return `METRIC${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ResponseStatsService();
