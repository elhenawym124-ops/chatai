/**
 * Company Service
 * 
 * Handles company management, subscriptions, and limits
 */

class CompanyService {
  constructor() {
    this.subscriptionPlans = {
      FREE: {
        name: 'مجاني',
        price: 0,
        currency: 'SAR',
        limits: {
          users: 1,
          customers: 100,
          conversations: 500,
          products: 50,
          orders: 100,
          storage: 100, // MB
          aiRequests: 100,
          emailNotifications: 50,
          smsNotifications: 0,
        },
        features: {
          basicCRM: true,
          messengerIntegration: true,
          basicReports: true,
          aiAssistant: false,
          advancedAnalytics: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
        }
      },
      BASIC: {
        name: 'أساسي',
        price: 99,
        currency: 'SAR',
        limits: {
          users: 3,
          customers: 1000,
          conversations: 5000,
          products: 200,
          orders: 1000,
          storage: 1000, // MB
          aiRequests: 1000,
          emailNotifications: 500,
          smsNotifications: 100,
        },
        features: {
          basicCRM: true,
          messengerIntegration: true,
          basicReports: true,
          aiAssistant: true,
          advancedAnalytics: false,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
        }
      },
      PREMIUM: {
        name: 'متقدم',
        price: 299,
        currency: 'SAR',
        limits: {
          users: 10,
          customers: 10000,
          conversations: 50000,
          products: 1000,
          orders: 10000,
          storage: 10000, // MB
          aiRequests: 10000,
          emailNotifications: 5000,
          smsNotifications: 1000,
        },
        features: {
          basicCRM: true,
          messengerIntegration: true,
          basicReports: true,
          aiAssistant: true,
          advancedAnalytics: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: false,
        }
      },
      ENTERPRISE: {
        name: 'مؤسسي',
        price: 999,
        currency: 'SAR',
        limits: {
          users: -1, // Unlimited
          customers: -1,
          conversations: -1,
          products: -1,
          orders: -1,
          storage: -1,
          aiRequests: -1,
          emailNotifications: -1,
          smsNotifications: -1,
        },
        features: {
          basicCRM: true,
          messengerIntegration: true,
          basicReports: true,
          aiAssistant: true,
          advancedAnalytics: true,
          customBranding: true,
          apiAccess: true,
          prioritySupport: true,
        }
      }
    };
  }

  /**
   * Get all subscription plans
   */
  getSubscriptionPlans() {
    return this.subscriptionPlans;
  }

  /**
   * Get specific subscription plan
   */
  getSubscriptionPlan(planName) {
    return this.subscriptionPlans[planName] || null;
  }

  /**
   * Create new company
   */
  async createCompany(companyData) {
    try {
      const company = {
        id: this.generateId(),
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        website: companyData.website,
        industry: companyData.industry,
        size: companyData.size,
        subscription: {
          plan: 'FREE',
          status: 'active',
          startDate: new Date(),
          endDate: null,
          autoRenew: false,
        },
        settings: {
          timezone: 'Asia/Riyadh',
          language: 'ar',
          currency: 'SAR',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
        },
        limits: this.subscriptionPlans.FREE.limits,
        features: this.subscriptionPlans.FREE.features,
        usage: {
          users: 0,
          customers: 0,
          conversations: 0,
          products: 0,
          orders: 0,
          storage: 0,
          aiRequests: 0,
          emailNotifications: 0,
          smsNotifications: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // In real implementation, save to database
      console.log('Creating company:', company);
      
      return {
        success: true,
        data: company,
        message: 'تم إنشاء الشركة بنجاح'
      };
    } catch (error) {
      console.error('Error creating company:', error);
      return {
        success: false,
        error: 'فشل في إنشاء الشركة'
      };
    }
  }

  /**
   * Update company subscription
   */
  async updateSubscription(companyId, planName) {
    try {
      const plan = this.getSubscriptionPlan(planName);
      if (!plan) {
        return {
          success: false,
          error: 'باقة الاشتراك غير موجودة'
        };
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

      const subscription = {
        plan: planName,
        status: 'active',
        startDate,
        endDate,
        autoRenew: true,
        price: plan.price,
        currency: plan.currency,
      };

      // In real implementation, update database
      console.log('Updating subscription for company:', companyId, subscription);

      return {
        success: true,
        data: {
          subscription,
          limits: plan.limits,
          features: plan.features,
        },
        message: 'تم تحديث الاشتراك بنجاح'
      };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return {
        success: false,
        error: 'فشل في تحديث الاشتراك'
      };
    }
  }

  /**
   * Check if company can perform action based on limits
   */
  async checkLimit(companyId, resource, amount = 1) {
    try {
      // In real implementation, get from database
      const company = await this.getCompany(companyId);
      
      if (!company) {
        return { allowed: false, reason: 'الشركة غير موجودة' };
      }

      const limit = company.limits[resource];
      const usage = company.usage[resource] || 0;

      // Unlimited (-1) means no limit
      if (limit === -1) {
        return { allowed: true };
      }

      // Check if adding amount would exceed limit
      if (usage + amount > limit) {
        return {
          allowed: false,
          reason: `تم تجاوز الحد المسموح لـ ${resource}`,
          current: usage,
          limit: limit,
          requested: amount
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking limit:', error);
      return { allowed: false, reason: 'خطأ في فحص الحدود' };
    }
  }

  /**
   * Update usage statistics
   */
  async updateUsage(companyId, resource, amount = 1) {
    try {
      // In real implementation, update database
      console.log(`Updating usage for company ${companyId}: ${resource} +${amount}`);
      
      return {
        success: true,
        message: 'تم تحديث الاستخدام'
      };
    } catch (error) {
      console.error('Error updating usage:', error);
      return {
        success: false,
        error: 'فشل في تحديث الاستخدام'
      };
    }
  }

  /**
   * Get company details
   */
  async getCompany(companyId) {
    try {
      // Mock company data - in real implementation, get from database
      return {
        id: companyId,
        name: 'شركة التواصل التجريبية',
        subscription: {
          plan: 'PREMIUM',
          status: 'active',
        },
        limits: this.subscriptionPlans.PREMIUM.limits,
        features: this.subscriptionPlans.PREMIUM.features,
        usage: {
          users: 3,
          customers: 150,
          conversations: 1200,
          products: 45,
          orders: 89,
          storage: 2500,
          aiRequests: 450,
          emailNotifications: 120,
          smsNotifications: 25,
        }
      };
    } catch (error) {
      console.error('Error getting company:', error);
      return null;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(companyId) {
    try {
      const company = await this.getCompany(companyId);
      if (!company) {
        return { success: false, error: 'الشركة غير موجودة' };
      }

      const stats = {};
      Object.keys(company.limits).forEach(resource => {
        const limit = company.limits[resource];
        const usage = company.usage[resource] || 0;
        const percentage = limit === -1 ? 0 : Math.round((usage / limit) * 100);

        stats[resource] = {
          usage,
          limit,
          percentage,
          unlimited: limit === -1,
          warning: percentage > 80,
          exceeded: percentage >= 100,
        };
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الاستخدام'
      };
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = new CompanyService();
