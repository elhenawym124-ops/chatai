/**
 * Customer Lifetime Value (CLV) Service
 * 
 * Calculates and analyzes customer lifetime value with various metrics
 */

class CLVService {
  constructor() {
    this.customers = new Map(); // Mock customer data
    this.orders = new Map(); // Mock order data
    this.initializeMockData();
  }

  /**
   * Initialize mock data for CLV calculations
   */
  initializeMockData() {
    // Mock customers with purchase history
    const mockCustomers = [
      {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        firstPurchaseDate: new Date('2023-01-15'),
        lastPurchaseDate: new Date('2024-01-10'),
        totalOrders: 12,
        totalSpent: 15750,
        averageOrderValue: 1312.5,
        purchaseFrequency: 0.8, // orders per month
        segment: 'VIP',
        status: 'active',
        acquisitionCost: 150,
        acquisitionChannel: 'facebook',
      },
      {
        id: '2',
        name: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '+966507654321',
        firstPurchaseDate: new Date('2023-06-20'),
        lastPurchaseDate: new Date('2024-01-05'),
        totalOrders: 6,
        totalSpent: 8400,
        averageOrderValue: 1400,
        purchaseFrequency: 0.9,
        segment: 'متكرر',
        status: 'active',
        acquisitionCost: 120,
        acquisitionChannel: 'whatsapp',
      },
      {
        id: '3',
        name: 'محمد علي',
        email: 'mohammed@example.com',
        phone: '+966509876543',
        firstPurchaseDate: new Date('2023-03-10'),
        lastPurchaseDate: new Date('2023-12-20'),
        totalOrders: 3,
        totalSpent: 2100,
        averageOrderValue: 700,
        purchaseFrequency: 0.3,
        segment: 'جديد',
        status: 'inactive',
        acquisitionCost: 80,
        acquisitionChannel: 'organic',
      },
      {
        id: '4',
        name: 'فاطمة حسن',
        email: 'fatima@example.com',
        phone: '+966502468135',
        firstPurchaseDate: new Date('2022-08-15'),
        lastPurchaseDate: new Date('2024-01-08'),
        totalOrders: 18,
        totalSpent: 24300,
        averageOrderValue: 1350,
        purchaseFrequency: 1.2,
        segment: 'VIP',
        status: 'active',
        acquisitionCost: 200,
        acquisitionChannel: 'referral',
      }
    ];

    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });
  }

  /**
   * Calculate Customer Lifetime Value using multiple methods
   */
  async calculateCLV(customerId, method = 'predictive') {
    try {
      const customer = this.customers.get(customerId);
      if (!customer) {
        return {
          success: false,
          error: 'العميل غير موجود'
        };
      }

      let clv;
      let details = {};

      switch (method) {
        case 'historical':
          clv = this.calculateHistoricalCLV(customer);
          break;
        case 'predictive':
          clv = this.calculatePredictiveCLV(customer);
          break;
        case 'traditional':
          clv = this.calculateTraditionalCLV(customer);
          break;
        default:
          clv = this.calculatePredictiveCLV(customer);
      }

      // Calculate additional metrics
      details = {
        ...clv,
        roi: this.calculateROI(customer, clv.value),
        paybackPeriod: this.calculatePaybackPeriod(customer),
        riskScore: this.calculateChurnRisk(customer),
        segment: this.determineSegment(customer, clv.value),
        recommendations: this.generateRecommendations(customer, clv.value),
      };

      return {
        success: true,
        data: {
          customerId,
          customerName: customer.name,
          method,
          clv: details,
          calculatedAt: new Date(),
        }
      };
    } catch (error) {
      console.error('Error calculating CLV:', error);
      return {
        success: false,
        error: 'فشل في حساب قيمة العميل'
      };
    }
  }

  /**
   * Historical CLV - based on actual past purchases
   */
  calculateHistoricalCLV(customer) {
    const monthsActive = this.getMonthsActive(customer);
    const monthlyValue = customer.totalSpent / monthsActive;

    return {
      value: customer.totalSpent,
      monthlyValue,
      monthsActive,
      method: 'historical',
      confidence: 100, // Historical data is 100% accurate
    };
  }

  /**
   * Predictive CLV - forecasts future value
   */
  calculatePredictiveCLV(customer) {
    const monthsActive = this.getMonthsActive(customer);
    const monthlyValue = customer.totalSpent / monthsActive;
    const churnRate = this.estimateChurnRate(customer);
    const expectedLifetime = 1 / churnRate; // months
    
    // Predictive CLV = Monthly Value × Expected Lifetime
    const predictedValue = monthlyValue * expectedLifetime;
    
    return {
      value: Math.round(predictedValue),
      monthlyValue: Math.round(monthlyValue),
      expectedLifetime: Math.round(expectedLifetime),
      churnRate: Math.round(churnRate * 100) / 100,
      method: 'predictive',
      confidence: this.calculateConfidence(customer),
    };
  }

  /**
   * Traditional CLV - simple formula
   */
  calculateTraditionalCLV(customer) {
    // CLV = (Average Order Value × Purchase Frequency × Gross Margin × Lifespan)
    const grossMargin = 0.3; // 30% margin
    const estimatedLifespan = 24; // 24 months
    
    const clvValue = customer.averageOrderValue * 
                     customer.purchaseFrequency * 
                     grossMargin * 
                     estimatedLifespan;

    return {
      value: Math.round(clvValue),
      averageOrderValue: customer.averageOrderValue,
      purchaseFrequency: customer.purchaseFrequency,
      grossMargin,
      estimatedLifespan,
      method: 'traditional',
      confidence: 75,
    };
  }

  /**
   * Calculate ROI (Return on Investment)
   */
  calculateROI(customer, clv) {
    const roi = ((clv - customer.acquisitionCost) / customer.acquisitionCost) * 100;
    return {
      value: Math.round(roi),
      acquisitionCost: customer.acquisitionCost,
      netValue: clv - customer.acquisitionCost,
    };
  }

  /**
   * Calculate payback period
   */
  calculatePaybackPeriod(customer) {
    const monthsActive = this.getMonthsActive(customer);
    const monthlyValue = customer.totalSpent / monthsActive;
    const paybackMonths = customer.acquisitionCost / monthlyValue;
    
    return {
      months: Math.round(paybackMonths * 10) / 10,
      achieved: customer.totalSpent >= customer.acquisitionCost,
    };
  }

  /**
   * Calculate churn risk score
   */
  calculateChurnRisk(customer) {
    let riskScore = 0;
    
    // Days since last purchase
    const daysSinceLastPurchase = (new Date() - customer.lastPurchaseDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPurchase > 90) riskScore += 30;
    else if (daysSinceLastPurchase > 60) riskScore += 20;
    else if (daysSinceLastPurchase > 30) riskScore += 10;
    
    // Purchase frequency
    if (customer.purchaseFrequency < 0.5) riskScore += 25;
    else if (customer.purchaseFrequency < 1) riskScore += 15;
    
    // Order count
    if (customer.totalOrders < 3) riskScore += 20;
    else if (customer.totalOrders < 6) riskScore += 10;
    
    // Status
    if (customer.status === 'inactive') riskScore += 25;
    
    return {
      score: Math.min(riskScore, 100),
      level: riskScore > 70 ? 'عالي' : riskScore > 40 ? 'متوسط' : 'منخفض',
      factors: this.getChurnFactors(customer, daysSinceLastPurchase),
    };
  }

  /**
   * Determine customer segment based on CLV
   */
  determineSegment(customer, clv) {
    if (clv > 20000) return 'VIP';
    if (clv > 10000) return 'متكرر';
    if (clv > 5000) return 'واعد';
    if (clv > 1000) return 'جديد';
    return 'محتمل';
  }

  /**
   * Generate recommendations based on CLV analysis
   */
  generateRecommendations(customer, clv) {
    const recommendations = [];
    
    if (clv > 15000) {
      recommendations.push({
        type: 'retention',
        priority: 'high',
        action: 'برنامج ولاء VIP',
        description: 'تقديم خصومات حصرية وخدمة عملاء مميزة'
      });
    }
    
    if (customer.purchaseFrequency < 0.5) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        action: 'حملة إعادة تفعيل',
        description: 'إرسال عروض مخصصة لزيادة تكرار الشراء'
      });
    }
    
    const daysSinceLastPurchase = (new Date() - customer.lastPurchaseDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastPurchase > 60) {
      recommendations.push({
        type: 'winback',
        priority: 'high',
        action: 'حملة استرداد',
        description: 'التواصل الفوري مع عروض جذابة'
      });
    }
    
    if (customer.averageOrderValue < 1000) {
      recommendations.push({
        type: 'upsell',
        priority: 'medium',
        action: 'زيادة قيمة الطلب',
        description: 'اقتراح منتجات مكملة أو ترقيات'
      });
    }
    
    return recommendations;
  }

  /**
   * Get CLV analysis for all customers
   */
  async getCLVAnalysis(filters = {}) {
    try {
      const customers = Array.from(this.customers.values());
      const analysis = [];
      
      for (const customer of customers) {
        const clvResult = await this.calculateCLV(customer.id, 'predictive');
        if (clvResult.success) {
          analysis.push(clvResult.data);
        }
      }
      
      // Apply filters
      let filteredAnalysis = analysis;
      if (filters.segment) {
        filteredAnalysis = analysis.filter(item => item.clv.segment === filters.segment);
      }
      
      if (filters.minCLV) {
        filteredAnalysis = analysis.filter(item => item.clv.value >= filters.minCLV);
      }
      
      // Sort by CLV value (highest first)
      filteredAnalysis.sort((a, b) => b.clv.value - a.clv.value);
      
      // Calculate summary statistics
      const summary = this.calculateSummaryStats(filteredAnalysis);
      
      return {
        success: true,
        data: {
          customers: filteredAnalysis,
          summary,
          totalCustomers: filteredAnalysis.length,
        }
      };
    } catch (error) {
      console.error('Error getting CLV analysis:', error);
      return {
        success: false,
        error: 'فشل في تحليل قيمة العملاء'
      };
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats(analysis) {
    if (analysis.length === 0) return {};
    
    const clvValues = analysis.map(item => item.clv.value);
    const totalCLV = clvValues.reduce((sum, value) => sum + value, 0);
    const averageCLV = totalCLV / analysis.length;
    const medianCLV = this.calculateMedian(clvValues);
    
    // Segment distribution
    const segments = {};
    analysis.forEach(item => {
      const segment = item.clv.segment;
      segments[segment] = (segments[segment] || 0) + 1;
    });
    
    return {
      totalCLV: Math.round(totalCLV),
      averageCLV: Math.round(averageCLV),
      medianCLV: Math.round(medianCLV),
      highestCLV: Math.max(...clvValues),
      lowestCLV: Math.min(...clvValues),
      segments,
    };
  }

  /**
   * Helper methods
   */
  getMonthsActive(customer) {
    const months = (new Date() - customer.firstPurchaseDate) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(months, 1); // At least 1 month
  }

  estimateChurnRate(customer) {
    // Simple churn rate estimation based on purchase frequency
    const baseChurnRate = 0.05; // 5% monthly base rate
    const frequencyFactor = Math.max(0.01, 1 / customer.purchaseFrequency);
    return Math.min(baseChurnRate * frequencyFactor, 0.5);
  }

  calculateConfidence(customer) {
    let confidence = 50; // Base confidence
    
    // More orders = higher confidence
    confidence += Math.min(customer.totalOrders * 2, 30);
    
    // Longer history = higher confidence
    const monthsActive = this.getMonthsActive(customer);
    confidence += Math.min(monthsActive, 20);
    
    return Math.min(confidence, 95);
  }

  getChurnFactors(customer, daysSinceLastPurchase) {
    const factors = [];
    
    if (daysSinceLastPurchase > 90) {
      factors.push('لم يشتري منذ أكثر من 3 أشهر');
    }
    
    if (customer.purchaseFrequency < 0.5) {
      factors.push('تكرار شراء منخفض');
    }
    
    if (customer.totalOrders < 3) {
      factors.push('عدد طلبات قليل');
    }
    
    if (customer.status === 'inactive') {
      factors.push('حالة العميل غير نشط');
    }
    
    return factors;
  }

  calculateMedian(values) {
    const sorted = values.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }
}

module.exports = new CLVService();
