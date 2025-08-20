/**
 * Discount and Coupon Service
 * 
 * Handles discount codes, coupons, and promotional offers
 */

class DiscountService {
  constructor() {
    this.coupons = new Map(); // Active coupons
    this.usageHistory = new Map(); // Coupon usage history
    this.promotions = new Map(); // Active promotions
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock coupons
    const mockCoupons = [
      {
        id: 'WELCOME10',
        name: 'خصم الترحيب',
        description: 'خصم 10% للعملاء الجدد',
        type: 'percentage',
        value: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 500,
        usageLimit: 1000,
        usageCount: 245,
        userUsageLimit: 1,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-12-31'),
        isActive: true,
        applicableProducts: [], // Empty means all products
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: [],
        customerSegments: ['new'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      },
      {
        id: 'SAVE50',
        name: 'وفر 50 ريال',
        description: 'خصم 50 ريال على الطلبات أكثر من 300 ريال',
        type: 'fixed',
        value: 50,
        minOrderAmount: 300,
        maxDiscountAmount: 50,
        usageLimit: 500,
        usageCount: 89,
        userUsageLimit: 3,
        validFrom: new Date('2024-01-15'),
        validTo: new Date('2024-02-15'),
        isActive: true,
        applicableProducts: [],
        applicableCategories: ['أجهزة كمبيوتر', 'هواتف ذكية'],
        excludedProducts: [],
        excludedCategories: [],
        customerSegments: ['all'],
        createdAt: new Date('2024-01-15'),
        createdBy: 'admin',
      },
      {
        id: 'VIP20',
        name: 'خصم VIP',
        description: 'خصم 20% حصري للعملاء المميزين',
        type: 'percentage',
        value: 20,
        minOrderAmount: 500,
        maxDiscountAmount: 1000,
        usageLimit: 100,
        usageCount: 23,
        userUsageLimit: 5,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-06-30'),
        isActive: true,
        applicableProducts: [],
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: [],
        customerSegments: ['VIP'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      },
      {
        id: 'FREESHIP',
        name: 'شحن مجاني',
        description: 'شحن مجاني على جميع الطلبات',
        type: 'free_shipping',
        value: 0,
        minOrderAmount: 200,
        maxDiscountAmount: 50,
        usageLimit: 2000,
        usageCount: 567,
        userUsageLimit: 10,
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-03-31'),
        isActive: true,
        applicableProducts: [],
        applicableCategories: [],
        excludedProducts: [],
        excludedCategories: [],
        customerSegments: ['all'],
        createdAt: new Date('2024-01-01'),
        createdBy: 'admin',
      }
    ];

    mockCoupons.forEach(coupon => {
      this.coupons.set(coupon.id, coupon);
    });

    // Mock usage history
    const mockUsage = [
      {
        id: 'USAGE_001',
        couponId: 'WELCOME10',
        customerId: '1',
        orderId: 'ORD-001',
        discountAmount: 450,
        originalAmount: 4500,
        finalAmount: 4050,
        usedAt: new Date('2024-01-10'),
      },
      {
        id: 'USAGE_002',
        couponId: 'SAVE50',
        customerId: '2',
        orderId: 'ORD-002',
        discountAmount: 50,
        originalAmount: 5700,
        finalAmount: 5650,
        usedAt: new Date('2024-01-15'),
      }
    ];

    mockUsage.forEach(usage => {
      this.usageHistory.set(usage.id, usage);
    });
  }

  /**
   * Validate coupon
   */
  async validateCoupon(couponCode, customerId, orderData) {
    try {
      const coupon = this.coupons.get(couponCode.toUpperCase());
      
      if (!coupon) {
        return {
          success: false,
          error: 'كود الخصم غير موجود'
        };
      }

      if (!coupon.isActive) {
        return {
          success: false,
          error: 'كود الخصم غير نشط'
        };
      }

      // Check validity period
      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return {
          success: false,
          error: 'كود الخصم منتهي الصلاحية'
        };
      }

      // Check usage limits
      if (coupon.usageCount >= coupon.usageLimit) {
        return {
          success: false,
          error: 'تم استنفاد استخدامات كود الخصم'
        };
      }

      // Check user usage limit
      const userUsageCount = this.getUserCouponUsage(customerId, couponCode);
      if (userUsageCount >= coupon.userUsageLimit) {
        return {
          success: false,
          error: 'تم تجاوز الحد المسموح لاستخدام هذا الكود'
        };
      }

      // Check minimum order amount
      if (orderData.subtotal < coupon.minOrderAmount) {
        return {
          success: false,
          error: `الحد الأدنى للطلب ${coupon.minOrderAmount} ريال`
        };
      }

      // Check customer segment eligibility
      if (!this.isCustomerEligible(customerId, coupon.customerSegments)) {
        return {
          success: false,
          error: 'هذا الكود غير متاح لفئتك'
        };
      }

      // Check product/category restrictions
      const eligibleItems = this.getEligibleItems(orderData.items, coupon);
      if (eligibleItems.length === 0) {
        return {
          success: false,
          error: 'لا توجد منتجات مؤهلة لهذا الخصم'
        };
      }

      // Calculate discount
      const discountCalculation = this.calculateDiscount(coupon, orderData, eligibleItems);

      return {
        success: true,
        data: {
          coupon: {
            id: coupon.id,
            name: coupon.name,
            description: coupon.description,
            type: coupon.type,
            value: coupon.value,
          },
          discount: discountCalculation,
          eligibleItems: eligibleItems.length,
          totalItems: orderData.items.length,
        }
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        success: false,
        error: 'فشل في التحقق من كود الخصم'
      };
    }
  }

  /**
   * Apply coupon to order
   */
  async applyCoupon(couponCode, customerId, orderData) {
    try {
      const validation = await this.validateCoupon(couponCode, customerId, orderData);
      
      if (!validation.success) {
        return validation;
      }

      const coupon = this.coupons.get(couponCode.toUpperCase());
      const discountCalculation = validation.data.discount;

      // Create usage record
      const usage = {
        id: this.generateUsageId(),
        couponId: coupon.id,
        customerId,
        orderId: orderData.orderId || null,
        discountAmount: discountCalculation.amount,
        shippingDiscount: discountCalculation.shippingDiscount || 0,
        originalAmount: orderData.subtotal,
        finalAmount: orderData.subtotal - discountCalculation.amount,
        usedAt: new Date(),
        couponData: {
          name: coupon.name,
          type: coupon.type,
          value: coupon.value,
        }
      };

      this.usageHistory.set(usage.id, usage);

      // Update coupon usage count
      coupon.usageCount++;
      this.coupons.set(coupon.id, coupon);

      return {
        success: true,
        data: {
          usageId: usage.id,
          discountAmount: discountCalculation.amount,
          shippingDiscount: discountCalculation.shippingDiscount || 0,
          finalAmount: usage.finalAmount,
          coupon: {
            id: coupon.id,
            name: coupon.name,
            type: coupon.type,
          }
        },
        message: 'تم تطبيق كود الخصم بنجاح'
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return {
        success: false,
        error: 'فشل في تطبيق كود الخصم'
      };
    }
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(coupon, orderData, eligibleItems) {
    let discountAmount = 0;
    let shippingDiscount = 0;

    if (coupon.type === 'free_shipping') {
      shippingDiscount = Math.min(orderData.shipping || 0, coupon.maxDiscountAmount);
      return {
        amount: 0,
        shippingDiscount,
        type: 'free_shipping',
        appliedTo: 'shipping'
      };
    }

    // Calculate eligible amount
    const eligibleAmount = eligibleItems.reduce((sum, item) => sum + item.total, 0);

    if (coupon.type === 'percentage') {
      discountAmount = (eligibleAmount * coupon.value) / 100;
    } else if (coupon.type === 'fixed') {
      discountAmount = coupon.value;
    }

    // Apply maximum discount limit
    if (coupon.maxDiscountAmount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }

    // Don't exceed eligible amount
    discountAmount = Math.min(discountAmount, eligibleAmount);

    return {
      amount: Math.round(discountAmount * 100) / 100,
      shippingDiscount: 0,
      type: coupon.type,
      appliedTo: 'products',
      eligibleAmount,
      percentage: coupon.type === 'percentage' ? coupon.value : null,
    };
  }

  /**
   * Get eligible items for coupon
   */
  getEligibleItems(items, coupon) {
    return items.filter(item => {
      // Check if product is excluded
      if (coupon.excludedProducts.includes(item.productId)) {
        return false;
      }

      // Check if category is excluded
      if (coupon.excludedCategories.includes(item.category)) {
        return false;
      }

      // If specific products are defined, check inclusion
      if (coupon.applicableProducts.length > 0) {
        return coupon.applicableProducts.includes(item.productId);
      }

      // If specific categories are defined, check inclusion
      if (coupon.applicableCategories.length > 0) {
        return coupon.applicableCategories.includes(item.category);
      }

      // If no restrictions, all items are eligible
      return true;
    });
  }

  /**
   * Check if customer is eligible for coupon
   */
  isCustomerEligible(customerId, customerSegments) {
    if (customerSegments.includes('all')) {
      return true;
    }

    // Mock customer segment check
    // In real implementation, this would check customer data
    const customerSegment = this.getCustomerSegment(customerId);
    return customerSegments.includes(customerSegment);
  }

  /**
   * Get customer segment (mock implementation)
   */
  getCustomerSegment(customerId) {
    // Mock implementation - in real app, this would query customer data
    const segments = {
      '1': 'VIP',
      '2': 'regular',
      '3': 'new',
    };
    return segments[customerId] || 'new';
  }

  /**
   * Get user coupon usage count
   */
  getUserCouponUsage(customerId, couponCode) {
    const usages = Array.from(this.usageHistory.values());
    return usages.filter(usage => 
      usage.customerId === customerId && 
      usage.couponId === couponCode.toUpperCase()
    ).length;
  }

  /**
   * Create new coupon
   */
  async createCoupon(couponData) {
    try {
      const coupon = {
        id: couponData.code.toUpperCase(),
        name: couponData.name,
        description: couponData.description,
        type: couponData.type,
        value: couponData.value,
        minOrderAmount: couponData.minOrderAmount || 0,
        maxDiscountAmount: couponData.maxDiscountAmount || 0,
        usageLimit: couponData.usageLimit || 1000,
        usageCount: 0,
        userUsageLimit: couponData.userUsageLimit || 1,
        validFrom: new Date(couponData.validFrom),
        validTo: new Date(couponData.validTo),
        isActive: couponData.isActive !== false,
        applicableProducts: couponData.applicableProducts || [],
        applicableCategories: couponData.applicableCategories || [],
        excludedProducts: couponData.excludedProducts || [],
        excludedCategories: couponData.excludedCategories || [],
        customerSegments: couponData.customerSegments || ['all'],
        createdAt: new Date(),
        createdBy: couponData.createdBy || 'admin',
      };

      // Check if coupon code already exists
      if (this.coupons.has(coupon.id)) {
        return {
          success: false,
          error: 'كود الخصم موجود مسبقاً'
        };
      }

      this.coupons.set(coupon.id, coupon);

      return {
        success: true,
        data: coupon,
        message: 'تم إنشاء كود الخصم بنجاح'
      };
    } catch (error) {
      console.error('Error creating coupon:', error);
      return {
        success: false,
        error: 'فشل في إنشاء كود الخصم'
      };
    }
  }

  /**
   * Get all coupons
   */
  async getCoupons(filters = {}) {
    try {
      let coupons = Array.from(this.coupons.values());

      // Apply filters
      if (filters.isActive !== undefined) {
        coupons = coupons.filter(c => c.isActive === filters.isActive);
      }

      if (filters.type) {
        coupons = coupons.filter(c => c.type === filters.type);
      }

      if (filters.customerSegment) {
        coupons = coupons.filter(c => 
          c.customerSegments.includes(filters.customerSegment) || 
          c.customerSegments.includes('all')
        );
      }

      // Sort by creation date (newest first)
      coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        data: coupons,
        total: coupons.length
      };
    } catch (error) {
      console.error('Error getting coupons:', error);
      return {
        success: false,
        error: 'فشل في جلب أكواد الخصم'
      };
    }
  }

  /**
   * Get coupon usage history
   */
  async getCouponUsage(filters = {}) {
    try {
      let usages = Array.from(this.usageHistory.values());

      // Apply filters
      if (filters.couponId) {
        usages = usages.filter(u => u.couponId === filters.couponId);
      }

      if (filters.customerId) {
        usages = usages.filter(u => u.customerId === filters.customerId);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        usages = usages.filter(u => u.usedAt >= fromDate);
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        usages = usages.filter(u => u.usedAt <= toDate);
      }

      // Sort by usage date (newest first)
      usages.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedUsages = usages.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedUsages,
        pagination: {
          page,
          limit,
          total: usages.length,
          pages: Math.ceil(usages.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting coupon usage:', error);
      return {
        success: false,
        error: 'فشل في جلب سجل استخدام الكوبونات'
      };
    }
  }

  /**
   * Get discount statistics
   */
  async getDiscountStats() {
    try {
      const coupons = Array.from(this.coupons.values());
      const usages = Array.from(this.usageHistory.values());

      const stats = {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.isActive).length,
        totalUsages: usages.length,
        totalDiscountAmount: usages.reduce((sum, u) => sum + u.discountAmount, 0),
        totalShippingDiscount: usages.reduce((sum, u) => sum + (u.shippingDiscount || 0), 0),
        averageDiscountAmount: 0,
        topCoupons: [],
      };

      if (stats.totalUsages > 0) {
        stats.averageDiscountAmount = stats.totalDiscountAmount / stats.totalUsages;
      }

      // Calculate top performing coupons
      const couponUsageStats = {};
      usages.forEach(usage => {
        if (!couponUsageStats[usage.couponId]) {
          couponUsageStats[usage.couponId] = {
            couponId: usage.couponId,
            usageCount: 0,
            totalDiscount: 0,
          };
        }
        couponUsageStats[usage.couponId].usageCount++;
        couponUsageStats[usage.couponId].totalDiscount += usage.discountAmount;
      });

      stats.topCoupons = Object.values(couponUsageStats)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting discount stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الخصومات'
      };
    }
  }

  /**
   * Generate usage ID
   */
  generateUsageId() {
    return `USAGE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}

module.exports = new DiscountService();
