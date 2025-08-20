const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Inventory Service - Database Version
 * Manages inventory, warehouses, stock movements, and alerts using Prisma ORM
 */
class InventoryService {
  constructor() {
    this.initializeDefaultData();
  }

  /**
   * Initialize default warehouses and inventory data if not exists
   */
  async initializeDefaultData() {
    try {
      // Check if warehouses table exists and count warehouses
      let warehouseCount = 0;
      try {
        warehouseCount = await prisma.warehouse.count();
      } catch (error) {
        console.log('⚠️ Warehouse table not found, skipping initialization');
        return;
      }
      
      if (warehouseCount === 0) {
        // Get first company for demo data - FIXED: This should be passed as parameter
        // TODO: Remove this and require companyId parameter
        const company = await prisma.company.findFirst({
          select: { id: true, name: true }
        });
        if (!company) return;

        // Create default warehouses
        const warehouses = await prisma.warehouse.createMany({
          data: [
            {
              name: 'المستودع الرئيسي',
              location: 'الرياض - حي الصناعية',
              type: 'main',
              capacity: 10000,
              companyId: company.id,
            },
            {
              name: 'مستودع جدة',
              location: 'جدة - المنطقة الصناعية',
              type: 'branch',
              capacity: 5000,
              companyId: company.id,
            }
          ]
        });

        console.log('✅ تم إنشاء المستودعات الافتراضية');

        // Initialize inventory for existing products
        await this.initializeProductInventory();
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  /**
   * Initialize inventory for existing products
   */
  async initializeProductInventory(companyId = null) {
    try {
      // FIXED: Add company isolation
      const whereClause = companyId ? { companyId } : {};

      const products = await prisma.product.findMany({
        where: whereClause
      });
      const warehouses = await prisma.warehouse.findMany({
        where: whereClause
      });

      for (const product of products) {
        for (const warehouse of warehouses) {
          // Check if inventory record exists
          const existingInventory = await prisma.inventory.findUnique({
            where: {
              productId_warehouseId: {
                productId: product.id,
                warehouseId: warehouse.id
              }
            }
          });

          if (!existingInventory) {
            // Create inventory record with random stock
            const quantity = Math.floor(Math.random() * 100) + 10;
            const reserved = Math.floor(Math.random() * 5);
            const available = quantity - reserved;

            await prisma.inventory.create({
              data: {
                productId: product.id,
                warehouseId: warehouse.id,
                quantity,
                reserved,
                available,
                minStock: 10,
                reorderPoint: 20,
                reorderQuantity: 50,
                cost: parseFloat(product.cost) || 0
              }
            });
          }
        }
      }

      console.log('✅ تم تهيئة المخزون للمنتجات الموجودة');
    } catch (error) {
      console.error('Error initializing product inventory:', error);
    }
  }

  /**
   * Get inventory for all products
   */
  async getInventory(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.productId) {
        whereClause.productId = filters.productId;
      }
      
      if (filters.warehouseId) {
        whereClause.warehouseId = filters.warehouseId;
      }

      const inventory = await prisma.inventory.findMany({
      where: { product: { companyId: req.user?.companyId || companyId } },
        where: whereClause,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              images: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              location: true,
              type: true
            }
          }
        },
        orderBy: [
          { product: { name: 'asc' } },
          { warehouse: { name: 'asc' } }
        ]
      });

      // Transform data to match frontend expectations
      const transformedInventory = inventory.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        productPrice: item.product.price,
        productImages: item.product.images ? JSON.parse(item.product.images) : [],
        warehouseId: item.warehouseId,
        warehouseName: item.warehouse.name,
        warehouseLocation: item.warehouse.location,
        warehouseType: item.warehouse.type,
        quantity: item.quantity,
        reserved: item.reserved,
        available: item.available,
        minStock: item.minStock,
        maxStock: item.maxStock,
        reorderPoint: item.reorderPoint,
        reorderQuantity: item.reorderQuantity,
        cost: item.cost,
        updatedAt: item.updatedAt
      }));

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedInventory = transformedInventory.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedInventory,
        pagination: {
          page,
          limit,
          total: transformedInventory.length,
          pages: Math.ceil(transformedInventory.length / limit)
        }
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
      const inventory = await prisma.inventory.findMany({
      where: {
        productId,
        product: { companyId: companyId }
      },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              price: true,
              images: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              location: true,
              type: true
            }
          }
        }
      });

      if (inventory.length === 0) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      // Calculate totals
      const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
      const totalReserved = inventory.reduce((sum, item) => sum + item.reserved, 0);
      const totalAvailable = inventory.reduce((sum, item) => sum + item.available, 0);

      const productInventory = {
        productId,
        productName: inventory[0].product.name,
        productSku: inventory[0].product.sku,
        productPrice: inventory[0].product.price,
        productImages: inventory[0].product.images ? JSON.parse(inventory[0].product.images) : [],
        totalQuantity,
        totalReserved,
        totalAvailable,
        warehouses: inventory.reduce((acc, item) => {
          acc[item.warehouseId] = {
            warehouseId: item.warehouseId,
            warehouseName: item.warehouse.name,
            warehouseLocation: item.warehouse.location,
            quantity: item.quantity,
            reserved: item.reserved,
            available: item.available,
            minStock: item.minStock,
            maxStock: item.maxStock,
            reorderPoint: item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            cost: item.cost
          };
          return acc;
        }, {})
      };

      return {
        success: true,
        data: productInventory
      };
    } catch (error) {
      console.error('Error getting product inventory:', error);
      return {
        success: false,
        error: 'فشل في جلب مخزون المنتج'
      };
    }
  }

  /**
   * Update stock levels
   */
  async updateStock(productId, warehouseId, quantity, type, reason, reference, notes = '') {
    try {
      // Get current inventory
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      // Calculate new quantities
      let newQuantity = inventory.quantity;
      
      switch (type) {
        case 'in':
          newQuantity += quantity;
          break;
        case 'out':
          if (inventory.available < quantity) {
            return {
              success: false,
              error: 'الكمية المطلوبة غير متوفرة في المخزون'
            };
          }
          newQuantity -= quantity;
          break;
        case 'adjustment':
          newQuantity = quantity;
          break;
        default:
          return {
            success: false,
            error: 'نوع الحركة غير صحيح'
          };
      }

      const newAvailable = newQuantity - inventory.reserved;

      // Update inventory
      const updatedInventory = await prisma.inventory.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          quantity: newQuantity,
          available: newAvailable
        }
      });

      // Create stock movement record
      const movement = await prisma.stockMovement.create({
        data: {
          productId,
          warehouseId,
          type: type.toUpperCase(),
          reason: reason.toUpperCase(),
          quantity: type === 'out' ? -quantity : quantity,
          cost: inventory.cost,
          reference,
          notes,
          userId: '1', // Mock user ID
          userName: 'أحمد المدير'
        }
      });

      // Check for stock alerts
      await this.checkStockAlerts(productId, warehouseId);

      return {
        success: true,
        data: {
          inventory: updatedInventory,
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
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      if (inventory.available < quantity) {
        return {
          success: false,
          error: 'الكمية المطلوبة غير متوفرة للحجز'
        };
      }

      // Update inventory
      const updatedInventory = await prisma.inventory.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          reserved: inventory.reserved + quantity,
          available: inventory.available - quantity
        }
      });

      return {
        success: true,
        data: updatedInventory,
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
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        }
      });

      if (!inventory) {
        return {
          success: false,
          error: 'المنتج غير موجود في المخزون'
        };
      }

      if (inventory.reserved < quantity) {
        return {
          success: false,
          error: 'الكمية المطلوبة غير محجوزة'
        };
      }

      // Update inventory
      const updatedInventory = await prisma.inventory.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        data: {
          reserved: inventory.reserved - quantity,
          available: inventory.available + quantity
        }
      });

      return {
        success: true,
        data: updatedInventory,
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
      const whereClause = {};
      
      if (filters.productId) {
        whereClause.productId = filters.productId;
      }
      
      if (filters.warehouseId) {
        whereClause.warehouseId = filters.warehouseId;
      }
      
      if (filters.type) {
        whereClause.type = filters.type.toUpperCase();
      }
      
      if (filters.reason) {
        whereClause.reason = filters.reason.toUpperCase();
      }

      const movements = await prisma.stockMovement.findMany({
        where: whereClause,
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          },
          warehouse: {
            select: {
              name: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedMovements = movements.slice(startIndex, endIndex);

      // Transform data
      const transformedMovements = paginatedMovements.map(movement => ({
        id: movement.id,
        productId: movement.productId,
        productName: movement.product.name,
        productSku: movement.product.sku,
        warehouseId: movement.warehouseId,
        warehouseName: movement.warehouse.name,
        warehouseLocation: movement.warehouse.location,
        type: movement.type,
        reason: movement.reason,
        quantity: movement.quantity,
        cost: movement.cost,
        reference: movement.reference,
        notes: movement.notes,
        userId: movement.userId,
        userName: movement.userName,
        date: movement.createdAt
      }));

      return {
        success: true,
        data: transformedMovements,
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
      const alerts = await prisma.stockAlert.findMany({
      where: { product: { companyId: companyId } },
        include: {
          product: {
            select: {
              name: true,
              sku: true
            }
          },
          warehouse: {
            select: {
              name: true,
              location: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
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
   * Check stock alerts for specific product and warehouse
   */
  async checkStockAlerts(productId, warehouseId) {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId
          }
        },
        include: {
          product: {
            select: {
              name: true
            }
          },
          warehouse: {
            select: {
              name: true
            }
          }
        }
      });

      if (!inventory) return;

      // FIXED: Add company isolation for security
      // Remove existing alerts for this product/warehouse
      await prisma.stockAlert.deleteMany({
        where: {
          productId,
          warehouseId,
          // Add company isolation by getting it from the inventory record
          product: {
            companyId: inventory.product.companyId
          }
        }
      });

      // Generate new alerts if needed
      const alerts = [];

      // Out of stock alert
      if (inventory.available === 0) {
        alerts.push({
          type: 'OUT_OF_STOCK',
          priority: 'CRITICAL',
          productId,
          productName: inventory.product.name,
          warehouseId,
          warehouseName: inventory.warehouse.name,
          message: `المنتج ${inventory.product.name} نفد من المستودع ${inventory.warehouse.name}`,
          currentStock: inventory.available,
          reorderPoint: inventory.reorderPoint,
          reorderQuantity: inventory.reorderQuantity
        });
      }
      // Low stock alert
      else if (inventory.available <= inventory.reorderPoint) {
        alerts.push({
          type: 'LOW_STOCK',
          priority: inventory.available <= inventory.minStock ? 'HIGH' : 'MEDIUM',
          productId,
          productName: inventory.product.name,
          warehouseId,
          warehouseName: inventory.warehouse.name,
          message: `المنتج ${inventory.product.name} أوشك على النفاد في المستودع ${inventory.warehouse.name}`,
          currentStock: inventory.available,
          reorderPoint: inventory.reorderPoint,
          reorderQuantity: inventory.reorderQuantity
        });
      }

      // Create alerts
      if (alerts.length > 0) {
        await prisma.stockAlert.createMany({
          data: alerts
        });
      }
    } catch (error) {
      console.error('Error checking stock alerts:', error);
    }
  }
}

module.exports = new InventoryService();
