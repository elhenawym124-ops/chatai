/**
 * Opportunity Service
 * 
 * Handles sales opportunities, pipeline management, and forecasting
 */

class OpportunityService {
  constructor() {
    this.opportunities = new Map(); // Mock storage
    this.stages = {
      LEAD: {
        name: 'عميل محتمل',
        probability: 10,
        color: '#6B7280',
        order: 1,
      },
      QUALIFIED: {
        name: 'مؤهل',
        probability: 25,
        color: '#3B82F6',
        order: 2,
      },
      PROPOSAL: {
        name: 'عرض سعر',
        probability: 50,
        color: '#F59E0B',
        order: 3,
      },
      NEGOTIATION: {
        name: 'تفاوض',
        probability: 75,
        color: '#EF4444',
        order: 4,
      },
      CLOSED_WON: {
        name: 'مغلق - فوز',
        probability: 100,
        color: '#10B981',
        order: 5,
      },
      CLOSED_LOST: {
        name: 'مغلق - خسارة',
        probability: 0,
        color: '#6B7280',
        order: 6,
      },
    };

    // Initialize with mock data
    this.initializeMockData();
  }

  /**
   * Initialize mock opportunities
   */
  initializeMockData() {
    const mockOpportunities = [
      {
        id: '1',
        title: 'صفقة أجهزة كمبيوتر للشركة',
        customerId: '1',
        customerName: 'أحمد محمد',
        value: 45000,
        currency: 'SAR',
        stage: 'PROPOSAL',
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        source: 'facebook',
        assignedTo: '1',
        assignedToName: 'أحمد المدير',
        description: 'طلب شراء 10 أجهزة كمبيوتر للمكتب الجديد',
        products: [
          { id: '1', name: 'لابتوب Dell XPS', quantity: 10, price: 4500 }
        ],
        activities: [
          {
            id: '1',
            type: 'call',
            description: 'مكالمة هاتفية لمناقشة المتطلبات',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            userId: '1'
          },
          {
            id: '2',
            type: 'email',
            description: 'إرسال عرض سعر مفصل',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            userId: '1'
          }
        ],
        tags: ['B2B', 'أجهزة'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'طلب هواتف ذكية',
        customerId: '2',
        customerName: 'سارة أحمد',
        value: 12600,
        currency: 'SAR',
        stage: 'NEGOTIATION',
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        source: 'whatsapp',
        assignedTo: '1',
        assignedToName: 'أحمد المدير',
        description: 'طلب شراء 3 هواتف iPhone للعائلة',
        products: [
          { id: '2', name: 'iPhone 15 Pro', quantity: 3, price: 4200 }
        ],
        activities: [
          {
            id: '3',
            type: 'meeting',
            description: 'اجتماع في المعرض لمشاهدة الهواتف',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            userId: '1'
          }
        ],
        tags: ['B2C', 'هواتف'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: '3',
        title: 'مشروع تجهيز مكتب',
        customerId: '3',
        customerName: 'شركة التقنية المتقدمة',
        value: 85000,
        currency: 'SAR',
        stage: 'QUALIFIED',
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        source: 'website',
        assignedTo: '1',
        assignedToName: 'أحمد المدير',
        description: 'تجهيز مكتب جديد بأجهزة كمبيوتر وملحقات',
        products: [
          { id: '1', name: 'لابتوب Dell XPS', quantity: 15, price: 4500 },
          { id: '3', name: 'شاشة Dell 27 بوصة', quantity: 15, price: 1200 }
        ],
        activities: [
          {
            id: '4',
            type: 'email',
            description: 'استفسار أولي عن الأسعار',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            userId: '1'
          }
        ],
        tags: ['B2B', 'مشروع كبير'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      }
    ];

    mockOpportunities.forEach(opp => {
      this.opportunities.set(opp.id, opp);
    });
  }

  /**
   * Create new opportunity
   */
  async createOpportunity(opportunityData) {
    try {
      const opportunity = {
        id: this.generateId(),
        title: opportunityData.title,
        customerId: opportunityData.customerId,
        customerName: opportunityData.customerName,
        value: opportunityData.value || 0,
        currency: opportunityData.currency || 'SAR',
        stage: opportunityData.stage || 'LEAD',
        probability: this.stages[opportunityData.stage || 'LEAD'].probability,
        expectedCloseDate: opportunityData.expectedCloseDate ? new Date(opportunityData.expectedCloseDate) : null,
        source: opportunityData.source,
        assignedTo: opportunityData.assignedTo,
        assignedToName: opportunityData.assignedToName,
        description: opportunityData.description || '',
        products: opportunityData.products || [],
        activities: [],
        tags: opportunityData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.opportunities.set(opportunity.id, opportunity);

      return {
        success: true,
        data: opportunity,
        message: 'تم إنشاء الفرصة التجارية بنجاح'
      };
    } catch (error) {
      console.error('Error creating opportunity:', error);
      return {
        success: false,
        error: 'فشل في إنشاء الفرصة التجارية'
      };
    }
  }

  /**
   * Get all opportunities with filters
   */
  async getOpportunities(filters = {}) {
    try {
      let opportunities = Array.from(this.opportunities.values());

      // Apply filters
      if (filters.stage) {
        opportunities = opportunities.filter(opp => opp.stage === filters.stage);
      }

      if (filters.assignedTo) {
        opportunities = opportunities.filter(opp => opp.assignedTo === filters.assignedTo);
      }

      if (filters.customerId) {
        opportunities = opportunities.filter(opp => opp.customerId === filters.customerId);
      }

      if (filters.source) {
        opportunities = opportunities.filter(opp => opp.source === filters.source);
      }

      if (filters.minValue) {
        opportunities = opportunities.filter(opp => opp.value >= filters.minValue);
      }

      if (filters.maxValue) {
        opportunities = opportunities.filter(opp => opp.value <= filters.maxValue);
      }

      // Sort by updated date (newest first)
      opportunities.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedOpportunities = opportunities.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedOpportunities,
        pagination: {
          page,
          limit,
          total: opportunities.length,
          pages: Math.ceil(opportunities.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting opportunities:', error);
      return {
        success: false,
        error: 'فشل في جلب الفرص التجارية'
      };
    }
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(id) {
    try {
      const opportunity = this.opportunities.get(id);
      
      if (!opportunity) {
        return {
          success: false,
          error: 'الفرصة التجارية غير موجودة'
        };
      }

      return {
        success: true,
        data: opportunity
      };
    } catch (error) {
      console.error('Error getting opportunity:', error);
      return {
        success: false,
        error: 'فشل في جلب الفرصة التجارية'
      };
    }
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(id, updateData) {
    try {
      const opportunity = this.opportunities.get(id);
      
      if (!opportunity) {
        return {
          success: false,
          error: 'الفرصة التجارية غير موجودة'
        };
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          opportunity[key] = updateData[key];
        }
      });

      // Update probability if stage changed
      if (updateData.stage) {
        opportunity.probability = this.stages[updateData.stage].probability;
      }

      opportunity.updatedAt = new Date();

      this.opportunities.set(id, opportunity);

      return {
        success: true,
        data: opportunity,
        message: 'تم تحديث الفرصة التجارية بنجاح'
      };
    } catch (error) {
      console.error('Error updating opportunity:', error);
      return {
        success: false,
        error: 'فشل في تحديث الفرصة التجارية'
      };
    }
  }

  /**
   * Delete opportunity
   */
  async deleteOpportunity(id) {
    try {
      const deleted = this.opportunities.delete(id);
      
      if (!deleted) {
        return {
          success: false,
          error: 'الفرصة التجارية غير موجودة'
        };
      }

      return {
        success: true,
        message: 'تم حذف الفرصة التجارية بنجاح'
      };
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      return {
        success: false,
        error: 'فشل في حذف الفرصة التجارية'
      };
    }
  }

  /**
   * Add activity to opportunity
   */
  async addActivity(opportunityId, activityData) {
    try {
      const opportunity = this.opportunities.get(opportunityId);
      
      if (!opportunity) {
        return {
          success: false,
          error: 'الفرصة التجارية غير موجودة'
        };
      }

      const activity = {
        id: this.generateId(),
        type: activityData.type,
        description: activityData.description,
        date: activityData.date ? new Date(activityData.date) : new Date(),
        userId: activityData.userId,
        userName: activityData.userName,
      };

      opportunity.activities.push(activity);
      opportunity.updatedAt = new Date();

      this.opportunities.set(opportunityId, opportunity);

      return {
        success: true,
        data: activity,
        message: 'تم إضافة النشاط بنجاح'
      };
    } catch (error) {
      console.error('Error adding activity:', error);
      return {
        success: false,
        error: 'فشل في إضافة النشاط'
      };
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats() {
    try {
      const opportunities = Array.from(this.opportunities.values());
      const stats = {};

      // Initialize stats for each stage
      Object.keys(this.stages).forEach(stage => {
        stats[stage] = {
          count: 0,
          value: 0,
          opportunities: []
        };
      });

      // Calculate stats
      opportunities.forEach(opp => {
        if (stats[opp.stage]) {
          stats[opp.stage].count++;
          stats[opp.stage].value += opp.value;
          stats[opp.stage].opportunities.push(opp);
        }
      });

      // Calculate totals
      const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
      const totalCount = opportunities.length;
      const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

      return {
        success: true,
        data: {
          stages: stats,
          totals: {
            count: totalCount,
            value: totalValue,
            weightedValue: Math.round(weightedValue),
            averageValue: totalCount > 0 ? Math.round(totalValue / totalCount) : 0,
          }
        }
      };
    } catch (error) {
      console.error('Error getting pipeline stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المبيعات'
      };
    }
  }

  /**
   * Get sales forecast
   */
  async getSalesForecast(period = 'month') {
    try {
      const opportunities = Array.from(this.opportunities.values());
      const now = new Date();
      let endDate;

      // Calculate period end date
      switch (period) {
        case 'week':
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          break;
        case 'quarter':
          endDate = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
          break;
        default:
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      }

      // Filter opportunities expected to close in period
      const forecastOpportunities = opportunities.filter(opp => {
        return opp.expectedCloseDate && 
               opp.expectedCloseDate >= now && 
               opp.expectedCloseDate <= endDate &&
               !['CLOSED_WON', 'CLOSED_LOST'].includes(opp.stage);
      });

      // Calculate forecast
      const bestCase = forecastOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const mostLikely = forecastOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
      const worstCase = forecastOpportunities
        .filter(opp => opp.probability >= 75)
        .reduce((sum, opp) => sum + (opp.value * 0.5), 0);

      return {
        success: true,
        data: {
          period,
          startDate: now,
          endDate,
          opportunities: forecastOpportunities,
          forecast: {
            bestCase: Math.round(bestCase),
            mostLikely: Math.round(mostLikely),
            worstCase: Math.round(worstCase),
            count: forecastOpportunities.length,
          }
        }
      };
    } catch (error) {
      console.error('Error getting sales forecast:', error);
      return {
        success: false,
        error: 'فشل في جلب توقعات المبيعات'
      };
    }
  }

  /**
   * Get opportunity stages
   */
  getStages() {
    return {
      success: true,
      data: this.stages
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = new OpportunityService();
