/**
 * Cart and Order Service
 * 
 * Handles shopping cart operations and order management
 */

class CartService {
  constructor() {
    this.carts = new Map(); // Customer carts
    this.orders = new Map(); // Order history
    this.products = new Map(); // Product catalog
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock products
    const mockProducts = [
      {
        id: '1',
        name: 'جهاز لابتوب Dell XPS 13',
        price: 4500,
        comparePrice: 5000,
        sku: 'DELL-XPS-13-001',
        category: 'أجهزة كمبيوتر',
        stock: 15,
        image: '/images/dell-xps-13.jpg',
        isActive: true,
      },
      {
        id: '2',
        name: 'هاتف iPhone 15 Pro',
        price: 4200,
        comparePrice: 4500,
        sku: 'IPHONE-15-PRO-001',
        category: 'هواتف ذكية',
        stock: 8,
        image: '/images/iphone-15-pro.jpg',
        isActive: true,
      },
      {
        id: '3',
        name: 'سماعات AirPods Pro',
        price: 1500,
        comparePrice: 1800,
        sku: 'AIRPODS-PRO-001',
        category: 'إكسسوارات',
        stock: 25,
        image: '/images/airpods-pro.jpg',
        isActive: true,
      },
      {
        id: '4',
        name: 'ساعة Apple Watch Series 9',
        price: 3000,
        comparePrice: 3200,
        sku: 'APPLE-WATCH-S9-001',
        category: 'ساعات ذكية',
        stock: 12,
        image: '/images/apple-watch-s9.jpg',
        isActive: true,
      }
    ];

    mockProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Mock orders
    const mockOrders = [
      {
        id: 'ORD-001',
        customerId: '1',
        customerName: 'أحمد محمد',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+966501234567',
        status: 'delivered',
        items: [
          {
            productId: '1',
            productName: 'جهاز لابتوب Dell XPS 13',
            quantity: 1,
            price: 4500,
            total: 4500
          }
        ],
        subtotal: 4500,
        tax: 675, // 15% VAT
        shipping: 50,
        discount: 0,
        total: 5225,
        shippingAddress: {
          street: 'شارع الملك فهد',
          city: 'الرياض',
          state: 'الرياض',
          zipCode: '12345',
          country: 'السعودية'
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-10'),
        deliveryDate: new Date('2024-01-12'),
        trackingNumber: 'TRK123456789',
        notes: 'توصيل سريع'
      },
      {
        id: 'ORD-002',
        customerId: '2',
        customerName: 'سارة أحمد',
        customerEmail: 'sara@example.com',
        customerPhone: '+966507654321',
        status: 'processing',
        items: [
          {
            productId: '2',
            productName: 'هاتف iPhone 15 Pro',
            quantity: 1,
            price: 4200,
            total: 4200
          },
          {
            productId: '3',
            productName: 'سماعات AirPods Pro',
            quantity: 1,
            price: 1500,
            total: 1500
          }
        ],
        subtotal: 5700,
        tax: 855,
        shipping: 0, // Free shipping
        discount: 570, // 10% discount
        total: 5985,
        shippingAddress: {
          street: 'شارع العليا',
          city: 'الرياض',
          state: 'الرياض',
          zipCode: '11564',
          country: 'السعودية'
        },
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        orderDate: new Date('2024-01-15'),
        deliveryDate: null,
        trackingNumber: null,
        notes: ''
      }
    ];

    mockOrders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }

  /**
   * Get customer cart
   */
  async getCart(customerId) {
    try {
      const cart = this.carts.get(customerId) || {
        customerId,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        updatedAt: new Date(),
      };

      return {
        success: true,
        data: cart
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      return {
        success: false,
        error: 'فشل في جلب سلة التسوق'
      };
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(customerId, productId, quantity = 1) {
    try {
      const product = this.products.get(productId);
      if (!product) {
        return {
          success: false,
          error: 'المنتج غير موجود'
        };
      }

      if (!product.isActive) {
        return {
          success: false,
          error: 'المنتج غير متاح'
        };
      }

      if (product.stock < quantity) {
        return {
          success: false,
          error: 'الكمية المطلوبة غير متوفرة في المخزون'
        };
      }

      let cart = this.carts.get(customerId) || {
        customerId,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        updatedAt: new Date(),
      };

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (product.stock < newQuantity) {
          return {
            success: false,
            error: 'الكمية الإجمالية تتجاوز المخزون المتاح'
          };
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].total = newQuantity * product.price;
      } else {
        // Add new item
        cart.items.push({
          productId,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity,
          total: quantity * product.price,
          sku: product.sku,
        });
      }

      // Recalculate totals
      cart = this.calculateCartTotals(cart);
      cart.updatedAt = new Date();

      this.carts.set(customerId, cart);

      return {
        success: true,
        data: cart,
        message: 'تم إضافة المنتج إلى السلة'
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: 'فشل في إضافة المنتج إلى السلة'
      };
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(customerId, productId, quantity) {
    try {
      const cart = this.carts.get(customerId);
      if (!cart) {
        return {
          success: false,
          error: 'السلة غير موجودة'
        };
      }

      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        return {
          success: false,
          error: 'المنتج غير موجود في السلة'
        };
      }

      if (quantity <= 0) {
        // Remove item
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock
        const product = this.products.get(productId);
        if (product && product.stock < quantity) {
          return {
            success: false,
            error: 'الكمية المطلوبة غير متوفرة في المخزون'
          };
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].total = quantity * cart.items[itemIndex].price;
      }

      // Recalculate totals
      const updatedCart = this.calculateCartTotals(cart);
      updatedCart.updatedAt = new Date();

      this.carts.set(customerId, updatedCart);

      return {
        success: true,
        data: updatedCart,
        message: 'تم تحديث السلة'
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        error: 'فشل في تحديث السلة'
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(customerId, productId) {
    return this.updateCartItem(customerId, productId, 0);
  }

  /**
   * Clear cart
   */
  async clearCart(customerId) {
    try {
      this.carts.delete(customerId);
      
      return {
        success: true,
        message: 'تم إفراغ السلة'
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: 'فشل في إفراغ السلة'
      };
    }
  }

  /**
   * Create order from cart
   */
  async createOrder(customerId, orderData) {
    try {
      const cart = this.carts.get(customerId);
      if (!cart || cart.items.length === 0) {
        return {
          success: false,
          error: 'السلة فارغة'
        };
      }

      // Validate stock for all items
      for (const item of cart.items) {
        const product = this.products.get(item.productId);
        if (!product || product.stock < item.quantity) {
          return {
            success: false,
            error: `المنتج ${item.productName} غير متوفر بالكمية المطلوبة`
          };
        }
      }

      // Generate order ID
      const orderId = this.generateOrderId();

      const order = {
        id: orderId,
        customerId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        status: 'pending',
        items: [...cart.items],
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        discount: cart.discount,
        total: cart.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        orderDate: new Date(),
        deliveryDate: null,
        trackingNumber: null,
        notes: orderData.notes || '',
      };

      // Update product stock
      for (const item of cart.items) {
        const product = this.products.get(item.productId);
        if (product) {
          product.stock -= item.quantity;
          this.products.set(item.productId, product);
        }
      }

      // Save order
      this.orders.set(orderId, order);

      // Clear cart
      this.carts.delete(customerId);

      return {
        success: true,
        data: order,
        message: 'تم إنشاء الطلب بنجاح'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: 'فشل في إنشاء الطلب'
      };
    }
  }

  /**
   * Get orders with filters
   */
  async getOrders(filters = {}) {
    try {
      let orders = Array.from(this.orders.values());

      // Apply filters
      if (filters.customerId) {
        orders = orders.filter(order => order.customerId === filters.customerId);
      }

      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }

      if (filters.paymentStatus) {
        orders = orders.filter(order => order.paymentStatus === filters.paymentStatus);
      }

      // Sort by order date (newest first)
      orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedOrders = orders.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedOrders,
        pagination: {
          page,
          limit,
          total: orders.length,
          pages: Math.ceil(orders.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      return {
        success: false,
        error: 'فشل في جلب الطلبات'
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const order = this.orders.get(orderId);
      
      if (!order) {
        return {
          success: false,
          error: 'الطلب غير موجود'
        };
      }

      return {
        success: true,
        data: order
      };
    } catch (error) {
      console.error('Error getting order:', error);
      return {
        success: false,
        error: 'فشل في جلب الطلب'
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, trackingNumber = null) {
    try {
      const order = this.orders.get(orderId);
      
      if (!order) {
        return {
          success: false,
          error: 'الطلب غير موجود'
        };
      }

      order.status = status;
      
      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      if (status === 'delivered') {
        order.deliveryDate = new Date();
      }

      this.orders.set(orderId, order);

      return {
        success: true,
        data: order,
        message: 'تم تحديث حالة الطلب'
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة الطلب'
      };
    }
  }

  /**
   * Calculate cart totals
   */
  calculateCartTotals(cart) {
    const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round(subtotal * 0.15); // 15% VAT
    const shipping = subtotal >= 500 ? 0 : 50; // Free shipping over 500 SAR
    const discount = cart.discount || 0;
    const total = subtotal + tax + shipping - discount;

    return {
      ...cart,
      subtotal,
      tax,
      shipping,
      discount,
      total,
    };
  }

  /**
   * Generate order ID
   */
  generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 3).toUpperCase();
    return `ORD-${timestamp}${random}`;
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    try {
      const orders = Array.from(this.orders.values());
      
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات الطلبات'
      };
    }
  }
}

module.exports = new CartService();
