/**
 * SMS Service
 * 
 * Handles SMS notifications and templates
 */

class SMSService {
  constructor() {
    this.smsQueue = new Map(); // Mock SMS queue
    this.templates = new Map(); // SMS templates
    this.sentSMS = new Map(); // Sent SMS log
    this.providers = {
      primary: 'unifonic', // Primary SMS provider
      backup: 'twilio'     // Backup SMS provider
    };
    this.initializeTemplates();
  }

  /**
   * Initialize SMS templates
   */
  initializeTemplates() {
    const templates = [
      {
        id: 'welcome',
        name: 'رسالة ترحيب',
        content: 'مرحباً {{customerName}}! أهلاً بك في منصة التواصل والتجارة الإلكترونية. نحن سعداء لانضمامك إلينا.',
        maxLength: 160,
        type: 'promotional'
      },
      {
        id: 'order_confirmation',
        name: 'تأكيد الطلب',
        content: 'تم تأكيد طلبك رقم {{orderNumber}} بمبلغ {{totalAmount}} ريال. سيتم التواصل معك قريباً لتأكيد التسليم.',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'order_shipped',
        name: 'شحن الطلب',
        content: 'تم شحن طلبك رقم {{orderNumber}}. رقم التتبع: {{trackingNumber}}. التسليم المتوقع: {{expectedDelivery}}',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'order_delivered',
        name: 'تسليم الطلب',
        content: 'تم تسليم طلبك رقم {{orderNumber}} بنجاح. شكراً لثقتك بنا! قيّم تجربتك: {{reviewUrl}}',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'payment_reminder',
        name: 'تذكير دفع',
        content: 'تذكير: طلبك رقم {{orderNumber}} بانتظار الدفع. المبلغ: {{amount}} ريال. ادفع الآن: {{paymentUrl}}',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'appointment_reminder',
        name: 'تذكير موعد',
        content: 'تذكير: لديك موعد غداً {{appointmentDate}} في {{appointmentTime}}. للإلغاء أو التأجيل اتصل بنا.',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'verification_code',
        name: 'رمز التحقق',
        content: 'رمز التحقق الخاص بك: {{verificationCode}}. صالح لمدة {{expiryMinutes}} دقائق. لا تشارك هذا الرمز مع أحد.',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'password_reset',
        name: 'إعادة تعيين كلمة المرور',
        content: 'تم طلب إعادة تعيين كلمة المرور لحسابك. استخدم الرمز: {{resetCode}} أو اضغط: {{resetUrl}}',
        maxLength: 160,
        type: 'transactional'
      },
      {
        id: 'promotional_offer',
        name: 'عرض ترويجي',
        content: 'عرض خاص! خصم {{discountPercent}}% على جميع المنتجات. استخدم الكود: {{promoCode}} صالح حتى {{expiryDate}}',
        maxLength: 160,
        type: 'promotional'
      },
      {
        id: 'low_stock_alert',
        name: 'تنبيه نفاد مخزون',
        content: 'تنبيه: المنتج {{productName}} أوشك على النفاد. المخزون الحالي: {{currentStock}}. اطلب الآن!',
        maxLength: 160,
        type: 'transactional'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Send SMS
   */
  async sendSMS(to, templateId, data = {}, options = {}) {
    try {
      // Validate phone number
      if (!this.isValidPhoneNumber(to)) {
        return {
          success: false,
          error: 'رقم الهاتف غير صحيح'
        };
      }

      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          error: 'قالب الرسالة غير موجود'
        };
      }

      // Process template with data
      const processedContent = this.processTemplate(template.content, data);
      
      // Check message length
      if (processedContent.length > template.maxLength) {
        return {
          success: false,
          error: `الرسالة طويلة جداً. الحد الأقصى ${template.maxLength} حرف`
        };
      }

      const sms = {
        id: this.generateSMSId(),
        to: this.formatPhoneNumber(to),
        content: processedContent,
        templateId,
        data,
        status: 'pending',
        provider: options.provider || this.providers.primary,
        type: template.type,
        createdAt: new Date(),
        sentAt: null,
        deliveredAt: null,
        priority: options.priority || 'normal',
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        cost: this.calculateSMSCost(processedContent, template.type),
      };

      // Add to queue
      this.smsQueue.set(sms.id, sms);

      // Simulate sending
      setTimeout(() => {
        this.processPendingSMS();
      }, 1000);

      return {
        success: true,
        data: {
          smsId: sms.id,
          status: 'queued',
          cost: sms.cost
        },
        message: 'تم إضافة الرسالة إلى قائمة الانتظار'
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        error: 'فشل في إرسال الرسالة النصية'
      };
    }
  }

  /**
   * Process template with data
   */
  processTemplate(content, data) {
    let processedContent = content;

    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedContent = processedContent.replace(regex, data[key] || '');
    });

    return processedContent;
  }

  /**
   * Process pending SMS (simulate sending)
   */
  async processPendingSMS() {
    const pendingSMS = Array.from(this.smsQueue.values())
      .filter(sms => sms.status === 'pending');

    for (const sms of pendingSMS) {
      try {
        // Simulate SMS sending delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate provider-specific success rates
        let successRate = 0.95; // 95% default success rate
        if (sms.provider === 'unifonic') successRate = 0.97;
        if (sms.provider === 'twilio') successRate = 0.93;

        const success = Math.random() < successRate;

        if (success) {
          sms.status = 'sent';
          sms.sentAt = new Date();
          
          // Simulate delivery confirmation after a delay
          setTimeout(() => {
            if (Math.random() < 0.9) { // 90% delivery rate
              sms.status = 'delivered';
              sms.deliveredAt = new Date();
            }
          }, Math.random() * 5000 + 2000); // 2-7 seconds delay
          
          // Move to sent SMS log
          this.sentSMS.set(sms.id, sms);
          this.smsQueue.delete(sms.id);
          
          console.log(`SMS sent successfully to ${sms.to}: ${sms.content.substring(0, 50)}...`);
        } else {
          sms.retryCount++;
          if (sms.retryCount >= sms.maxRetries) {
            sms.status = 'failed';
            console.error(`SMS failed permanently to ${sms.to}: ${sms.content.substring(0, 50)}...`);
          } else {
            console.warn(`SMS retry ${sms.retryCount} for ${sms.to}: ${sms.content.substring(0, 50)}...`);
            
            // Try backup provider on retry
            if (sms.retryCount === 2 && sms.provider === this.providers.primary) {
              sms.provider = this.providers.backup;
            }
          }
        }

        this.smsQueue.set(sms.id, sms);
      } catch (error) {
        console.error('Error processing SMS:', error);
        sms.status = 'failed';
        this.smsQueue.set(sms.id, sms);
      }
    }
  }

  /**
   * Get SMS status
   */
  async getSMSStatus(smsId) {
    try {
      let sms = this.smsQueue.get(smsId) || this.sentSMS.get(smsId);
      
      if (!sms) {
        return {
          success: false,
          error: 'الرسالة النصية غير موجودة'
        };
      }

      return {
        success: true,
        data: {
          id: sms.id,
          to: sms.to,
          content: sms.content,
          status: sms.status,
          provider: sms.provider,
          type: sms.type,
          createdAt: sms.createdAt,
          sentAt: sms.sentAt,
          deliveredAt: sms.deliveredAt,
          retryCount: sms.retryCount,
          cost: sms.cost,
        }
      };
    } catch (error) {
      console.error('Error getting SMS status:', error);
      return {
        success: false,
        error: 'فشل في جلب حالة الرسالة النصية'
      };
    }
  }

  /**
   * Get SMS history
   */
  async getSMSHistory(filters = {}) {
    try {
      let messages = [
        ...Array.from(this.smsQueue.values()),
        ...Array.from(this.sentSMS.values())
      ];

      // Apply filters
      if (filters.to) {
        messages = messages.filter(sms => 
          sms.to.includes(filters.to)
        );
      }

      if (filters.status) {
        messages = messages.filter(sms => sms.status === filters.status);
      }

      if (filters.templateId) {
        messages = messages.filter(sms => sms.templateId === filters.templateId);
      }

      if (filters.type) {
        messages = messages.filter(sms => sms.type === filters.type);
      }

      if (filters.provider) {
        messages = messages.filter(sms => sms.provider === filters.provider);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        messages = messages.filter(sms => sms.createdAt >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        messages = messages.filter(sms => sms.createdAt <= toDate);
      }

      // Sort by creation date (newest first)
      messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedMessages = messages.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedMessages.map(sms => ({
          id: sms.id,
          to: sms.to,
          content: sms.content.substring(0, 100) + (sms.content.length > 100 ? '...' : ''),
          templateId: sms.templateId,
          status: sms.status,
          provider: sms.provider,
          type: sms.type,
          createdAt: sms.createdAt,
          sentAt: sms.sentAt,
          deliveredAt: sms.deliveredAt,
          retryCount: sms.retryCount,
          cost: sms.cost,
        })),
        pagination: {
          page,
          limit,
          total: messages.length,
          pages: Math.ceil(messages.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting SMS history:', error);
      return {
        success: false,
        error: 'فشل في جلب سجل الرسائل النصية'
      };
    }
  }

  /**
   * Get SMS statistics
   */
  async getSMSStats() {
    try {
      const allSMS = [
        ...Array.from(this.smsQueue.values()),
        ...Array.from(this.sentSMS.values())
      ];

      const stats = {
        total: allSMS.length,
        sent: allSMS.filter(s => s.status === 'sent' || s.status === 'delivered').length,
        delivered: allSMS.filter(s => s.status === 'delivered').length,
        pending: allSMS.filter(s => s.status === 'pending').length,
        failed: allSMS.filter(s => s.status === 'failed').length,
        deliveryRate: 0,
        totalCost: allSMS.reduce((sum, s) => sum + s.cost, 0),
        templates: this.templates.size,
      };

      if (stats.sent > 0) {
        stats.deliveryRate = Math.round((stats.delivered / stats.sent) * 100);
      }

      // Provider stats
      const providerStats = {};
      allSMS.forEach(sms => {
        if (!providerStats[sms.provider]) {
          providerStats[sms.provider] = { total: 0, sent: 0, failed: 0 };
        }
        providerStats[sms.provider].total++;
        if (sms.status === 'sent' || sms.status === 'delivered') {
          providerStats[sms.provider].sent++;
        } else if (sms.status === 'failed') {
          providerStats[sms.provider].failed++;
        }
      });

      stats.providerStats = providerStats;

      // Template usage stats
      const templateUsage = {};
      allSMS.forEach(sms => {
        templateUsage[sms.templateId] = (templateUsage[sms.templateId] || 0) + 1;
      });

      stats.templateUsage = templateUsage;

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting SMS stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الرسائل النصية'
      };
    }
  }

  /**
   * Get available templates
   */
  getTemplates() {
    const templates = Array.from(this.templates.values()).map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      maxLength: template.maxLength,
      type: template.type,
    }));

    return {
      success: true,
      data: templates
    };
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients, templateId, data = {}, options = {}) {
    try {
      const results = [];
      
      for (const recipient of recipients) {
        const result = await this.sendSMS(recipient, templateId, data, options);
        results.push({
          recipient,
          success: result.success,
          smsId: result.data?.smsId,
          cost: result.data?.cost || 0,
          error: result.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

      return {
        success: true,
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          totalCost,
          results
        },
        message: `تم إرسال ${successCount} من أصل ${results.length} رسالة بنجاح`
      };
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      return {
        success: false,
        error: 'فشل في إرسال الرسائل الجماعية'
      };
    }
  }

  /**
   * Validate phone number
   */
  isValidPhoneNumber(phone) {
    // Saudi Arabia phone number validation
    const saudiRegex = /^(\+966|966|0)?[5][0-9]{8}$/;
    // International format validation
    const intlRegex = /^\+[1-9]\d{1,14}$/;
    
    return saudiRegex.test(phone) || intlRegex.test(phone);
  }

  /**
   * Format phone number
   */
  formatPhoneNumber(phone) {
    // Convert Saudi numbers to international format
    if (phone.startsWith('05')) {
      return '+966' + phone.substring(1);
    } else if (phone.startsWith('5') && phone.length === 9) {
      return '+966' + phone;
    } else if (phone.startsWith('966') && !phone.startsWith('+966')) {
      return '+' + phone;
    }
    
    return phone;
  }

  /**
   * Calculate SMS cost
   */
  calculateSMSCost(content, type) {
    const basePrice = type === 'promotional' ? 0.05 : 0.08; // SAR per SMS
    const segments = Math.ceil(content.length / 160);
    return segments * basePrice;
  }

  /**
   * Generate unique SMS ID
   */
  generateSMSId() {
    return `SMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new SMSService();
