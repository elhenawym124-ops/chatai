/**
 * خدمة بناء prompt المنتجات للذكاء الصناعي
 */

class ProductsPromptBuilder {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  }

  /**
   * جلب جميع منتجات الشركة من API
   */
  async fetchCompanyProducts(companyId) {
    try {
      console.log(`📦 جلب منتجات الشركة: ${companyId}`);
      
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${this.baseUrl}/api/v1/products?companyId=${companyId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Invalid API response format');
      }
      
      console.log(`✅ تم جلب ${data.data.length} منتج`);
      return data.data;
      
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      
      // fallback: جلب من قاعدة البيانات مباشرة
      return await this.fetchProductsDirectly(companyId);
    }
  }

  /**
   * جلب المنتجات مباشرة من قاعدة البيانات (fallback)
   */
  async fetchProductsDirectly(companyId) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const products = await prisma.product.findMany({
        where: { companyId },
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      await prisma.$disconnect();
      
      console.log(`✅ تم جلب ${products.length} منتج من قاعدة البيانات مباشرة`);
      return products;
      
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات من قاعدة البيانات:', error);
      return [];
    }
  }

  /**
   * بناء prompt المنتجات
   */
  async buildProductsPrompt(companyId) {
    try {
      const products = await this.fetchCompanyProducts(companyId);
      
      if (!products || products.length === 0) {
        return "لا توجد منتجات متاحة حالياً في المتجر.";
      }
      
      let prompt = "المنتجات المتاحة في المتجر:\n\n";
      
      products.forEach((product, index) => {
        // تنظيف البيانات
        const name = product.name || 'منتج بدون اسم';
        const price = product.price ? parseFloat(product.price) : 0;
        const description = product.description || 'لا يوجد وصف';
        const stock = product.stock || 0;
        const categoryName = product.category?.name || 'عام';

        // تحديد حالة المخزون
        let stockStatus = 'نافد';
        if (stock > 10) {
          stockStatus = 'متوفر';
        } else if (stock > 0) {
          stockStatus = `متوفر (${stock} قطع فقط)`;
        }

        // معلومات المتغيرات (الألوان، المقاسات، إلخ)
        let variantsInfo = '';
        if (product.variants && product.variants.length > 0) {
          const colors = product.variants.filter(v => v.type === 'color').map(v => v.name);
          const sizes = product.variants.filter(v => v.type === 'size').map(v => v.name);
          const styles = product.variants.filter(v => v.type === 'style').map(v => v.name);

          if (colors.length > 0) {
            variantsInfo += `   - الألوان المتاحة: ${colors.join(', ')}\n`;
          }
          if (sizes.length > 0) {
            variantsInfo += `   - المقاسات المتاحة: ${sizes.join(', ')}\n`;
          }
          if (styles.length > 0) {
            variantsInfo += `   - الأنواع المتاحة: ${styles.join(', ')}\n`;
          }
        }

        prompt += `${index + 1}. ${name}
   - السعر: ${price} جنيه
   - الوصف: ${description}
   - الفئة: ${categoryName}
   - المخزون: ${stockStatus}
${variantsInfo}   - رقم المنتج: ${product.id}
   - معرف المنتج: ${product.id}

`;
      });
      
      prompt += `\nإجمالي المنتجات المتاحة: ${products.length} منتج\n`;
      
      console.log(`✅ تم بناء prompt المنتجات (${products.length} منتج)`);
      return prompt;
      
    } catch (error) {
      console.error('❌ خطأ في بناء prompt المنتجات:', error);
      return "حدث خطأ في جلب المنتجات. يرجى المحاولة مرة أخرى.";
    }
  }

  /**
   * بناء prompt مبسط للمنتجات (للرسائل القصيرة)
   */
  async buildSimpleProductsPrompt(companyId, limit = 5) {
    try {
      const products = await this.fetchCompanyProducts(companyId);
      
      if (!products || products.length === 0) {
        return "لا توجد منتجات متاحة حالياً.";
      }
      
      // أخذ أول منتجات متاحة فقط
      const availableProducts = products
        .filter(product => product.stock > 0)
        .slice(0, limit);
      
      if (availableProducts.length === 0) {
        return "جميع المنتجات نافدة حالياً.";
      }
      
      let prompt = "أهم المنتجات المتاحة:\n\n";
      
      availableProducts.forEach((product, index) => {
        const name = product.name || 'منتج بدون اسم';
        const price = product.price ? parseFloat(product.price) : 0;
        
        prompt += `${index + 1}. ${name} - ${price} جنيه\n`;
      });
      
      return prompt;
      
    } catch (error) {
      console.error('❌ خطأ في بناء prompt المنتجات المبسط:', error);
      return "حدث خطأ في جلب المنتجات.";
    }
  }

  /**
   * بناء prompt للمنتجات حسب الفئة
   */
  async buildCategoryProductsPrompt(companyId, categoryName) {
    try {
      const products = await this.fetchCompanyProducts(companyId);
      
      if (!products || products.length === 0) {
        return "لا توجد منتجات متاحة حالياً.";
      }
      
      // فلترة المنتجات حسب الفئة
      const categoryProducts = products.filter(product => 
        product.category?.name?.toLowerCase().includes(categoryName.toLowerCase())
      );
      
      if (categoryProducts.length === 0) {
        return `لا توجد منتجات في فئة "${categoryName}" حالياً.`;
      }
      
      let prompt = `منتجات فئة "${categoryName}":\n\n`;
      
      categoryProducts.forEach((product, index) => {
        const name = product.name || 'منتج بدون اسم';
        const price = product.price ? parseFloat(product.price) : 0;
        const description = product.description || 'لا يوجد وصف';
        const stock = product.stock || 0;
        const stockStatus = stock > 0 ? 'متوفر' : 'نافد';
        
        prompt += `${index + 1}. ${name}
   - السعر: ${price} جنيه
   - الوصف: ${description}
   - المخزون: ${stockStatus}

`;
      });
      
      return prompt;
      
    } catch (error) {
      console.error('❌ خطأ في بناء prompt منتجات الفئة:', error);
      return "حدث خطأ في جلب منتجات الفئة.";
    }
  }

  /**
   * اختبار الاتصال بـ API
   */
  async testConnection() {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${this.baseUrl}/api/v1/products`);
      
      console.log(`🔗 اختبار الاتصال بـ API: ${response.status}`);
      return response.ok;
      
    } catch (error) {
      console.error('❌ فشل اختبار الاتصال:', error);
      return false;
    }
  }
}

module.exports = ProductsPromptBuilder;
