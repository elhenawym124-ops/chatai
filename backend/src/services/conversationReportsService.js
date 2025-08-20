/**
 * Conversation Reports Service
 * 
 * Handles comprehensive conversation analytics,
 * response time metrics, and communication insights
 */

class ConversationReportsService {
  constructor() {
    this.conversationData = new Map(); // Conversation analytics data
    this.responseMetrics = new Map(); // Response time metrics
    this.agentPerformance = new Map(); // Agent performance data
    this.customerInsights = new Map(); // Customer behavior insights
    this.reportTemplates = new Map(); // Report templates
    this.scheduledReports = new Map(); // Scheduled reports
    this.initializeMockData();
  }

  /**
   * Initialize mock data for conversation reports
   */
  initializeMockData() {
    // Mock conversation analytics data
    const mockConversationData = {
      '1': { // Company ID
        daily: [
          {
            date: '2024-01-15',
            totalConversations: 47,
            newConversations: 23,
            resolvedConversations: 19,
            avgResponseTime: 145, // seconds
            avgResolutionTime: 1800, // seconds
            customerSatisfaction: 4.2,
            agentUtilization: 0.78,
            peakHours: ['14:00', '15:00', '16:00'],
            channels: {
              messenger: 32,
              whatsapp: 12,
              email: 3,
            },
            categories: {
              product_inquiry: 18,
              technical_support: 12,
              billing: 8,
              general: 9,
            },
          },
          {
            date: '2024-01-14',
            totalConversations: 52,
            newConversations: 28,
            resolvedConversations: 24,
            avgResponseTime: 167,
            avgResolutionTime: 2100,
            customerSatisfaction: 4.0,
            agentUtilization: 0.82,
            peakHours: ['13:00', '14:00', '15:00'],
            channels: {
              messenger: 38,
              whatsapp: 10,
              email: 4,
            },
            categories: {
              product_inquiry: 22,
              technical_support: 15,
              billing: 7,
              general: 8,
            },
          },
        ],
        weekly: [
          {
            week: '2024-W03',
            totalConversations: 324,
            newConversations: 167,
            resolvedConversations: 142,
            avgResponseTime: 156,
            avgResolutionTime: 1950,
            customerSatisfaction: 4.1,
            agentUtilization: 0.75,
            topAgents: ['agent1', 'agent2', 'agent3'],
            busyDays: ['Tuesday', 'Wednesday', 'Thursday'],
          },
        ],
        monthly: [
          {
            month: '2024-01',
            totalConversations: 1456,
            newConversations: 743,
            resolvedConversations: 678,
            avgResponseTime: 162,
            avgResolutionTime: 2050,
            customerSatisfaction: 4.15,
            agentUtilization: 0.77,
            growthRate: 0.12,
            resolutionRate: 0.93,
          },
        ],
      },
    };

    this.conversationData.set('1', mockConversationData['1']);

    // Mock agent performance data
    const mockAgentPerformance = [
      {
        agentId: 'agent1',
        agentName: 'أحمد محمد',
        period: 'week',
        metrics: {
          totalConversations: 89,
          resolvedConversations: 82,
          avgResponseTime: 125,
          avgResolutionTime: 1650,
          customerSatisfaction: 4.5,
          resolutionRate: 0.92,
          firstContactResolution: 0.78,
          escalationRate: 0.08,
          workingHours: 40,
          utilization: 0.85,
        },
        trends: {
          responseTime: { direction: 'down', percentage: 8.2 },
          satisfaction: { direction: 'up', percentage: 5.1 },
          resolutionRate: { direction: 'up', percentage: 3.4 },
        },
        strengths: ['سرعة الاستجابة', 'حل المشاكل التقنية', 'التواصل الفعال'],
        improvementAreas: ['معرفة المنتجات الجديدة', 'التعامل مع الشكاوى'],
      },
      {
        agentId: 'agent2',
        agentName: 'فاطمة علي',
        period: 'week',
        metrics: {
          totalConversations: 76,
          resolvedConversations: 71,
          avgResponseTime: 142,
          avgResolutionTime: 1820,
          customerSatisfaction: 4.3,
          resolutionRate: 0.93,
          firstContactResolution: 0.82,
          escalationRate: 0.05,
          workingHours: 40,
          utilization: 0.78,
        },
        trends: {
          responseTime: { direction: 'up', percentage: 3.1 },
          satisfaction: { direction: 'up', percentage: 7.8 },
          resolutionRate: { direction: 'stable', percentage: 0.5 },
        },
        strengths: ['خدمة العملاء المتميزة', 'الصبر والتفهم', 'حل المشاكل المعقدة'],
        improvementAreas: ['سرعة الاستجابة', 'استخدام الأدوات التقنية'],
      },
    ];

    mockAgentPerformance.forEach(agent => {
      this.agentPerformance.set(agent.agentId, agent);
    });

    // Mock customer insights
    const mockCustomerInsights = {
      '1': {
        behaviorPatterns: {
          peakContactTimes: [
            { hour: '14:00', percentage: 18.5 },
            { hour: '15:00', percentage: 22.3 },
            { hour: '16:00', percentage: 19.7 },
            { hour: '10:00', percentage: 15.2 },
          ],
          preferredChannels: {
            messenger: 68,
            whatsapp: 25,
            email: 7,
          },
          avgConversationLength: 8.5, // minutes
          returnCustomerRate: 0.34,
          escalationTriggers: [
            'وقت انتظار طويل',
            'عدم فهم المشكلة',
            'حلول غير مناسبة',
            'مشاكل تقنية معقدة',
          ],
        },
        satisfactionFactors: {
          responseSpeed: { weight: 0.35, avgScore: 4.1 },
          problemResolution: { weight: 0.40, avgScore: 4.3 },
          agentKnowledge: { weight: 0.15, avgScore: 4.0 },
          communication: { weight: 0.10, avgScore: 4.4 },
        },
        commonIssues: [
          { category: 'product_inquiry', count: 234, avgResolutionTime: 1200 },
          { category: 'technical_support', count: 189, avgResolutionTime: 2400 },
          { category: 'billing', count: 156, avgResolutionTime: 1800 },
          { category: 'shipping', count: 98, avgResolutionTime: 1500 },
        ],
      },
    };

    this.customerInsights.set('1', mockCustomerInsights['1']);

    // Mock report templates
    const mockReportTemplates = [
      {
        id: 'DAILY_SUMMARY',
        name: 'التقرير اليومي',
        description: 'ملخص يومي للمحادثات والأداء',
        type: 'summary',
        frequency: 'daily',
        sections: [
          'conversation_volume',
          'response_metrics',
          'agent_performance',
          'customer_satisfaction',
        ],
        format: 'pdf',
        recipients: ['manager@company.com'],
        schedule: { time: '18:00', timezone: 'Asia/Riyadh' },
        enabled: true,
      },
      {
        id: 'WEEKLY_DETAILED',
        name: 'التقرير الأسبوعي المفصل',
        description: 'تقرير مفصل للأداء الأسبوعي',
        type: 'detailed',
        frequency: 'weekly',
        sections: [
          'conversation_trends',
          'agent_comparison',
          'customer_insights',
          'improvement_recommendations',
        ],
        format: 'pdf',
        recipients: ['manager@company.com', 'supervisor@company.com'],
        schedule: { day: 'monday', time: '09:00', timezone: 'Asia/Riyadh' },
        enabled: true,
      },
    ];

    mockReportTemplates.forEach(template => {
      this.reportTemplates.set(template.id, template);
    });
  }

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(filters = {}) {
    try {
      const {
        companyId = '1',
        period = 'week',
        startDate,
        endDate,
        agentId,
        channel,
        category,
      } = filters;

      const data = this.conversationData.get(companyId);
      if (!data) {
        return {
          success: false,
          error: 'لا توجد بيانات للشركة المحددة'
        };
      }

      let analytics;
      switch (period) {
        case 'day':
          analytics = this.getDailyAnalytics(data, filters);
          break;
        case 'week':
          analytics = this.getWeeklyAnalytics(data, filters);
          break;
        case 'month':
          analytics = this.getMonthlyAnalytics(data, filters);
          break;
        default:
          analytics = this.getWeeklyAnalytics(data, filters);
      }

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
   * Get response time metrics
   */
  async getResponseTimeMetrics(filters = {}) {
    try {
      const { companyId = '1', period = 'week' } = filters;

      const metrics = {
        overview: {
          avgResponseTime: 145, // seconds
          medianResponseTime: 120,
          firstResponseTime: 95,
          avgResolutionTime: 1800,
          slaCompliance: 0.87,
        },
        distribution: [
          { range: '< 1 دقيقة', count: 156, percentage: 45.2 },
          { range: '1-5 دقائق', count: 123, percentage: 35.7 },
          { range: '5-15 دقيقة', count: 45, percentage: 13.0 },
          { range: '> 15 دقيقة', count: 21, percentage: 6.1 },
        ],
        trends: [
          { date: '2024-01-09', avgTime: 167 },
          { date: '2024-01-10', avgTime: 152 },
          { date: '2024-01-11', avgTime: 143 },
          { date: '2024-01-12', avgTime: 138 },
          { date: '2024-01-13', avgTime: 145 },
          { date: '2024-01-14', avgTime: 149 },
          { date: '2024-01-15', avgTime: 145 },
        ],
        byChannel: {
          messenger: { avgTime: 132, count: 234 },
          whatsapp: { avgTime: 156, count: 89 },
          email: { avgTime: 245, count: 23 },
        },
        byCategory: {
          product_inquiry: { avgTime: 125, count: 156 },
          technical_support: { avgTime: 189, count: 98 },
          billing: { avgTime: 167, count: 67 },
          general: { avgTime: 134, count: 45 },
        },
        slaBreakdown: {
          within1min: 45.2,
          within5min: 80.9,
          within15min: 93.9,
          over15min: 6.1,
        },
      };

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      console.error('Error getting response time metrics:', error);
      return {
        success: false,
        error: 'فشل في جلب مقاييس وقت الاستجابة'
      };
    }
  }

  /**
   * Get agent performance report
   */
  async getAgentPerformance(filters = {}) {
    try {
      const { companyId = '1', agentId, period = 'week' } = filters;

      let agents = Array.from(this.agentPerformance.values());

      if (agentId) {
        agents = agents.filter(agent => agent.agentId === agentId);
      }

      const performance = {
        agents,
        summary: {
          totalAgents: agents.length,
          avgSatisfaction: this.calculateAverage(agents, 'metrics.customerSatisfaction'),
          avgResponseTime: this.calculateAverage(agents, 'metrics.avgResponseTime'),
          avgResolutionRate: this.calculateAverage(agents, 'metrics.resolutionRate'),
          topPerformer: agents.reduce((top, agent) => 
            agent.metrics.customerSatisfaction > (top?.metrics?.customerSatisfaction || 0) ? agent : top
          ),
        },
        comparison: this.generateAgentComparison(agents),
        recommendations: this.generatePerformanceRecommendations(agents),
      };

      return {
        success: true,
        data: performance
      };

    } catch (error) {
      console.error('Error getting agent performance:', error);
      return {
        success: false,
        error: 'فشل في جلب تقرير أداء الموظفين'
      };
    }
  }

  /**
   * Get customer insights
   */
  async getCustomerInsights(filters = {}) {
    try {
      const { companyId = '1' } = filters;

      const insights = this.customerInsights.get(companyId);
      if (!insights) {
        return {
          success: false,
          error: 'لا توجد رؤى للعملاء'
        };
      }

      return {
        success: true,
        data: insights
      };

    } catch (error) {
      console.error('Error getting customer insights:', error);
      return {
        success: false,
        error: 'فشل في جلب رؤى العملاء'
      };
    }
  }

  /**
   * Generate conversation report
   */
  async generateReport(reportConfig) {
    try {
      const {
        templateId,
        companyId = '1',
        period,
        format = 'pdf',
        sections = [],
        filters = {},
      } = reportConfig;

      const template = this.reportTemplates.get(templateId);
      if (!template) {
        return {
          success: false,
          error: 'قالب التقرير غير موجود'
        };
      }

      // Gather data for each section
      const reportData = {};
      
      for (const section of sections) {
        switch (section) {
          case 'conversation_volume':
            reportData.conversationVolume = await this.getConversationAnalytics({ companyId, period, ...filters });
            break;
          case 'response_metrics':
            reportData.responseMetrics = await this.getResponseTimeMetrics({ companyId, period, ...filters });
            break;
          case 'agent_performance':
            reportData.agentPerformance = await this.getAgentPerformance({ companyId, period, ...filters });
            break;
          case 'customer_insights':
            reportData.customerInsights = await this.getCustomerInsights({ companyId, ...filters });
            break;
        }
      }

      const report = {
        id: this.generateReportId(),
        templateId,
        title: template.name,
        description: template.description,
        period,
        generatedAt: new Date(),
        format,
        data: reportData,
        summary: this.generateReportSummary(reportData),
        recommendations: this.generateReportRecommendations(reportData),
      };

      return {
        success: true,
        data: report,
        message: 'تم إنشاء التقرير بنجاح'
      };

    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: 'فشل في إنشاء التقرير'
      };
    }
  }

  /**
   * Helper methods for analytics
   */
  getDailyAnalytics(data, filters) {
    return {
      period: 'daily',
      data: data.daily || [],
      summary: {
        totalConversations: data.daily?.reduce((sum, day) => sum + day.totalConversations, 0) || 0,
        avgResponseTime: this.calculateAverageFromArray(data.daily, 'avgResponseTime'),
        avgSatisfaction: this.calculateAverageFromArray(data.daily, 'customerSatisfaction'),
      },
      trends: this.calculateTrends(data.daily, 'totalConversations'),
    };
  }

  getWeeklyAnalytics(data, filters) {
    return {
      period: 'weekly',
      data: data.weekly || [],
      summary: {
        totalConversations: data.weekly?.[0]?.totalConversations || 0,
        avgResponseTime: data.weekly?.[0]?.avgResponseTime || 0,
        avgSatisfaction: data.weekly?.[0]?.customerSatisfaction || 0,
      },
      comparison: this.generateWeeklyComparison(data.weekly),
    };
  }

  getMonthlyAnalytics(data, filters) {
    return {
      period: 'monthly',
      data: data.monthly || [],
      summary: {
        totalConversations: data.monthly?.[0]?.totalConversations || 0,
        growthRate: data.monthly?.[0]?.growthRate || 0,
        resolutionRate: data.monthly?.[0]?.resolutionRate || 0,
      },
      yearOverYear: this.generateYearOverYearComparison(data.monthly),
    };
  }

  calculateAverage(items, path) {
    if (items.length === 0) return 0;
    const values = items.map(item => this.getNestedValue(item, path));
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateAverageFromArray(array, field) {
    if (!array || array.length === 0) return 0;
    return array.reduce((sum, item) => sum + (item[field] || 0), 0) / array.length;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) || 0;
  }

  calculateTrends(data, field) {
    if (!data || data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const latest = data[data.length - 1][field];
    const previous = data[data.length - 2][field];
    const percentage = ((latest - previous) / previous) * 100;
    
    return {
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable',
      percentage: Math.abs(percentage),
    };
  }

  generateAgentComparison(agents) {
    return agents.map(agent => ({
      agentId: agent.agentId,
      agentName: agent.agentName,
      score: this.calculateAgentScore(agent.metrics),
      rank: 0, // Would be calculated based on sorting
    })).sort((a, b) => b.score - a.score).map((agent, index) => ({
      ...agent,
      rank: index + 1,
    }));
  }

  calculateAgentScore(metrics) {
    // Weighted score calculation
    return (
      metrics.customerSatisfaction * 0.3 +
      (1 / metrics.avgResponseTime) * 1000 * 0.2 +
      metrics.resolutionRate * 5 * 0.3 +
      metrics.firstContactResolution * 5 * 0.2
    );
  }

  generatePerformanceRecommendations(agents) {
    const recommendations = [];
    
    agents.forEach(agent => {
      if (agent.metrics.avgResponseTime > 180) {
        recommendations.push({
          agentId: agent.agentId,
          type: 'response_time',
          message: `${agent.agentName} يحتاج تحسين وقت الاستجابة`,
          priority: 'medium',
        });
      }
      
      if (agent.metrics.customerSatisfaction < 4.0) {
        recommendations.push({
          agentId: agent.agentId,
          type: 'satisfaction',
          message: `${agent.agentName} يحتاج تحسين رضا العملاء`,
          priority: 'high',
        });
      }
    });
    
    return recommendations;
  }

  generateWeeklyComparison(weeklyData) {
    // Mock comparison with previous week
    return {
      conversationsChange: { direction: 'up', percentage: 8.5 },
      responseTimeChange: { direction: 'down', percentage: 5.2 },
      satisfactionChange: { direction: 'up', percentage: 2.1 },
    };
  }

  generateYearOverYearComparison(monthlyData) {
    // Mock year-over-year comparison
    return {
      conversationsGrowth: 15.3,
      responseTimeImprovement: 12.7,
      satisfactionImprovement: 8.9,
    };
  }

  generateReportSummary(reportData) {
    return {
      keyMetrics: {
        totalConversations: 324,
        avgResponseTime: 145,
        customerSatisfaction: 4.2,
        resolutionRate: 0.93,
      },
      highlights: [
        'تحسن وقت الاستجابة بنسبة 8.2%',
        'زيادة رضا العملاء بنسبة 5.1%',
        'ارتفاع معدل حل المشاكل إلى 93%',
      ],
      concerns: [
        'زيادة في عدد التصعيدات',
        'انخفاض في الاستجابة السريعة',
      ],
    };
  }

  generateReportRecommendations(reportData) {
    return [
      {
        category: 'response_time',
        recommendation: 'تدريب الموظفين على الاستجابة السريعة',
        priority: 'high',
        expectedImpact: 'تحسين وقت الاستجابة بنسبة 15%',
      },
      {
        category: 'customer_satisfaction',
        recommendation: 'تحسين عملية حل المشاكل',
        priority: 'medium',
        expectedImpact: 'زيادة رضا العملاء بنسبة 10%',
      },
    ];
  }

  generateReportId() {
    return `RPT${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ConversationReportsService();
