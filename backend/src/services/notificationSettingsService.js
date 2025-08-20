/**
 * Notification Settings Service
 * 
 * Handles user-specific notification preferences,
 * channel configurations, and delivery settings
 */

class NotificationSettingsService {
  constructor() {
    this.userSettings = new Map(); // User notification settings
    this.companySettings = new Map(); // Company-wide settings
    this.channelConfigs = new Map(); // Channel configurations
    this.notificationTypes = new Map(); // Available notification types
    this.deliveryRules = new Map(); // Delivery rules and schedules
    this.initializeMockData();
  }

  /**
   * Initialize mock data and default settings
   */
  initializeMockData() {
    // Mock notification types
    const mockNotificationTypes = [
      {
        id: 'NEW_MESSAGE',
        name: 'رسالة جديدة',
        description: 'إشعار عند وصول رسالة جديدة من العميل',
        category: 'messages',
        priority: 'high',
        defaultEnabled: true,
        channels: ['push', 'email', 'sms'],
        canDisable: false,
      },
      {
        id: 'CUSTOMER_INQUIRY',
        name: 'استفسار عميل',
        description: 'إشعار عند استفسار عميل جديد',
        category: 'customer',
        priority: 'medium',
        defaultEnabled: true,
        channels: ['push', 'email'],
        canDisable: true,
      },
      {
        id: 'ORDER_PLACED',
        name: 'طلب جديد',
        description: 'إشعار عند وضع طلب جديد',
        category: 'orders',
        priority: 'high',
        defaultEnabled: true,
        channels: ['push', 'email', 'sms'],
        canDisable: false,
      },
      {
        id: 'PAYMENT_RECEIVED',
        name: 'دفعة مستلمة',
        description: 'إشعار عند استلام دفعة',
        category: 'payments',
        priority: 'medium',
        defaultEnabled: true,
        channels: ['push', 'email'],
        canDisable: true,
      },
      {
        id: 'REMINDER_DUE',
        name: 'تذكير مستحق',
        description: 'إشعار عند استحقاق تذكير',
        category: 'reminders',
        priority: 'medium',
        defaultEnabled: true,
        channels: ['push'],
        canDisable: true,
      },
      {
        id: 'SYSTEM_ALERT',
        name: 'تنبيه النظام',
        description: 'تنبيهات النظام والأخطاء',
        category: 'system',
        priority: 'high',
        defaultEnabled: true,
        channels: ['push', 'email'],
        canDisable: false,
      },
      {
        id: 'MARKETING_UPDATE',
        name: 'تحديثات تسويقية',
        description: 'إشعارات التحديثات والعروض التسويقية',
        category: 'marketing',
        priority: 'low',
        defaultEnabled: false,
        channels: ['email'],
        canDisable: true,
      },
    ];

    mockNotificationTypes.forEach(type => {
      this.notificationTypes.set(type.id, type);
    });

    // Mock user settings
    const mockUserSettings = [
      {
        userId: '1',
        companyId: '1',
        globalEnabled: true,
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Asia/Riyadh',
        },
        channels: {
          push: {
            enabled: true,
            deviceTokens: ['token123', 'token456'],
            sound: true,
            vibration: true,
            badge: true,
          },
          email: {
            enabled: true,
            address: 'user@example.com',
            frequency: 'immediate', // immediate, hourly, daily
            format: 'html', // html, text
          },
          sms: {
            enabled: false,
            phoneNumber: '+966501234567',
            frequency: 'immediate',
          },
          inApp: {
            enabled: true,
            showBadge: true,
            autoMarkRead: false,
          },
        },
        typeSettings: {
          NEW_MESSAGE: {
            enabled: true,
            channels: ['push', 'email'],
            priority: 'high',
            customSound: null,
          },
          CUSTOMER_INQUIRY: {
            enabled: true,
            channels: ['push'],
            priority: 'medium',
            customSound: null,
          },
          ORDER_PLACED: {
            enabled: true,
            channels: ['push', 'email', 'sms'],
            priority: 'high',
            customSound: 'order_sound.mp3',
          },
          PAYMENT_RECEIVED: {
            enabled: true,
            channels: ['push', 'email'],
            priority: 'medium',
            customSound: null,
          },
          REMINDER_DUE: {
            enabled: true,
            channels: ['push'],
            priority: 'medium',
            customSound: null,
          },
          SYSTEM_ALERT: {
            enabled: true,
            channels: ['push', 'email'],
            priority: 'high',
            customSound: 'alert_sound.mp3',
          },
          MARKETING_UPDATE: {
            enabled: false,
            channels: [],
            priority: 'low',
            customSound: null,
          },
        },
        deliveryRules: {
          batchNotifications: false,
          maxPerHour: 10,
          respectQuietHours: true,
          emergencyOverride: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUserSettings.forEach(settings => {
      this.userSettings.set(settings.userId, settings);
    });

    // Mock company settings
    const mockCompanySettings = [
      {
        companyId: '1',
        defaultSettings: {
          globalEnabled: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'Asia/Riyadh',
          },
          channels: {
            push: { enabled: true },
            email: { enabled: true, frequency: 'immediate' },
            sms: { enabled: false },
            inApp: { enabled: true },
          },
        },
        restrictions: {
          canDisableCritical: false,
          maxQuietHours: 12,
          allowedChannels: ['push', 'email', 'sms', 'inApp'],
          requireEmailVerification: true,
          requirePhoneVerification: true,
        },
        branding: {
          emailTemplate: 'company_template',
          logoUrl: 'https://example.com/logo.png',
          brandColor: '#007bff',
          fromName: 'شركة التجارة الذكية',
          fromEmail: 'notifications@smartcommerce.com',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCompanySettings.forEach(settings => {
      this.companySettings.set(settings.companyId, settings);
    });

    // Mock delivery rules
    const mockDeliveryRules = [
      {
        id: 'RULE001',
        name: 'قاعدة الرسائل العاجلة',
        description: 'تسليم فوري للرسائل عالية الأولوية',
        conditions: {
          priority: ['high'],
          types: ['NEW_MESSAGE', 'ORDER_PLACED', 'SYSTEM_ALERT'],
        },
        actions: {
          delivery: 'immediate',
          channels: ['push', 'email'],
          overrideQuietHours: true,
        },
        enabled: true,
        companyId: '1',
      },
      {
        id: 'RULE002',
        name: 'قاعدة التجميع',
        description: 'تجميع الإشعارات منخفضة الأولوية',
        conditions: {
          priority: ['low', 'medium'],
          types: ['MARKETING_UPDATE', 'REMINDER_DUE'],
        },
        actions: {
          delivery: 'batch',
          batchInterval: 60, // minutes
          channels: ['email'],
          overrideQuietHours: false,
        },
        enabled: true,
        companyId: '1',
      },
    ];

    mockDeliveryRules.forEach(rule => {
      this.deliveryRules.set(rule.id, rule);
    });
  }

  /**
   * Get user notification settings
   */
  async getUserSettings(userId) {
    try {
      let settings = this.userSettings.get(userId);
      
      if (!settings) {
        // Create default settings for new user
        settings = await this.createDefaultUserSettings(userId);
      }

      return {
        success: true,
        data: settings
      };

    } catch (error) {
      console.error('Error getting user settings:', error);
      return {
        success: false,
        error: 'فشل في جلب إعدادات المستخدم'
      };
    }
  }

  /**
   * Update user notification settings
   */
  async updateUserSettings(userId, updates) {
    try {
      let settings = this.userSettings.get(userId);
      
      if (!settings) {
        settings = await this.createDefaultUserSettings(userId);
      }

      // Merge updates with existing settings
      settings = {
        ...settings,
        ...updates,
        updatedAt: new Date(),
      };

      // Validate settings
      const validation = await this.validateSettings(settings);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      this.userSettings.set(userId, settings);

      return {
        success: true,
        data: settings,
        message: 'تم تحديث إعدادات الإشعارات بنجاح'
      };

    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: 'فشل في تحديث إعدادات الإشعارات'
      };
    }
  }

  /**
   * Get notification types and their configurations
   */
  async getNotificationTypes(companyId) {
    try {
      const types = Array.from(this.notificationTypes.values());
      const companySettings = this.companySettings.get(companyId);

      // Apply company restrictions
      const filteredTypes = types.map(type => ({
        ...type,
        canDisable: companySettings?.restrictions?.canDisableCritical === false 
          ? (type.priority !== 'high' && type.canDisable)
          : type.canDisable,
        availableChannels: type.channels.filter(channel => 
          companySettings?.restrictions?.allowedChannels?.includes(channel) ?? true
        ),
      }));

      return {
        success: true,
        data: filteredTypes
      };

    } catch (error) {
      console.error('Error getting notification types:', error);
      return {
        success: false,
        error: 'فشل في جلب أنواع الإشعارات'
      };
    }
  }

  /**
   * Test notification delivery
   */
  async testNotification(userId, testConfig) {
    try {
      const { type, channel, message } = testConfig;
      
      const userSettings = await this.getUserSettings(userId);
      if (!userSettings.success) {
        return userSettings;
      }

      const settings = userSettings.data;
      
      // Check if notification type is enabled
      const typeSettings = settings.typeSettings[type];
      if (!typeSettings?.enabled) {
        return {
          success: false,
          error: 'نوع الإشعار غير مفعل'
        };
      }

      // Check if channel is enabled
      if (!typeSettings.channels.includes(channel)) {
        return {
          success: false,
          error: 'قناة الإشعار غير مفعلة لهذا النوع'
        };
      }

      // Simulate sending test notification
      const testNotification = {
        id: `TEST_${Date.now()}`,
        type,
        channel,
        message: message || 'هذا إشعار تجريبي',
        userId,
        timestamp: new Date(),
        isTest: true,
      };

      return {
        success: true,
        data: testNotification,
        message: 'تم إرسال الإشعار التجريبي بنجاح'
      };

    } catch (error) {
      console.error('Error testing notification:', error);
      return {
        success: false,
        error: 'فشل في إرسال الإشعار التجريبي'
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId, period = 'week') {
    try {
      // Mock statistics
      const stats = {
        delivered: {
          total: 156,
          byChannel: {
            push: 89,
            email: 45,
            sms: 12,
            inApp: 10,
          },
          byType: {
            NEW_MESSAGE: 67,
            ORDER_PLACED: 23,
            CUSTOMER_INQUIRY: 34,
            PAYMENT_RECEIVED: 18,
            REMINDER_DUE: 14,
          },
        },
        engagement: {
          openRate: 0.78,
          clickRate: 0.45,
          dismissRate: 0.23,
          responseTime: 145, // seconds
        },
        preferences: {
          mostUsedChannel: 'push',
          preferredTime: '14:00-16:00',
          quietHoursUsage: 0.65,
        },
        trends: [
          { period: 'يوم 1', delivered: 22, opened: 18, clicked: 8 },
          { period: 'يوم 2', delivered: 25, opened: 20, clicked: 12 },
          { period: 'يوم 3', delivered: 19, opened: 15, clicked: 7 },
          { period: 'يوم 4', delivered: 28, opened: 22, clicked: 15 },
          { period: 'يوم 5', delivered: 31, opened: 24, clicked: 18 },
          { period: 'يوم 6', delivered: 18, opened: 14, clicked: 6 },
          { period: 'يوم 7', delivered: 13, opened: 10, clicked: 4 },
        ],
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
   * Create default settings for a new user
   */
  async createDefaultUserSettings(userId) {
    // Get user's company to apply company defaults
    const companyId = '1'; // This would come from user data
    const companySettings = this.companySettings.get(companyId);

    const defaultSettings = {
      userId,
      companyId,
      globalEnabled: companySettings?.defaultSettings?.globalEnabled ?? true,
      quietHours: companySettings?.defaultSettings?.quietHours ?? {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'Asia/Riyadh',
      },
      channels: companySettings?.defaultSettings?.channels ?? {
        push: { enabled: true },
        email: { enabled: true, frequency: 'immediate' },
        sms: { enabled: false },
        inApp: { enabled: true },
      },
      typeSettings: {},
      deliveryRules: {
        batchNotifications: false,
        maxPerHour: 10,
        respectQuietHours: true,
        emergencyOverride: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set default type settings
    Array.from(this.notificationTypes.values()).forEach(type => {
      defaultSettings.typeSettings[type.id] = {
        enabled: type.defaultEnabled,
        channels: type.channels.filter(channel => 
          defaultSettings.channels[channel]?.enabled
        ),
        priority: type.priority,
        customSound: null,
      };
    });

    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }

  /**
   * Validate notification settings
   */
  async validateSettings(settings) {
    try {
      // Check required fields
      if (!settings.userId || !settings.companyId) {
        return {
          valid: false,
          error: 'معرف المستخدم والشركة مطلوبان'
        };
      }

      // Validate quiet hours
      if (settings.quietHours?.enabled) {
        const start = settings.quietHours.startTime;
        const end = settings.quietHours.endTime;
        
        if (!start || !end) {
          return {
            valid: false,
            error: 'أوقات الهدوء غير صالحة'
          };
        }
      }

      // Validate channels
      const requiredChannels = ['push', 'email', 'sms', 'inApp'];
      for (const channel of requiredChannels) {
        if (!settings.channels[channel]) {
          return {
            valid: false,
            error: `إعدادات قناة ${channel} مفقودة`
          };
        }
      }

      // Validate email if enabled
      if (settings.channels.email?.enabled && !settings.channels.email?.address) {
        return {
          valid: false,
          error: 'عنوان البريد الإلكتروني مطلوب عند تفعيل إشعارات البريد'
        };
      }

      // Validate phone if SMS enabled
      if (settings.channels.sms?.enabled && !settings.channels.sms?.phoneNumber) {
        return {
          valid: false,
          error: 'رقم الهاتف مطلوب عند تفعيل إشعارات الرسائل النصية'
        };
      }

      return { valid: true };

    } catch (error) {
      return {
        valid: false,
        error: 'خطأ في التحقق من صحة الإعدادات'
      };
    }
  }

  /**
   * Check if notification should be delivered based on settings
   */
  async shouldDeliverNotification(userId, notificationType, channel, priority = 'medium') {
    try {
      const userSettings = await this.getUserSettings(userId);
      if (!userSettings.success) {
        return false;
      }

      const settings = userSettings.data;

      // Check global enabled
      if (!settings.globalEnabled) {
        return false;
      }

      // Check type settings
      const typeSettings = settings.typeSettings[notificationType];
      if (!typeSettings?.enabled) {
        return false;
      }

      // Check channel enabled for this type
      if (!typeSettings.channels.includes(channel)) {
        return false;
      }

      // Check channel enabled globally
      if (!settings.channels[channel]?.enabled) {
        return false;
      }

      // Check quiet hours (unless emergency override)
      if (settings.quietHours?.enabled && settings.deliveryRules?.respectQuietHours) {
        if (priority !== 'high' || !settings.deliveryRules?.emergencyOverride) {
          if (this.isInQuietHours(settings.quietHours)) {
            return false;
          }
        }
      }

      return true;

    } catch (error) {
      console.error('Error checking delivery rules:', error);
      return false;
    }
  }

  /**
   * Check if current time is in quiet hours
   */
  isInQuietHours(quietHours) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const start = quietHours.startTime;
    const end = quietHours.endTime;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (start > end) {
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }
}

module.exports = new NotificationSettingsService();
