const { PrismaClient } = require('@prisma/client');

class EnhancedOrderService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * إنشاء طلب محسن مع دمج قاعدة البيانات
   */
  async createEnhancedOrder(data) {
    try {
      console.log('🚀 [ENHANCED-ORDER] بدء إنشاء طلب محسن...');
      console.log('📋 [ENHANCED-ORDER] البيانات المستلمة:', {
        conversationId: data.conversationId,
        customerId: data.customerId,
        productName: data.productName,
        customerName: data.customerName,
        confidence: data.confidence
      });

      // التحقق من وجود العميل
      const customer = await this.findOrCreateCustomer(data);
      
      // التحقق من وجود المحادثة
      const conversation = await this.findConversation(data.conversationId);
      
      // إنشاء رقم الطلب
      const orderNumber = await this.generateOrderNumber(data.companyId);
      
      // حساب التكاليف
      const costs = this.calculateOrderCosts(data);
      
      // تحضير بيانات الطلب
      const orderData = await this.prepareOrderData({
        ...data,
        customer,
        conversation,
        orderNumber,
        costs
      });
      
      // إنشاء الطلب في قاعدة البيانات
      const order = await this.createOrderInDatabase(orderData);
      
      // إضافة ملاحظة عن الطلب للمحادثة بدون إنهائها
      if (conversation) {
        await this.addOrderNoteToConversation(conversation.id, order.orderNumber);
      }
      
      // تسجيل الإحصائيات
      await this.logOrderCreation(order);
      
      console.log('✅ [ENHANCED-ORDER] تم إنشاء الطلب بنجاح:', order.orderNumber);
      
      return {
        success: true,
        order: order,
        message: 'تم إنشاء الطلب بنجاح'
      };
      
    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في إنشاء الطلب:', error);
      return {
        success: false,
        error: error.message,
        message: 'فشل في إنشاء الطلب'
      };
    }
  }

  /**
   * البحث عن العميل أو إنشاؤه
   */
  async findOrCreateCustomer(data) {
    try {
      let customer = null;
      
      // البحث بـ customerId أولاً
      if (data.customerId) {
        customer = await this.prisma.customer.findUnique({
          where: { id: data.customerId }
        });
      }
      
      // البحث بـ facebookId إذا لم نجد العميل
      if (!customer && data.customerId && data.customerId.match(/^\d+$/)) {
        customer = await this.prisma.customer.findUnique({
          where: { facebookId: data.customerId }
        });
      }
      
      // البحث برقم الهاتف
      if (!customer && data.customerPhone) {
        customer = await this.prisma.customer.findFirst({
          where: { 
            phone: data.customerPhone,
            companyId: data.companyId
          }
        });
      }
      
      // إنشاء عميل جديد إذا لم نجده
      if (!customer) {
        console.log('👤 [ENHANCED-ORDER] إنشاء عميل جديد...');
        
        const customerName = this.parseCustomerName(data.customerName);
        
        customer = await this.prisma.customer.create({
          data: {
            firstName: customerName.firstName,
            lastName: customerName.lastName,
            phone: data.customerPhone || null,
            email: data.customerEmail || null,
            facebookId: data.customerId && data.customerId.match(/^\d+$/) ? data.customerId : null,
            status: 'LEAD',
            companyId: data.companyId,
            metadata: JSON.stringify({
              source: 'ai_conversation',
              conversationId: data.conversationId,
              extractionMethod: data.extractionMethod || 'ai_enhanced',
              confidence: data.confidence || 0.5,
              createdFromOrder: true
            })
          }
        });
        
        console.log('✅ [ENHANCED-ORDER] تم إنشاء عميل جديد:', customer.id);
      } else {
        console.log('👤 [ENHANCED-ORDER] تم العثور على العميل:', customer.id);
      }
      
      return customer;
      
    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في البحث عن العميل:', error);
      throw error;
    }
  }

  /**
   * تحليل اسم العميل
   */
  parseCustomerName(fullName) {
    if (!fullName || typeof fullName !== 'string') {
      return {
        firstName: 'عميل',
        lastName: 'جديد'
      };
    }
    
    const nameParts = fullName.trim().split(' ');
    
    return {
      firstName: nameParts[0] || 'عميل',
      lastName: nameParts.slice(1).join(' ') || 'جديد'
    };
  }

  /**
   * البحث عن المحادثة
   */
  async findConversation(conversationId) {
    if (!conversationId) return null;
    
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      
      if (conversation) {
        console.log('💬 [ENHANCED-ORDER] تم العثور على المحادثة:', conversationId);
      } else {
        console.log('⚠️ [ENHANCED-ORDER] لم يتم العثور على المحادثة:', conversationId);
      }
      
      return conversation;
    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في البحث عن المحادثة:', error);
      return null;
    }
  }

  /**
   * توليد رقم الطلب
   */
  async generateOrderNumber(companyId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // البحث عن آخر طلب اليوم
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        companyId: companyId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-3));
      sequence = lastSequence + 1;
    }
    
    return `ORD-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  /**
   * حساب تكاليف الطلب
   */
  calculateOrderCosts(data) {
    const productPrice = parseFloat(data.productPrice) || 349;
    const quantity = parseInt(data.quantity) || 1;
    const subtotal = productPrice * quantity;
    
    // حساب الشحن
    const shipping = this.calculateShipping(data.city, subtotal);
    
    // حساب الضرائب (0% حالياً)
    const tax = 0;
    
    // حساب الخصم
    const discount = 0;
    
    const total = subtotal + shipping + tax - discount;
    
    return {
      productPrice,
      quantity,
      subtotal,
      shipping,
      tax,
      discount,
      total
    };
  }

  /**
   * حساب تكلفة الشحن
   */
  calculateShipping(city, subtotal) {
    if (!city || city === 'غير محدد') return 50;
    
    const cityLower = city.toLowerCase();
    
    // شحن مجاني للطلبات أكثر من 500 جنيه
    if (subtotal >= 500) return 0;
    
    // أسعار الشحن حسب المدينة
    const shippingRates = {
      'القاهرة': 30,
      'الجيزة': 30,
      'الإسكندرية': 40,
      'شبرا الخيمة': 35,
      'المنصورة': 45,
      'طنطا': 45,
      'الزقازيق': 40
    };
    
    return shippingRates[city] || 50; // سعر افتراضي للمدن الأخرى
  }

  /**
   * تحضير بيانات الطلب
   */
  async prepareOrderData({ customer, conversation, orderNumber, costs, ...data }) {
    return {
      orderNumber,
      customerId: customer.id,
      conversationId: conversation?.id || null,
      companyId: data.companyId,
      
      // حالة الطلب
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMethod: 'CASH',
      
      // التكاليف
      subtotal: costs.subtotal,
      tax: costs.tax,
      shipping: costs.shipping,
      discount: costs.discount,
      total: costs.total,
      currency: 'EGP',
      
      // معلومات العميل من الـ AI
      customerName: data.customerName || `${customer.firstName} ${customer.lastName}`,
      customerPhone: data.customerPhone || customer.phone,
      customerEmail: data.customerEmail || customer.email,
      city: data.city || 'غير محدد',
      customerAddress: data.customerAddress || '',
      
      // عناوين الشحن والفواتير
      shippingAddress: JSON.stringify({
        city: data.city || 'غير محدد',
        address: data.customerAddress || '',
        phone: data.customerPhone || customer.phone,
        country: 'مصر'
      }),
      billingAddress: JSON.stringify({
        city: data.city || 'غير محدد',
        address: data.customerAddress || '',
        phone: data.customerPhone || customer.phone,
        country: 'مصر'
      }),
      
      // معلومات جودة البيانات
      dataQuality: JSON.stringify(data.dataQuality || {}),
      extractionMethod: data.extractionMethod || 'ai_enhanced',
      confidence: data.confidence || 0.5,
      validationStatus: 'pending',
      sourceType: 'ai_conversation',
      extractionTimestamp: new Date(),
      
      // ملاحظات
      notes: this.buildOrderNotes(data),
      
      // metadata
      metadata: JSON.stringify({
        conversationId: data.conversationId,
        originalData: {
          productName: data.productName,
          productColor: data.productColor,
          productSize: data.productSize
        },
        aiExtraction: {
          confidence: data.confidence,
          extractionMethod: data.extractionMethod,
          validation: data.validation
        },
        timestamps: {
          extracted: new Date(),
          created: new Date()
        }
      })
    };
  }

  /**
   * بناء ملاحظات الطلب
   */
  buildOrderNotes(data) {
    let notes = `طلب تلقائي من المحادثة\n`;
    notes += `معرف المحادثة: ${data.conversationId}\n`;
    
    if (data.confidence) {
      notes += `مستوى الثقة: ${(data.confidence * 100).toFixed(0)}%\n`;
    }
    
    if (data.notes) {
      notes += `ملاحظات إضافية: ${data.notes}\n`;
    }
    
    if (data.validation && data.validation.warnings && data.validation.warnings.length > 0) {
      notes += `تحذيرات: ${data.validation.warnings.join(', ')}\n`;
    }
    
    notes += `تاريخ الإنشاء: ${new Date().toLocaleString('ar-EG')}`;
    
    return notes;
  }

  /**
   * إنشاء الطلب في قاعدة البيانات
   */
  async createOrderInDatabase(orderData) {
    try {
      console.log('💾 [ENHANCED-ORDER] حفظ الطلب في قاعدة البيانات...');

      const order = await this.prisma.order.create({
        data: orderData,
        include: {
          customer: true,
          conversation: true,
          items: true
        }
      });

      // إنشاء عناصر الطلب
      await this.createOrderItems(order.id, orderData);

      // إعادة جلب الطلب مع العناصر
      const completeOrder = await this.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true,
          conversation: true,
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        }
      });

      console.log('✅ [ENHANCED-ORDER] تم حفظ الطلب في قاعدة البيانات');
      return completeOrder;

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في حفظ الطلب:', error);
      throw error;
    }
  }

  /**
   * إنشاء عناصر الطلب
   */
  async createOrderItems(orderId, orderData) {
    try {
      // البحث عن المنتج في الكتالوج
      let product = null;
      if (orderData.productName) {
        product = await this.findProductByName(orderData.productName, orderData.companyId);
      }

      const itemData = {
        orderId: orderId,
        productId: product?.id || null,
        quantity: orderData.quantity || 1,
        price: orderData.productPrice || 349,
        total: (orderData.productPrice || 349) * (orderData.quantity || 1),

        // معلومات المنتج من الـ AI
        productName: orderData.productName || 'كوتشي حريمي',
        productColor: orderData.productColor || 'أبيض',
        productSize: orderData.productSize || '37',
        productSku: product?.sku || `AI-${Date.now()}`,

        extractionSource: 'ai',
        confidence: orderData.confidence || 0.5,

        metadata: JSON.stringify({
          aiExtracted: true,
          originalData: {
            productName: orderData.productName,
            productColor: orderData.productColor,
            productSize: orderData.productSize
          },
          catalogMatch: !!product,
          productId: product?.id || null
        })
      };

      const orderItem = await this.prisma.orderItem.create({
        data: itemData
      });

      console.log('📦 [ENHANCED-ORDER] تم إنشاء عنصر الطلب');
      return orderItem;

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في إنشاء عناصر الطلب:', error);
      throw error;
    }
  }

  /**
   * البحث عن المنتج بالاسم
   */
  async findProductByName(productName, companyId) {
    try {
      if (!productName || !companyId) return null;

      // البحث المباشر
      let product = await this.prisma.product.findFirst({
        where: {
          name: {
            contains: productName,
            mode: 'insensitive'
          },
          companyId: companyId,
          isActive: true
        }
      });

      // البحث بالكلمات المفتاحية
      if (!product) {
        const keywords = productName.split(' ').filter(word => word.length > 2);

        for (const keyword of keywords) {
          product = await this.prisma.product.findFirst({
            where: {
              OR: [
                {
                  name: {
                    contains: keyword,
                    mode: 'insensitive'
                  }
                },
                {
                  tags: {
                    contains: keyword,
                    mode: 'insensitive'
                  }
                }
              ],
              companyId: companyId,
              isActive: true
            }
          });

          if (product) break;
        }
      }

      if (product) {
        console.log(`🔍 [ENHANCED-ORDER] تم العثور على منتج مطابق: ${product.name}`);
      } else {
        console.log(`⚠️ [ENHANCED-ORDER] لم يتم العثور على منتج مطابق لـ: ${productName}`);
      }

      return product;

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في البحث عن المنتج:', error);
      return null;
    }
  }

  /**
   * إضافة ملاحظة عن الطلب للمحادثة بدون إنهائها
   */
  async addOrderNoteToConversation(conversationId, orderNumber) {
    try {
      const updateData = {
        lastMessagePreview: `تم إنشاء الطلب ${orderNumber} بنجاح - المحادثة مستمرة`,
        updatedAt: new Date()
      };

      const updatedConversation = await this.prisma.conversation.update({
        where: { id: conversationId },
        data: updateData,
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      console.log(`💬 [ENHANCED-ORDER] تم إضافة ملاحظة الطلب للمحادثة: ${orderNumber}`);

      // إضافة رسالة نظام للمحادثة
      await this.addSystemMessageToConversation(conversationId, orderNumber);

      return updatedConversation;

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في إضافة ملاحظة الطلب:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة المحادثة مع تفاصيل إضافية
   */
  async updateConversationStatus(conversationId, status, orderNumber = null) {
    try {
      const updateData = {
        status: status,
        updatedAt: new Date()
      };

      // إضافة ملاحظة عن الطلب إذا تم إنشاؤه
      if (orderNumber && status === 'RESOLVED') {
        updateData.lastMessagePreview = `تم إنشاء الطلب ${orderNumber} بنجاح`;
      }

      const updatedConversation = await this.prisma.conversation.update({
        where: { id: conversationId },
        data: updateData,
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      console.log(`💬 [ENHANCED-ORDER] تم تحديث حالة المحادثة إلى: ${status}`);

      // إضافة رسالة نظام للمحادثة
      if (orderNumber) {
        await this.addSystemMessageToConversation(conversationId, orderNumber);
      }

      // إشعار المستخدمين المعنيين
      await this.notifyUsersAboutOrderCreation(updatedConversation, orderNumber);

      return updatedConversation;

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في تحديث حالة المحادثة:', error);
      return null;
    }
  }

  /**
   * إضافة رسالة نظام للمحادثة
   */
  async addSystemMessageToConversation(conversationId, orderNumber) {
    try {
      await this.prisma.message.create({
        data: {
          conversationId: conversationId,
          content: `🎉 تم إنشاء الطلب ${orderNumber} بنجاح! يمكنك الاستمرار في المحادثة لأي استفسارات إضافية.`,
          type: 'TEXT',
          isFromCustomer: false,
          metadata: JSON.stringify({
            type: 'system_order_notification',
            orderNumber: orderNumber,
            timestamp: new Date().toISOString(),
            source: 'enhanced_order_service'
          })
        }
      });

      console.log(`📝 [ENHANCED-ORDER] تم إضافة رسالة نظام للمحادثة: ${conversationId}`);

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في إضافة رسالة النظام:', error);
    }
  }

  /**
   * إشعار المستخدمين عن إنشاء الطلب
   */
  async notifyUsersAboutOrderCreation(conversation, orderNumber) {
    try {
      if (!orderNumber || !conversation) return;

      // إنشاء إشعار للمستخدم المسؤول عن المحادثة
      if (conversation.assignedUserId) {
        await this.prisma.notification.create({
          data: {
            userId: conversation.assignedUserId,
            companyId: conversation.companyId,
            title: 'تم إنشاء طلب جديد',
            message: `تم إنشاء الطلب ${orderNumber} من محادثة العميل ${conversation.customer?.firstName || 'غير محدد'}`,
            type: 'order_created',
            data: JSON.stringify({
              orderId: orderNumber,
              conversationId: conversation.id,
              customerId: conversation.customerId,
              source: 'ai_agent'
            })
          }
        });
      }

      // إنشاء إشعار عام لجميع المديرين
      const managers = await this.prisma.user.findMany({
        where: {
          companyId: conversation.companyId,
          role: { in: ['COMPANY_ADMIN', 'MANAGER'] },
          isActive: true
        }
      });

      for (const manager of managers) {
        if (manager.id !== conversation.assignedUserId) {
          await this.prisma.notification.create({
            data: {
              userId: manager.id,
              companyId: conversation.companyId,
              title: 'طلب جديد من الذكاء الاصطناعي',
              message: `تم إنشاء الطلب ${orderNumber} تلقائياً بواسطة الذكاء الاصطناعي`,
              type: 'ai_order_created',
              data: JSON.stringify({
                orderId: orderNumber,
                conversationId: conversation.id,
                customerId: conversation.customerId,
                source: 'ai_agent',
                automated: true
              })
            }
          });
        }
      }

      console.log(`🔔 [ENHANCED-ORDER] تم إرسال إشعارات عن الطلب: ${orderNumber}`);

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في إرسال الإشعارات:', error);
    }
  }

  /**
   * تسجيل إحصائيات إنشاء الطلب
   */
  async logOrderCreation(order) {
    try {
      console.log('\n📊 [ENHANCED-ORDER] تقرير إنشاء الطلب:');
      console.log(`   رقم الطلب: ${order.orderNumber}`);
      console.log(`   العميل: ${order.customerName}`);
      console.log(`   الهاتف: ${order.customerPhone || 'غير متوفر'}`);
      console.log(`   المدينة: ${order.city}`);
      console.log(`   الإجمالي: ${order.total} ${order.currency}`);
      console.log(`   مستوى الثقة: ${order.confidence ? (order.confidence * 100).toFixed(0) + '%' : 'غير محدد'}`);
      console.log(`   طريقة الاستخراج: ${order.extractionMethod}`);
      console.log(`   المحادثة: ${order.conversationId || 'غير مربوطة'}`);

      if (order.items && order.items.length > 0) {
        console.log(`   المنتجات:`);
        order.items.forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.productName} - ${item.productColor} - مقاس ${item.productSize} - ${item.price} جنيه`);
        });
      }

      console.log(`   تاريخ الإنشاء: ${order.createdAt.toLocaleString('ar-EG')}\n`);

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في تسجيل الإحصائيات:', error);
    }
  }

  /**
   * جلب الطلبات المحسنة
   */
  async getEnhancedOrders(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        customerId,
        conversationId,
        dateFrom,
        dateTo,
        minConfidence,
        extractionMethod
      } = options;

      const where = {
        companyId: companyId
      };

      // فلاتر إضافية
      if (status) where.status = status;
      if (customerId) where.customerId = customerId;
      if (conversationId) where.conversationId = conversationId;
      if (minConfidence) where.confidence = { gte: minConfidence };
      if (extractionMethod) where.extractionMethod = extractionMethod;

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const orders = await this.prisma.order.findMany({
        where,
        include: {
          customer: true,
          conversation: true,
          items: {
            include: {
              product: true,
              variant: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await this.prisma.order.count({ where });

      return {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في جلب الطلبات:', error);
      throw error;
    }
  }

  /**
   * إحصائيات الطلبات المحسنة
   */
  async getOrderStats(companyId, dateFrom, dateTo) {
    try {
      const where = {
        companyId: companyId
      };

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = new Date(dateFrom);
        if (dateTo) where.createdAt.lte = new Date(dateTo);
      }

      const [
        totalOrders,
        totalRevenue,
        avgConfidence,
        extractionMethods,
        statusDistribution,
        topCities
      ] = await Promise.all([
        // إجمالي الطلبات
        this.prisma.order.count({ where }),

        // إجمالي الإيرادات
        this.prisma.order.aggregate({
          where,
          _sum: { total: true }
        }),

        // متوسط الثقة
        this.prisma.order.aggregate({
          where: { ...where, confidence: { not: null } },
          _avg: { confidence: true }
        }),

        // طرق الاستخراج
        this.prisma.order.groupBy({
          by: ['extractionMethod'],
          where,
          _count: true
        }),

        // توزيع الحالات
        this.prisma.order.groupBy({
          by: ['status'],
          where,
          _count: true
        }),

        // أهم المدن
        this.prisma.order.groupBy({
          by: ['city'],
          where: { ...where, city: { not: null } },
          _count: true,
          orderBy: { _count: { city: 'desc' } },
          take: 10
        })
      ]);

      return {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        avgConfidence: avgConfidence._avg.confidence || 0,
        extractionMethods: extractionMethods.reduce((acc, item) => {
          acc[item.extractionMethod || 'unknown'] = item._count;
          return acc;
        }, {}),
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
        topCities: topCities.map(item => ({
          city: item.city,
          count: item._count
        }))
      };

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في حساب الإحصائيات:', error);
      throw error;
    }
  }

  /**
   * إحصائيات المحادثات المكتملة
   */
  async getConversationCompletionStats(companyId, dateFrom, dateTo) {
    try {
      const where = {
        companyId: companyId,
        status: 'RESOLVED'
      };

      if (dateFrom || dateTo) {
        where.updatedAt = {};
        if (dateFrom) where.updatedAt.gte = new Date(dateFrom);
        if (dateTo) where.updatedAt.lte = new Date(dateTo);
      }

      const [
        totalCompleted,
        completedWithOrders,
        avgCompletionTime,
        completionByChannel
      ] = await Promise.all([
        // إجمالي المحادثات المكتملة
        this.prisma.conversation.count({ where }),

        // المحادثات المكتملة مع طلبات
        this.prisma.conversation.count({
          where: {
            ...where,
            orders: { some: {} }
          }
        }),

        // متوسط وقت إكمال المحادثة
        this.prisma.conversation.aggregate({
          where,
          _avg: {
            // حساب الفرق بين تاريخ الإنشاء والتحديث
          }
        }),

        // التوزيع حسب القناة
        this.prisma.conversation.groupBy({
          by: ['channel'],
          where,
          _count: true
        })
      ]);

      const conversionRate = totalCompleted > 0 ?
        ((completedWithOrders / totalCompleted) * 100).toFixed(1) : 0;

      return {
        totalCompleted,
        completedWithOrders,
        conversionRate: parseFloat(conversionRate),
        completionByChannel: completionByChannel.reduce((acc, item) => {
          acc[item.channel] = item._count;
          return acc;
        }, {}),
        summary: {
          message: `تم إكمال ${totalCompleted} محادثة، منها ${completedWithOrders} أدت لطلبات`,
          conversionMessage: `معدل التحويل: ${conversionRate}%`
        }
      };

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في حساب إحصائيات المحادثات:', error);
      throw error;
    }
  }

  /**
   * جلب المحادثات المرتبطة بالطلبات
   */
  async getOrderConversations(companyId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'RESOLVED',
        hasOrder = true
      } = options;

      const where = {
        companyId: companyId,
        status: status
      };

      if (hasOrder) {
        where.orders = { some: {} };
      }

      const conversations = await this.prisma.conversation.findMany({
        where,
        include: {
          customer: true,
          orders: {
            include: {
              items: true
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await this.prisma.conversation.count({ where });

      return {
        conversations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('❌ [ENHANCED-ORDER] خطأ في جلب محادثات الطلبات:', error);
      throw error;
    }
  }

  /**
   * إغلاق الاتصال
   */
  /**
   * جلب تفاصيل طلب واحد بالـ ID
   */
  async getOrderById(orderId) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true,
          conversation: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!order) {
        return {
          success: false,
          message: 'الطلب غير موجود'
        };
      }

      // تنسيق البيانات
      const formattedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        city: order.city,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || 'غير محدد',
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productColor: item.productColor,
          productSize: item.productSize,
          price: parseFloat(item.price),
          quantity: item.quantity,
          total: parseFloat(item.total)
        })),
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax || 0),
        shipping: parseFloat(order.shipping || 0),
        total: parseFloat(order.total),
        currency: order.currency,
        confidence: order.confidence,
        extractionMethod: order.extractionMethod,
        conversationId: order.conversationId,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        statusHistory: order.statusHistory?.map(history => ({
          status: history.status,
          notes: history.notes,
          createdAt: history.createdAt,
          updatedBy: history.updatedBy
        })) || []
      };

      return {
        success: true,
        order: formattedOrder
      };

    } catch (error) {
      console.error('❌ Error fetching order by ID:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء جلب تفاصيل الطلب'
      };
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = EnhancedOrderService;
