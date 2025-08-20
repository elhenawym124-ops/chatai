/**
 * Follow-up Automation Service
 * 
 * Handles automated follow-up messages, customer re-engagement,
 * and personalized communication sequences
 */

class FollowUpAutomationService {
  constructor() {
    this.followUpRules = new Map(); // Follow-up rules
    this.scheduledFollowUps = new Map(); // Scheduled follow-ups
    this.followUpHistory = new Map(); // Follow-up history
    this.messageTemplates = new Map(); // Message templates
    this.customerSegments = new Map(); // Customer segments for targeting
    this.initializeMockData();
    this.startFollowUpProcessor();
  }

  /**
   * Initialize mock data for follow-up automation
   */
  initializeMockData() {
    // Mock follow-up rules
    const mockFollowUpRules = [
      {
        id: 'FOLLOWUP001',
        name: 'متابعة العملاء الجدد',
        description: 'رسالة ترحيب ومتابعة للعملاء الجدد بعد التسجيل',
        isActive: true,
        companyId: '1',
        trigger: {
          event: 'customer_registration',
          delay: 24, // hours
          conditions: {
            customerType: 'new',
            hasOrdered: false,
          },
        },
        targeting: {
          customerSegments: ['new_customers'],
          excludeSegments: ['churned'],
          customFilters: {},
        },
        message: {
          templateId: 'WELCOME_NEW_CUSTOMER',
          personalization: true,
          channel: 'messenger',
          fallbackChannel: 'email',
        },
        schedule: {
          workingHoursOnly: true,
          timezone: 'Asia/Riyadh',
          workingHours: {
            start: '09:00',
            end: '18:00',
          },
          excludeDays: ['friday'],
        },
        limits: {
          maxPerCustomer: 1,
          cooldownPeriod: 7, // days
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'FOLLOWUP002',
        name: 'متابعة السلة المهجورة',
        description: 'تذكير العملاء بالمنتجات في سلة التسوق',
        isActive: true,
        companyId: '1',
        trigger: {
          event: 'cart_abandonment',
          delay: 2, // hours
          conditions: {
            cartValue: { min: 100 },
            hasOrdered: false,
          },
        },
        targeting: {
          customerSegments: ['active_customers'],
          excludeSegments: ['churned'],
          customFilters: {},
        },
        message: {
          templateId: 'CART_ABANDONMENT_REMINDER',
          personalization: true,
          channel: 'messenger',
          fallbackChannel: 'email',
        },
        schedule: {
          workingHoursOnly: false,
          timezone: 'Asia/Riyadh',
          workingHours: null,
          excludeDays: [],
        },
        limits: {
          maxPerCustomer: 3,
          cooldownPeriod: 1, // days
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'FOLLOWUP003',
        name: 'متابعة ما بعد الشراء',
        description: 'طلب تقييم وتجربة العميل بعد الشراء',
        isActive: true,
        companyId: '1',
        trigger: {
          event: 'order_delivered',
          delay: 48, // hours
          conditions: {
            orderStatus: 'delivered',
            hasReviewed: false,
          },
        },
        targeting: {
          customerSegments: ['customers'],
          excludeSegments: [],
          customFilters: {},
        },
        message: {
          templateId: 'POST_PURCHASE_REVIEW',
          personalization: true,
          channel: 'messenger',
          fallbackChannel: 'sms',
        },
        schedule: {
          workingHoursOnly: true,
          timezone: 'Asia/Riyadh',
          workingHours: {
            start: '10:00',
            end: '20:00',
          },
          excludeDays: [],
        },
        limits: {
          maxPerCustomer: 1,
          cooldownPeriod: 30, // days
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'FOLLOWUP004',
        name: 'إعادة تفعيل العملاء الخاملين',
        description: 'محاولة إعادة تفعيل العملاء الذين لم يشتروا لفترة',
        isActive: true,
        companyId: '1',
        trigger: {
          event: 'customer_inactivity',
          delay: 0, // immediate when detected
          conditions: {
            lastOrderDays: 60,
            customerType: 'regular',
          },
        },
        targeting: {
          customerSegments: ['inactive_customers'],
          excludeSegments: ['churned'],
          customFilters: {
            totalOrders: { min: 2 },
          },
        },
        message: {
          templateId: 'REACTIVATION_OFFER',
          personalization: true,
          channel: 'email',
          fallbackChannel: 'sms',
        },
        schedule: {
          workingHoursOnly: true,
          timezone: 'Asia/Riyadh',
          workingHours: {
            start: '09:00',
            end: '17:00',
          },
          excludeDays: ['friday'],
        },
        limits: {
          maxPerCustomer: 2,
          cooldownPeriod: 30, // days
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockFollowUpRules.forEach(rule => {
      this.followUpRules.set(rule.id, rule);
    });

    // Mock message templates
    const mockMessageTemplates = [
      {
        id: 'WELCOME_NEW_CUSTOMER',
        name: 'رسالة ترحيب للعملاء الجدد',
        subject: 'مرحباً بك في {{company_name}}! 🎉',
        content: `مرحباً {{customer_name}}! 👋

نحن سعداء جداً بانضمامك إلى عائلة {{company_name}}!

🎁 كهدية ترحيب، احصل على خصم 15% على طلبك الأول باستخدام الكود: WELCOME15

✨ اكتشف مجموعتنا المميزة من المنتجات:
• أحدث الإلكترونيات
• أزياء عصرية
• منتجات منزلية

هل تحتاج مساعدة في اختيار منتج؟ أنا هنا لمساعدتك! 😊`,
        variables: ['customer_name', 'company_name'],
        channel: 'messenger',
        type: 'welcome',
        companyId: '1',
      },
      {
        id: 'CART_ABANDONMENT_REMINDER',
        name: 'تذكير السلة المهجورة',
        subject: 'لا تنس منتجاتك المفضلة! 🛒',
        content: `مرحباً {{customer_name}}! 

لاحظت أنك تركت بعض المنتجات الرائعة في سلة التسوق:

{{cart_items}}

💰 إجمالي السلة: {{cart_total}} ريال

⏰ لا تفوت الفرصة! أكمل طلبك الآن واحصل على:
• شحن مجاني للطلبات أكثر من 200 ريال
• ضمان الجودة
• خدمة عملاء 24/7

هل تحتاج مساعدة في إتمام الطلب؟`,
        variables: ['customer_name', 'cart_items', 'cart_total'],
        channel: 'messenger',
        type: 'cart_abandonment',
        companyId: '1',
      },
      {
        id: 'POST_PURCHASE_REVIEW',
        name: 'طلب تقييم بعد الشراء',
        subject: 'كيف كانت تجربتك معنا؟ ⭐',
        content: `مرحباً {{customer_name}}! 

نتمنى أن تكون راضياً عن طلبك الأخير: {{order_items}}

📝 نود معرفة رأيك! تقييمك يساعدنا على التحسين:

⭐ قيم منتجاتك
💬 اكتب مراجعة
📸 شارك صورة (اختياري)

🎁 كمكافأة على تقييمك، احصل على خصم 10% على طلبك القادم!

شكراً لثقتك بنا ❤️`,
        variables: ['customer_name', 'order_items'],
        channel: 'messenger',
        type: 'review_request',
        companyId: '1',
      },
      {
        id: 'REACTIVATION_OFFER',
        name: 'عرض إعادة التفعيل',
        subject: 'اشتقنا لك! عرض خاص لعودتك 💝',
        content: `مرحباً {{customer_name}}! 

لاحظنا أنك لم تتسوق معنا منذ فترة، واشتقنا لك! 😢

🎉 عرض خاص لعودتك:
• خصم 25% على جميع المنتجات
• شحن مجاني
• منتجات جديدة ومثيرة

استخدم الكود: COMEBACK25

⏰ العرض ساري لمدة 7 أيام فقط!

اكتشف ما الجديد وعد إلى عائلتنا ❤️`,
        variables: ['customer_name'],
        channel: 'email',
        type: 'reactivation',
        companyId: '1',
      },
    ];

    mockMessageTemplates.forEach(template => {
      this.messageTemplates.set(template.id, template);
    });

    // Mock scheduled follow-ups
    const mockScheduledFollowUps = [
      {
        id: 'SCHED001',
        ruleId: 'FOLLOWUP001',
        customerId: '1',
        templateId: 'WELCOME_NEW_CUSTOMER',
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'scheduled',
        channel: 'messenger',
        personalizedContent: null,
        attempts: 0,
        maxAttempts: 3,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'SCHED002',
        ruleId: 'FOLLOWUP002',
        customerId: '2',
        templateId: 'CART_ABANDONMENT_REMINDER',
        scheduledFor: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        status: 'scheduled',
        channel: 'messenger',
        personalizedContent: null,
        attempts: 0,
        maxAttempts: 3,
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockScheduledFollowUps.forEach(followUp => {
      this.scheduledFollowUps.set(followUp.id, followUp);
    });

    // Mock follow-up history
    const mockFollowUpHistory = [
      {
        id: 'HIST001',
        ruleId: 'FOLLOWUP001',
        customerId: '1',
        templateId: 'WELCOME_NEW_CUSTOMER',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        channel: 'messenger',
        status: 'delivered',
        opened: true,
        clicked: false,
        responded: true,
        responseTime: 45, // minutes
        companyId: '1',
      },
      {
        id: 'HIST002',
        ruleId: 'FOLLOWUP002',
        customerId: '2',
        templateId: 'CART_ABANDONMENT_REMINDER',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        channel: 'messenger',
        status: 'delivered',
        opened: true,
        clicked: true,
        responded: false,
        responseTime: null,
        companyId: '1',
      },
    ];

    mockFollowUpHistory.forEach(history => {
      this.followUpHistory.set(history.id, history);
    });
  }

  /**
   * Create follow-up rule
   */
  async createFollowUpRule(ruleData) {
    try {
      const {
        name,
        description,
        trigger,
        targeting,
        message,
        schedule,
        limits,
        companyId,
      } = ruleData;

      const rule = {
        id: this.generateRuleId(),
        name,
        description,
        isActive: true,
        companyId,
        trigger,
        targeting,
        message,
        schedule,
        limits,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.followUpRules.set(rule.id, rule);

      return {
        success: true,
        data: rule,
        message: 'تم إنشاء قاعدة المتابعة بنجاح'
      };

    } catch (error) {
      console.error('Error creating follow-up rule:', error);
      return {
        success: false,
        error: 'فشل في إنشاء قاعدة المتابعة'
      };
    }
  }

  /**
   * Schedule follow-up message
   */
  async scheduleFollowUp(scheduleData) {
    try {
      const {
        ruleId,
        customerId,
        triggerData,
        companyId,
      } = scheduleData;

      const rule = this.followUpRules.get(ruleId);
      if (!rule || !rule.isActive) {
        return {
          success: false,
          error: 'قاعدة المتابعة غير موجودة أو غير نشطة'
        };
      }

      // Check if customer meets targeting criteria
      const meetsTargeting = await this.checkTargetingCriteria(rule.targeting, customerId);
      if (!meetsTargeting) {
        return {
          success: false,
          error: 'العميل لا يلبي معايير الاستهداف'
        };
      }

      // Check limits
      const withinLimits = await this.checkFollowUpLimits(rule.limits, customerId, ruleId);
      if (!withinLimits) {
        return {
          success: false,
          error: 'تم تجاوز حدود المتابعة للعميل'
        };
      }

      // Calculate scheduled time
      const scheduledFor = this.calculateScheduledTime(rule.trigger.delay, rule.schedule);

      const followUp = {
        id: this.generateFollowUpId(),
        ruleId,
        customerId,
        templateId: rule.message.templateId,
        scheduledFor,
        status: 'scheduled',
        channel: rule.message.channel,
        personalizedContent: null,
        attempts: 0,
        maxAttempts: 3,
        triggerData,
        companyId,
        createdAt: new Date(),
      };

      this.scheduledFollowUps.set(followUp.id, followUp);

      return {
        success: true,
        data: followUp,
        message: 'تم جدولة رسالة المتابعة بنجاح'
      };

    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      return {
        success: false,
        error: 'فشل في جدولة رسالة المتابعة'
      };
    }
  }

  /**
   * Process scheduled follow-ups
   */
  async processScheduledFollowUps() {
    try {
      const now = new Date();
      const dueFollowUps = Array.from(this.scheduledFollowUps.values())
        .filter(followUp => 
          followUp.status === 'scheduled' && 
          followUp.scheduledFor <= now
        );

      for (const followUp of dueFollowUps) {
        await this.sendFollowUpMessage(followUp);
      }

      return {
        success: true,
        processed: dueFollowUps.length
      };

    } catch (error) {
      console.error('Error processing scheduled follow-ups:', error);
      return {
        success: false,
        error: 'فشل في معالجة رسائل المتابعة المجدولة'
      };
    }
  }

  /**
   * Send follow-up message
   */
  async sendFollowUpMessage(followUp) {
    try {
      const template = this.messageTemplates.get(followUp.templateId);
      if (!template) {
        throw new Error('قالب الرسالة غير موجود');
      }

      // Personalize message content
      const personalizedContent = await this.personalizeMessage(template, followUp.customerId, followUp.triggerData);

      // Send message through appropriate channel
      const sendResult = await this.sendMessage({
        customerId: followUp.customerId,
        channel: followUp.channel,
        content: personalizedContent,
        template: template,
      });

      if (sendResult.success) {
        // Update follow-up status
        followUp.status = 'sent';
        followUp.sentAt = new Date();
        this.scheduledFollowUps.set(followUp.id, followUp);

        // Add to history
        const historyEntry = {
          id: this.generateHistoryId(),
          ruleId: followUp.ruleId,
          customerId: followUp.customerId,
          templateId: followUp.templateId,
          sentAt: new Date(),
          channel: followUp.channel,
          status: 'sent',
          opened: false,
          clicked: false,
          responded: false,
          responseTime: null,
          companyId: followUp.companyId,
        };

        this.followUpHistory.set(historyEntry.id, historyEntry);

        return {
          success: true,
          data: historyEntry
        };
      } else {
        // Handle send failure
        followUp.attempts += 1;
        if (followUp.attempts >= followUp.maxAttempts) {
          followUp.status = 'failed';
        }
        this.scheduledFollowUps.set(followUp.id, followUp);

        throw new Error('فشل في إرسال رسالة المتابعة');
      }

    } catch (error) {
      console.error('Error sending follow-up message:', error);
      throw error;
    }
  }

  /**
   * Get follow-up rules
   */
  async getFollowUpRules(filters = {}) {
    try {
      const { companyId, isActive, event } = filters;

      let rules = Array.from(this.followUpRules.values());

      // Apply filters
      if (companyId) {
        rules = rules.filter(rule => rule.companyId === companyId);
      }
      if (isActive !== undefined) {
        rules = rules.filter(rule => rule.isActive === isActive);
      }
      if (event) {
        rules = rules.filter(rule => rule.trigger.event === event);
      }

      return {
        success: true,
        data: rules
      };

    } catch (error) {
      console.error('Error getting follow-up rules:', error);
      return {
        success: false,
        error: 'فشل في جلب قواعد المتابعة'
      };
    }
  }

  /**
   * Get follow-up statistics
   */
  async getFollowUpStats(filters = {}) {
    try {
      const { companyId, period = 'week' } = filters;

      let history = Array.from(this.followUpHistory.values());
      
      if (companyId) {
        history = history.filter(h => h.companyId === companyId);
      }

      const stats = {
        total: history.length,
        byStatus: this.countByField(history, 'status'),
        byChannel: this.countByField(history, 'channel'),
        byRule: this.countByField(history, 'ruleId'),
        engagement: {
          openRate: this.calculateOpenRate(history),
          clickRate: this.calculateClickRate(history),
          responseRate: this.calculateResponseRate(history),
        },
        averageResponseTime: this.calculateAverageResponseTime(history),
        trends: this.calculateFollowUpTrends(history, period),
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting follow-up stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المتابعة'
      };
    }
  }

  /**
   * Helper methods
   */
  async checkTargetingCriteria(targeting, customerId) {
    // Mock targeting check - would integrate with customer segmentation service
    return true;
  }

  async checkFollowUpLimits(limits, customerId, ruleId) {
    const customerHistory = Array.from(this.followUpHistory.values())
      .filter(h => h.customerId === customerId && h.ruleId === ruleId);

    // Check max per customer
    if (customerHistory.length >= limits.maxPerCustomer) {
      return false;
    }

    // Check cooldown period
    if (limits.cooldownPeriod > 0 && customerHistory.length > 0) {
      const lastSent = customerHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
      const cooldownEnd = new Date(lastSent.sentAt.getTime() + limits.cooldownPeriod * 24 * 60 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        return false;
      }
    }

    return true;
  }

  calculateScheduledTime(delayHours, schedule) {
    const scheduledTime = new Date(Date.now() + delayHours * 60 * 60 * 1000);

    if (schedule.workingHoursOnly && schedule.workingHours) {
      // Adjust to working hours if needed
      const hour = scheduledTime.getHours();
      const startHour = parseInt(schedule.workingHours.start.split(':')[0]);
      const endHour = parseInt(schedule.workingHours.end.split(':')[0]);

      if (hour < startHour) {
        scheduledTime.setHours(startHour, 0, 0, 0);
      } else if (hour >= endHour) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
        scheduledTime.setHours(startHour, 0, 0, 0);
      }
    }

    return scheduledTime;
  }

  async personalizeMessage(template, customerId, triggerData) {
    // Mock personalization - would fetch customer data
    let content = template.content;
    
    content = content.replace('{{customer_name}}', 'أحمد');
    content = content.replace('{{company_name}}', 'متجرنا المميز');
    
    if (triggerData) {
      Object.keys(triggerData).forEach(key => {
        content = content.replace(`{{${key}}}`, triggerData[key]);
      });
    }

    return content;
  }

  async sendMessage(messageData) {
    // Mock message sending
    console.log(`Sending follow-up message to customer ${messageData.customerId} via ${messageData.channel}`);
    
    return {
      success: true,
      messageId: `MSG${Date.now()}`,
    };
  }

  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });
    return counts;
  }

  calculateOpenRate(history) {
    const total = history.length;
    const opened = history.filter(h => h.opened).length;
    return total > 0 ? (opened / total) * 100 : 0;
  }

  calculateClickRate(history) {
    const total = history.length;
    const clicked = history.filter(h => h.clicked).length;
    return total > 0 ? (clicked / total) * 100 : 0;
  }

  calculateResponseRate(history) {
    const total = history.length;
    const responded = history.filter(h => h.responded).length;
    return total > 0 ? (responded / total) * 100 : 0;
  }

  calculateAverageResponseTime(history) {
    const responded = history.filter(h => h.responseTime);
    if (responded.length === 0) return 0;
    
    const total = responded.reduce((sum, h) => sum + h.responseTime, 0);
    return total / responded.length;
  }

  calculateFollowUpTrends(history, period) {
    // Mock trend data
    return [
      { period: 'أسبوع 1', sent: 45, opened: 32, responded: 18 },
      { period: 'أسبوع 2', sent: 52, opened: 38, responded: 22 },
      { period: 'أسبوع 3', sent: 48, opened: 35, responded: 20 },
      { period: 'أسبوع 4', sent: 55, opened: 41, responded: 25 },
    ];
  }

  startFollowUpProcessor() {
    // Process scheduled follow-ups every 5 minutes
    setInterval(() => {
      this.processScheduledFollowUps();
    }, 5 * 60 * 1000);
  }

  generateRuleId() {
    return `FOLLOWUP${Date.now().toString(36).toUpperCase()}`;
  }

  generateFollowUpId() {
    return `SCHED${Date.now().toString(36).toUpperCase()}`;
  }

  generateHistoryId() {
    return `HIST${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new FollowUpAutomationService();
