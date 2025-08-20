/**
 * خدمة التخزين المؤقت لتحسين الأداء
 * Cache Service for Performance Optimization
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time To Live
    this.defaultTTL = 5 * 60 * 1000; // 5 دقائق افتراضي
    
    // تنظيف Cache كل دقيقة
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * حفظ قيمة في Cache
   */
  set(key, value, ttlMs = this.defaultTTL) {
    const expiresAt = Date.now() + ttlMs;
    
    this.cache.set(key, value);
    this.ttl.set(key, expiresAt);
    
    console.log(`💾 Cache SET: ${key} (expires in ${ttlMs}ms)`);
  }

  /**
   * جلب قيمة من Cache
   */
  get(key) {
    const expiresAt = this.ttl.get(key);
    
    if (!expiresAt || Date.now() > expiresAt) {
      // انتهت صلاحية Cache
      this.delete(key);
      console.log(`⏰ Cache EXPIRED: ${key}`);
      return null;
    }
    
    const value = this.cache.get(key);
    console.log(`📖 Cache HIT: ${key}`);
    return value;
  }

  /**
   * حذف قيمة من Cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
  }

  /**
   * التحقق من وجود قيمة في Cache
   */
  has(key) {
    const expiresAt = this.ttl.get(key);
    
    if (!expiresAt || Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }
    
    return this.cache.has(key);
  }

  /**
   * مسح Cache بالكامل
   */
  clear() {
    this.cache.clear();
    this.ttl.clear();
    console.log('🧹 Cache CLEARED');
  }

  /**
   * تنظيف Cache من القيم المنتهية الصلاحية
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, expiresAt] of this.ttl.entries()) {
      if (now > expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
    }
  }

  /**
   * إحصائيات Cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * تقدير استخدام الذاكرة
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    
    for (const [key, value] of this.cache.entries()) {
      totalSize += JSON.stringify(key).length;
      totalSize += JSON.stringify(value).length;
    }
    
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: Math.round(totalSize / (1024 * 1024))
    };
  }

  /**
   * إنشاء مفتاح Cache للمنتجات
   */
  static createProductCacheKey(companyId, searchParams) {
    const params = {
      companyId,
      ...searchParams
    };
    
    // ترتيب المعاملات لضمان consistency
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `products:${JSON.stringify(sortedParams)}`;
  }

  /**
   * إنشاء مفتاح Cache للردود
   */
  static createResponseCacheKey(companyId, message, systemType) {
    const key = `response:${companyId}:${systemType}:${message}`;
    return key.substring(0, 200); // تحديد طول المفتاح
  }

  /**
   * Cache مع دالة fallback
   */
  async getOrSet(key, fallbackFunction, ttlMs = this.defaultTTL) {
    // محاولة جلب من Cache أولاً
    const cachedValue = this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // إذا لم توجد، تنفيذ الدالة وحفظ النتيجة
    console.log(`🔄 Cache MISS: ${key}, executing fallback`);
    
    try {
      const value = await fallbackFunction();
      this.set(key, value, ttlMs);
      return value;
    } catch (error) {
      console.error(`❌ Cache fallback error for ${key}:`, error);
      throw error;
    }
  }
}

// إنشاء instance مشترك
const cacheService = new CacheService();

module.exports = {
  CacheService,
  cacheService
};
