import { PrismaClient } from '@prisma/client';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError 
} from '../../../shared/errors/AppError';
import { enhancedLogger } from '../../../shared/utils/logger';
import { getPrismaClient } from '../../../config/database';
import { PaginationParams, FilterParams } from '../../../shared/types/common';

interface ProductData {
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  cost?: number;
  sku?: string;
  categoryId: string;
  images?: string;
  tags?: string;
  stock?: number;
  lowStockThreshold?: number;
  trackQuantity?: boolean;
  isActive?: boolean;
  weight?: number;
  dimensions?: string;
  seoTitle?: string;
  seoDescription?: string;
  companyId: string;
}

interface CategoryData {
  name: string;
  description?: string;
  parentId?: string;
  companyId: string;
}

/**
 * Product Service
 * 
 * Handles all product business logic including:
 * - Product CRUD operations
 * - Category management
 * - Inventory tracking
 * - Product analytics
 * - Search and filtering
 */
export class ProductService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  /**
   * Get products with filtering and pagination
   */
  async getProducts(filters: FilterParams & { companyId: string }, pagination: PaginationParams): Promise<any[]> {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const { companyId, search, categoryId, isActive, priceMin, priceMax, inStock } = filters;

      const skip = (page - 1) * limit;
      const where: any = { companyId };

      // Apply filters
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (priceMin || priceMax) {
        where.price = {};
        if (priceMin) where.price.gte = parseFloat(priceMin);
        if (priceMax) where.price.lte = parseFloat(priceMax);
      }

      if (inStock) {
        where.stock = { gt: 0 };
      }

      const products = await this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              orderItems: true,
              variants: true,
            }
          }
        }
      });

      // Parse JSON fields for each product
      return products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      }));
    } catch (error) {
      enhancedLogger.error('Get products failed', error);
      throw error;
    }
  }

  /**
   * Get products count for pagination
   */
  async getProductsCount(filters: FilterParams & { companyId: string }): Promise<number> {
    try {
      const { companyId, search, categoryId, isActive, priceMin, priceMax, inStock } = filters;
      const where: any = { companyId };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (categoryId) where.categoryId = categoryId;
      if (isActive !== undefined) where.isActive = isActive;
      if (priceMin || priceMax) {
        where.price = {};
        if (priceMin) where.price.gte = parseFloat(priceMin);
        if (priceMax) where.price.lte = parseFloat(priceMax);
      }
      if (inStock) where.stock = { gt: 0 };

      return await this.prisma.product.count({ where });
    } catch (error) {
      enhancedLogger.error('Get products count failed', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string, companyId: string): Promise<any> {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id, companyId },
        include: {
          category: true,
          variants: {
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              orderItems: true,
              variants: true,
            }
          }
        }
      });

      if (!product) {
        throw new NotFoundError('Product', id);
      }

      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      };
    } catch (error) {
      enhancedLogger.error('Get product by ID failed', error, { productId: id });
      throw error;
    }
  }

  /**
   * Create new product
   */
  async createProduct(productData: ProductData, variants?: any[]): Promise<any> {
    try {
      // Check if SKU already exists
      if (productData.sku) {
        const existingProduct = await this.prisma.product.findFirst({
          where: {
            sku: productData.sku,
            companyId: productData.companyId,
          }
        });

        if (existingProduct) {
          throw new ConflictError('Product with this SKU already exists');
        }
      }

      // Create product with variants in transaction
      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: productData,
          include: {
            category: true,
            _count: {
              select: {
                orderItems: true,
                variants: true,
              }
            }
          }
        });

        // Create variants if provided
        if (variants && variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map(variant => ({
              ...variant,
              productId: product.id,
            }))
          });
        }

        return product;
      });

      enhancedLogger.business('product_created', {
        productId: result.id,
        companyId: productData.companyId,
      });

      return {
        ...result,
        images: result.images ? JSON.parse(result.images) : [],
        tags: result.tags ? JSON.parse(result.tags) : [],
        dimensions: result.dimensions ? JSON.parse(result.dimensions) : null,
      };
    } catch (error) {
      enhancedLogger.error('Create product failed', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, updateData: any, companyId: string): Promise<any> {
    try {
      // Check if product exists and belongs to company
      const existingProduct = await this.prisma.product.findFirst({
        where: { id, companyId }
      });

      if (!existingProduct) {
        throw new NotFoundError('Product', id);
      }

      // Check SKU uniqueness if SKU is being updated
      if (updateData.sku && updateData.sku !== existingProduct.sku) {
        const skuExists = await this.prisma.product.findFirst({
          where: {
            sku: updateData.sku,
            companyId,
            id: { not: id }
          }
        });

        if (skuExists) {
          throw new ConflictError('Product with this SKU already exists');
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true,
              variants: true,
            }
          }
        }
      });

      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      };
    } catch (error) {
      enhancedLogger.error('Update product failed', error, { productId: id });
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string, companyId: string): Promise<void> {
    try {
      // Check if product exists and belongs to company
      const product = await this.prisma.product.findFirst({
        where: { id, companyId }
      });

      if (!product) {
        throw new NotFoundError('Product', id);
      }

      // Soft delete by updating isActive
      await this.prisma.product.update({
        where: { id },
        data: { isActive: false }
      });

      enhancedLogger.business('product_deleted', { productId: id });
    } catch (error) {
      enhancedLogger.error('Delete product failed', error, { productId: id });
      throw error;
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string, companyId: string): Promise<any[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { sku: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
      });

      return products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      }));
    } catch (error) {
      enhancedLogger.error('Search products failed', error, { query });
      throw error;
    }
  }

  /**
   * Get categories
   */
  async getCategories(companyId: string): Promise<any[]> {
    try {
      console.log('🔍 ProductService: Getting categories for company:', companyId);

      const categories = await this.prisma.category.findMany({
        where: { companyId },
        include: {
          _count: {
            select: { products: true }
          },
          children: {
            include: {
              _count: {
                select: { products: true }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      console.log('📦 ProductService: Found categories:', categories.length);
      console.log('📋 ProductService: Categories data:', categories.map(c => ({ id: c.id, name: c.name, products: c._count.products })));

      return categories;
    } catch (error) {
      console.error('❌ ProductService: Get categories failed:', error);
      enhancedLogger.error('Get categories failed', error);
      throw error;
    }
  }

  /**
   * Create category
   */
  async createCategory(categoryData: CategoryData): Promise<any> {
    try {
      // Check if category name already exists
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: categoryData.name,
          companyId: categoryData.companyId,
        }
      });

      if (existingCategory) {
        throw new ConflictError('Category with this name already exists');
      }

      const category = await this.prisma.category.create({
        data: categoryData,
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      enhancedLogger.business('category_created', {
        categoryId: category.id,
        companyId: categoryData.companyId,
      });

      return category;
    } catch (error) {
      enhancedLogger.error('Create category failed', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, categoryData: Partial<CategoryData>, companyId: string): Promise<any> {
    try {
      // Check if category exists and belongs to company
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          id: categoryId,
          companyId: companyId,
        }
      });

      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Check if new name conflicts with existing categories
      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const nameConflict = await this.prisma.category.findFirst({
          where: {
            name: categoryData.name,
            companyId: companyId,
            id: { not: categoryId }
          }
        });

        if (nameConflict) {
          throw new ConflictError('Category with this name already exists');
        }
      }

      const category = await this.prisma.category.update({
        where: { id: categoryId },
        data: categoryData,
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      enhancedLogger.business('category_updated', {
        categoryId: categoryId,
        companyId: companyId,
      });

      return category;
    } catch (error) {
      enhancedLogger.error('Update category failed', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string, companyId: string): Promise<void> {
    try {
      // Check if category exists and belongs to company
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          id: categoryId,
          companyId: companyId,
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      if (!existingCategory) {
        throw new NotFoundError('Category not found');
      }

      // Check if category has products
      if (existingCategory._count.products > 0) {
        throw new ConflictError(`Cannot delete category with ${existingCategory._count.products} products`);
      }

      await this.prisma.category.delete({
        where: { id: categoryId }
      });

      enhancedLogger.business('category_deleted', {
        categoryId: categoryId,
        companyId: companyId,
      });
    } catch (error) {
      enhancedLogger.error('Delete category failed', error);
      throw error;
    }
  }

  /**
   * Cleanup duplicate and empty categories
   */
  async cleanupCategories(companyId: string): Promise<{ deletedCount: number; message: string }> {
    try {
      // Get all categories for the company
      const categories = await this.prisma.category.findMany({
        where: { companyId },
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      let deletedCount = 0;
      const nameCounts = new Map<string, string[]>();

      // Group categories by name
      categories.forEach(category => {
        if (!nameCounts.has(category.name)) {
          nameCounts.set(category.name, []);
        }
        nameCounts.get(category.name)!.push(category.id);
      });

      // Delete duplicates (keep the first one) and empty categories
      for (const [name, categoryIds] of nameCounts) {
        if (categoryIds.length > 1) {
          // Keep the first category, delete the rest if they're empty
          for (let i = 1; i < categoryIds.length; i++) {
            const category = categories.find(c => c.id === categoryIds[i]);
            if (category && category._count.products === 0) {
              await this.prisma.category.delete({
                where: { id: categoryIds[i] }
              });
              deletedCount++;
            }
          }
        }
      }

      // Delete empty categories with numeric names like "1", "3"
      const numericEmptyCategories = categories.filter(c =>
        /^\d+$/.test(c.name) && c._count.products === 0
      );

      for (const category of numericEmptyCategories) {
        await this.prisma.category.delete({
          where: { id: category.id }
        });
        deletedCount++;
      }

      enhancedLogger.business('categories_cleaned', {
        companyId: companyId,
        deletedCount: deletedCount,
      });

      return {
        deletedCount,
        message: `Cleaned up ${deletedCount} categories`
      };
    } catch (error) {
      enhancedLogger.error('Cleanup categories failed', error);
      throw error;
    }
  }

  /**
   * Update inventory
   */
  async updateInventory(
    productId: string,
    quantity: number,
    operation: 'set' | 'add' | 'subtract',
    companyId: string,
    userId: string
  ): Promise<any> {
    try {
      const product = await this.prisma.product.findFirst({
        where: { id: productId, companyId }
      });

      if (!product) {
        throw new NotFoundError('Product', productId);
      }

      let newStock = product.stock;
      
      switch (operation) {
        case 'set':
          newStock = quantity;
          break;
        case 'add':
          newStock = product.stock + quantity;
          break;
        case 'subtract':
          newStock = product.stock - quantity;
          break;
      }

      if (newStock < 0) {
        throw new ValidationError('Stock cannot be negative');
      }

      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
        include: {
          category: true,
        }
      });

      // Log inventory change
      await this.prisma.inventoryLog.create({
        data: {
          productId,
          previousStock: product.stock,
          newStock,
          changeAmount: newStock - product.stock,
          operation,
          reason: `Manual ${operation} by user`,
          userId,
        }
      });

      return {
        ...updatedProduct,
        images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
        tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
        dimensions: updatedProduct.dimensions ? JSON.parse(updatedProduct.dimensions) : null,
      };
    } catch (error) {
      enhancedLogger.error('Update inventory failed', error, { productId });
      throw error;
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(companyId: string): Promise<any[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          trackQuantity: true,
          stock: {
            lte: this.prisma.product.fields.lowStockThreshold
          }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: { stock: 'asc' }
      });

      return products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        tags: product.tags ? JSON.parse(product.tags) : [],
        dimensions: product.dimensions ? JSON.parse(product.dimensions) : null,
      }));
    } catch (error) {
      enhancedLogger.error('Get low stock products failed', error);
      throw error;
    }
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(companyId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    try {
      const where: any = { companyId };
      
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue,
        topSellingProducts
      ] = await Promise.all([
        this.prisma.product.count({ where }),
        this.prisma.product.count({ where: { ...where, isActive: true } }),
        this.prisma.product.count({
          where: {
            ...where,
            isActive: true,
            trackQuantity: true,
            stock: { lte: this.prisma.product.fields.lowStockThreshold }
          }
        }),
        this.prisma.product.count({
          where: {
            ...where,
            isActive: true,
            trackQuantity: true,
            stock: 0
          }
        }),
        this.prisma.product.aggregate({
          where: { ...where, isActive: true },
          _sum: { price: true }
        }),
        this.prisma.product.findMany({
          where: { ...where, isActive: true },
          include: {
            _count: {
              select: { orderItems: true }
            }
          },
          orderBy: {
            orderItems: {
              _count: 'desc'
            }
          },
          take: 10
        })
      ]);

      return {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue: totalValue._sum.price || 0,
        topSellingProducts: topSellingProducts.map(product => ({
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
          tags: product.tags ? JSON.parse(product.tags) : [],
          salesCount: product._count.orderItems,
        })),
      };
    } catch (error) {
      enhancedLogger.error('Get product analytics failed', error);
      throw error;
    }
  }

  /**
   * Export products
   */
  async exportProducts(filters: FilterParams & { companyId: string }, format: string): Promise<{ data: string; count: number }> {
    try {
      const products = await this.getProducts(filters, { page: 1, limit: 10000 }); // Get all products

      if (format === 'csv') {
        const headers = ['ID', 'Name', 'SKU', 'Price', 'Stock', 'Category', 'Status', 'Created At'];
        const csvData = [
          headers.join(','),
          ...products.map(product => [
            product.id,
            `"${product.name}"`,
            product.sku || '',
            product.price,
            product.stock,
            `"${product.category?.name || ''}"`,
            product.isActive ? 'Active' : 'Inactive',
            product.createdAt
          ].join(','))
        ].join('\n');

        return { data: csvData, count: products.length };
      } else {
        return { data: JSON.stringify(products, null, 2), count: products.length };
      }
    } catch (error) {
      enhancedLogger.error('Export products failed', error);
      throw error;
    }
  }
}
