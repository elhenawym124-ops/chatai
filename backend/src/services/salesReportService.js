/**
 * Sales Reports Service
 * 
 * Handles comprehensive sales reporting, analytics, and business intelligence
 */

class SalesReportService {
  constructor() {
    this.salesData = new Map(); // Sales transactions
    this.productSales = new Map(); // Product-specific sales
    this.customerSales = new Map(); // Customer-specific sales
    this.dailySales = new Map(); // Daily sales summaries
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock sales data
    const mockSales = [
      {
        id: 'SALE001',
        orderId: 'ORD001',
        customerId: '1',
        customerName: 'أحمد محمد',
        customerEmail: 'ahmed@example.com',
        customerPhone: '+966501234567',
        products: [
          {
            productId: '1',
            productName: 'لابتوب HP Pavilion',
            category: 'إلكترونيات',
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500,
            cost: 2000,
            profit: 500,
          }
        ],
        subtotal: 2500,
        tax: 375, // 15%
        shipping: 25,
        discount: 0,
        total: 2900,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        salesChannel: 'messenger',
        salesAgent: 'أحمد المدير',
        region: 'الرياض',
        date: new Date('2024-01-15'),
        deliveredAt: new Date('2024-01-17'),
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'SALE002',
        orderId: 'ORD002',
        customerId: '2',
        customerName: 'سارة أحمد',
        customerEmail: 'sara@example.com',
        customerPhone: '+966507654321',
        products: [
          {
            productId: '2',
            productName: 'هاتف Samsung Galaxy',
            category: 'إلكترونيات',
            quantity: 1,
            unitPrice: 1800,
            totalPrice: 1800,
            cost: 1400,
            profit: 400,
          },
          {
            productId: '3',
            productName: 'ماوس لاسلكي Logitech',
            category: 'إكسسوارات',
            quantity: 2,
            unitPrice: 150,
            totalPrice: 300,
            cost: 200,
            profit: 100,
          }
        ],
        subtotal: 2100,
        tax: 315,
        shipping: 30,
        discount: 100, // كوبون خصم
        total: 2345,
        paymentMethod: 'mada',
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        salesChannel: 'whatsapp',
        salesAgent: 'سارة المستشارة',
        region: 'جدة',
        date: new Date('2024-01-14'),
        deliveredAt: null,
        createdAt: new Date('2024-01-14'),
      },
      {
        id: 'SALE003',
        orderId: 'ORD003',
        customerId: '3',
        customerName: 'محمد علي',
        customerEmail: 'mohammed@example.com',
        customerPhone: '+966509876543',
        products: [
          {
            productId: '4',
            productName: 'كيبورد ميكانيكي',
            category: 'إكسسوارات',
            quantity: 1,
            unitPrice: 350,
            totalPrice: 350,
            cost: 250,
            profit: 100,
          }
        ],
        subtotal: 350,
        tax: 52.5,
        shipping: 20,
        discount: 0,
        total: 422.5,
        paymentMethod: 'stc_pay',
        paymentStatus: 'paid',
        orderStatus: 'processing',
        salesChannel: 'telegram',
        salesAgent: 'أحمد المدير',
        region: 'الدمام',
        date: new Date('2024-01-13'),
        deliveredAt: null,
        createdAt: new Date('2024-01-13'),
      }
    ];

    mockSales.forEach(sale => {
      this.salesData.set(sale.id, sale);
    });

    // Mock daily sales summaries
    const mockDailySales = [
      {
        date: '2024-01-15',
        totalSales: 2900,
        totalOrders: 1,
        totalProfit: 500,
        averageOrderValue: 2900,
        newCustomers: 1,
        returningCustomers: 0,
        topProducts: [
          { productId: '1', productName: 'لابتوب HP Pavilion', quantity: 1, revenue: 2500 }
        ],
        salesByChannel: {
          messenger: 2900,
          whatsapp: 0,
          telegram: 0,
        },
        salesByRegion: {
          'الرياض': 2900,
          'جدة': 0,
          'الدمام': 0,
        },
      },
      {
        date: '2024-01-14',
        totalSales: 2345,
        totalOrders: 1,
        totalProfit: 500,
        averageOrderValue: 2345,
        newCustomers: 1,
        returningCustomers: 0,
        topProducts: [
          { productId: '2', productName: 'هاتف Samsung Galaxy', quantity: 1, revenue: 1800 },
          { productId: '3', productName: 'ماوس لاسلكي Logitech', quantity: 2, revenue: 300 }
        ],
        salesByChannel: {
          messenger: 0,
          whatsapp: 2345,
          telegram: 0,
        },
        salesByRegion: {
          'الرياض': 0,
          'جدة': 2345,
          'الدمام': 0,
        },
      },
      {
        date: '2024-01-13',
        totalSales: 422.5,
        totalOrders: 1,
        totalProfit: 100,
        averageOrderValue: 422.5,
        newCustomers: 1,
        returningCustomers: 0,
        topProducts: [
          { productId: '4', productName: 'كيبورد ميكانيكي', quantity: 1, revenue: 350 }
        ],
        salesByChannel: {
          messenger: 0,
          whatsapp: 0,
          telegram: 422.5,
        },
        salesByRegion: {
          'الرياض': 0,
          'جدة': 0,
          'الدمام': 422.5,
        },
      }
    ];

    mockDailySales.forEach(dailySale => {
      this.dailySales.set(dailySale.date, dailySale);
    });
  }

  /**
   * Get sales overview
   */
  async getSalesOverview(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        period = 'month', // today, week, month, quarter, year, custom
        region,
        salesAgent,
        channel,
      } = filters;

      let sales = Array.from(this.salesData.values());

      // Apply date filter
      const dateRange = this.getDateRange(period, startDate, endDate);
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      // Apply other filters
      if (region) {
        sales = sales.filter(sale => sale.region === region);
      }

      if (salesAgent) {
        sales = sales.filter(sale => sale.salesAgent === salesAgent);
      }

      if (channel) {
        sales = sales.filter(sale => sale.salesChannel === channel);
      }

      // Calculate overview metrics
      const overview = this.calculateOverviewMetrics(sales);

      return {
        success: true,
        data: overview
      };
    } catch (error) {
      console.error('Error getting sales overview:', error);
      return {
        success: false,
        error: 'فشل في جلب نظرة عامة على المبيعات'
      };
    }
  }

  /**
   * Get detailed sales report
   */
  async getDetailedSalesReport(filters = {}) {
    try {
      const {
        startDate,
        endDate,
        period = 'month',
        groupBy = 'day', // day, week, month, product, customer, region
        region,
        salesAgent,
        channel,
        productId,
        customerId,
      } = filters;

      let sales = Array.from(this.salesData.values());

      // Apply date filter
      const dateRange = this.getDateRange(period, startDate, endDate);
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      // Apply other filters
      if (region) sales = sales.filter(sale => sale.region === region);
      if (salesAgent) sales = sales.filter(sale => sale.salesAgent === salesAgent);
      if (channel) sales = sales.filter(sale => sale.salesChannel === channel);
      if (productId) {
        sales = sales.filter(sale => 
          sale.products.some(product => product.productId === productId)
        );
      }
      if (customerId) sales = sales.filter(sale => sale.customerId === customerId);

      // Group and aggregate data
      const groupedData = this.groupSalesData(sales, groupBy);
      const summary = this.calculateSummaryMetrics(sales);

      return {
        success: true,
        data: {
          summary,
          groupedData,
          totalRecords: sales.length,
          dateRange: {
            start: dateRange.start,
            end: dateRange.end,
          },
        }
      };
    } catch (error) {
      console.error('Error getting detailed sales report:', error);
      return {
        success: false,
        error: 'فشل في جلب التقرير المفصل للمبيعات'
      };
    }
  }

  /**
   * Get product performance report
   */
  async getProductPerformanceReport(filters = {}) {
    try {
      const { period = 'month', limit = 20 } = filters;

      let sales = Array.from(this.salesData.values());

      // Apply date filter
      const dateRange = this.getDateRange(period);
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      // Aggregate product data
      const productPerformance = this.aggregateProductData(sales);

      // Sort by revenue and limit results
      const sortedProducts = Object.values(productPerformance)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);

      return {
        success: true,
        data: {
          products: sortedProducts,
          totalProducts: Object.keys(productPerformance).length,
          period: period,
        }
      };
    } catch (error) {
      console.error('Error getting product performance report:', error);
      return {
        success: false,
        error: 'فشل في جلب تقرير أداء المنتجات'
      };
    }
  }

  /**
   * Get customer analysis report
   */
  async getCustomerAnalysisReport(filters = {}) {
    try {
      const { period = 'month', segment = 'all' } = filters;

      let sales = Array.from(this.salesData.values());

      // Apply date filter
      const dateRange = this.getDateRange(period);
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      // Aggregate customer data
      const customerAnalysis = this.aggregateCustomerData(sales);

      // Apply segment filter
      let filteredCustomers = Object.values(customerAnalysis);
      if (segment !== 'all') {
        filteredCustomers = this.filterCustomersBySegment(filteredCustomers, segment);
      }

      // Sort by total spent
      const sortedCustomers = filteredCustomers
        .sort((a, b) => b.totalSpent - a.totalSpent);

      return {
        success: true,
        data: {
          customers: sortedCustomers,
          totalCustomers: Object.keys(customerAnalysis).length,
          segments: this.calculateCustomerSegments(Object.values(customerAnalysis)),
          period: period,
        }
      };
    } catch (error) {
      console.error('Error getting customer analysis report:', error);
      return {
        success: false,
        error: 'فشل في جلب تقرير تحليل العملاء'
      };
    }
  }

  /**
   * Get sales trends and forecasting
   */
  async getSalesTrends(filters = {}) {
    try {
      const { period = 'month', forecastDays = 30 } = filters;

      let sales = Array.from(this.salesData.values());

      // Apply date filter for historical data
      const dateRange = this.getDateRange(period);
      sales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      });

      // Calculate trends
      const trends = this.calculateSalesTrends(sales);
      
      // Generate forecast (mock implementation)
      const forecast = this.generateSalesForecast(sales, forecastDays);

      return {
        success: true,
        data: {
          trends,
          forecast,
          period: period,
          forecastPeriod: forecastDays,
        }
      };
    } catch (error) {
      console.error('Error getting sales trends:', error);
      return {
        success: false,
        error: 'فشل في جلب اتجاهات المبيعات'
      };
    }
  }

  /**
   * Export sales report
   */
  async exportSalesReport(filters = {}, format = 'csv') {
    try {
      const reportData = await this.getDetailedSalesReport(filters);
      
      if (!reportData.success) {
        return reportData;
      }

      // Generate export data based on format
      let exportData;
      switch (format.toLowerCase()) {
        case 'csv':
          exportData = this.generateCSVExport(reportData.data);
          break;
        case 'excel':
          exportData = this.generateExcelExport(reportData.data);
          break;
        case 'pdf':
          exportData = this.generatePDFExport(reportData.data);
          break;
        default:
          return {
            success: false,
            error: 'صيغة التصدير غير مدعومة'
          };
      }

      return {
        success: true,
        data: {
          format,
          filename: `sales_report_${new Date().toISOString().split('T')[0]}.${format}`,
          downloadUrl: exportData.url,
          size: exportData.size,
        },
        message: 'تم إنشاء التقرير بنجاح'
      };
    } catch (error) {
      console.error('Error exporting sales report:', error);
      return {
        success: false,
        error: 'فشل في تصدير التقرير'
      };
    }
  }

  /**
   * Helper methods
   */
  calculateOverviewMetrics(sales) {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = sales.reduce((sum, sale) => 
      sum + sale.products.reduce((productSum, product) => productSum + product.profit, 0), 0
    );
    const totalOrders = sales.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth compared to previous period (mock)
    const previousPeriodRevenue = totalRevenue * 0.85; // Mock 15% growth
    const revenueGrowth = previousPeriodRevenue > 0 ? 
      ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100).toFixed(1) : 0;

    return {
      totalRevenue: Math.round(totalRevenue),
      totalProfit: Math.round(totalProfit),
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0,
      revenueGrowth: `${revenueGrowth}%`,
      topSellingProducts: this.getTopSellingProducts(sales, 5),
      salesByChannel: this.getSalesByChannel(sales),
      salesByRegion: this.getSalesByRegion(sales),
      salesByPaymentMethod: this.getSalesByPaymentMethod(sales),
      monthlyTrend: this.getMonthlyTrend(sales),
    };
  }

  calculateSummaryMetrics(sales) {
    return {
      totalSales: sales.reduce((sum, sale) => sum + sale.total, 0),
      totalOrders: sales.length,
      totalProfit: sales.reduce((sum, sale) => 
        sum + sale.products.reduce((productSum, product) => productSum + product.profit, 0), 0
      ),
      averageOrderValue: sales.length > 0 ? 
        sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0,
      totalCustomers: new Set(sales.map(sale => sale.customerId)).size,
      totalProducts: new Set(sales.flatMap(sale => sale.products.map(p => p.productId))).size,
    };
  }

  groupSalesData(sales, groupBy) {
    const grouped = {};

    sales.forEach(sale => {
      let key;
      
      switch (groupBy) {
        case 'day':
          key = sale.date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(sale.date);
          weekStart.setDate(sale.date.getDate() - sale.date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${sale.date.getFullYear()}-${(sale.date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        case 'product':
          sale.products.forEach(product => {
            key = product.productName;
            if (!grouped[key]) {
              grouped[key] = { items: [], summary: { revenue: 0, quantity: 0, profit: 0 } };
            }
            grouped[key].items.push({ ...sale, product });
            grouped[key].summary.revenue += product.totalPrice;
            grouped[key].summary.quantity += product.quantity;
            grouped[key].summary.profit += product.profit;
          });
          return;
        case 'customer':
          key = sale.customerName;
          break;
        case 'region':
          key = sale.region;
          break;
        default:
          key = sale.date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = { items: [], summary: { revenue: 0, orders: 0, profit: 0 } };
      }

      grouped[key].items.push(sale);
      grouped[key].summary.revenue += sale.total;
      grouped[key].summary.orders += 1;
      grouped[key].summary.profit += sale.products.reduce((sum, p) => sum + p.profit, 0);
    });

    return grouped;
  }

  aggregateProductData(sales) {
    const productData = {};

    sales.forEach(sale => {
      sale.products.forEach(product => {
        if (!productData[product.productId]) {
          productData[product.productId] = {
            productId: product.productId,
            productName: product.productName,
            category: product.category,
            totalQuantity: 0,
            totalRevenue: 0,
            totalProfit: 0,
            totalOrders: 0,
            averagePrice: 0,
          };
        }

        const data = productData[product.productId];
        data.totalQuantity += product.quantity;
        data.totalRevenue += product.totalPrice;
        data.totalProfit += product.profit;
        data.totalOrders += 1;
        data.averagePrice = data.totalRevenue / data.totalQuantity;
      });
    });

    return productData;
  }

  aggregateCustomerData(sales) {
    const customerData = {};

    sales.forEach(sale => {
      if (!customerData[sale.customerId]) {
        customerData[sale.customerId] = {
          customerId: sale.customerId,
          customerName: sale.customerName,
          customerEmail: sale.customerEmail,
          totalOrders: 0,
          totalSpent: 0,
          totalProfit: 0,
          averageOrderValue: 0,
          firstPurchase: sale.date,
          lastPurchase: sale.date,
          favoriteProducts: {},
          preferredChannel: {},
        };
      }

      const data = customerData[sale.customerId];
      data.totalOrders += 1;
      data.totalSpent += sale.total;
      data.totalProfit += sale.products.reduce((sum, p) => sum + p.profit, 0);
      data.averageOrderValue = data.totalSpent / data.totalOrders;
      
      if (sale.date < data.firstPurchase) data.firstPurchase = sale.date;
      if (sale.date > data.lastPurchase) data.lastPurchase = sale.date;

      // Track favorite products
      sale.products.forEach(product => {
        data.favoriteProducts[product.productName] = 
          (data.favoriteProducts[product.productName] || 0) + product.quantity;
      });

      // Track preferred channel
      data.preferredChannel[sale.salesChannel] = 
        (data.preferredChannel[sale.salesChannel] || 0) + 1;
    });

    return customerData;
  }

  getTopSellingProducts(sales, limit = 5) {
    const productSales = {};

    sales.forEach(sale => {
      sale.products.forEach(product => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = {
            productId: product.productId,
            productName: product.productName,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[product.productId].totalQuantity += product.quantity;
        productSales[product.productId].totalRevenue += product.totalPrice;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  getSalesByChannel(sales) {
    const channelSales = {};
    sales.forEach(sale => {
      channelSales[sale.salesChannel] = (channelSales[sale.salesChannel] || 0) + sale.total;
    });
    return channelSales;
  }

  getSalesByRegion(sales) {
    const regionSales = {};
    sales.forEach(sale => {
      regionSales[sale.region] = (regionSales[sale.region] || 0) + sale.total;
    });
    return regionSales;
  }

  getSalesByPaymentMethod(sales) {
    const paymentSales = {};
    sales.forEach(sale => {
      paymentSales[sale.paymentMethod] = (paymentSales[sale.paymentMethod] || 0) + sale.total;
    });
    return paymentSales;
  }

  getMonthlyTrend(sales) {
    // Mock monthly trend - in production, calculate from actual data
    return [
      { month: 'يناير', revenue: 45000, orders: 120 },
      { month: 'فبراير', revenue: 52000, orders: 135 },
      { month: 'مارس', revenue: 48000, orders: 128 },
    ];
  }

  calculateSalesTrends(sales) {
    // Mock trend calculation
    return {
      dailyTrend: [
        { date: '2024-01-13', revenue: 422.5, orders: 1 },
        { date: '2024-01-14', revenue: 2345, orders: 1 },
        { date: '2024-01-15', revenue: 2900, orders: 1 },
      ],
      weeklyGrowth: '+15%',
      monthlyGrowth: '+8%',
      seasonalTrends: {
        'Q1': 145000,
        'Q2': 162000,
        'Q3': 158000,
        'Q4': 189000,
      },
    };
  }

  generateSalesForecast(sales, days) {
    // Mock forecast generation
    const forecast = [];
    const baseRevenue = 2000;
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const revenue = baseRevenue + (Math.random() * 1000 - 500);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedRevenue: Math.round(revenue),
        confidence: 0.75 + (Math.random() * 0.2),
      });
    }

    return forecast;
  }

  calculateCustomerSegments(customers) {
    const segments = {
      vip: customers.filter(c => c.totalSpent > 5000).length,
      regular: customers.filter(c => c.totalSpent >= 1000 && c.totalSpent <= 5000).length,
      new: customers.filter(c => c.totalSpent < 1000).length,
    };

    return segments;
  }

  filterCustomersBySegment(customers, segment) {
    switch (segment) {
      case 'vip':
        return customers.filter(c => c.totalSpent > 5000);
      case 'regular':
        return customers.filter(c => c.totalSpent >= 1000 && c.totalSpent <= 5000);
      case 'new':
        return customers.filter(c => c.totalSpent < 1000);
      default:
        return customers;
    }
  }

  generateCSVExport(data) {
    // Mock CSV generation
    return {
      url: '/exports/sales_report.csv',
      size: '2.5 MB',
    };
  }

  generateExcelExport(data) {
    // Mock Excel generation
    return {
      url: '/exports/sales_report.xlsx',
      size: '3.2 MB',
    };
  }

  generatePDFExport(data) {
    // Mock PDF generation
    return {
      url: '/exports/sales_report.pdf',
      size: '1.8 MB',
    };
  }

  getDateRange(period, startDate = null, endDate = null) {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = now;
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
    }

    return { start, end };
  }
}

module.exports = new SalesReportService();
