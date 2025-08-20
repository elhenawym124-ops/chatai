/**
 * Payment Service
 * 
 * Handles payment processing with multiple payment gateways
 */

class PaymentService {
  constructor() {
    this.payments = new Map(); // Payment transactions
    this.paymentMethods = new Map(); // Saved payment methods
    this.gateways = {
      stripe: {
        name: 'Stripe',
        enabled: true,
        currencies: ['USD', 'EUR', 'SAR'],
        fees: { percentage: 2.9, fixed: 0.30 },
        supportedMethods: ['card', 'apple_pay', 'google_pay']
      },
      paypal: {
        name: 'PayPal',
        enabled: true,
        currencies: ['USD', 'EUR'],
        fees: { percentage: 3.4, fixed: 0.30 },
        supportedMethods: ['paypal', 'card']
      },
      mada: {
        name: 'مدى',
        enabled: true,
        currencies: ['SAR'],
        fees: { percentage: 1.5, fixed: 0 },
        supportedMethods: ['mada_card']
      },
      stc_pay: {
        name: 'STC Pay',
        enabled: true,
        currencies: ['SAR'],
        fees: { percentage: 2.0, fixed: 0 },
        supportedMethods: ['stc_pay']
      },
      apple_pay: {
        name: 'Apple Pay',
        enabled: true,
        currencies: ['USD', 'EUR', 'SAR'],
        fees: { percentage: 2.5, fixed: 0 },
        supportedMethods: ['apple_pay']
      },
      bank_transfer: {
        name: 'تحويل بنكي',
        enabled: true,
        currencies: ['SAR'],
        fees: { percentage: 0, fixed: 0 },
        supportedMethods: ['bank_transfer']
      }
    };
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock payment transactions
    const mockPayments = [
      {
        id: 'PAY_001',
        orderId: 'ORD-001',
        customerId: '1',
        amount: 5225,
        currency: 'SAR',
        gateway: 'mada',
        method: 'mada_card',
        status: 'completed',
        gatewayTransactionId: 'MADA_TXN_123456',
        fees: 78.38,
        netAmount: 5146.62,
        createdAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-10'),
        description: 'دفع طلب رقم ORD-001',
        metadata: {
          customerName: 'أحمد محمد',
          customerEmail: 'ahmed@example.com'
        }
      },
      {
        id: 'PAY_002',
        orderId: 'ORD-002',
        customerId: '2',
        amount: 5985,
        currency: 'SAR',
        gateway: 'stc_pay',
        method: 'stc_pay',
        status: 'pending',
        gatewayTransactionId: null,
        fees: 119.70,
        netAmount: 5865.30,
        createdAt: new Date('2024-01-15'),
        completedAt: null,
        description: 'دفع طلب رقم ORD-002',
        metadata: {
          customerName: 'سارة أحمد',
          customerEmail: 'sara@example.com'
        }
      }
    ];

    mockPayments.forEach(payment => {
      this.payments.set(payment.id, payment);
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(paymentData) {
    try {
      const {
        orderId,
        customerId,
        amount,
        currency = 'SAR',
        gateway,
        method,
        description,
        metadata = {}
      } = paymentData;

      // Validate gateway
      if (!this.gateways[gateway] || !this.gateways[gateway].enabled) {
        return {
          success: false,
          error: 'بوابة الدفع غير متاحة'
        };
      }

      // Validate currency
      if (!this.gateways[gateway].currencies.includes(currency)) {
        return {
          success: false,
          error: 'العملة غير مدعومة في بوابة الدفع المحددة'
        };
      }

      // Validate payment method
      if (!this.gateways[gateway].supportedMethods.includes(method)) {
        return {
          success: false,
          error: 'طريقة الدفع غير مدعومة في بوابة الدفع المحددة'
        };
      }

      // Calculate fees
      const fees = this.calculateFees(amount, gateway);
      const netAmount = amount - fees;

      const payment = {
        id: this.generatePaymentId(),
        orderId,
        customerId,
        amount,
        currency,
        gateway,
        method,
        status: 'pending',
        gatewayTransactionId: null,
        fees,
        netAmount,
        createdAt: new Date(),
        completedAt: null,
        description,
        metadata,
        clientSecret: this.generateClientSecret(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };

      this.payments.set(payment.id, payment);

      return {
        success: true,
        data: {
          paymentId: payment.id,
          clientSecret: payment.clientSecret,
          amount: payment.amount,
          currency: payment.currency,
          fees: payment.fees,
          netAmount: payment.netAmount,
          gateway: payment.gateway,
          method: payment.method,
          expiresAt: payment.expiresAt,
        },
        message: 'تم إنشاء نية الدفع بنجاح'
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: 'فشل في إنشاء نية الدفع'
      };
    }
  }

  /**
   * Process payment
   */
  async processPayment(paymentId, paymentDetails = {}) {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'عملية الدفع غير موجودة'
        };
      }

      if (payment.status !== 'pending') {
        return {
          success: false,
          error: 'عملية الدفع تمت معالجتها مسبقاً'
        };
      }

      if (new Date() > payment.expiresAt) {
        payment.status = 'expired';
        this.payments.set(paymentId, payment);
        return {
          success: false,
          error: 'انتهت صلاحية عملية الدفع'
        };
      }

      // Simulate payment processing based on gateway
      const result = await this.simulateGatewayProcessing(payment, paymentDetails);

      if (result.success) {
        payment.status = 'completed';
        payment.completedAt = new Date();
        payment.gatewayTransactionId = result.transactionId;
        
        // Send confirmation notifications
        this.sendPaymentConfirmation(payment);
      } else {
        payment.status = 'failed';
        payment.failureReason = result.error;
      }

      this.payments.set(paymentId, payment);

      return {
        success: result.success,
        data: result.success ? {
          paymentId: payment.id,
          transactionId: payment.gatewayTransactionId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          completedAt: payment.completedAt,
        } : null,
        error: result.success ? null : result.error,
        message: result.success ? 'تم الدفع بنجاح' : 'فشل في عملية الدفع'
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: 'فشل في معالجة الدفع'
      };
    }
  }

  /**
   * Simulate gateway processing
   */
  async simulateGatewayProcessing(payment, paymentDetails) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different success rates for different gateways
    let successRate = 0.95; // Default 95% success rate
    
    switch (payment.gateway) {
      case 'mada':
        successRate = 0.98; // Very high success rate for local cards
        break;
      case 'stc_pay':
        successRate = 0.96;
        break;
      case 'stripe':
        successRate = 0.94;
        break;
      case 'paypal':
        successRate = 0.92;
        break;
      case 'bank_transfer':
        successRate = 1.0; // Always successful (manual verification)
        break;
    }

    const success = Math.random() < successRate;

    if (success) {
      return {
        success: true,
        transactionId: this.generateTransactionId(payment.gateway)
      };
    } else {
      const errors = [
        'رصيد غير كافي',
        'البطاقة منتهية الصلاحية',
        'رقم البطاقة غير صحيح',
        'تم رفض العملية من البنك',
        'خطأ في الشبكة'
      ];
      
      return {
        success: false,
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'عملية الدفع غير موجودة'
        };
      }

      return {
        success: true,
        data: {
          id: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          method: payment.method,
          status: payment.status,
          gatewayTransactionId: payment.gatewayTransactionId,
          fees: payment.fees,
          netAmount: payment.netAmount,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          failureReason: payment.failureReason,
          description: payment.description,
        }
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        error: 'فشل في جلب حالة الدفع'
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, refundData = {}) {
    try {
      const payment = this.payments.get(paymentId);
      if (!payment) {
        return {
          success: false,
          error: 'عملية الدفع غير موجودة'
        };
      }

      if (payment.status !== 'completed') {
        return {
          success: false,
          error: 'لا يمكن استرداد دفعة غير مكتملة'
        };
      }

      const refundAmount = refundData.amount || payment.amount;
      if (refundAmount > payment.amount) {
        return {
          success: false,
          error: 'مبلغ الاسترداد أكبر من مبلغ الدفع'
        };
      }

      const refund = {
        id: this.generateRefundId(),
        paymentId,
        amount: refundAmount,
        currency: payment.currency,
        reason: refundData.reason || 'طلب العميل',
        status: 'pending',
        gatewayRefundId: null,
        createdAt: new Date(),
        completedAt: null,
      };

      // Simulate refund processing
      setTimeout(async () => {
        const success = Math.random() > 0.05; // 95% success rate
        
        if (success) {
          refund.status = 'completed';
          refund.completedAt = new Date();
          refund.gatewayRefundId = this.generateTransactionId(payment.gateway, 'REF');
          
          // Update payment status if full refund
          if (refundAmount === payment.amount) {
            payment.status = 'refunded';
            this.payments.set(paymentId, payment);
          }
          
          console.log(`Refund completed: ${refund.id}`);
        } else {
          refund.status = 'failed';
          console.error(`Refund failed: ${refund.id}`);
        }
      }, 3000);

      return {
        success: true,
        data: {
          refundId: refund.id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
        },
        message: 'تم إنشاء طلب الاسترداد'
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: 'فشل في معالجة الاسترداد'
      };
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(filters = {}) {
    try {
      let payments = Array.from(this.payments.values());

      // Apply filters
      if (filters.customerId) {
        payments = payments.filter(p => p.customerId === filters.customerId);
      }

      if (filters.orderId) {
        payments = payments.filter(p => p.orderId === filters.orderId);
      }

      if (filters.status) {
        payments = payments.filter(p => p.status === filters.status);
      }

      if (filters.gateway) {
        payments = payments.filter(p => p.gateway === filters.gateway);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        payments = payments.filter(p => p.createdAt >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        payments = payments.filter(p => p.createdAt <= toDate);
      }

      // Sort by creation date (newest first)
      payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedPayments = payments.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedPayments,
        pagination: {
          page,
          limit,
          total: payments.length,
          pages: Math.ceil(payments.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        error: 'فشل في جلب سجل المدفوعات'
      };
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    try {
      const payments = Array.from(this.payments.values());
      
      const stats = {
        total: payments.length,
        completed: payments.filter(p => p.status === 'completed').length,
        pending: payments.filter(p => p.status === 'pending').length,
        failed: payments.filter(p => p.status === 'failed').length,
        refunded: payments.filter(p => p.status === 'refunded').length,
        totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
        totalFees: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.fees, 0),
        netAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.netAmount, 0),
        successRate: 0,
      };

      if (stats.total > 0) {
        stats.successRate = Math.round((stats.completed / stats.total) * 100);
      }

      // Gateway stats
      const gatewayStats = {};
      payments.forEach(payment => {
        if (!gatewayStats[payment.gateway]) {
          gatewayStats[payment.gateway] = {
            total: 0,
            completed: 0,
            amount: 0,
            fees: 0
          };
        }
        gatewayStats[payment.gateway].total++;
        if (payment.status === 'completed') {
          gatewayStats[payment.gateway].completed++;
          gatewayStats[payment.gateway].amount += payment.amount;
          gatewayStats[payment.gateway].fees += payment.fees;
        }
      });

      stats.gatewayStats = gatewayStats;

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المدفوعات'
      };
    }
  }

  /**
   * Get available payment gateways
   */
  getAvailableGateways(currency = 'SAR') {
    const availableGateways = Object.entries(this.gateways)
      .filter(([key, gateway]) => 
        gateway.enabled && gateway.currencies.includes(currency)
      )
      .map(([key, gateway]) => ({
        id: key,
        name: gateway.name,
        supportedMethods: gateway.supportedMethods,
        fees: gateway.fees,
      }));

    return {
      success: true,
      data: availableGateways
    };
  }

  /**
   * Calculate payment fees
   */
  calculateFees(amount, gateway) {
    const gatewayConfig = this.gateways[gateway];
    if (!gatewayConfig) return 0;

    const percentageFee = (amount * gatewayConfig.fees.percentage) / 100;
    const totalFees = percentageFee + gatewayConfig.fees.fixed;
    
    return Math.round(totalFees * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(payment) {
    // This would integrate with email/SMS services
    console.log(`Payment confirmation sent for payment ${payment.id}`);
  }

  /**
   * Helper methods
   */
  generatePaymentId() {
    return `PAY_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  generateRefundId() {
    return `REF_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  generateTransactionId(gateway, prefix = 'TXN') {
    const gatewayPrefix = gateway.toUpperCase();
    return `${gatewayPrefix}_${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  generateClientSecret() {
    return `cs_${Math.random().toString(36).substr(2, 32)}`;
  }
}

module.exports = new PaymentService();
