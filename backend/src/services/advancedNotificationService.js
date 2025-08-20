/**
 * Advanced Notification Service
 * 
 * Handles comprehensive notification system with multiple channels,
 * templates, scheduling, and delivery tracking
 */

class AdvancedNotificationService {
  constructor() {
    this.notifications = new Map(); // All notifications
    this.templates = new Map(); // Notification templates
    this.channels = new Map(); // Notification channels
    this.subscriptions = new Map(); // User subscriptions
    this.deliveryHistory = new Map(); // Delivery tracking
    this.notificationQueue = new Map(); // Pending notifications
    this.initializeMockData();
    this.startNotificationProcessor();
  }

  /**
   * Initialize mock data for notifications
   */
  initializeMockData() {
    // Mock notification templates
    const mockTemplates = [
      {
        id: 'NEW_MESSAGE',
        name: 'رسالة جديدة',
        description: 'إشعار عند وصول رسالة جديدة',
        category: 'messages',
        channels: ['push', 'email', 'sms'],
        priority: 'high',
        template: {
          title: 'رسالة جديدة من {{customer_name}}',
          body: '{{message_preview}}',
          action: {
            text: 'عرض الرسالة',
            url: '/conversations/{{conversation_id}}',
          },
        },
        variables: ['customer_name', 'message_preview', 'conversation_id'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'ORDER_RECEIVED',
        name: 'طلب جديد',
        description: 'إشعار عند استلام طلب جديد',
        category: 'orders',
        channels: ['push', 'email'],
        priority: 'high',
        template: {
          title: 'طلب جديد #{{order_number}}',
          body: 'طلب بقيمة {{order_total}} ريال من {{customer_name}}',
          action: {
            text: 'عرض الطلب',
            url: '/orders/{{order_id}}',
          },
        },
        variables: ['order_number', 'order_total', 'customer_name', 'order_id'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'CUSTOMER_COMPLAINT',
        name: 'شكوى عميل',
        description: 'إشعار عند تلقي شكوى من عميل',
        category: 'complaints',
        channels: ['push', 'email', 'sms'],
        priority: 'urgent',
        template: {
          title: 'شكوى عميل جديدة',
          body: 'شكوى من {{customer_name}}: {{complaint_summary}}',
          action: {
            text: 'معالجة الشكوى',
            url: '/complaints/{{complaint_id}}',
          },
        },
        variables: ['customer_name', 'complaint_summary', 'complaint_id'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
      {
        id: 'SYSTEM_ALERT',
        name: 'تنبيه النظام',
        description: 'تنبيهات النظام والأخطاء',
        category: 'system',
        channels: ['push', 'email'],
        priority: 'urgent',
        template: {
          title: 'تنبيه نظام: {{alert_type}}',
          body: '{{alert_message}}',
          action: {
            text: 'عرض التفاصيل',
            url: '/system/alerts/{{alert_id}}',
          },
        },
        variables: ['alert_type', 'alert_message', 'alert_id'],
        isActive: true,
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Mock notification channels
    const mockChannels = [
      {
        id: 'push',
        name: 'إشعارات فورية',
        type: 'push',
        isActive: true,
        config: {
          endpoint: 'https://fcm.googleapis.com/fcm/send',
          apiKey: 'mock_api_key',
        },
        deliveryRate: 0.95,
        averageDeliveryTime: 2, // seconds
      },
      {
        id: 'email',
        name: 'البريد الإلكتروني',
        type: 'email',
        isActive: true,
        config: {
          smtp: {
            host: 'smtp.company.com',
            port: 587,
            secure: false,
            auth: {
              user: 'notifications@company.com',
              pass: 'mock_password',
            },
          },
          from: 'منصة التواصل <notifications@company.com>',
        },
        deliveryRate: 0.98,
        averageDeliveryTime: 30, // seconds
      },
      {
        id: 'sms',
        name: 'الرسائل النصية',
        type: 'sms',
        isActive: true,
        config: {
          provider: 'twilio',
          accountSid: 'mock_account_sid',
          authToken: 'mock_auth_token',
          from: '+966501234567',
        },
        deliveryRate: 0.92,
        averageDeliveryTime: 10, // seconds
      },
      {
        id: 'webhook',
        name: 'Webhook',
        type: 'webhook',
        isActive: true,
        config: {
          url: 'https://api.company.com/webhooks/notifications',
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock_token',
            'Content-Type': 'application/json',
          },
        },
        deliveryRate: 0.99,
        averageDeliveryTime: 5, // seconds
      },
    ];

    mockChannels.forEach(channel => {
      this.channels.set(channel.id, channel);
    });

    // Mock user subscriptions
    const mockSubscriptions = [
      {
        userId: 'user1',
        companyId: '1',
        preferences: {
          NEW_MESSAGE: {
            enabled: true,
            channels: ['push', 'email'],
            quietHours: {
              enabled: true,
              start: '22:00',
              end: '08:00',
              timezone: 'Asia/Riyadh',
            },
          },
          ORDER_RECEIVED: {
            enabled: true,
            channels: ['push', 'email'],
            quietHours: { enabled: false },
          },
          CUSTOMER_COMPLAINT: {
            enabled: true,
            channels: ['push', 'email', 'sms'],
            quietHours: { enabled: false },
          },
          SYSTEM_ALERT: {
            enabled: true,
            channels: ['push', 'email'],
            quietHours: { enabled: false },
          },
        },
        devices: [
          {
            id: 'device1',
            type: 'web',
            token: 'mock_push_token_1',
            isActive: true,
          },
          {
            id: 'device2',
            type: 'mobile',
            token: 'mock_push_token_2',
            isActive: true,
          },
        ],
        contactInfo: {
          email: 'user1@company.com',
          phone: '+966501234567',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockSubscriptions.forEach(subscription => {
      this.subscriptions.set(subscription.userId, subscription);
    });

    // Mock recent notifications
    const mockNotifications = [
      {
        id: 'NOTIF001',
        templateId: 'NEW_MESSAGE',
        userId: 'user1',
        title: 'رسالة جديدة من أحمد محمد',
        body: 'مرحباً، أريد الاستفسار عن المنتج...',
        data: {
          customer_name: 'أحمد محمد',
          message_preview: 'مرحباً، أريد الاستفسار عن المنتج...',
          conversation_id: 'CONV001',
        },
        channels: ['push', 'email'],
        priority: 'high',
        status: 'delivered',
        scheduledFor: new Date(),
        sentAt: new Date(),
        deliveryStatus: {
          push: { status: 'delivered', deliveredAt: new Date() },
          email: { status: 'delivered', deliveredAt: new Date() },
        },
        companyId: '1',
        createdAt: new Date(),
      },
    ];

    mockNotifications.forEach(notification => {
      this.notifications.set(notification.id, notification);
    });
  }

  /**
   * Send notification
   */
  async sendNotification(notificationData) {
    try {
      const {
        templateId,
        userId,
        data = {},
        channels,
        priority = 'normal',
        scheduledFor,
        companyId,
      } = notificationData;

      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          error: 'قالب الإشعار غير موجود'
        };
      }

      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return {
          success: false,
          error: 'المستخدم غير مشترك في الإشعارات'
        };
      }

      // Check if user has enabled this notification type
      const userPrefs = subscription.preferences[templateId];
      if (!userPrefs || !userPrefs.enabled) {
        return {
          success: false,
          error: 'المستخدم لم يفعل هذا النوع من الإشعارات'
        };
      }

      // Determine channels to use
      const targetChannels = channels || userPrefs.channels || template.channels;

      // Create notification
      const notification = {
        id: this.generateNotificationId(),
        templateId,
        userId,
        title: this.processTemplate(template.template.title, data),
        body: this.processTemplate(template.template.body, data),
        data,
        channels: targetChannels,
        priority: priority || template.priority,
        status: scheduledFor ? 'scheduled' : 'pending',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
        sentAt: null,
        deliveryStatus: {},
        companyId,
        createdAt: new Date(),
      };

      this.notifications.set(notification.id, notification);

      // Queue for immediate sending or schedule for later
      if (!scheduledFor || new Date(scheduledFor) <= new Date()) {
        await this.processNotification(notification);
      } else {
        this.notificationQueue.set(notification.id, notification);
      }

      return {
        success: true,
        data: notification,
        message: 'تم إرسال الإشعار بنجاح'
      };

    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: 'فشل في إرسال الإشعار'
      };
    }
  }

  /**
   * Process notification for delivery
   */
  async processNotification(notification) {
    try {
      const subscription = this.subscriptions.get(notification.userId);
      if (!subscription) {
        throw new Error('بيانات الاشتراك غير موجودة');
      }

      // Check quiet hours
      if (this.isInQuietHours(notification, subscription)) {
        // Reschedule for after quiet hours
        const nextAvailableTime = this.getNextAvailableTime(subscription);
        notification.scheduledFor = nextAvailableTime;
        notification.status = 'scheduled';
        this.notificationQueue.set(notification.id, notification);
        return;
      }

      notification.status = 'sending';
      notification.sentAt = new Date();

      // Send through each channel
      for (const channelId of notification.channels) {
        const channel = this.channels.get(channelId);
        if (channel && channel.isActive) {
          const deliveryResult = await this.sendThroughChannel(
            notification,
            channel,
            subscription
          );
          notification.deliveryStatus[channelId] = deliveryResult;
        }
      }

      notification.status = 'delivered';
      this.notifications.set(notification.id, notification);

      // Store delivery history
      this.storeDeliveryHistory(notification);

    } catch (error) {
      console.error('Error processing notification:', error);
      notification.status = 'failed';
      notification.error = error.message;
      this.notifications.set(notification.id, notification);
    }
  }

  /**
   * Send notification through specific channel
   */
  async sendThroughChannel(notification, channel, subscription) {
    try {
      switch (channel.type) {
        case 'push':
          return await this.sendPushNotification(notification, channel, subscription);
        case 'email':
          return await this.sendEmailNotification(notification, channel, subscription);
        case 'sms':
          return await this.sendSMSNotification(notification, channel, subscription);
        case 'webhook':
          return await this.sendWebhookNotification(notification, channel, subscription);
        default:
          throw new Error(`نوع قناة غير مدعوم: ${channel.type}`);
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        attemptedAt: new Date(),
      };
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(notification, channel, subscription) {
    // Mock push notification sending
    console.log(`Sending push notification to user ${notification.userId}`);
    
    return {
      status: 'delivered',
      deliveredAt: new Date(),
      messageId: `push_${Date.now()}`,
    };
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification, channel, subscription) {
    // Mock email sending
    console.log(`Sending email notification to ${subscription.contactInfo.email}`);
    
    return {
      status: 'delivered',
      deliveredAt: new Date(),
      messageId: `email_${Date.now()}`,
    };
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(notification, channel, subscription) {
    // Mock SMS sending
    console.log(`Sending SMS notification to ${subscription.contactInfo.phone}`);
    
    return {
      status: 'delivered',
      deliveredAt: new Date(),
      messageId: `sms_${Date.now()}`,
    };
  }

  /**
   * Send webhook notification
   */
  async sendWebhookNotification(notification, channel, subscription) {
    // Mock webhook sending
    console.log(`Sending webhook notification to ${channel.config.url}`);
    
    return {
      status: 'delivered',
      deliveredAt: new Date(),
      messageId: `webhook_${Date.now()}`,
    };
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(filters = {}) {
    try {
      const { userId, companyId, status, limit = 50, offset = 0 } = filters;

      let notifications = Array.from(this.notifications.values());

      // Apply filters
      if (userId) {
        notifications = notifications.filter(n => n.userId === userId);
      }
      if (companyId) {
        notifications = notifications.filter(n => n.companyId === companyId);
      }
      if (status) {
        notifications = notifications.filter(n => n.status === status);
      }

      // Sort by creation date (newest first)
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const total = notifications.length;
      notifications = notifications.slice(offset, offset + limit);

      return {
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        }
      };

    } catch (error) {
      console.error('Error getting user notifications:', error);
      return {
        success: false,
        error: 'فشل في جلب الإشعارات'
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(userId, preferences) {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return {
          success: false,
          error: 'بيانات الاشتراك غير موجودة'
        };
      }

      subscription.preferences = { ...subscription.preferences, ...preferences };
      subscription.updatedAt = new Date();
      this.subscriptions.set(userId, subscription);

      return {
        success: true,
        data: subscription.preferences,
        message: 'تم تحديث تفضيلات الإشعارات'
      };

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return {
        success: false,
        error: 'فشل في تحديث تفضيلات الإشعارات'
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(filters = {}) {
    try {
      const { companyId, period = 'week' } = filters;

      let notifications = Array.from(this.notifications.values());
      
      if (companyId) {
        notifications = notifications.filter(n => n.companyId === companyId);
      }

      const stats = {
        total: notifications.length,
        byStatus: this.countByField(notifications, 'status'),
        byTemplate: this.countByField(notifications, 'templateId'),
        byChannel: this.calculateChannelStats(notifications),
        deliveryRates: this.calculateDeliveryRates(notifications),
        averageDeliveryTime: this.calculateAverageDeliveryTime(notifications),
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الإشعارات'
      };
    }
  }

  /**
   * Helper methods
   */
  processTemplate(template, data) {
    let processed = template;
    Object.keys(data).forEach(key => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
    });
    return processed;
  }

  isInQuietHours(notification, subscription) {
    const template = this.templates.get(notification.templateId);
    const userPrefs = subscription.preferences[notification.templateId];
    
    if (!userPrefs.quietHours || !userPrefs.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const quietStart = userPrefs.quietHours.start;
    const quietEnd = userPrefs.quietHours.end;

    // Handle quiet hours that span midnight
    if (quietStart > quietEnd) {
      return currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart && currentTime <= quietEnd;
    }
  }

  getNextAvailableTime(subscription) {
    // Mock implementation - return next morning
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }

  storeDeliveryHistory(notification) {
    const historyEntry = {
      id: this.generateHistoryId(),
      notificationId: notification.id,
      userId: notification.userId,
      templateId: notification.templateId,
      channels: notification.channels,
      deliveryStatus: notification.deliveryStatus,
      sentAt: notification.sentAt,
      companyId: notification.companyId,
    };

    this.deliveryHistory.set(historyEntry.id, historyEntry);
  }

  countByField(items, field) {
    const counts = {};
    items.forEach(item => {
      counts[item[field]] = (counts[item[field]] || 0) + 1;
    });
    return counts;
  }

  calculateChannelStats(notifications) {
    const channelStats = {};
    
    notifications.forEach(notification => {
      notification.channels.forEach(channel => {
        if (!channelStats[channel]) {
          channelStats[channel] = { sent: 0, delivered: 0 };
        }
        channelStats[channel].sent += 1;
        
        if (notification.deliveryStatus[channel]?.status === 'delivered') {
          channelStats[channel].delivered += 1;
        }
      });
    });

    return channelStats;
  }

  calculateDeliveryRates(notifications) {
    const rates = {};
    const channelStats = this.calculateChannelStats(notifications);
    
    Object.keys(channelStats).forEach(channel => {
      const stats = channelStats[channel];
      rates[channel] = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
    });

    return rates;
  }

  calculateAverageDeliveryTime(notifications) {
    // Mock calculation
    return {
      push: 2,
      email: 30,
      sms: 10,
      webhook: 5,
    };
  }

  startNotificationProcessor() {
    // Process scheduled notifications every minute
    setInterval(() => {
      this.processScheduledNotifications();
    }, 60 * 1000);
  }

  processScheduledNotifications() {
    const now = new Date();
    
    this.notificationQueue.forEach((notification, id) => {
      if (notification.scheduledFor <= now) {
        this.processNotification(notification);
        this.notificationQueue.delete(id);
      }
    });
  }

  generateNotificationId() {
    return `NOTIF${Date.now().toString(36).toUpperCase()}`;
  }

  generateHistoryId() {
    return `HIST${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new AdvancedNotificationService();
