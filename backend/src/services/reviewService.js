/**
 * Product Reviews and Ratings Service
 * 
 * Handles product reviews, ratings, and customer feedback management
 */

class ReviewService {
  constructor() {
    this.reviews = new Map(); // Product reviews
    this.ratings = new Map(); // Product ratings summary
    this.reviewReports = new Map(); // Reported reviews
    this.reviewLikes = new Map(); // Review likes/dislikes
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock product reviews
    const mockReviews = [
      {
        id: 'REV001',
        productId: '1',
        productName: 'لابتوب HP Pavilion',
        customerId: '1',
        customerName: 'أحمد محمد',
        rating: 5,
        title: 'منتج ممتاز وجودة عالية',
        content: 'اشتريت هذا اللابتوب منذ شهرين وأنا راضي جداً عن الأداء. سرعة المعالج ممتازة وجودة الشاشة واضحة. أنصح بشرائه.',
        pros: ['أداء سريع', 'جودة شاشة ممتازة', 'بطارية تدوم طويلاً'],
        cons: ['الوزن ثقيل نوعاً ما'],
        images: ['review1_img1.jpg', 'review1_img2.jpg'],
        isVerifiedPurchase: true,
        isRecommended: true,
        helpfulVotes: 15,
        notHelpfulVotes: 2,
        status: 'approved',
        moderatorNotes: '',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'REV002',
        productId: '1',
        productName: 'لابتوب HP Pavilion',
        customerId: '2',
        customerName: 'سارة أحمد',
        rating: 4,
        title: 'جيد لكن يحتاج تحسينات',
        content: 'اللابتوب جيد بشكل عام، لكن المروحة تصدر صوتاً عالياً أحياناً. الأداء مقبول للاستخدام اليومي.',
        pros: ['سعر مناسب', 'تصميم أنيق'],
        cons: ['صوت المروحة عالي', 'مساحة التخزين قليلة'],
        images: [],
        isVerifiedPurchase: true,
        isRecommended: true,
        helpfulVotes: 8,
        notHelpfulVotes: 1,
        status: 'approved',
        moderatorNotes: '',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'REV003',
        productId: '2',
        productName: 'هاتف Samsung Galaxy',
        customerId: '3',
        customerName: 'محمد علي',
        rating: 5,
        title: 'هاتف رائع بمميزات متقدمة',
        content: 'الهاتف يفوق التوقعات! الكاميرا ممتازة والأداء سريع جداً. البطارية تدوم يوم كامل بسهولة.',
        pros: ['كاميرا ممتازة', 'أداء سريع', 'بطارية قوية', 'تصميم أنيق'],
        cons: ['السعر مرتفع'],
        images: ['review3_img1.jpg'],
        isVerifiedPurchase: true,
        isRecommended: true,
        helpfulVotes: 23,
        notHelpfulVotes: 0,
        status: 'approved',
        moderatorNotes: '',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
      },
      {
        id: 'REV004',
        productId: '3',
        productName: 'ماوس لاسلكي Logitech',
        customerId: '4',
        customerName: 'فاطمة خالد',
        rating: 2,
        title: 'جودة أقل من المتوقع',
        content: 'الماوس يفقد الاتصال كثيراً والبطارية تنفد بسرعة. لا أنصح بشرائه.',
        pros: ['تصميم جميل'],
        cons: ['مشاكل في الاتصال', 'بطارية ضعيفة', 'جودة بناء رديئة'],
        images: [],
        isVerifiedPurchase: true,
        isRecommended: false,
        helpfulVotes: 5,
        notHelpfulVotes: 8,
        status: 'approved',
        moderatorNotes: '',
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14'),
      },
      {
        id: 'REV005',
        productId: '2',
        productName: 'هاتف Samsung Galaxy',
        customerId: '5',
        customerName: 'عبدالله أحمد',
        rating: 3,
        title: 'متوسط الجودة',
        content: 'الهاتف مقبول لكن ليس بالجودة المتوقعة للسعر. الكاميرا جيدة لكن الأداء بطيء أحياناً.',
        pros: ['كاميرا جيدة', 'شاشة واضحة'],
        cons: ['أداء بطيء أحياناً', 'يسخن بسرعة'],
        images: [],
        isVerifiedPurchase: false,
        isRecommended: false,
        helpfulVotes: 3,
        notHelpfulVotes: 2,
        status: 'pending',
        moderatorNotes: 'يحتاج مراجعة - عدم تأكيد الشراء',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      }
    ];

    mockReviews.forEach(review => {
      this.reviews.set(review.id, review);
    });

    // Calculate ratings summary for products
    this.calculateProductRatings();
  }

  /**
   * Add new review
   */
  async addReview(reviewData) {
    try {
      const {
        productId,
        productName,
        customerId,
        customerName,
        rating,
        title,
        content,
        pros = [],
        cons = [],
        images = [],
        isVerifiedPurchase = false,
      } = reviewData;

      // Validate rating
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'التقييم يجب أن يكون بين 1 و 5'
        };
      }

      // Check if customer already reviewed this product
      const existingReview = Array.from(this.reviews.values())
        .find(review => review.productId === productId && review.customerId === customerId);

      if (existingReview) {
        return {
          success: false,
          error: 'لقد قمت بتقييم هذا المنتج مسبقاً'
        };
      }

      const review = {
        id: this.generateReviewId(),
        productId,
        productName,
        customerId,
        customerName,
        rating,
        title,
        content,
        pros,
        cons,
        images,
        isVerifiedPurchase,
        isRecommended: rating >= 4,
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        status: 'pending', // pending, approved, rejected
        moderatorNotes: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.reviews.set(review.id, review);

      // Update product ratings
      this.updateProductRating(productId);

      return {
        success: true,
        data: review,
        message: 'تم إضافة التقييم بنجاح وهو في انتظار المراجعة'
      };
    } catch (error) {
      console.error('Error adding review:', error);
      return {
        success: false,
        error: 'فشل في إضافة التقييم'
      };
    }
  }

  /**
   * Update review status (approve/reject)
   */
  async updateReviewStatus(reviewId, status, moderatorNotes = '') {
    try {
      const review = this.reviews.get(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'التقييم غير موجود'
        };
      }

      review.status = status;
      review.moderatorNotes = moderatorNotes;
      review.updatedAt = new Date();

      this.reviews.set(reviewId, review);

      // Update product ratings if approved
      if (status === 'approved') {
        this.updateProductRating(review.productId);
      }

      return {
        success: true,
        data: review,
        message: `تم ${status === 'approved' ? 'قبول' : 'رفض'} التقييم`
      };
    } catch (error) {
      console.error('Error updating review status:', error);
      return {
        success: false,
        error: 'فشل في تحديث حالة التقييم'
      };
    }
  }

  /**
   * Vote on review helpfulness
   */
  async voteOnReview(reviewId, userId, voteType) {
    try {
      const review = this.reviews.get(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'التقييم غير موجود'
        };
      }

      // Check if user already voted
      const voteKey = `${reviewId}_${userId}`;
      const existingVote = this.reviewLikes.get(voteKey);

      if (existingVote) {
        // Remove previous vote
        if (existingVote === 'helpful') {
          review.helpfulVotes--;
        } else {
          review.notHelpfulVotes--;
        }
      }

      // Add new vote
      if (voteType === 'helpful') {
        review.helpfulVotes++;
      } else if (voteType === 'not_helpful') {
        review.notHelpfulVotes++;
      }

      this.reviewLikes.set(voteKey, voteType);
      this.reviews.set(reviewId, review);

      return {
        success: true,
        data: {
          helpfulVotes: review.helpfulVotes,
          notHelpfulVotes: review.notHelpfulVotes,
        },
        message: 'تم تسجيل تصويتك'
      };
    } catch (error) {
      console.error('Error voting on review:', error);
      return {
        success: false,
        error: 'فشل في تسجيل التصويت'
      };
    }
  }

  /**
   * Report review
   */
  async reportReview(reviewId, reporterId, reason, description = '') {
    try {
      const review = this.reviews.get(reviewId);
      
      if (!review) {
        return {
          success: false,
          error: 'التقييم غير موجود'
        };
      }

      const report = {
        id: this.generateReportId(),
        reviewId,
        reporterId,
        reason,
        description,
        status: 'pending', // pending, reviewed, resolved
        createdAt: new Date(),
      };

      this.reviewReports.set(report.id, report);

      return {
        success: true,
        data: report,
        message: 'تم إرسال البلاغ وسيتم مراجعته'
      };
    } catch (error) {
      console.error('Error reporting review:', error);
      return {
        success: false,
        error: 'فشل في إرسال البلاغ'
      };
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId, filters = {}) {
    try {
      let reviews = Array.from(this.reviews.values())
        .filter(review => review.productId === productId && review.status === 'approved');

      // Apply filters
      if (filters.rating) {
        reviews = reviews.filter(review => review.rating === parseInt(filters.rating));
      }

      if (filters.verified === 'true') {
        reviews = reviews.filter(review => review.isVerifiedPurchase);
      }

      if (filters.recommended === 'true') {
        reviews = reviews.filter(review => review.isRecommended);
      }

      // Sort reviews
      const sortBy = filters.sortBy || 'newest';
      switch (sortBy) {
        case 'newest':
          reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case 'highest_rating':
          reviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest_rating':
          reviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'most_helpful':
          reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
          break;
      }

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedReviews = reviews.slice(startIndex, endIndex);

      // Get product rating summary
      const ratingSummary = this.ratings.get(productId) || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 0,
      };

      return {
        success: true,
        data: {
          reviews: paginatedReviews,
          ratingSummary,
          pagination: {
            page,
            limit,
            total: reviews.length,
            pages: Math.ceil(reviews.length / limit)
          }
        }
      };
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return {
        success: false,
        error: 'فشل في جلب التقييمات'
      };
    }
  }

  /**
   * Get all reviews for moderation
   */
  async getAllReviews(filters = {}) {
    try {
      let reviews = Array.from(this.reviews.values());

      // Apply filters
      if (filters.status) {
        reviews = reviews.filter(review => review.status === filters.status);
      }

      if (filters.productId) {
        reviews = reviews.filter(review => review.productId === filters.productId);
      }

      if (filters.rating) {
        reviews = reviews.filter(review => review.rating === parseInt(filters.rating));
      }

      // Sort by creation date (newest first)
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedReviews = reviews.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedReviews,
        pagination: {
          page,
          limit,
          total: reviews.length,
          pages: Math.ceil(reviews.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return {
        success: false,
        error: 'فشل في جلب التقييمات'
      };
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats() {
    try {
      const reviews = Array.from(this.reviews.values());
      const reports = Array.from(this.reviewReports.values());

      const stats = {
        totalReviews: reviews.length,
        approvedReviews: reviews.filter(r => r.status === 'approved').length,
        pendingReviews: reviews.filter(r => r.status === 'pending').length,
        rejectedReviews: reviews.filter(r => r.status === 'rejected').length,
        verifiedPurchaseReviews: reviews.filter(r => r.isVerifiedPurchase).length,
        averageRating: this.calculateOverallAverageRating(reviews),
        ratingDistribution: this.calculateOverallRatingDistribution(reviews),
        totalReports: reports.length,
        pendingReports: reports.filter(r => r.status === 'pending').length,
        topRatedProducts: this.getTopRatedProducts(),
        recentReviews: reviews
          .filter(r => r.status === 'approved')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(r => ({
            id: r.id,
            productName: r.productName,
            customerName: r.customerName,
            rating: r.rating,
            title: r.title,
            createdAt: r.createdAt,
          })),
        monthlyTrend: this.getMonthlyReviewTrend(reviews),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات التقييمات'
      };
    }
  }

  /**
   * Helper methods
   */
  calculateProductRatings() {
    const productRatings = {};

    // Group reviews by product
    Array.from(this.reviews.values())
      .filter(review => review.status === 'approved')
      .forEach(review => {
        if (!productRatings[review.productId]) {
          productRatings[review.productId] = [];
        }
        productRatings[review.productId].push(review);
      });

    // Calculate ratings for each product
    Object.keys(productRatings).forEach(productId => {
      this.updateProductRating(productId);
    });
  }

  updateProductRating(productId) {
    const productReviews = Array.from(this.reviews.values())
      .filter(review => review.productId === productId && review.status === 'approved');

    if (productReviews.length === 0) {
      this.ratings.set(productId, {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recommendationRate: 0,
      });
      return;
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    const recommendedCount = productReviews.filter(review => review.isRecommended).length;
    const recommendationRate = (recommendedCount / productReviews.length) * 100;

    this.ratings.set(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: productReviews.length,
      ratingDistribution,
      recommendationRate: Math.round(recommendationRate),
    });
  }

  calculateOverallAverageRating(reviews) {
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    if (approvedReviews.length === 0) return 0;

    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / approvedReviews.length) * 10) / 10;
  }

  calculateOverallRatingDistribution(reviews) {
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    approvedReviews.forEach(review => {
      distribution[review.rating]++;
    });

    return distribution;
  }

  getTopRatedProducts() {
    const productRatings = Array.from(this.ratings.entries())
      .map(([productId, rating]) => ({
        productId,
        productName: this.getProductName(productId),
        averageRating: rating.averageRating,
        totalReviews: rating.totalReviews,
      }))
      .filter(product => product.totalReviews >= 2)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5);

    return productRatings;
  }

  getProductName(productId) {
    const review = Array.from(this.reviews.values())
      .find(review => review.productId === productId);
    return review ? review.productName : `منتج ${productId}`;
  }

  getMonthlyReviewTrend(reviews) {
    // Mock monthly trend data
    return [
      { month: 'يناير', reviews: 45, averageRating: 4.2 },
      { month: 'فبراير', reviews: 52, averageRating: 4.1 },
      { month: 'مارس', reviews: 38, averageRating: 4.3 },
    ];
  }

  generateReviewId() {
    return `REV${Date.now().toString(36).toUpperCase()}`;
  }

  generateReportId() {
    return `RPT${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new ReviewService();
