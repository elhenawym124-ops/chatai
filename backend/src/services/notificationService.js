/**
 * خدمة الإشعارات المتقدمة
 * Advanced Notification Service with push notifications, Slack/Teams integration
 */

const webpush = require('web-push');
const axios = require('axios');

class NotificationService {
  constructor() {
    this.subscribers = new Map(); // WebSocket connections
    this.notificationQueue = [];
    this.subscriptions = new Map();
    this.notificationHistory = [];
    this.notificationTemplates = new Map();
    this.integrations = new Map();
    this.userPreferences = new Map();
    this.templates = {
      NEW_MESSAGE: {
        title: 'رسالة جديدة',
        body: 'لديك رسالة جديدة من {customerName}',
        icon: '/icons/message.png',
        badge: '/icons/badge.png',
      },
      NEW_ORDER: {
        title: 'طلب جديد',
        body: 'طلب جديد بقيمة {amount} {currency}',
        icon: '/icons/order.png',
        badge: '/icons/badge.png',
      },
      LOW_STOCK: {
        title: 'تنبيه مخزون',
        body: 'المنتج {productName} أوشك على النفاد',
        icon: '/icons/warning.png',
        badge: '/icons/badge.png',
      },
      CUSTOMER_REPLY: {
        title: 'رد العميل',
        body: '{customerName} رد على رسالتك',
        icon: '/icons/reply.png',
        badge: '/icons/badge.png',
      },
      SYSTEM_ALERT: {
        title: 'تنبيه النظام',
        body: '{message}',
        icon: '/icons/system.png',
        badge: '/icons/badge.png',
      }
    };
  }

  /**
   * Subscribe user to notifications
   */
  subscribe(userId, connection) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId).add(connection);
    
    console.log(`User ${userId} subscribed to notifications`);
    
    // Send pending notifications
    this.sendPendingNotifications(userId);
  }

  /**
   * Unsubscribe user from notifications
   */
  unsubscribe(userId, connection) {
    if (this.subscribers.has(userId)) {
      this.subscribers.get(userId).delete(connection);
      
      // Remove user if no connections left
      if (this.subscribers.get(userId).size === 0) {
        this.subscribers.delete(userId);
      }
    }
    
    console.log(`User ${userId} unsubscribed from notifications`);
  }

  /**
   * Send real-time notification
   */
  async sendRealTimeNotification(userId, notification) {
    try {
      const connections = this.subscribers.get(userId);
      
      if (connections && connections.size > 0) {
        const payload = {
          type: 'notification',
          data: {
            id: this.generateId(),
            ...notification,
            timestamp: new Date().toISOString(),
            read: false,
          }
        };

        // Send to all user connections
        connections.forEach(connection => {
          if (connection.readyState === 1) { // WebSocket.OPEN
            connection.send(JSON.stringify(payload));
          }
        });

        return { success: true, sent: connections.size };
      } else {
        // Store for later delivery
        this.storeNotification(userId, notification);
        return { success: true, stored: true };
      }
    } catch (error) {
      console.error('Real-time notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId, type, data = {}) {
    try {
      const template = this.templates[type];
      if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
      }

      // Replace template variables
      const notification = {
        title: this.replaceVariables(template.title, data),
        body: this.replaceVariables(template.body, data),
        icon: template.icon,
        badge: template.badge,
        tag: type,
        data: {
          type,
          ...data,
          url: this.getNotificationUrl(type, data),
        },
        actions: this.getNotificationActions(type),
      };

      // Send real-time notification
      await this.sendRealTimeNotification(userId, notification);

      // In production, send actual push notification
      // await this.sendWebPushNotification(userId, notification);

      console.log(`Push notification sent to user ${userId}:`, notification.title);
      
      return { success: true, notification };
    } catch (error) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(email, subject, template, data = {}) {
    try {
      // Mock email sending - in production use actual email service
      const emailContent = {
        to: email,
        subject: this.replaceVariables(subject, data),
        html: this.generateEmailTemplate(template, data),
        timestamp: new Date().toISOString(),
      };

      console.log(`Email notification sent to ${email}:`, emailContent.subject);
      
      return { success: true, email: emailContent };
    } catch (error) {
      console.error('Email notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMSNotification(phone, message, data = {}) {
    try {
      // Mock SMS sending - in production use actual SMS service
      const smsContent = {
        to: phone,
        message: this.replaceVariables(message, data),
        timestamp: new Date().toISOString(),
      };

      console.log(`SMS notification sent to ${phone}:`, smsContent.message);
      
      return { success: true, sms: smsContent };
    } catch (error) {
      console.error('SMS notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple channels
   */
  async sendMultiChannelNotification(userId, channels, type, data = {}) {
    const results = {};

    try {
      // Real-time notification
      if (channels.includes('realtime')) {
        results.realtime = await this.sendPushNotification(userId, type, data);
      }

      // Email notification
      if (channels.includes('email') && data.email) {
        const subject = this.templates[type]?.title || 'إشعار جديد';
        results.email = await this.sendEmailNotification(data.email, subject, type, data);
      }

      // SMS notification
      if (channels.includes('sms') && data.phone) {
        const message = this.templates[type]?.body || 'لديك إشعار جديد';
        results.sms = await this.sendSMSNotification(data.phone, message, data);
      }

      return { success: true, results };
    } catch (error) {
      console.error('Multi-channel notification error:', error);
      return { success: false, error: error.message, results };
    }
  }

  /**
   * Store notification for offline users
   */
  storeNotification(userId, notification) {
    this.notificationQueue.push({
      userId,
      notification: {
        id: this.generateId(),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false,
      }
    });

    // Keep only last 100 notifications per user
    this.notificationQueue = this.notificationQueue.slice(-100);
  }

  /**
   * Send pending notifications when user comes online
   */
  sendPendingNotifications(userId) {
    const pending = this.notificationQueue.filter(item => item.userId === userId);
    
    pending.forEach(item => {
      this.sendRealTimeNotification(userId, item.notification);
    });

    // Remove sent notifications
    this.notificationQueue = this.notificationQueue.filter(item => item.userId !== userId);
  }

  /**
   * Get user notifications
   */
  getUserNotifications(userId, limit = 50) {
    const userNotifications = this.notificationQueue
      .filter(item => item.userId === userId)
      .slice(-limit)
      .map(item => item.notification)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      success: true,
      data: userNotifications,
      total: userNotifications.length
    };
  }

  /**
   * Mark notification as read
   */
  markAsRead(userId, notificationId) {
    const notification = this.notificationQueue.find(
      item => item.userId === userId && item.notification.id === notificationId
    );

    if (notification) {
      notification.notification.read = true;
      return { success: true };
    }

    return { success: false, error: 'Notification not found' };
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(userId) {
    let count = 0;
    this.notificationQueue.forEach(item => {
      if (item.userId === userId && !item.notification.read) {
        item.notification.read = true;
        count++;
      }
    });

    return { success: true, marked: count };
  }

  /**
   * Replace template variables
   */
  replaceVariables(template, data) {
    let result = template;
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, data[key]);
    });
    return result;
  }

  /**
   * Generate email template
   */
  generateEmailTemplate(type, data) {
    // Simple HTML template - in production use proper email templates
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${this.templates[type]?.title || 'إشعار جديد'}</h2>
        <p>${this.replaceVariables(this.templates[type]?.body || '', data)}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          هذا إشعار تلقائي من منصة إدارة التواصل
        </p>
      </div>
    `;
  }

  /**
   * Get notification URL based on type
   */
  getNotificationUrl(type, data) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'NEW_MESSAGE':
      case 'CUSTOMER_REPLY':
        return `${baseUrl}/conversations/${data.conversationId}`;
      case 'NEW_ORDER':
        return `${baseUrl}/orders/${data.orderId}`;
      case 'LOW_STOCK':
        return `${baseUrl}/products/${data.productId}`;
      default:
        return `${baseUrl}/dashboard`;
    }
  }

  /**
   * Get notification actions based on type
   */
  getNotificationActions(type) {
    switch (type) {
      case 'NEW_MESSAGE':
      case 'CUSTOMER_REPLY':
        return [
          { action: 'reply', title: 'رد', icon: '/icons/reply.png' },
          { action: 'view', title: 'عرض', icon: '/icons/view.png' }
        ];
      case 'NEW_ORDER':
        return [
          { action: 'view', title: 'عرض الطلب', icon: '/icons/view.png' },
          { action: 'process', title: 'معالجة', icon: '/icons/process.png' }
        ];
      default:
        return [
          { action: 'view', title: 'عرض', icon: '/icons/view.png' }
        ];
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const stats = {
      activeSubscribers: this.subscribers.size,
      totalConnections: Array.from(this.subscribers.values()).reduce((total, connections) => total + connections.size, 0),
      pendingNotifications: this.notificationQueue.length,
      notificationTypes: {}
    };

    // Count notifications by type
    this.notificationQueue.forEach(item => {
      const type = item.notification.type || 'unknown';
      stats.notificationTypes[type] = (stats.notificationTypes[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear old notifications
   */
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
    const cutoff = Date.now() - maxAge;
    const before = this.notificationQueue.length;
    
    this.notificationQueue = this.notificationQueue.filter(item => {
      const timestamp = new Date(item.notification.timestamp).getTime();
      return timestamp > cutoff;
    });

    const removed = before - this.notificationQueue.length;
    console.log(`Cleaned up ${removed} old notifications`);
    
    return { removed, remaining: this.notificationQueue.length };
  }
  /**
   * إرسال إشعار Slack
   */
  async sendSlackNotification(notification) {
    try {
      const slackConfig = this.integrations.get('slack');
      if (!slackConfig || !slackConfig.enabled || !slackConfig.webhookUrl) {
        throw new Error('Slack integration not configured');
      }

      const color = this.getSeverityColor(notification.severity || 'medium');

      const payload = {
        channel: slackConfig.channel,
        username: slackConfig.username,
        icon_emoji: slackConfig.iconEmoji,
        attachments: [{
          color,
          title: notification.title,
          text: notification.message,
          fields: [
            {
              title: 'النوع',
              value: notification.type,
              short: true
            },
            {
              title: 'الشدة',
              value: notification.severity || 'medium',
              short: true
            },
            {
              title: 'الوقت',
              value: new Date().toLocaleString('ar-EG'),
              short: true
            }
          ],
          footer: 'AI System',
          ts: Math.floor(Date.now() / 1000)
        }]
      };

      const response = await axios.post(slackConfig.webhookUrl, payload);

      return {
        channel: 'slack',
        status: 'sent',
        response: response.status
      };

    } catch (error) {
      console.error('❌ [Notifications] Slack notification error:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار Teams
   */
  async sendTeamsNotification(notification) {
    try {
      const teamsConfig = this.integrations.get('teams');
      if (!teamsConfig || !teamsConfig.enabled || !teamsConfig.webhookUrl) {
        throw new Error('Teams integration not configured');
      }

      const color = this.getSeverityColor(notification.severity || 'medium');

      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color.replace('#', ''),
        "summary": notification.title,
        "sections": [{
          "activityTitle": notification.title,
          "activitySubtitle": notification.message,
          "facts": [
            {
              "name": "النوع",
              "value": notification.type
            },
            {
              "name": "الشدة",
              "value": notification.severity || 'medium'
            },
            {
              "name": "الوقت",
              "value": new Date().toLocaleString('ar-EG')
            }
          ],
          "markdown": true
        }]
      };

      const response = await axios.post(teamsConfig.webhookUrl, payload);

      return {
        channel: 'teams',
        status: 'sent',
        response: response.status
      };

    } catch (error) {
      console.error('❌ [Notifications] Teams notification error:', error);
      throw error;
    }
  }

  /**
   * الحصول على لون الشدة
   */
  getSeverityColor(severity) {
    const colors = {
      critical: '#FF0000',
      high: '#FF6600',
      medium: '#FFAA00',
      low: '#00AA00'
    };

    return colors[severity] || colors.medium;
  }

  /**
   * تكوين التكامل
   */
  configureIntegration(type, config) {
    if (this.integrations.has(type)) {
      const currentConfig = this.integrations.get(type);
      this.integrations.set(type, { ...currentConfig, ...config });
      console.log(`🔗 [Notifications] ${type} integration configured`);
      return true;
    }
    return false;
  }

  /**
   * اختبار التكامل
   */
  async testIntegration(type) {
    try {
      const testNotification = {
        type: 'test',
        severity: 'low',
        title: 'اختبار التكامل',
        message: `هذا اختبار لتكامل ${type}`,
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      if (type === 'slack') {
        const result = await this.sendSlackNotification(testNotification);
        return { success: true, result };
      } else if (type === 'teams') {
        const result = await this.sendTeamsNotification(testNotification);
        return { success: true, result };
      }

      return { success: false, error: 'Unknown integration type' };

    } catch (error) {
      console.error(`❌ [Notifications] Integration test failed for ${type}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * الحصول على إحصائيات الإشعارات المتقدمة
   */
  getAdvancedStats() {
    return {
      totalNotifications: this.notificationHistory?.length || 0,
      integrations: Array.from(this.integrations?.entries() || []).map(([type, config]) => ({
        type,
        enabled: config.enabled
      })),
      templates: Array.from(this.notificationTemplates?.keys() || []),
      subscribers: this.subscribers.size
    };
  }
}

module.exports = new NotificationService();
