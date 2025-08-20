/**
 * Returns and Exchange Service
 * 
 * Handles product returns, exchanges, and refund processing
 */

class ReturnService {
  constructor() {
    this.returns = new Map(); // Return requests
    this.returnPolicies = new Map(); // Return policies by product category
    this.refunds = new Map(); // Refund transactions
    this.exchanges = new Map(); // Exchange requests
    this.returnReasons = new Map(); // Return reasons
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock return policies
    const mockPolicies = [
      {
        id: 'POLICY001',
        categoryId: 'electronics',
        categoryName: 'إلكترونيات',
        returnPeriodDays: 14,
        exchangePeriodDays: 30,
        conditions: [
          'المنتج في حالته الأصلية',
          'وجود العبوة الأصلية',
          'عدم وجود خدوش أو أضرار',
          'وجود جميع الإكسسوارات'
        ],
        allowedReasons: ['defective', 'not_as_described', 'changed_mind', 'wrong_item'],
        requiresApproval: true,
        restockingFee: 0,
        shippingCostResponsibility: 'customer', // customer, seller, shared
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'POLICY002',
        categoryId: 'clothing',
        categoryName: 'ملابس',
        returnPeriodDays: 30,
        exchangePeriodDays: 30,
        conditions: [
          'المنتج غير مستعمل',
          'وجود العلامات الأصلية',
          'عدم وجود روائح أو بقع'
        ],
        allowedReasons: ['wrong_size', 'not_as_described', 'changed_mind', 'defective'],
        requiresApproval: false,
        restockingFee: 0,
        shippingCostResponsibility: 'seller',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'POLICY003',
        categoryId: 'books',
        categoryName: 'كتب',
        returnPeriodDays: 7,
        exchangePeriodDays: 14,
        conditions: [
          'الكتاب في حالة ممتازة',
          'عدم وجود كتابات أو تمزق'
        ],
        allowedReasons: ['not_as_described', 'wrong_item', 'defective'],
        requiresApproval: true,
        restockingFee: 10, // percentage
        shippingCostResponsibility: 'customer',
        isActive: true,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockPolicies.forEach(policy => {
      this.returnPolicies.set(policy.id, policy);
    });

    // Mock return reasons
    const mockReasons = [
      {
        id: 'REASON001',
        code: 'defective',
        name: 'منتج معيب',
        description: 'المنتج لا يعمل بشكل صحيح أو به عيب تصنيع',
        requiresEvidence: true,
        autoApprove: false,
        refundEligible: true,
        exchangeEligible: true,
      },
      {
        id: 'REASON002',
        code: 'not_as_described',
        name: 'لا يطابق الوصف',
        description: 'المنتج مختلف عن الوصف أو الصور المعروضة',
        requiresEvidence: true,
        autoApprove: false,
        refundEligible: true,
        exchangeEligible: true,
      },
      {
        id: 'REASON003',
        code: 'wrong_size',
        name: 'مقاس خاطئ',
        description: 'المقاس غير مناسب',
        requiresEvidence: false,
        autoApprove: true,
        refundEligible: true,
        exchangeEligible: true,
      },
      {
        id: 'REASON004',
        code: 'changed_mind',
        name: 'تغيير رأي',
        description: 'لم يعد المنتج مرغوباً فيه',
        requiresEvidence: false,
        autoApprove: true,
        refundEligible: true,
        exchangeEligible: false,
      },
      {
        id: 'REASON005',
        code: 'wrong_item',
        name: 'منتج خاطئ',
        description: 'تم إرسال منتج مختلف عن المطلوب',
        requiresEvidence: true,
        autoApprove: true,
        refundEligible: true,
        exchangeEligible: true,
      }
    ];

    mockReasons.forEach(reason => {
      this.returnReasons.set(reason.id, reason);
    });

    // Mock return requests
    const mockReturns = [
      {
        id: 'RET001',
        orderId: 'ORD001',
        customerId: '1',
        customerName: 'أحمد محمد',
        productId: '1',
        productName: 'لابتوب HP Pavilion',
        quantity: 1,
        originalPrice: 2500,
        reasonCode: 'defective',
        reasonName: 'منتج معيب',
        description: 'الشاشة لا تعمل بشكل صحيح، توجد خطوط سوداء',
        images: ['return1_img1.jpg', 'return1_img2.jpg'],
        requestType: 'refund', // refund, exchange
        status: 'pending', // pending, approved, rejected, processing, completed, cancelled
        approvedBy: null,
        approvedAt: null,
        rejectionReason: '',
        refundAmount: 0,
        restockingFee: 0,
        shippingCost: 0,
        trackingNumber: '',
        returnShippingLabel: '',
        estimatedProcessingDays: 5,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date('2024-01-14T10:00:00'),
            description: 'تم تقديم طلب الإرجاع',
            updatedBy: 'customer',
          }
        ],
      },
      {
        id: 'RET002',
        orderId: 'ORD002',
        customerId: '2',
        customerName: 'سارة أحمد',
        productId: '2',
        productName: 'هاتف Samsung Galaxy',
        quantity: 1,
        originalPrice: 1800,
        reasonCode: 'wrong_size',
        reasonName: 'مقاس خاطئ',
        description: 'الهاتف أكبر من المتوقع، أريد مقاس أصغر',
        images: [],
        requestType: 'exchange',
        status: 'approved',
        approvedBy: '1',
        approvedAt: new Date('2024-01-13T14:30:00'),
        rejectionReason: '',
        refundAmount: 0,
        restockingFee: 0,
        shippingCost: 25,
        trackingNumber: 'RET123456789',
        returnShippingLabel: 'https://shipping.com/label/RET123456789.pdf',
        estimatedProcessingDays: 3,
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-13'),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date('2024-01-12T09:00:00'),
            description: 'تم تقديم طلب الاستبدال',
            updatedBy: 'customer',
          },
          {
            status: 'approved',
            timestamp: new Date('2024-01-13T14:30:00'),
            description: 'تم قبول طلب الاستبدال',
            updatedBy: 'admin',
          }
        ],
      },
      {
        id: 'RET003',
        orderId: 'ORD003',
        customerId: '3',
        customerName: 'محمد علي',
        productId: '3',
        productName: 'ماوس لاسلكي Logitech',
        quantity: 1,
        originalPrice: 150,
        reasonCode: 'changed_mind',
        reasonName: 'تغيير رأي',
        description: 'لم أعد بحاجة للمنتج',
        images: [],
        requestType: 'refund',
        status: 'completed',
        approvedBy: '1',
        approvedAt: new Date('2024-01-10T11:00:00'),
        rejectionReason: '',
        refundAmount: 135, // after restocking fee
        restockingFee: 15,
        shippingCost: 20,
        trackingNumber: 'RET987654321',
        returnShippingLabel: 'https://shipping.com/label/RET987654321.pdf',
        estimatedProcessingDays: 5,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-15'),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date('2024-01-08T16:00:00'),
            description: 'تم تقديم طلب الإرجاع',
            updatedBy: 'customer',
          },
          {
            status: 'approved',
            timestamp: new Date('2024-01-10T11:00:00'),
            description: 'تم قبول طلب الإرجاع',
            updatedBy: 'admin',
          },
          {
            status: 'processing',
            timestamp: new Date('2024-01-12T09:30:00'),
            description: 'تم استلام المنتج وبدء المعالجة',
            updatedBy: 'warehouse',
          },
          {
            status: 'completed',
            timestamp: new Date('2024-01-15T13:45:00'),
            description: 'تم إكمال الإرجاع وإرسال المبلغ',
            updatedBy: 'finance',
          }
        ],
      }
    ];

    mockReturns.forEach(returnRequest => {
      this.returns.set(returnRequest.id, returnRequest);
    });
  }

  /**
   * Create return request
   */
  async createReturnRequest(returnData) {
    try {
      const {
        orderId,
        customerId,
        customerName,
        productId,
        productName,
        quantity,
        originalPrice,
        reasonCode,
        description,
        images = [],
        requestType = 'refund', // refund or exchange
      } = returnData;

      // Get return reason
      const reason = Array.from(this.returnReasons.values())
        .find(r => r.code === reasonCode);

      if (!reason) {
        return {
          success: false,
          error: 'سبب الإرجاع غير صحيح'
        };
      }

      // Check if return is allowed for this reason and request type
      if (requestType === 'refund' && !reason.refundEligible) {
        return {
          success: false,
          error: 'الإرجاع غير مسموح لهذا السبب'
        };
      }

      if (requestType === 'exchange' && !reason.exchangeEligible) {
        return {
          success: false,
          error: 'الاستبدال غير مسموح لهذا السبب'
        };
      }

      // Get applicable policy (mock - in production, get from product category)
      const policy = Array.from(this.returnPolicies.values())[0]; // Default policy

      // Check if within return period (mock check)
      const orderDate = new Date('2024-01-01'); // Mock order date
      const daysSinceOrder = Math.ceil((new Date() - orderDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceOrder > policy.returnPeriodDays) {
        return {
          success: false,
          error: `فترة الإرجاع انتهت. يمكن الإرجاع خلال ${policy.returnPeriodDays} يوم من تاريخ الشراء`
        };
      }

      const returnRequest = {
        id: this.generateReturnId(),
        orderId,
        customerId,
        customerName,
        productId,
        productName,
        quantity,
        originalPrice,
        reasonCode,
        reasonName: reason.name,
        description,
        images,
        requestType,
        status: reason.autoApprove ? 'approved' : 'pending',
        approvedBy: reason.autoApprove ? 'system' : null,
        approvedAt: reason.autoApprove ? new Date() : null,
        rejectionReason: '',
        refundAmount: 0,
        restockingFee: 0,
        shippingCost: 0,
        trackingNumber: '',
        returnShippingLabel: '',
        estimatedProcessingDays: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeline: [
          {
            status: reason.autoApprove ? 'approved' : 'pending',
            timestamp: new Date(),
            description: reason.autoApprove ? 'تم قبول الطلب تلقائياً' : 'تم تقديم طلب الإرجاع',
            updatedBy: reason.autoApprove ? 'system' : 'customer',
          }
        ],
      };

      this.returns.set(returnRequest.id, returnRequest);

      return {
        success: true,
        data: returnRequest,
        message: reason.autoApprove ? 
          'تم قبول طلب الإرجاع تلقائياً' : 
          'تم تقديم طلب الإرجاع وهو في انتظار المراجعة'
      };
    } catch (error) {
      console.error('Error creating return request:', error);
      return {
        success: false,
        error: 'فشل في إنشاء طلب الإرجاع'
      };
    }
  }

  /**
   * Update return status
   */
  async updateReturnStatus(returnId, status, updatedBy, notes = '') {
    try {
      const returnRequest = this.returns.get(returnId);
      
      if (!returnRequest) {
        return {
          success: false,
          error: 'طلب الإرجاع غير موجود'
        };
      }

      const oldStatus = returnRequest.status;
      returnRequest.status = status;
      returnRequest.updatedAt = new Date();

      // Add to timeline
      returnRequest.timeline.push({
        status,
        timestamp: new Date(),
        description: notes || this.getStatusDescription(status),
        updatedBy,
      });

      // Handle specific status updates
      if (status === 'approved') {
        returnRequest.approvedBy = updatedBy;
        returnRequest.approvedAt = new Date();
        
        // Generate shipping label for return
        returnRequest.trackingNumber = this.generateTrackingNumber();
        returnRequest.returnShippingLabel = `https://shipping.com/label/${returnRequest.trackingNumber}.pdf`;
        
        // Calculate refund amount if applicable
        if (returnRequest.requestType === 'refund') {
          this.calculateRefundAmount(returnRequest);
        }
      } else if (status === 'rejected') {
        returnRequest.rejectionReason = notes;
      } else if (status === 'completed' && returnRequest.requestType === 'refund') {
        // Process refund
        await this.processRefund(returnRequest);
      }

      this.returns.set(returnId, returnRequest);

      return {
        success: true,
        data: returnRequest,
        message: `تم تحديث حالة الطلب إلى: ${this.getStatusText(status)}`
      };
    } catch (error) {
      console.error('Error updating return status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة الطلب'
      };
    }
  }

  /**
   * Get return requests
   */
  async getReturnRequests(filters = {}) {
    try {
      let returns = Array.from(this.returns.values());

      // Apply filters
      if (filters.status) {
        returns = returns.filter(r => r.status === filters.status);
      }

      if (filters.customerId) {
        returns = returns.filter(r => r.customerId === filters.customerId);
      }

      if (filters.requestType) {
        returns = returns.filter(r => r.requestType === filters.requestType);
      }

      if (filters.reasonCode) {
        returns = returns.filter(r => r.reasonCode === filters.reasonCode);
      }

      // Sort by creation date (newest first)
      returns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedReturns = returns.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedReturns,
        pagination: {
          page,
          limit,
          total: returns.length,
          pages: Math.ceil(returns.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting return requests:', error);
      return {
        success: false,
        error: 'فشل في جلب طلبات الإرجاع'
      };
    }
  }

  /**
   * Get return policies
   */
  async getReturnPolicies() {
    try {
      const policies = Array.from(this.returnPolicies.values())
        .filter(policy => policy.isActive);

      return {
        success: true,
        data: policies
      };
    } catch (error) {
      console.error('Error getting return policies:', error);
      return {
        success: false,
        error: 'فشل في جلب سياسات الإرجاع'
      };
    }
  }

  /**
   * Get return reasons
   */
  async getReturnReasons() {
    try {
      const reasons = Array.from(this.returnReasons.values());

      return {
        success: true,
        data: reasons
      };
    } catch (error) {
      console.error('Error getting return reasons:', error);
      return {
        success: false,
        error: 'فشل في جلب أسباب الإرجاع'
      };
    }
  }

  /**
   * Get return statistics
   */
  async getReturnStats() {
    try {
      const returns = Array.from(this.returns.values());
      const refunds = Array.from(this.refunds.values());

      const stats = {
        totalReturns: returns.length,
        pendingReturns: returns.filter(r => r.status === 'pending').length,
        approvedReturns: returns.filter(r => r.status === 'approved').length,
        completedReturns: returns.filter(r => r.status === 'completed').length,
        rejectedReturns: returns.filter(r => r.status === 'rejected').length,
        totalRefunds: refunds.length,
        totalRefundAmount: refunds.reduce((sum, refund) => sum + refund.amount, 0),
        returnRate: this.calculateReturnRate(),
        averageProcessingTime: this.calculateAverageProcessingTime(returns),
        topReturnReasons: this.getTopReturnReasons(returns),
        returnsByType: {
          refund: returns.filter(r => r.requestType === 'refund').length,
          exchange: returns.filter(r => r.requestType === 'exchange').length,
        },
        monthlyTrend: this.getMonthlyReturnTrend(),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting return stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الإرجاع'
      };
    }
  }

  /**
   * Helper methods
   */
  calculateRefundAmount(returnRequest) {
    const policy = Array.from(this.returnPolicies.values())[0]; // Mock policy
    
    let refundAmount = returnRequest.originalPrice * returnRequest.quantity;
    
    // Apply restocking fee if applicable
    if (policy.restockingFee > 0) {
      const restockingFee = (refundAmount * policy.restockingFee) / 100;
      returnRequest.restockingFee = restockingFee;
      refundAmount -= restockingFee;
    }
    
    // Handle shipping cost
    if (policy.shippingCostResponsibility === 'customer') {
      returnRequest.shippingCost = 25; // Mock shipping cost
      refundAmount -= returnRequest.shippingCost;
    }
    
    returnRequest.refundAmount = Math.max(0, refundAmount);
  }

  async processRefund(returnRequest) {
    const refund = {
      id: this.generateRefundId(),
      returnId: returnRequest.id,
      orderId: returnRequest.orderId,
      customerId: returnRequest.customerId,
      amount: returnRequest.refundAmount,
      method: 'original_payment', // original_payment, bank_transfer, store_credit
      status: 'processed',
      processedAt: new Date(),
      transactionId: this.generateTransactionId(),
      notes: 'تم إرجاع المبلغ للطريقة الأصلية للدفع',
    };

    this.refunds.set(refund.id, refund);
    return refund;
  }

  calculateReturnRate() {
    // Mock calculation - in production, calculate based on total orders
    const totalOrders = 1000; // Mock total orders
    const totalReturns = this.returns.size;
    return ((totalReturns / totalOrders) * 100).toFixed(1);
  }

  calculateAverageProcessingTime(returns) {
    const completedReturns = returns.filter(r => r.status === 'completed');
    
    if (completedReturns.length === 0) return 0;
    
    const totalDays = completedReturns.reduce((sum, returnRequest) => {
      const createdDate = new Date(returnRequest.createdAt);
      const completedEvent = returnRequest.timeline.find(t => t.status === 'completed');
      
      if (completedEvent) {
        const completedDate = new Date(completedEvent.timestamp);
        const daysDiff = Math.ceil((completedDate - createdDate) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }
      
      return sum;
    }, 0);
    
    return Math.round(totalDays / completedReturns.length);
  }

  getTopReturnReasons(returns) {
    const reasonCounts = {};
    
    returns.forEach(returnRequest => {
      reasonCounts[returnRequest.reasonName] = (reasonCounts[returnRequest.reasonName] || 0) + 1;
    });
    
    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getMonthlyReturnTrend() {
    // Mock monthly trend data
    return [
      { month: 'يناير', returns: 25, refunds: 20 },
      { month: 'فبراير', returns: 18, refunds: 15 },
      { month: 'مارس', returns: 22, refunds: 18 },
    ];
  }

  getStatusDescription(status) {
    const descriptions = {
      pending: 'في انتظار المراجعة',
      approved: 'تم قبول الطلب',
      rejected: 'تم رفض الطلب',
      processing: 'جاري المعالجة',
      completed: 'تم إكمال الطلب',
      cancelled: 'تم إلغاء الطلب',
    };
    
    return descriptions[status] || 'تحديث الحالة';
  }

  getStatusText(status) {
    const statusTexts = {
      pending: 'في الانتظار',
      approved: 'مقبول',
      rejected: 'مرفوض',
      processing: 'قيد المعالجة',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    
    return statusTexts[status] || status;
  }

  generateReturnId() {
    return `RET${Date.now().toString(36).toUpperCase()}`;
  }

  generateRefundId() {
    return `REF${Date.now().toString(36).toUpperCase()}`;
  }

  generateTrackingNumber() {
    return `RET${Date.now().toString().slice(-9)}`;
  }

  generateTransactionId() {
    return `TXN${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ReturnService();
