const { PrismaClient } = require('@prisma/client');
const { cacheService, CacheService } = require('./cacheService');

/**
 * خدمة البحث المتقدم في المنتجات
 * تستخدم مع Gemini Function Calling للوصول الذكي لقاعدة البيانات
 * مع دعم التخزين المؤقت لتحسين الأداء
 */
class ProductSearchService {
  constructor() {
    this.prisma = new PrismaClient();
    this.cache = cacheService;
  }

  /**
   * البحث في المنتجات بكلمات مفتاحية مع فلترة متقدمة
   */
  async searchProducts(keywords = '', filters = {}) {
    try {
      // إنشاء مفتاح Cache
      const cacheKey = CacheService.createProductCacheKey(filters.companyId, {
        keywords,
        ...filters
      });

      // محاولة جلب من Cache أولاً
      return await this.cache.getOrSet(cacheKey, async () => {
        return await this._searchProductsFromDB(keywords, filters);
      }, 3 * 60 * 1000); // 3 دقائق

    } catch (error) {
      console.error('❌ خطأ في البحث:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * البحث الفعلي في قاعدة البيانات
   */
  async _searchProductsFromDB(keywords = '', filters = {}) {
    console.log(`🔍 البحث في قاعدة البيانات عن: "${keywords}" مع فلاتر:`, filters);

      const {
        category = null,
        priceMin = null,
        priceMax = null,
        companyId = null,
        limit = 10,
        inStock = null,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // بناء شروط البحث
      const where = {};

      // فلترة بالشركة
      if (companyId) {
        where.companyId = companyId;
      }

      // البحث بالكلمات المفتاحية
      if (keywords && keywords.trim()) {
        where.OR = [
          {
            name: {
              contains: keywords
            }
          },
          {
            description: {
              contains: keywords
            }
          }
        ];
      }

      // فلترة بالفئة
      if (category) {
        where.category = {
          name: {
            contains: category
          }
        };
      }

      // فلترة بالسعر
      if (priceMin !== null || priceMax !== null) {
        where.price = {};
        if (priceMin !== null) where.price.gte = parseFloat(priceMin);
        if (priceMax !== null) where.price.lte = parseFloat(priceMax);
      }

      // فلترة بالمخزون
      if (inStock === true) {
        where.stock = { gt: 0 };
      } else if (inStock === false) {
        where.stock = { lte: 0 };
      }

      // فلترة المنتجات النشطة فقط
      where.isActive = true;

      const products = await this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        take: limit
      });

    console.log(`✅ وُجد ${products.length} منتج`);

    return {
      success: true,
      data: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: product.stock,
        category: product.category?.name || 'غير محدد',
        isActive: product.isActive,
        images: product.images ? JSON.parse(product.images) : []
      })),
      total: products.length
    };
  }

  /**
   * جلب منتجات حسب الفئة
   */
  async getProductsByCategory(categoryName, companyId, limit = 10) {
    try {
      console.log(`📂 جلب منتجات فئة: "${categoryName}"`);

      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          category: {
            name: {
              contains: categoryName
            }
          }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return {
        success: true,
        data: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          category: product.category?.name || 'غير محدد'
        }))
      };

    } catch (error) {
      console.error('❌ خطأ في جلب منتجات الفئة:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * جلب تفاصيل منتج محدد
   */
  async getProductDetails(productId, companyId = null) {
    try {
      console.log(`📦 جلب تفاصيل المنتج: ${productId}`);

      const where = { id: productId };
      if (companyId) {
        where.companyId = companyId;
      }

      const product = await this.prisma.product.findFirst({
        where,
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        }
      });

      if (!product) {
        return {
          success: false,
          error: 'المنتج غير موجود',
          data: null
        };
      }

      return {
        success: true,
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
          stock: product.stock,
          category: product.category?.name || 'غير محدد',
          images: product.images ? JSON.parse(product.images) : [],
          variants: product.variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            type: variant.type,
            price: variant.price ? parseFloat(variant.price) : null,
            stock: variant.stock
          })),
          isActive: product.isActive,
          isFeatured: product.isFeatured
        }
      };

    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل المنتج:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * جلب المنتجات الأكثر شعبية (الأكثر مبيعاً)
   */
  async getPopularProducts(companyId, limit = 5) {
    try {
      console.log(`🔥 جلب المنتجات الشائعة للشركة: ${companyId}`);

      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          stock: { gt: 0 }
        },
        include: {
          category: true,
          _count: {
            select: {
              orderItems: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { orderItems: { _count: 'desc' } },
          { createdAt: 'desc' }
        ],
        take: limit
      });

      return {
        success: true,
        data: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          category: product.category?.name || 'غير محدد',
          orderCount: product._count.orderItems,
          isFeatured: product.isFeatured
        }))
      };

    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات الشائعة:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * جلب المنتجات الجديدة
   */
  async getNewProducts(companyId, limit = 5) {
    try {
      console.log(`🆕 جلب المنتجات الجديدة للشركة: ${companyId}`);

      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          stock: { gt: 0 }
        },
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return {
        success: true,
        data: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          category: product.category?.name || 'غير محدد',
          createdAt: product.createdAt
        }))
      };

    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات الجديدة:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * جلب المنتجات في نطاق سعري محدد
   */
  async getProductsByPriceRange(companyId, minPrice, maxPrice, limit = 10) {
    try {
      console.log(`💰 جلب منتجات في نطاق ${minPrice} - ${maxPrice} جنيه`);

      const products = await this.prisma.product.findMany({
        where: {
          companyId,
          isActive: true,
          price: {
            gte: parseFloat(minPrice),
            lte: parseFloat(maxPrice)
          }
        },
        include: {
          category: true
        },
        orderBy: {
          price: 'asc'
        },
        take: limit
      });

      return {
        success: true,
        data: products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          stock: product.stock,
          category: product.category?.name || 'غير محدد'
        }))
      };

    } catch (error) {
      console.error('❌ خطأ في جلب منتجات النطاق السعري:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * جلب الفئات المتاحة
   */
  async getAvailableCategories(companyId) {
    try {
      console.log(`📂 جلب الفئات المتاحة للشركة: ${companyId}`);

      const categories = await this.prisma.category.findMany({
        where: {
          companyId,
          products: {
            some: {
              isActive: true
            }
          }
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  isActive: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return {
        success: true,
        data: categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          productCount: category._count.products
        }))
      };

    } catch (error) {
      console.error('❌ خطأ في جلب الفئات:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * إحصائيات سريعة عن المنتجات
   */
  async getProductStats(companyId) {
    try {
      console.log(`📊 جلب إحصائيات المنتجات للشركة: ${companyId}`);

      const [totalProducts, activeProducts, outOfStock, categories] = await Promise.all([
        this.prisma.product.count({ where: { companyId } }),
        this.prisma.product.count({ where: { companyId, isActive: true } }),
        this.prisma.product.count({ where: { companyId, isActive: true, stock: { lte: 0 } } }),
        this.prisma.category.count({ where: { companyId } })
      ]);

      return {
        success: true,
        data: {
          totalProducts,
          activeProducts,
          outOfStock,
          inStock: activeProducts - outOfStock,
          categories
        }
      };

    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }
}

module.exports = ProductSearchService;
