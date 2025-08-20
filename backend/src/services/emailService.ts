import nodemailer from 'nodemailer';
import { config } from '@/config';
import { logger } from '@/utils/logger';

/**
 * Email Service
 * 
 * Handles sending emails for various purposes like welcome, password reset, etc.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.port === 465,
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `${config.email.from.name} <${config.email.from.email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        to: options.to,
        subject: options.subject,
      });
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'مرحباً بك في منصة التواصل';
    const html = this.getWelcomeEmailTemplate(firstName);
    
    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, firstName: string): Promise<void> {
    const subject = 'إعادة تعيين كلمة المرور';
    const resetUrl = `${config.cors.origin}/auth/reset-password?token=${resetToken}`;
    const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);
    
    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerificationEmail(email: string, verificationToken: string, firstName: string): Promise<void> {
    const subject = 'تأكيد البريد الإلكتروني';
    const verificationUrl = `${config.cors.origin}/auth/verify-email?token=${verificationToken}`;
    const html = this.getEmailVerificationTemplate(firstName, verificationUrl);
    
    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(email: string, orderData: any): Promise<void> {
    const subject = `تأكيد الطلب #${orderData.orderNumber}`;
    const html = this.getOrderConfirmationTemplate(orderData);
    
    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(email: string, notification: any): Promise<void> {
    const subject = notification.title;
    const html = this.getNotificationEmailTemplate(notification);
    
    await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Welcome email template
   */
  private getWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مرحباً بك</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>مرحباً بك في منصة التواصل</h1>
          </div>
          <div class="content">
            <h2>أهلاً ${firstName}!</h2>
            <p>نرحب بك في منصة التواصل الشاملة لإدارة علاقات العملاء والتجارة الإلكترونية.</p>
            <p>يمكنك الآن:</p>
            <ul>
              <li>إدارة محادثات العملاء من جميع القنوات</li>
              <li>إنشاء وإدارة متجرك الإلكتروني</li>
              <li>تتبع الطلبات والمبيعات</li>
              <li>الحصول على تقارير مفصلة</li>
            </ul>
            <a href="${config.cors.origin}/dashboard" class="button">ابدأ الآن</a>
          </div>
          <div class="footer">
            <p>شكراً لاختيارك منصة التواصل</p>
            <p>فريق الدعم الفني</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Password reset email template
   */
  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إعادة تعيين كلمة المرور</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
          .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${firstName}</h2>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
            <div class="warning">
              <strong>تنبيه:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط.
            </div>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
          </div>
          <div class="footer">
            <p>فريق الدعم الفني</p>
            <p>منصة التواصل</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Email verification template
   */
  private getEmailVerificationTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد البريد الإلكتروني</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تأكيد البريد الإلكتروني</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${firstName}</h2>
            <p>شكراً لتسجيلك في منصة التواصل!</p>
            <p>يرجى تأكيد بريدك الإلكتروني بالضغط على الرابط أدناه:</p>
            <a href="${verificationUrl}" class="button">تأكيد البريد الإلكتروني</a>
            <p>بعد التأكيد، ستتمكن من الوصول إلى جميع ميزات المنصة.</p>
          </div>
          <div class="footer">
            <p>فريق الدعم الفني</p>
            <p>منصة التواصل</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Order confirmation template
   */
  private getOrderConfirmationTemplate(orderData: any): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تأكيد الطلب</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
          .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تأكيد الطلب #${orderData.orderNumber}</h1>
          </div>
          <div class="content">
            <h2>شكراً لطلبك!</h2>
            <p>تم استلام طلبك بنجاح وسيتم معالجته قريباً.</p>
            <div class="order-details">
              <h3>تفاصيل الطلب:</h3>
              <p><strong>رقم الطلب:</strong> ${orderData.orderNumber}</p>
              <p><strong>التاريخ:</strong> ${new Date(orderData.createdAt).toLocaleDateString('ar-SA')}</p>
              <p><strong>المجموع:</strong> <span class="total">${orderData.total} ${orderData.currency}</span></p>
            </div>
            <p>سنرسل لك تحديثات حول حالة طلبك عبر البريد الإلكتروني.</p>
          </div>
          <div class="footer">
            <p>شكراً لثقتك بنا</p>
            <p>فريق المبيعات</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Notification email template
   */
  private getNotificationEmailTemplate(notification: any): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notification.title}</h1>
          </div>
          <div class="content">
            <p>${notification.message}</p>
          </div>
          <div class="footer">
            <p>منصة التواصل</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed', { error });
      return false;
    }
  }
}

export const emailService = new EmailService();
