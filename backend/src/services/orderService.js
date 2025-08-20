const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrderService {
  constructor() {
    console.log('🛒 OrderService initialized');
  }

  // إنشاء طلب جديد من المحادثة (نسخة مبسطة)
  async createOrderFromConversation(data) {
    try {
      const {
        conversationId,
        customerId,
        companyId,
        productName,
        productColor,
        productSize,
        productPrice,
        quantity = 1,
        customerName,
        customerPhone,
        city,
        notes
      } = data;

      console.log('🛒 Creating new order from conversation:', {
        conversationId,
        customerId,
        productName,
        productColor,
        productSize,
        productPrice,
        quantity
      });

      // إنشاء رقم طلب فريد
      const orderNumber = await this.generateOrderNumber();

      // حساب المجموع
      const subtotal = parseFloat(productPrice) * quantity;
      const shipping = parseFloat(this.calculateShipping(city, subtotal));
      const total = subtotal + shipping;

      // إنشاء الطلب بدون items (سنضيفها لاحقاً)
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId,
          companyId,
          subtotal: parseFloat(subtotal.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
          currency: 'EGP',
          notes: `طلب من المحادثة\nالمنتج: ${productName}\nاللون: ${productColor}\nالمقاس: ${productSize}\nاسم العميل: ${customerName}\nالهاتف: ${customerPhone}\nالمدينة: ${city}\nالمحادثة: ${conversationId}\n${notes || ''}`,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'CASH'
        }
      });

      // جلب الطلب مع بيانات العميل
      const orderWithCustomer = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          customer: true
        }
      });

      // تحديث إحصائيات العميل
      await this.updateCustomerStats(customerId, parseFloat(total));

      console.log('✅ Order created successfully:', order.orderNumber);
      return orderWithCustomer;

    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  // إنشاء رقم طلب فريد
  async generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  // حساب تكلفة الشحن
  calculateShipping(city, subtotal) {
    // شحن مجاني للطلبات أكثر من 250 جنيه
    if (subtotal >= 250) {
      return 0;
    }

    // تكلفة الشحن حسب المدينة
    const shippingRates = {
      'القاهرة': 50,
      'الإسكندرية': 50,
      'الجيزة': 50,
      'default': 75
    };

    return shippingRates[city] || shippingRates.default;
  }

  // البحث عن المنتج أو إنشاؤه
  async findOrCreateProduct(productName, companyId) {
    try {
      // البحث عن المنتج الموجود
      let product = await prisma.product.findFirst({
        where: {
          name: productName,
          companyId
        }
      });

      // إنشاء المنتج إذا لم يكن موجود
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: productName,
            sku: `AI-${Date.now()}`, // إنشاء SKU تلقائي
            companyId,
            price: 0, // سيتم تحديثه لاحقاً
            isActive: true,
            metadata: JSON.stringify({
              createdFromOrder: true,
              source: 'ai_agent'
            })
          }
        });
        console.log('📦 Created new product:', productName);
      }

      return product.id;
    } catch (error) {
      console.error('❌ Error finding/creating product:', error);
      // إرجاع null إذا فشل
      return null;
    }
  }

  // تحديث إحصائيات العميل
  async updateCustomerStats(customerId, orderTotal) {
    try {
      // التحقق من وجود العميل أولاً
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (customer) {
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            orderCount: { increment: 1 },
            totalSpent: { increment: parseFloat(orderTotal) },
            lastOrderAt: new Date()
          }
        });
        console.log('📊 Customer stats updated');
      }
    } catch (error) {
      console.error('❌ Error updating customer stats:', error);
    }
  }

  // الحصول على طلبات العميل
  async getCustomerOrders(customerId, limit = 10) {
    try {
      const orders = await prisma.order.findMany({
      where: { companyId: companyId },
        where: { customerId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return orders;
    } catch (error) {
      console.error('❌ Error fetching customer orders:', error);
      return [];
    }
  }

  // الحصول على طلب بالرقم
  async getOrderByNumber(orderNumber) {
    try {
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });

      return order;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      return null;
    }
  }

  // تحديث حالة الطلب
  async updateOrderStatus(orderNumber, status, notes = null) {
    try {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status,
          notes: notes || undefined,
          updatedAt: new Date()
        },
        include: {
          customer: true,
          items: true
        }
      });

      console.log(`✅ Order ${orderNumber} status updated to ${status}`);
      return order;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  // تأكيد الطلب
  async confirmOrder(orderNumber, shippingAddress = null) {
    try {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status: 'CONFIRMED',
          shippingAddress: shippingAddress || undefined,
          updatedAt: new Date()
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`✅ Order ${orderNumber} confirmed`);
      return order;
    } catch (error) {
      console.error('❌ Error confirming order:', error);
      throw error;
    }
  }

  // إلغاء الطلب
  async cancelOrder(orderNumber, reason = null) {
    try {
      const order = await prisma.order.update({
        where: { orderNumber },
        data: {
          status: 'CANCELLED',
          notes: reason || 'تم إلغاء الطلب',
          updatedAt: new Date()
        }
      });

      // تحديث إحصائيات العميل (تقليل العدد والمبلغ)
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          orderCount: { decrement: 1 },
          totalSpent: { decrement: parseFloat(order.total) }
        }
      });

      console.log(`❌ Order ${orderNumber} cancelled`);
      return order;
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }

  // إحصائيات الطلبات
  async getOrderStats(companyId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await prisma.order.aggregate({
        where: {
          companyId,
          createdAt: { gte: startDate }
        },
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true }
      });

      return {
        totalOrders: stats._count.id || 0,
        totalRevenue: parseFloat(stats._sum.total || 0),
        averageOrderValue: parseFloat(stats._avg.total || 0),
        period: `${days} days`
      };
    } catch (error) {
      console.error('❌ Error fetching order stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        period: `${days} days`
      };
    }
  }
}

module.exports = new OrderService();
