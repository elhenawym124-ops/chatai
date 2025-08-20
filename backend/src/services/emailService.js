/**
 * Email Service
 * 
 * Handles email notifications and templates
 */

class EmailService {
  constructor() {
    this.emailQueue = new Map(); // Mock email queue
    this.templates = new Map(); // Email templates
    this.sentEmails = new Map(); // Sent emails log
    this.initializeTemplates();
  }

  /**
   * Initialize email templates
   */
  initializeTemplates() {
    const templates = [
      {
        id: 'welcome',
        name: 'رسالة ترحيب',
        subject: 'مرحباً بك في منصة التواصل والتجارة الإلكترونية',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">مرحباً بك!</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">أهلاً {{customerName}}</h2>
              <p style="color: #666; line-height: 1.6;">
                نحن سعداء لانضمامك إلى منصتنا. يمكنك الآن الاستفادة من جميع خدماتنا المتميزة.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboardUrl}}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  ادخل إلى حسابك
                </a>
              </div>
              <p style="color: #999; font-size: 14px;">
                إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.
              </p>
            </div>
          </div>
        `,
        textContent: 'مرحباً {{customerName}}، أهلاً بك في منصتنا!'
      },
      {
        id: 'order_confirmation',
        name: 'تأكيد الطلب',
        subject: 'تأكيد طلبك رقم {{orderNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: #28a745; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">تم تأكيد طلبك</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">شكراً لك {{customerName}}</h2>
              <p style="color: #666;">تم استلام طلبك بنجاح ونحن نعمل على معالجته.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">تفاصيل الطلب</h3>
                <p><strong>رقم الطلب:</strong> {{orderNumber}}</p>
                <p><strong>تاريخ الطلب:</strong> {{orderDate}}</p>
                <p><strong>المبلغ الإجمالي:</strong> {{totalAmount}} ريال</p>
                <p><strong>طريقة الدفع:</strong> {{paymentMethod}}</p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">المنتجات</h3>
                {{#each items}}
                <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                  <p><strong>{{name}}</strong></p>
                  <p>الكمية: {{quantity}} × {{price}} ريال = {{total}} ريال</p>
                </div>
                {{/each}}
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{trackingUrl}}" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  تتبع الطلب
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: 'تم تأكيد طلبك رقم {{orderNumber}}. المبلغ الإجمالي: {{totalAmount}} ريال'
      },
      {
        id: 'order_shipped',
        name: 'شحن الطلب',
        subject: 'تم شحن طلبك رقم {{orderNumber}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: #17a2b8; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🚚 تم شحن طلبك</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">عزيزي {{customerName}}</h2>
              <p style="color: #666;">تم شحن طلبك وهو في طريقه إليك!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333;">معلومات الشحن</h3>
                <p><strong>رقم الطلب:</strong> {{orderNumber}}</p>
                <p><strong>رقم التتبع:</strong> {{trackingNumber}}</p>
                <p><strong>شركة الشحن:</strong> {{shippingCompany}}</p>
                <p><strong>التسليم المتوقع:</strong> {{expectedDelivery}}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="{{trackingUrl}}" style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  تتبع الشحنة
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: 'تم شحن طلبك رقم {{orderNumber}}. رقم التتبع: {{trackingNumber}}'
      },
      {
        id: 'low_stock_alert',
        name: 'تنبيه نفاد المخزون',
        subject: 'تنبيه: مخزون منخفض للمنتج {{productName}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: #ffc107; padding: 20px; text-align: center;">
              <h1 style="color: #333; margin: 0;">⚠️ تنبيه مخزون</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">تنبيه مخزون منخفض</h2>
              <p style="color: #666;">المنتج التالي أوشك على النفاد:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h3 style="color: #333;">{{productName}}</h3>
                <p><strong>SKU:</strong> {{productSku}}</p>
                <p><strong>المخزون الحالي:</strong> {{currentStock}}</p>
                <p><strong>نقطة الطلب:</strong> {{reorderPoint}}</p>
                <p><strong>المستودع:</strong> {{warehouseName}}</p>
              </div>

              <p style="color: #d63384; font-weight: bold;">
                يُنصح بطلب كمية جديدة قدرها {{reorderQuantity}} قطعة.
              </p>
            </div>
          </div>
        `,
        textContent: 'تنبيه: المنتج {{productName}} أوشك على النفاد. المخزون الحالي: {{currentStock}}'
      },
      {
        id: 'password_reset',
        name: 'إعادة تعيين كلمة المرور',
        subject: 'طلب إعادة تعيين كلمة المرور',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: #dc3545; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🔐 إعادة تعيين كلمة المرور</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">مرحباً {{userName}}</h2>
              <p style="color: #666;">تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{resetUrl}}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  إعادة تعيين كلمة المرور
                </a>
              </div>

              <p style="color: #999; font-size: 14px;">
                هذا الرابط صالح لمدة 24 ساعة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
              </p>
            </div>
          </div>
        `,
        textContent: 'طلب إعادة تعيين كلمة المرور. الرابط: {{resetUrl}}'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Send email
   */
  async sendEmail(to, templateId, data = {}, options = {}) {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          error: 'قالب البريد الإلكتروني غير موجود'
        };
      }

      // Process template with data
      const processedEmail = this.processTemplate(template, data);
      
      const email = {
        id: this.generateEmailId(),
        to,
        from: options.from || 'noreply@yourcompany.com',
        subject: processedEmail.subject,
        htmlContent: processedEmail.htmlContent,
        textContent: processedEmail.textContent,
        templateId,
        data,
        status: 'pending',
        createdAt: new Date(),
        sentAt: null,
        priority: options.priority || 'normal',
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
      };

      // Add to queue
      this.emailQueue.set(email.id, email);

      // Simulate sending (in real implementation, use nodemailer or similar)
      setTimeout(() => {
        this.processPendingEmails();
      }, 1000);

      return {
        success: true,
        data: {
          emailId: email.id,
          status: 'queued'
        },
        message: 'تم إضافة البريد الإلكتروني إلى قائمة الانتظار'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: 'فشل في إرسال البريد الإلكتروني'
      };
    }
  }

  /**
   * Process template with data
   */
  processTemplate(template, data) {
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    // Simple template processing (replace {{variable}} with data)
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, data[key] || '');
      htmlContent = htmlContent.replace(regex, data[key] || '');
      textContent = textContent.replace(regex, data[key] || '');
    });

    // Handle arrays (like order items)
    if (data.items && Array.isArray(data.items)) {
      const itemsHtml = data.items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
          <p><strong>${item.name}</strong></p>
          <p>الكمية: ${item.quantity} × ${item.price} ريال = ${item.total} ريال</p>
        </div>
      `).join('');
      
      htmlContent = htmlContent.replace(/{{#each items}}.*?{{\/each}}/s, itemsHtml);
    }

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  /**
   * Process pending emails (simulate sending)
   */
  async processPendingEmails() {
    const pendingEmails = Array.from(this.emailQueue.values())
      .filter(email => email.status === 'pending');

    for (const email of pendingEmails) {
      try {
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate 95% success rate
        const success = Math.random() > 0.05;

        if (success) {
          email.status = 'sent';
          email.sentAt = new Date();
          
          // Move to sent emails log
          this.sentEmails.set(email.id, email);
          this.emailQueue.delete(email.id);
          
          console.log(`Email sent successfully to ${email.to}: ${email.subject}`);
        } else {
          email.retryCount++;
          if (email.retryCount >= email.maxRetries) {
            email.status = 'failed';
            console.error(`Email failed permanently to ${email.to}: ${email.subject}`);
          } else {
            console.warn(`Email retry ${email.retryCount} for ${email.to}: ${email.subject}`);
          }
        }

        this.emailQueue.set(email.id, email);
      } catch (error) {
        console.error('Error processing email:', error);
        email.status = 'failed';
        this.emailQueue.set(email.id, email);
      }
    }
  }

  /**
   * Get email status
   */
  async getEmailStatus(emailId) {
    try {
      let email = this.emailQueue.get(emailId) || this.sentEmails.get(emailId);
      
      if (!email) {
        return {
          success: false,
          error: 'البريد الإلكتروني غير موجود'
        };
      }

      return {
        success: true,
        data: {
          id: email.id,
          to: email.to,
          subject: email.subject,
          status: email.status,
          createdAt: email.createdAt,
          sentAt: email.sentAt,
          retryCount: email.retryCount,
        }
      };
    } catch (error) {
      console.error('Error getting email status:', error);
      return {
        success: false,
        error: 'فشل في جلب حالة البريد الإلكتروني'
      };
    }
  }

  /**
   * Get email history
   */
  async getEmailHistory(filters = {}) {
    try {
      let emails = [
        ...Array.from(this.emailQueue.values()),
        ...Array.from(this.sentEmails.values())
      ];

      // Apply filters
      if (filters.to) {
        emails = emails.filter(email => 
          email.to.toLowerCase().includes(filters.to.toLowerCase())
        );
      }

      if (filters.status) {
        emails = emails.filter(email => email.status === filters.status);
      }

      if (filters.templateId) {
        emails = emails.filter(email => email.templateId === filters.templateId);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        emails = emails.filter(email => email.createdAt >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        emails = emails.filter(email => email.createdAt <= toDate);
      }

      // Sort by creation date (newest first)
      emails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedEmails = emails.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedEmails.map(email => ({
          id: email.id,
          to: email.to,
          subject: email.subject,
          templateId: email.templateId,
          status: email.status,
          createdAt: email.createdAt,
          sentAt: email.sentAt,
          retryCount: email.retryCount,
        })),
        pagination: {
          page,
          limit,
          total: emails.length,
          pages: Math.ceil(emails.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting email history:', error);
      return {
        success: false,
        error: 'فشل في جلب سجل البريد الإلكتروني'
      };
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats() {
    try {
      const allEmails = [
        ...Array.from(this.emailQueue.values()),
        ...Array.from(this.sentEmails.values())
      ];

      const stats = {
        total: allEmails.length,
        sent: allEmails.filter(e => e.status === 'sent').length,
        pending: allEmails.filter(e => e.status === 'pending').length,
        failed: allEmails.filter(e => e.status === 'failed').length,
        deliveryRate: 0,
        templates: this.templates.size,
      };

      if (stats.total > 0) {
        stats.deliveryRate = Math.round((stats.sent / stats.total) * 100);
      }

      // Template usage stats
      const templateUsage = {};
      allEmails.forEach(email => {
        templateUsage[email.templateId] = (templateUsage[email.templateId] || 0) + 1;
      });

      stats.templateUsage = templateUsage;

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting email stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات البريد الإلكتروني'
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
      subject: template.subject,
    }));

    return {
      success: true,
      data: templates
    };
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(recipients, templateId, data = {}, options = {}) {
    try {
      const results = [];
      
      for (const recipient of recipients) {
        const result = await this.sendEmail(recipient, templateId, data, options);
        results.push({
          recipient,
          success: result.success,
          emailId: result.data?.emailId,
          error: result.error
        });
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return {
        success: true,
        data: {
          total: results.length,
          successful: successCount,
          failed: failureCount,
          results
        },
        message: `تم إرسال ${successCount} من أصل ${results.length} رسالة بنجاح`
      };
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      return {
        success: false,
        error: 'فشل في إرسال الرسائل الجماعية'
      };
    }
  }

  /**
   * Generate unique email ID
   */
  generateEmailId() {
    return `EMAIL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new EmailService();
