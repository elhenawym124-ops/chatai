/**
 * Message Scheduling Service
 * 
 * Handles scheduling of messages and marketing campaigns,
 * bulk messaging, and campaign management
 */

class MessageSchedulingService {
  constructor() {
    this.scheduledMessages = new Map(); // Scheduled individual messages
    this.campaigns = new Map(); // Marketing campaigns
    this.campaignSchedules = new Map(); // Campaign schedules
    this.messageQueue = new Map(); // Message queue for processing
    this.campaignTemplates = new Map(); // Campaign templates
    this.audienceSegments = new Map(); // Audience segments
    this.initializeMockData();
    this.startMessageProcessor();
  }

  /**
   * Initialize mock data for message scheduling
   */
  initializeMockData() {
    // Mock scheduled messages
    const mockScheduledMessages = [
      {
        id: 'MSG001',
        type: 'individual',
        customerId: '1',
        content: 'مرحباً! لا تنس أن لديك موعد غداً في الساعة 2 ظهراً',
        channel: 'messenger',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'scheduled',
        priority: 'normal',
        companyId: '1',
        createdBy: 'user1',
        createdAt: new Date(),
      },
      {
        id: 'MSG002',
        type: 'individual',
        customerId: '2',
        content: 'عرض خاص! خصم 20% على جميع المنتجات لمدة 24 ساعة فقط',
        channel: 'sms',
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'scheduled',
        priority: 'high',
        companyId: '1',
        createdBy: 'user1',
        createdAt: new Date(),
      },
    ];

    mockScheduledMessages.forEach(message => {
      this.scheduledMessages.set(message.id, message);
    });

    // Mock campaigns
    const mockCampaigns = [
      {
        id: 'CAMP001',
        name: 'حملة العيد الوطني',
        description: 'حملة تسويقية للاحتفال بالعيد الوطني مع عروض خاصة',
        type: 'promotional',
        status: 'active',
        companyId: '1',
        targeting: {
          segments: ['active_customers', 'vip_customers'],
          filters: {
            location: ['riyadh', 'jeddah'],
            ageRange: { min: 18, max: 65 },
            lastOrderDays: { max: 90 },
          },
          estimatedReach: 1250,
        },
        content: {
          templateId: 'NATIONAL_DAY_PROMO',
          subject: '🇸🇦 عروض العيد الوطني المميزة!',
          message: `🎉 احتفل معنا بالعيد الوطني!

🇸🇦 عروض وطنية مميزة:
• خصم 30% على جميع المنتجات
• شحن مجاني لجميع أنحاء المملكة
• هدايا مجانية مع كل طلب

استخدم الكود: NATIONAL30

⏰ العرض ساري حتى 25 سبتمبر

كل عام وأنتم بخير! 💚`,
          attachments: [],
          personalization: true,
        },
        schedule: {
          startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          frequency: 'once',
          timeSlots: ['10:00', '15:00', '19:00'],
          timezone: 'Asia/Riyadh',
          workingDaysOnly: false,
        },
        channels: {
          primary: 'messenger',
          secondary: 'email',
          fallback: 'sms',
        },
        budget: {
          total: 5000,
          perMessage: 0.5,
          spent: 0,
        },
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
        },
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'CAMP002',
        name: 'حملة العملاء الجدد',
        description: 'حملة ترحيب للعملاء الجدد مع عروض خاصة',
        type: 'welcome',
        status: 'active',
        companyId: '1',
        targeting: {
          segments: ['new_customers'],
          filters: {
            registrationDays: { max: 7 },
            hasOrdered: false,
          },
          estimatedReach: 150,
        },
        content: {
          templateId: 'NEW_CUSTOMER_WELCOME',
          subject: 'مرحباً بك في عائلتنا! 🎁',
          message: `مرحباً {{customer_name}}! 👋

نحن سعداء جداً بانضمامك إلينا!

🎁 هدية ترحيب خاصة:
• خصم 25% على طلبك الأول
• شحن مجاني
• دعم عملاء مخصص

استخدم الكود: WELCOME25

اكتشف مجموعتنا المميزة واستمتع بتجربة تسوق فريدة!`,
          attachments: [],
          personalization: true,
        },
        schedule: {
          startDate: new Date(),
          endDate: null, // ongoing
          frequency: 'trigger', // triggered by new registrations
          timeSlots: ['09:00'],
          timezone: 'Asia/Riyadh',
          workingDaysOnly: true,
        },
        channels: {
          primary: 'email',
          secondary: 'messenger',
          fallback: null,
        },
        budget: {
          total: 2000,
          perMessage: 0.3,
          spent: 450,
        },
        metrics: {
          sent: 1500,
          delivered: 1485,
          opened: 1120,
          clicked: 445,
          converted: 89,
          revenue: 12750,
        },
        createdBy: 'user1',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];

    mockCampaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });

    // Mock campaign templates
    const mockCampaignTemplates = [
      {
        id: 'NATIONAL_DAY_PROMO',
        name: 'قالب العيد الوطني',
        category: 'promotional',
        subject: '🇸🇦 {{event_name}} - عروض مميزة!',
        content: `🎉 احتفل معنا بـ {{event_name}}!

🇸🇦 عروض وطنية مميزة:
• خصم {{discount_percentage}}% على {{product_categories}}
• {{shipping_offer}}
• {{gift_offer}}

استخدم الكود: {{promo_code}}

⏰ العرض ساري حتى {{end_date}}

{{closing_message}}`,
        variables: [
          'event_name',
          'discount_percentage',
          'product_categories',
          'shipping_offer',
          'gift_offer',
          'promo_code',
          'end_date',
          'closing_message'
        ],
        companyId: '1',
      },
      {
        id: 'SEASONAL_SALE',
        name: 'قالب التخفيضات الموسمية',
        category: 'promotional',
        subject: '🛍️ {{season_name}} - تخفيضات تصل إلى {{max_discount}}%!',
        content: `🛍️ تخفيضات {{season_name}} الكبرى!

💰 وفر أكثر:
• تخفيضات تصل إلى {{max_discount}}%
• {{featured_products}}
• عروض محدودة الوقت

{{call_to_action}}

⏰ لفترة محدودة فقط!`,
        variables: [
          'season_name',
          'max_discount',
          'featured_products',
          'call_to_action'
        ],
        companyId: '1',
      },
    ];

    mockCampaignTemplates.forEach(template => {
      this.campaignTemplates.set(template.id, template);
    });

    // Mock audience segments
    const mockAudienceSegments = [
      {
        id: 'active_customers',
        name: 'العملاء النشطون',
        description: 'العملاء الذين اشتروا خلال آخر 30 يوم',
        criteria: {
          lastOrderDays: { max: 30 },
          totalOrders: { min: 1 },
        },
        size: 850,
        companyId: '1',
      },
      {
        id: 'vip_customers',
        name: 'عملاء VIP',
        description: 'العملاء عالي القيمة',
        criteria: {
          totalSpent: { min: 5000 },
          orderFrequency: { min: 5 },
        },
        size: 125,
        companyId: '1',
      },
      {
        id: 'new_customers',
        name: 'العملاء الجدد',
        description: 'العملاء المسجلون حديثاً',
        criteria: {
          registrationDays: { max: 30 },
          totalOrders: { max: 1 },
        },
        size: 200,
        companyId: '1',
      },
    ];

    mockAudienceSegments.forEach(segment => {
      this.audienceSegments.set(segment.id, segment);
    });
  }

  /**
   * Schedule individual message
   */
  async scheduleMessage(messageData) {
    try {
      const {
        customerId,
        content,
        channel,
        scheduledFor,
        priority = 'normal',
        companyId,
        createdBy,
      } = messageData;

      const message = {
        id: this.generateMessageId(),
        type: 'individual',
        customerId,
        content,
        channel,
        scheduledFor: new Date(scheduledFor),
        status: 'scheduled',
        priority,
        companyId,
        createdBy,
        createdAt: new Date(),
      };

      this.scheduledMessages.set(message.id, message);

      return {
        success: true,
        data: message,
        message: 'تم جدولة الرسالة بنجاح'
      };

    } catch (error) {
      console.error('Error scheduling message:', error);
      return {
        success: false,
        error: 'فشل في جدولة الرسالة'
      };
    }
  }

  /**
   * Create marketing campaign
   */
  async createCampaign(campaignData) {
    try {
      const {
        name,
        description,
        type,
        targeting,
        content,
        schedule,
        channels,
        budget,
        companyId,
        createdBy,
      } = campaignData;

      // Calculate estimated reach
      const estimatedReach = await this.calculateEstimatedReach(targeting);

      const campaign = {
        id: this.generateCampaignId(),
        name,
        description,
        type,
        status: 'draft',
        companyId,
        targeting: {
          ...targeting,
          estimatedReach,
        },
        content,
        schedule,
        channels,
        budget,
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
        },
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.campaigns.set(campaign.id, campaign);

      return {
        success: true,
        data: campaign,
        message: 'تم إنشاء الحملة بنجاح'
      };

    } catch (error) {
      console.error('Error creating campaign:', error);
      return {
        success: false,
        error: 'فشل في إنشاء الحملة'
      };
    }
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId) {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        return {
          success: false,
          error: 'الحملة غير موجودة'
        };
      }

      if (campaign.status !== 'draft') {
        return {
          success: false,
          error: 'لا يمكن إطلاق الحملة في حالتها الحالية'
        };
      }

      // Get target audience
      const audience = await this.getTargetAudience(campaign.targeting);
      
      // Schedule messages for audience
      const scheduledMessages = await this.scheduleMessagesForAudience(campaign, audience);

      // Update campaign status
      campaign.status = 'active';
      campaign.launchedAt = new Date();
      campaign.updatedAt = new Date();
      this.campaigns.set(campaignId, campaign);

      return {
        success: true,
        data: {
          campaign,
          scheduledMessages: scheduledMessages.length,
          estimatedReach: audience.length,
        },
        message: 'تم إطلاق الحملة بنجاح'
      };

    } catch (error) {
      console.error('Error launching campaign:', error);
      return {
        success: false,
        error: 'فشل في إطلاق الحملة'
      };
    }
  }

  /**
   * Get scheduled messages
   */
  async getScheduledMessages(filters = {}) {
    try {
      const { companyId, status, channel, customerId } = filters;

      let messages = Array.from(this.scheduledMessages.values());

      // Apply filters
      if (companyId) {
        messages = messages.filter(msg => msg.companyId === companyId);
      }
      if (status) {
        messages = messages.filter(msg => msg.status === status);
      }
      if (channel) {
        messages = messages.filter(msg => msg.channel === channel);
      }
      if (customerId) {
        messages = messages.filter(msg => msg.customerId === customerId);
      }

      // Sort by scheduled time
      messages.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));

      return {
        success: true,
        data: messages
      };

    } catch (error) {
      console.error('Error getting scheduled messages:', error);
      return {
        success: false,
        error: 'فشل في جلب الرسائل المجدولة'
      };
    }
  }

  /**
   * Get campaigns
   */
  async getCampaigns(filters = {}) {
    try {
      const { companyId, status, type } = filters;

      let campaigns = Array.from(this.campaigns.values());

      // Apply filters
      if (companyId) {
        campaigns = campaigns.filter(camp => camp.companyId === companyId);
      }
      if (status) {
        campaigns = campaigns.filter(camp => camp.status === status);
      }
      if (type) {
        campaigns = campaigns.filter(camp => camp.type === type);
      }

      // Sort by creation date (newest first)
      campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        data: campaigns
      };

    } catch (error) {
      console.error('Error getting campaigns:', error);
      return {
        success: false,
        error: 'فشل في جلب الحملات'
      };
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId) {
    try {
      const campaign = this.campaigns.get(campaignId);
      if (!campaign) {
        return {
          success: false,
          error: 'الحملة غير موجودة'
        };
      }

      const analytics = {
        overview: {
          status: campaign.status,
          sent: campaign.metrics.sent,
          delivered: campaign.metrics.delivered,
          opened: campaign.metrics.opened,
          clicked: campaign.metrics.clicked,
          converted: campaign.metrics.converted,
          revenue: campaign.metrics.revenue,
        },
        rates: {
          deliveryRate: campaign.metrics.sent > 0 ? (campaign.metrics.delivered / campaign.metrics.sent) * 100 : 0,
          openRate: campaign.metrics.delivered > 0 ? (campaign.metrics.opened / campaign.metrics.delivered) * 100 : 0,
          clickRate: campaign.metrics.opened > 0 ? (campaign.metrics.clicked / campaign.metrics.opened) * 100 : 0,
          conversionRate: campaign.metrics.clicked > 0 ? (campaign.metrics.converted / campaign.metrics.clicked) * 100 : 0,
        },
        roi: {
          spent: campaign.budget.spent,
          revenue: campaign.metrics.revenue,
          roi: campaign.budget.spent > 0 ? ((campaign.metrics.revenue - campaign.budget.spent) / campaign.budget.spent) * 100 : 0,
        },
        timeline: this.generateCampaignTimeline(campaign),
      };

      return {
        success: true,
        data: analytics
      };

    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      return {
        success: false,
        error: 'فشل في جلب تحليلات الحملة'
      };
    }
  }

  /**
   * Process scheduled messages
   */
  async processScheduledMessages() {
    try {
      const now = new Date();
      const dueMessages = Array.from(this.scheduledMessages.values())
        .filter(message => 
          message.status === 'scheduled' && 
          message.scheduledFor <= now
        );

      for (const message of dueMessages) {
        await this.sendScheduledMessage(message);
      }

      return {
        success: true,
        processed: dueMessages.length
      };

    } catch (error) {
      console.error('Error processing scheduled messages:', error);
      return {
        success: false,
        error: 'فشل في معالجة الرسائل المجدولة'
      };
    }
  }

  /**
   * Helper methods
   */
  async calculateEstimatedReach(targeting) {
    // Mock calculation based on segments and filters
    let reach = 0;
    
    if (targeting.segments) {
      for (const segmentId of targeting.segments) {
        const segment = this.audienceSegments.get(segmentId);
        if (segment) {
          reach += segment.size;
        }
      }
    }

    // Apply filter adjustments (mock)
    if (targeting.filters) {
      reach = Math.floor(reach * 0.8); // Assume 20% reduction due to filters
    }

    return reach;
  }

  async getTargetAudience(targeting) {
    // Mock audience generation
    const audienceSize = targeting.estimatedReach || 100;
    const audience = [];
    
    for (let i = 1; i <= audienceSize; i++) {
      audience.push({
        customerId: `customer_${i}`,
        name: `عميل ${i}`,
        email: `customer${i}@example.com`,
        phone: `+96650123456${i % 10}`,
      });
    }

    return audience;
  }

  async scheduleMessagesForAudience(campaign, audience) {
    const scheduledMessages = [];
    
    for (const customer of audience) {
      const message = {
        id: this.generateMessageId(),
        type: 'campaign',
        campaignId: campaign.id,
        customerId: customer.customerId,
        content: await this.personalizeContent(campaign.content, customer),
        channel: campaign.channels.primary,
        scheduledFor: this.calculateOptimalSendTime(campaign.schedule),
        status: 'scheduled',
        priority: 'normal',
        companyId: campaign.companyId,
        createdBy: campaign.createdBy,
        createdAt: new Date(),
      };

      this.scheduledMessages.set(message.id, message);
      scheduledMessages.push(message);
    }

    return scheduledMessages;
  }

  async personalizeContent(content, customer) {
    let personalizedContent = content.message;
    
    // Replace customer variables
    personalizedContent = personalizedContent.replace('{{customer_name}}', customer.name);
    
    return personalizedContent;
  }

  calculateOptimalSendTime(schedule) {
    const now = new Date();
    const sendTime = new Date(schedule.startDate);
    
    // If start date is in the past, schedule for next available time slot
    if (sendTime <= now) {
      const nextSlot = schedule.timeSlots[0];
      const [hours, minutes] = nextSlot.split(':');
      sendTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (sendTime <= now) {
        sendTime.setDate(sendTime.getDate() + 1);
      }
    }

    return sendTime;
  }

  async sendScheduledMessage(message) {
    try {
      // Mock message sending
      console.log(`Sending scheduled message ${message.id} to customer ${message.customerId}`);
      
      // Update message status
      message.status = 'sent';
      message.sentAt = new Date();
      this.scheduledMessages.set(message.id, message);

      // Update campaign metrics if it's a campaign message
      if (message.campaignId) {
        const campaign = this.campaigns.get(message.campaignId);
        if (campaign) {
          campaign.metrics.sent += 1;
          campaign.budget.spent += campaign.budget.perMessage;
          this.campaigns.set(message.campaignId, campaign);
        }
      }

      return {
        success: true,
        messageId: message.id
      };

    } catch (error) {
      console.error('Error sending scheduled message:', error);
      
      // Update message status to failed
      message.status = 'failed';
      message.error = error.message;
      this.scheduledMessages.set(message.id, message);
      
      throw error;
    }
  }

  generateCampaignTimeline(campaign) {
    // Mock timeline data
    return [
      { date: campaign.createdAt, event: 'تم إنشاء الحملة', type: 'created' },
      { date: campaign.launchedAt || new Date(), event: 'تم إطلاق الحملة', type: 'launched' },
    ];
  }

  startMessageProcessor() {
    // Process scheduled messages every 2 minutes
    setInterval(() => {
      this.processScheduledMessages();
    }, 2 * 60 * 1000);
  }

  generateMessageId() {
    return `MSG${Date.now().toString(36).toUpperCase()}`;
  }

  generateCampaignId() {
    return `CAMP${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new MessageSchedulingService();
