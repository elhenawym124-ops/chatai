/**
 * Shipping and Tracking Service
 * 
 * Handles shipping calculations, carrier integration, and real-time tracking
 */

class ShippingService {
  constructor() {
    this.carriers = new Map(); // Shipping carriers
    this.shippingRates = new Map(); // Shipping rates
    this.trackingData = new Map(); // Tracking information
    this.shippingZones = new Map(); // Shipping zones
    this.deliveryMethods = new Map(); // Delivery methods
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock shipping carriers
    const mockCarriers = [
      {
        id: 'CARRIER001',
        name: 'شركة الشحن السريع',
        code: 'FAST_SHIP',
        isActive: true,
        supportedServices: ['standard', 'express', 'overnight'],
        trackingUrl: 'https://fastship.com/track/{tracking_number}',
        apiEndpoint: 'https://api.fastship.com/v1',
        apiKey: 'mock-api-key',
        deliveryTime: {
          standard: '3-5 أيام عمل',
          express: '1-2 أيام عمل',
          overnight: '24 ساعة',
        },
        coverage: ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'],
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CARRIER002',
        name: 'البريد السعودي',
        code: 'SAUDI_POST',
        isActive: true,
        supportedServices: ['standard', 'registered'],
        trackingUrl: 'https://saudipost.com.sa/track/{tracking_number}',
        apiEndpoint: 'https://api.saudipost.com.sa/v1',
        apiKey: 'mock-api-key',
        deliveryTime: {
          standard: '5-7 أيام عمل',
          registered: '3-5 أيام عمل',
        },
        coverage: ['جميع مناطق المملكة'],
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CARRIER003',
        name: 'أرامكس',
        code: 'ARAMEX',
        isActive: true,
        supportedServices: ['standard', 'express', 'same_day'],
        trackingUrl: 'https://www.aramex.com/track/{tracking_number}',
        apiEndpoint: 'https://api.aramex.com/v1',
        apiKey: 'mock-api-key',
        deliveryTime: {
          standard: '2-4 أيام عمل',
          express: '1-2 أيام عمل',
          same_day: 'نفس اليوم',
        },
        coverage: ['المدن الرئيسية'],
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockCarriers.forEach(carrier => {
      this.carriers.set(carrier.id, carrier);
    });

    // Mock shipping zones
    const mockZones = [
      {
        id: 'ZONE001',
        name: 'المنطقة الوسطى',
        cities: ['الرياض', 'القصيم', 'حائل'],
        baseRate: 15,
        weightMultiplier: 2,
        isActive: true,
      },
      {
        id: 'ZONE002',
        name: 'المنطقة الغربية',
        cities: ['جدة', 'مكة', 'المدينة', 'الطائف'],
        baseRate: 20,
        weightMultiplier: 2.5,
        isActive: true,
      },
      {
        id: 'ZONE003',
        name: 'المنطقة الشرقية',
        cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء'],
        baseRate: 25,
        weightMultiplier: 3,
        isActive: true,
      },
      {
        id: 'ZONE004',
        name: 'المناطق الأخرى',
        cities: ['أبها', 'جازان', 'تبوك', 'عرعر'],
        baseRate: 30,
        weightMultiplier: 3.5,
        isActive: true,
      }
    ];

    mockZones.forEach(zone => {
      this.shippingZones.set(zone.id, zone);
    });

    // Mock delivery methods
    const mockMethods = [
      {
        id: 'METHOD001',
        name: 'توصيل عادي',
        code: 'standard',
        description: 'توصيل خلال 3-5 أيام عمل',
        priceMultiplier: 1.0,
        isActive: true,
        minDeliveryDays: 3,
        maxDeliveryDays: 5,
      },
      {
        id: 'METHOD002',
        name: 'توصيل سريع',
        code: 'express',
        description: 'توصيل خلال 1-2 أيام عمل',
        priceMultiplier: 1.5,
        isActive: true,
        minDeliveryDays: 1,
        maxDeliveryDays: 2,
      },
      {
        id: 'METHOD003',
        name: 'توصيل فوري',
        code: 'same_day',
        description: 'توصيل في نفس اليوم',
        priceMultiplier: 2.5,
        isActive: true,
        minDeliveryDays: 0,
        maxDeliveryDays: 0,
      }
    ];

    mockMethods.forEach(method => {
      this.deliveryMethods.set(method.id, method);
    });

    // Mock tracking data
    const mockTracking = [
      {
        trackingNumber: 'FS123456789',
        orderId: 'ORD001',
        carrierId: 'CARRIER001',
        carrierName: 'شركة الشحن السريع',
        status: 'in_transit',
        estimatedDelivery: new Date('2024-01-20'),
        currentLocation: 'مركز توزيع الرياض',
        events: [
          {
            timestamp: new Date('2024-01-15T10:00:00'),
            status: 'picked_up',
            location: 'المستودع الرئيسي',
            description: 'تم استلام الطرد من المرسل',
          },
          {
            timestamp: new Date('2024-01-15T14:30:00'),
            status: 'in_transit',
            location: 'مركز فرز الرياض',
            description: 'الطرد في مركز الفرز',
          },
          {
            timestamp: new Date('2024-01-16T09:15:00'),
            status: 'out_for_delivery',
            location: 'مركز توزيع الرياض',
            description: 'الطرد في طريقه للتوصيل',
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-16'),
      }
    ];

    mockTracking.forEach(tracking => {
      this.trackingData.set(tracking.trackingNumber, tracking);
    });
  }

  /**
   * Calculate shipping rates
   */
  async calculateShippingRates(shippingData) {
    try {
      const {
        destinationCity,
        weight = 1, // kg
        dimensions = { length: 20, width: 15, height: 10 }, // cm
        value = 100, // SAR
        deliveryMethod = 'standard',
      } = shippingData;

      // Find shipping zone
      const zone = this.findShippingZone(destinationCity);
      if (!zone) {
        return {
          success: false,
          error: 'المدينة غير مدعومة للشحن'
        };
      }

      // Get delivery method
      const method = Array.from(this.deliveryMethods.values())
        .find(m => m.code === deliveryMethod);
      
      if (!method) {
        return {
          success: false,
          error: 'طريقة التوصيل غير متاحة'
        };
      }

      // Calculate rates for each carrier
      const rates = [];
      
      for (const carrier of this.carriers.values()) {
        if (!carrier.isActive || !carrier.supportedServices.includes(deliveryMethod)) {
          continue;
        }

        const baseRate = zone.baseRate;
        const weightRate = weight * zone.weightMultiplier;
        const methodMultiplier = method.priceMultiplier;
        
        // Calculate dimensional weight
        const dimensionalWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000;
        const chargeableWeight = Math.max(weight, dimensionalWeight);
        
        // Calculate final rate
        const shippingCost = Math.round((baseRate + (chargeableWeight * zone.weightMultiplier)) * methodMultiplier);
        
        // Calculate estimated delivery date
        const estimatedDelivery = this.calculateDeliveryDate(method.minDeliveryDays, method.maxDeliveryDays);

        rates.push({
          carrierId: carrier.id,
          carrierName: carrier.name,
          carrierCode: carrier.code,
          serviceName: method.name,
          serviceCode: method.code,
          cost: shippingCost,
          currency: 'SAR',
          estimatedDelivery,
          deliveryTime: carrier.deliveryTime[deliveryMethod],
          features: this.getCarrierFeatures(carrier, method),
        });
      }

      // Sort by cost (cheapest first)
      rates.sort((a, b) => a.cost - b.cost);

      return {
        success: true,
        data: {
          rates,
          zone: zone.name,
          weight: chargeableWeight,
          method: method.name,
        }
      };
    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      return {
        success: false,
        error: 'فشل في حساب تكلفة الشحن'
      };
    }
  }

  /**
   * Create shipping label
   */
  async createShippingLabel(shippingData) {
    try {
      const {
        orderId,
        carrierId,
        serviceCode,
        senderAddress,
        recipientAddress,
        packageDetails,
      } = shippingData;

      const carrier = this.carriers.get(carrierId);
      if (!carrier) {
        return {
          success: false,
          error: 'شركة الشحن غير موجودة'
        };
      }

      // Generate tracking number
      const trackingNumber = this.generateTrackingNumber(carrier.code);

      // Create shipping label (mock)
      const shippingLabel = {
        trackingNumber,
        orderId,
        carrierId,
        carrierName: carrier.name,
        serviceCode,
        labelUrl: `https://api.shipping.com/labels/${trackingNumber}.pdf`,
        cost: packageDetails.shippingCost,
        estimatedDelivery: this.calculateDeliveryDate(1, 3),
        senderAddress,
        recipientAddress,
        packageDetails,
        createdAt: new Date(),
      };

      // Initialize tracking
      const trackingInfo = {
        trackingNumber,
        orderId,
        carrierId,
        carrierName: carrier.name,
        status: 'label_created',
        estimatedDelivery: shippingLabel.estimatedDelivery,
        currentLocation: 'تم إنشاء بطاقة الشحن',
        events: [
          {
            timestamp: new Date(),
            status: 'label_created',
            location: 'النظام',
            description: 'تم إنشاء بطاقة الشحن',
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.trackingData.set(trackingNumber, trackingInfo);

      return {
        success: true,
        data: shippingLabel,
        message: 'تم إنشاء بطاقة الشحن بنجاح'
      };
    } catch (error) {
      console.error('Error creating shipping label:', error);
      return {
        success: false,
        error: 'فشل في إنشاء بطاقة الشحن'
      };
    }
  }

  /**
   * Track shipment
   */
  async trackShipment(trackingNumber) {
    try {
      const tracking = this.trackingData.get(trackingNumber);
      
      if (!tracking) {
        return {
          success: false,
          error: 'رقم التتبع غير موجود'
        };
      }

      // Simulate real-time updates (in production, call carrier API)
      const updatedTracking = await this.updateTrackingStatus(tracking);

      return {
        success: true,
        data: updatedTracking
      };
    } catch (error) {
      console.error('Error tracking shipment:', error);
      return {
        success: false,
        error: 'فشل في تتبع الشحنة'
      };
    }
  }

  /**
   * Get shipping statistics
   */
  async getShippingStats() {
    try {
      const trackingEntries = Array.from(this.trackingData.values());
      
      const stats = {
        totalShipments: trackingEntries.length,
        inTransit: trackingEntries.filter(t => t.status === 'in_transit').length,
        delivered: trackingEntries.filter(t => t.status === 'delivered').length,
        pending: trackingEntries.filter(t => t.status === 'label_created').length,
        delayed: trackingEntries.filter(t => 
          t.estimatedDelivery < new Date() && t.status !== 'delivered'
        ).length,
        carrierDistribution: this.getCarrierDistribution(trackingEntries),
        averageDeliveryTime: this.calculateAverageDeliveryTime(trackingEntries),
        onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(trackingEntries),
        topDestinations: this.getTopDestinations(trackingEntries),
        monthlyTrend: this.getMonthlyShippingTrend(),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting shipping stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الشحن'
      };
    }
  }

  /**
   * Get available carriers
   */
  async getCarriers() {
    try {
      const carriers = Array.from(this.carriers.values())
        .filter(carrier => carrier.isActive)
        .map(carrier => ({
          id: carrier.id,
          name: carrier.name,
          code: carrier.code,
          services: carrier.supportedServices,
          coverage: carrier.coverage,
          deliveryTime: carrier.deliveryTime,
        }));

      return {
        success: true,
        data: carriers
      };
    } catch (error) {
      console.error('Error getting carriers:', error);
      return {
        success: false,
        error: 'فشل في جلب شركات الشحن'
      };
    }
  }

  /**
   * Helper methods
   */
  findShippingZone(city) {
    return Array.from(this.shippingZones.values())
      .find(zone => zone.cities.includes(city) && zone.isActive);
  }

  calculateDeliveryDate(minDays, maxDays) {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + maxDays);
    
    // Skip weekends (Friday and Saturday in Saudi Arabia)
    while (deliveryDate.getDay() === 5 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    return deliveryDate;
  }

  getCarrierFeatures(carrier, method) {
    const features = ['تتبع مباشر', 'تأمين الشحنة'];
    
    if (method.code === 'express') {
      features.push('توصيل سريع');
    }
    
    if (method.code === 'same_day') {
      features.push('توصيل فوري', 'خدمة عملاء 24/7');
    }
    
    if (carrier.code === 'ARAMEX') {
      features.push('إشعار SMS', 'إمكانية تغيير العنوان');
    }
    
    return features;
  }

  generateTrackingNumber(carrierCode) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${carrierCode}${timestamp.slice(-6)}${random}`;
  }

  async updateTrackingStatus(tracking) {
    // Simulate status progression
    const statusProgression = [
      'label_created',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered'
    ];

    const currentIndex = statusProgression.indexOf(tracking.status);
    
    // Randomly progress status (mock real-time updates)
    if (currentIndex < statusProgression.length - 1 && Math.random() > 0.7) {
      const newStatus = statusProgression[currentIndex + 1];
      const newEvent = {
        timestamp: new Date(),
        status: newStatus,
        location: this.getLocationForStatus(newStatus),
        description: this.getDescriptionForStatus(newStatus),
      };

      tracking.status = newStatus;
      tracking.currentLocation = newEvent.location;
      tracking.events.push(newEvent);
      tracking.updatedAt = new Date();

      this.trackingData.set(tracking.trackingNumber, tracking);
    }

    return tracking;
  }

  getLocationForStatus(status) {
    const locations = {
      label_created: 'النظام',
      picked_up: 'المستودع الرئيسي',
      in_transit: 'مركز الفرز',
      out_for_delivery: 'مركز التوزيع المحلي',
      delivered: 'عنوان العميل',
    };
    
    return locations[status] || 'غير محدد';
  }

  getDescriptionForStatus(status) {
    const descriptions = {
      label_created: 'تم إنشاء بطاقة الشحن',
      picked_up: 'تم استلام الطرد من المرسل',
      in_transit: 'الطرد في طريقه للوجهة',
      out_for_delivery: 'الطرد خرج للتوصيل',
      delivered: 'تم تسليم الطرد بنجاح',
    };
    
    return descriptions[status] || 'تحديث الحالة';
  }

  getCarrierDistribution(trackingEntries) {
    const distribution = {};
    trackingEntries.forEach(entry => {
      distribution[entry.carrierName] = (distribution[entry.carrierName] || 0) + 1;
    });
    return distribution;
  }

  calculateAverageDeliveryTime(trackingEntries) {
    const deliveredShipments = trackingEntries.filter(t => t.status === 'delivered');
    
    if (deliveredShipments.length === 0) return 0;
    
    const totalDays = deliveredShipments.reduce((sum, shipment) => {
      const createdDate = new Date(shipment.createdAt);
      const deliveredEvent = shipment.events.find(e => e.status === 'delivered');
      
      if (deliveredEvent) {
        const deliveredDate = new Date(deliveredEvent.timestamp);
        const daysDiff = Math.ceil((deliveredDate - createdDate) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }
      
      return sum;
    }, 0);
    
    return Math.round(totalDays / deliveredShipments.length);
  }

  calculateOnTimeDeliveryRate(trackingEntries) {
    const deliveredShipments = trackingEntries.filter(t => t.status === 'delivered');
    
    if (deliveredShipments.length === 0) return 100;
    
    const onTimeDeliveries = deliveredShipments.filter(shipment => {
      const deliveredEvent = shipment.events.find(e => e.status === 'delivered');
      
      if (deliveredEvent) {
        const deliveredDate = new Date(deliveredEvent.timestamp);
        const estimatedDate = new Date(shipment.estimatedDelivery);
        return deliveredDate <= estimatedDate;
      }
      
      return false;
    });
    
    return Math.round((onTimeDeliveries.length / deliveredShipments.length) * 100);
  }

  getTopDestinations(trackingEntries) {
    // Mock implementation - in production, extract from actual addresses
    return [
      { city: 'الرياض', count: 45 },
      { city: 'جدة', count: 32 },
      { city: 'الدمام', count: 28 },
      { city: 'مكة', count: 15 },
    ];
  }

  getMonthlyShippingTrend() {
    // Mock monthly trend data
    return [
      { month: 'يناير', shipments: 120, delivered: 115 },
      { month: 'فبراير', shipments: 135, delivered: 130 },
      { month: 'مارس', shipments: 150, delivered: 145 },
    ];
  }
}

module.exports = new ShippingService();
