/**
 * Inventory Management Service
 * 
 * Handles inventory tracking, stock alerts, and warehouse management
 */

class InventoryService {
  constructor() {
    this.products = new Map(); // Product inventory
    this.movements = new Map(); // Stock movements
    this.warehouses = new Map(); // Warehouse locations
    this.alerts = new Map(); // Stock alerts
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock warehouses
    const mockWarehouses = [
      {
        id: 'WH001',
        name: 'المستودع الرئيسي',
        location: 'الرياض - حي الصناعية',
        type: 'main',
        capacity: 10000,
        isActive: true,
      },
      {
        id: 'WH002',
        name: 'مستودع جدة',
        location: 'جدة - المنطقة الصناعية',
        type: 'branch',
        capacity: 5000,
        isActive: true,
      }
    ];

    mockWarehouses.forEach(warehouse => {
      this.warehouses.set(warehouse.id, warehouse);
    });

    // Mock inventory data
    const mockInventory = [
      {
        productId: '1',
        productName: 'جهاز لابتوب Dell XPS 13',
        sku: 'DELL-XPS-13-001',
        warehouses: {
          'WH001': {
            quantity: 15,
            reserved: 2,
            available: 13,
            minStock: 5,
            maxStock: 50,
            reorderPoint: 8,
            reorderQuantity: 20,
          },
          'WH002': {
            quantity: 8,
            reserved: 1,
            available: 7,
            minStock: 3,
            maxStock: 20,
            reorderPoint: 5,
            reorderQuantity: 10,
          }
        },
        totalQuantity: 23,
        totalReserved: 3,
        totalAvailable: 20,
        averageCost: 4200,
        lastUpdated: new Date(),
      },
      {
        productId: '2',
        productName: 'هاتف iPhone 15 Pro',
        sku: 'IPHONE-15-PRO-001',
        warehouses: {
          'WH001': {
            quantity: 8,
            reserved: 3,
            available: 5,
            minStock: 10,
            maxStock: 100,
            reorderPoint: 15,
            reorderQuantity: 50,
          },
          'WH002': {
            quantity: 3,
            reserved: 0,
            available: 3,
            minStock: 5,
            maxStock: 30,
            reorderPoint: 8,
            reorderQuantity: 20,
          }
        },
        totalQuantity: 11,
        totalReserved: 3,
        totalAvailable: 8,
        averageCost: 3800,
        lastUpdated: new Date(),
      },
      {
        productId: '3',
        productName: 'سماعات AirPods Pro',
        sku: 'AIRPODS-PRO-001',
        warehouses: {
          'WH001': {
            quantity: 25,
            reserved: 5,
            available: 20,
            minStock: 15,
            maxStock: 200,
            reorderPoint: 25,
            reorderQuantity: 100,
          },
          'WH002': {
            quantity: 12,
            reserved: 2,
            available: 10,
            minStock: 8,
            maxStock: 50,
            reorderPoint: 12,
            reorderQuantity: 30,
          }
        },
        totalQuantity: 37,
        totalReserved: 7,
        totalAvailable: 30,
        averageCost: 1350,
        lastUpdated: new Date(),
      }
    ];

    mockInventory.forEach(item => {
      this.products.set(item.productId, item);
    });

    // Mock stock movements
    const mockMovements = [
      {
        id: 'MOV001',
        productId: '1',
        productName: 'جهاز لابتوب Dell XPS 13',
        warehouseId: 'WH001',
        type: 'in',
        quantity: 20,
        reason: 'purchase',
        reference: 'PO-2024-001',
        cost: 4200,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        userId: '1',
        userName: 'أحمد المدير',
        notes: 'شحنة جديدة من المورد',
      },
      {
        id: 'MOV002',
        productId: '1',
        productName: 'جهاز لابتوب Dell XPS 13',
        warehouseId: 'WH001',
        type: 'out',
        quantity: 1,
        reason: 'sale',
        reference: 'ORD-001',
        cost: 4200,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        userId: '1',
        userName: 'أحمد المدير',
        notes: 'بيع للعميل أحمد محمد',
      },
      {
        id: 'MOV003',
        productId: '2',
        productName: 'هاتف iPhone 15 Pro',
        warehouseId: 'WH001',
        type: 'adjustment',
        quantity: -2,
        reason: 'damage',
        reference: 'ADJ-001',
        cost: 3800,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        userId: '1',
        userName: 'أحمد المدير',
        notes: 'تلف أثناء النقل',
      }
    ];

    mockMovements.forEach(movement => {
      this.movements.set(movement.id, movement);
    });

    // Generate stock alerts
    this.generateStockAlerts();
  }

  /**
   * Get inventory for all products
   */
  async getInventory(filters = {}) {
    try {
      let inventory = Array.from(this.products.values());

      // Apply filters
      if (filters.warehouseId) {
        inventory = inventory.filter(item => 
          item.warehouses[filters.warehouseId]
        );
      }

      if (filters.lowStock) {
        inventory = inventory.filter(item => {
          return Object.values(item.warehouses).some(warehouse => 
            warehouse.available <= warehouse.reorderPoint
          );
        });
      }

      if (filters.outOfStock) {
        inventory = inventory.filter(item => 
          item.totalAvailable === 0
        );
      }

      // Sort by product name
      inventory.sort((a, b) => a.productName.localeCompare(b.productName));

      return {
        success: true,
        data: inventory,
        total: inventory.length
      };
    } catch (error) {
      console.error('Error getting inventory:', error);
      return {
        success: false,
        error: 'فشل في جلب بيانات المخزون'
      };
    }
  }

  /**
   * Get inventory for specific product
   */
  async getProductInventory(productId) {
    try {
      const inventory = this.products.get(productId);
      
      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      return {
        success: true,
        data: inventory
      };
    } catch (error) {
      console.error('Error getting product inventory:', error);
      return {
        success: false,
        error: 'فشل في جلب بيانات المنتج'
      };
    }
  }

  /**
   * Update stock levels
   */
  async updateStock(productId, warehouseId, quantity, type, reason, reference, notes = '') {
    try {
      const inventory = this.products.get(productId);
      
      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      const warehouse = inventory.warehouses[warehouseId];
      if (!warehouse) {
        return {
          success: false,
          error: 'المستودع غير موجود'
        };
      }

      // Calculate new quantities
      let newQuantity = warehouse.quantity;
      
      switch (type) {
        case 'in':
          newQuantity += quantity;
          break;
        case 'out':
          if (warehouse.available < quantity) {
            return {
              success: false,
              error: 'الكمية المطلوبة غير متوفرة'
            };
          }
          newQuantity -= quantity;
          break;
        case 'adjustment':
          newQuantity += quantity; // quantity can be negative
          break;
        case 'transfer':
          // Handle transfer between warehouses
          break;
        default:
          return {
            success: false,
            error: 'نوع الحركة غير صحيح'
          };
      }

      if (newQuantity < 0) {
        return {
          success: false,
          error: 'لا يمكن أن تكون الكمية سالبة'
        };
      }

      // Update warehouse inventory
      warehouse.quantity = newQuantity;
      warehouse.available = newQuantity - warehouse.reserved;

      // Update totals
      inventory.totalQuantity = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.quantity, 0);
      inventory.totalAvailable = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.available, 0);
      inventory.lastUpdated = new Date();

      // Record movement
      const movement = {
        id: this.generateMovementId(),
        productId,
        productName: inventory.productName,
        warehouseId,
        type,
        quantity: Math.abs(quantity),
        reason,
        reference,
        cost: inventory.averageCost,
        date: new Date(),
        userId: '1', // Mock user ID
        userName: 'أحمد المدير',
        notes,
      };

      this.movements.set(movement.id, movement);
      this.products.set(productId, inventory);

      // Check for stock alerts
      this.checkStockAlerts(productId);

      return {
        success: true,
        data: {
          inventory,
          movement
        },
        message: 'تم تحديث المخزون بنجاح'
      };
    } catch (error) {
      console.error('Error updating stock:', error);
      return {
        success: false,
        error: 'فشل في تحديث المخزون'
      };
    }
  }

  /**
   * Reserve stock for orders
   */
  async reserveStock(productId, warehouseId, quantity) {
    try {
      const inventory = this.products.get(productId);
      
      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      const warehouse = inventory.warehouses[warehouseId];
      if (!warehouse) {
        return {
          success: false,
          error: 'المستودع غير موجود'
        };
      }

      if (warehouse.available < quantity) {
        return {
          success: false,
          error: 'الكمية المطلوبة غير متوفرة للحجز'
        };
      }

      // Update reservations
      warehouse.reserved += quantity;
      warehouse.available -= quantity;

      // Update totals
      inventory.totalReserved = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.reserved, 0);
      inventory.totalAvailable = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.available, 0);

      this.products.set(productId, inventory);

      return {
        success: true,
        data: inventory,
        message: 'تم حجز المخزون بنجاح'
      };
    } catch (error) {
      console.error('Error reserving stock:', error);
      return {
        success: false,
        error: 'فشل في حجز المخزون'
      };
    }
  }

  /**
   * Release reserved stock
   */
  async releaseStock(productId, warehouseId, quantity) {
    try {
      const inventory = this.products.get(productId);
      
      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      const warehouse = inventory.warehouses[warehouseId];
      if (!warehouse) {
        return {
          success: false,
          error: 'المستودع غير موجود'
        };
      }

      if (warehouse.reserved < quantity) {
        return {
          success: false,
          error: 'الكمية المحجوزة أقل من المطلوب إلغاؤها'
        };
      }

      // Update reservations
      warehouse.reserved -= quantity;
      warehouse.available += quantity;

      // Update totals
      inventory.totalReserved = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.reserved, 0);
      inventory.totalAvailable = Object.values(inventory.warehouses)
        .reduce((sum, wh) => sum + wh.available, 0);

      this.products.set(productId, inventory);

      return {
        success: true,
        data: inventory,
        message: 'تم إلغاء حجز المخزون بنجاح'
      };
    } catch (error) {
      console.error('Error releasing stock:', error);
      return {
        success: false,
        error: 'فشل في إلغاء حجز المخزون'
      };
    }
  }

  /**
   * Get stock movements
   */
  async getStockMovements(filters = {}) {
    try {
      let movements = Array.from(this.movements.values());

      // Apply filters
      if (filters.productId) {
        movements = movements.filter(m => m.productId === filters.productId);
      }

      if (filters.warehouseId) {
        movements = movements.filter(m => m.warehouseId === filters.warehouseId);
      }

      if (filters.type) {
        movements = movements.filter(m => m.type === filters.type);
      }

      if (filters.reason) {
        movements = movements.filter(m => m.reason === filters.reason);
      }

      // Sort by date (newest first)
      movements.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedMovements = movements.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedMovements,
        pagination: {
          page,
          limit,
          total: movements.length,
          pages: Math.ceil(movements.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting stock movements:', error);
      return {
        success: false,
        error: 'فشل في جلب حركات المخزون'
      };
    }
  }

  /**
   * Get stock alerts
   */
  async getStockAlerts() {
    try {
      const alerts = Array.from(this.alerts.values());
      
      // Sort by priority and date
      alerts.sort((a, b) => {
        if (a.priority !== b.priority) {
          const priorityOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return {
        success: true,
        data: alerts,
        total: alerts.length
      };
    } catch (error) {
      console.error('Error getting stock alerts:', error);
      return {
        success: false,
        error: 'فشل في جلب تنبيهات المخزون'
      };
    }
  }

  /**
   * Generate stock alerts
   */
  generateStockAlerts() {
    this.alerts.clear();
    
    this.products.forEach((inventory, productId) => {
      Object.entries(inventory.warehouses).forEach(([warehouseId, warehouse]) => {
        // Out of stock alert
        if (warehouse.available === 0) {
          this.alerts.set(`${productId}-${warehouseId}-outofstock`, {
            id: `${productId}-${warehouseId}-outofstock`,
            type: 'out_of_stock',
            priority: 'critical',
            productId,
            productName: inventory.productName,
            warehouseId,
            warehouseName: this.warehouses.get(warehouseId)?.name,
            message: `المنتج ${inventory.productName} نفد من المستودع ${this.warehouses.get(warehouseId)?.name}`,
            currentStock: warehouse.available,
            reorderPoint: warehouse.reorderPoint,
            createdAt: new Date(),
            isRead: false,
          });
        }
        // Low stock alert
        else if (warehouse.available <= warehouse.reorderPoint) {
          this.alerts.set(`${productId}-${warehouseId}-lowstock`, {
            id: `${productId}-${warehouseId}-lowstock`,
            type: 'low_stock',
            priority: warehouse.available <= warehouse.minStock ? 'high' : 'medium',
            productId,
            productName: inventory.productName,
            warehouseId,
            warehouseName: this.warehouses.get(warehouseId)?.name,
            message: `المنتج ${inventory.productName} أوشك على النفاد في المستودع ${this.warehouses.get(warehouseId)?.name}`,
            currentStock: warehouse.available,
            reorderPoint: warehouse.reorderPoint,
            reorderQuantity: warehouse.reorderQuantity,
            createdAt: new Date(),
            isRead: false,
          });
        }
      });
    });
  }

  /**
   * Check stock alerts for specific product
   */
  checkStockAlerts(productId) {
    const inventory = this.products.get(productId);
    if (!inventory) return;

    Object.entries(inventory.warehouses).forEach(([warehouseId, warehouse]) => {
      const alertId = `${productId}-${warehouseId}-lowstock`;
      const outOfStockId = `${productId}-${warehouseId}-outofstock`;

      // Remove existing alerts
      this.alerts.delete(alertId);
      this.alerts.delete(outOfStockId);

      // Generate new alerts if needed
      if (warehouse.available === 0) {
        this.alerts.set(outOfStockId, {
          id: outOfStockId,
          type: 'out_of_stock',
          priority: 'critical',
          productId,
          productName: inventory.productName,
          warehouseId,
          warehouseName: this.warehouses.get(warehouseId)?.name,
          message: `المنتج ${inventory.productName} نفد من المستودع ${this.warehouses.get(warehouseId)?.name}`,
          currentStock: warehouse.available,
          reorderPoint: warehouse.reorderPoint,
          createdAt: new Date(),
          isRead: false,
        });
      } else if (warehouse.available <= warehouse.reorderPoint) {
        this.alerts.set(alertId, {
          id: alertId,
          type: 'low_stock',
          priority: warehouse.available <= warehouse.minStock ? 'high' : 'medium',
          productId,
          productName: inventory.productName,
          warehouseId,
          warehouseName: this.warehouses.get(warehouseId)?.name,
          message: `المنتج ${inventory.productName} أوشك على النفاد في المستودع ${this.warehouses.get(warehouseId)?.name}`,
          currentStock: warehouse.available,
          reorderPoint: warehouse.reorderPoint,
          reorderQuantity: warehouse.reorderQuantity,
          createdAt: new Date(),
          isRead: false,
        });
      }
    });
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats() {
    try {
      const products = Array.from(this.products.values());
      const alerts = Array.from(this.alerts.values());
      
      const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.totalQuantity * p.averageCost), 0),
        lowStockProducts: products.filter(p => 
          Object.values(p.warehouses).some(w => w.available <= w.reorderPoint)
        ).length,
        outOfStockProducts: products.filter(p => p.totalAvailable === 0).length,
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
        totalMovements: this.movements.size,
        warehouses: this.warehouses.size,
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المخزون'
      };
    }
  }

  /**
   * Helper methods
   */
  generateMovementId() {
    return `MOV${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new InventoryService();
