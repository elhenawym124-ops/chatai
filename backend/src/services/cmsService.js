/**
 * Content Management System (CMS) Service
 * 
 * Handles content creation, management, and publishing
 */

class CMSService {
  constructor() {
    this.pages = new Map(); // Website pages
    this.posts = new Map(); // Blog posts
    this.categories = new Map(); // Content categories
    this.menus = new Map(); // Navigation menus
    this.widgets = new Map(); // Page widgets
    this.initializeMockData();
  }

  /**
   * Initialize mock data
   */
  initializeMockData() {
    // Mock categories
    const mockCategories = [
      {
        id: 'CAT001',
        name: 'أخبار الشركة',
        slug: 'company-news',
        description: 'آخر أخبار وتطورات الشركة',
        parentId: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT002',
        name: 'نصائح تقنية',
        slug: 'tech-tips',
        description: 'نصائح وإرشادات تقنية مفيدة',
        parentId: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'CAT003',
        name: 'دراسات حالة',
        slug: 'case-studies',
        description: 'قصص نجاح عملائنا',
        parentId: null,
        isActive: true,
        sortOrder: 3,
        createdAt: new Date('2024-01-01'),
      }
    ];

    mockCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Mock pages
    const mockPages = [
      {
        id: 'PAGE001',
        title: 'الصفحة الرئيسية',
        slug: 'home',
        content: `
          <div class="hero-section">
            <h1>مرحباً بكم في منصة التواصل والتجارة الإلكترونية</h1>
            <p>الحل الشامل لإدارة أعمالكم التجارية والتواصل مع العملاء</p>
            <button class="cta-button">ابدأ الآن</button>
          </div>
          <div class="features-section">
            <h2>ميزاتنا الرئيسية</h2>
            <div class="features-grid">
              <div class="feature">
                <h3>إدارة العملاء</h3>
                <p>نظام CRM متطور لإدارة علاقات العملاء</p>
              </div>
              <div class="feature">
                <h3>التجارة الإلكترونية</h3>
                <p>منصة شاملة لبيع المنتجات والخدمات</p>
              </div>
              <div class="feature">
                <h3>التحليلات</h3>
                <p>تقارير مفصلة وإحصائيات متقدمة</p>
              </div>
            </div>
          </div>
        `,
        metaTitle: 'منصة التواصل والتجارة الإلكترونية - الحل الشامل لأعمالكم',
        metaDescription: 'منصة متكاملة لإدارة الأعمال التجارية والتواصل مع العملاء مع ميزات متقدمة',
        metaKeywords: 'تجارة إلكترونية، CRM، إدارة أعمال، منصة تجارية',
        status: 'published',
        isHomePage: true,
        template: 'home',
        authorId: '1',
        authorName: 'أحمد المدير',
        publishedAt: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'PAGE002',
        title: 'من نحن',
        slug: 'about',
        content: `
          <div class="about-section">
            <h1>من نحن</h1>
            <p>نحن شركة رائدة في مجال تطوير الحلول التقنية للأعمال التجارية.</p>
            
            <h2>رؤيتنا</h2>
            <p>أن نكون الخيار الأول للشركات التي تسعى للتحول الرقمي وتطوير أعمالها.</p>
            
            <h2>مهمتنا</h2>
            <p>تقديم حلول تقنية مبتكرة تساعد الشركات على النمو والازدهار في العصر الرقمي.</p>
            
            <h2>قيمنا</h2>
            <ul>
              <li>الابتكار والإبداع</li>
              <li>الجودة والتميز</li>
              <li>خدمة العملاء</li>
              <li>الشفافية والنزاهة</li>
            </ul>
          </div>
        `,
        metaTitle: 'من نحن - منصة التواصل والتجارة الإلكترونية',
        metaDescription: 'تعرف على شركتنا ورؤيتنا ومهمتنا في تقديم أفضل الحلول التقنية',
        metaKeywords: 'من نحن، الشركة، رؤية، مهمة، قيم',
        status: 'published',
        isHomePage: false,
        template: 'page',
        authorId: '1',
        authorName: 'أحمد المدير',
        publishedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-10'),
      }
    ];

    mockPages.forEach(page => {
      this.pages.set(page.id, page);
    });

    // Mock blog posts
    const mockPosts = [
      {
        id: 'POST001',
        title: 'كيفية تحسين تجربة العملاء في التجارة الإلكترونية',
        slug: 'improve-customer-experience-ecommerce',
        excerpt: 'نصائح وإرشادات لتحسين تجربة العملاء وزيادة المبيعات في متجرك الإلكتروني',
        content: `
          <p>تجربة العملاء هي العامل الأهم في نجاح أي متجر إلكتروني. في هذا المقال، سنستعرض أهم الطرق لتحسين تجربة العملاء.</p>
          
          <h2>1. تصميم واجهة مستخدم بديهية</h2>
          <p>يجب أن يكون موقعك سهل الاستخدام والتنقل، مع تصميم جذاب ومتجاوب.</p>
          
          <h2>2. سرعة تحميل الصفحات</h2>
          <p>العملاء لا يحبون الانتظار. تأكد من أن صفحات موقعك تحمل بسرعة.</p>
          
          <h2>3. خدمة عملاء متميزة</h2>
          <p>قدم دعماً فورياً عبر الدردشة المباشرة والهاتف والبريد الإلكتروني.</p>
          
          <h2>4. عملية دفع مبسطة</h2>
          <p>اجعل عملية الدفع سهلة وآمنة مع خيارات دفع متعددة.</p>
        `,
        featuredImage: '/images/customer-experience.jpg',
        categoryId: 'CAT002',
        categoryName: 'نصائح تقنية',
        tags: ['تجربة العملاء', 'التجارة الإلكترونية', 'تحسين المبيعات'],
        status: 'published',
        authorId: '2',
        authorName: 'سارة المستشارة',
        publishedAt: new Date('2024-01-10'),
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-10'),
        views: 245,
        likes: 18,
        comments: 5,
      },
      {
        id: 'POST002',
        title: 'قصة نجاح: كيف ضاعفت شركة ABC مبيعاتها باستخدام منصتنا',
        slug: 'abc-company-success-story',
        excerpt: 'تعرف على كيف استطاعت شركة ABC مضاعفة مبيعاتها خلال 6 أشهر باستخدام منصتنا',
        content: `
          <p>شركة ABC هي إحدى الشركات الرائدة في مجال بيع الإلكترونيات. واجهت الشركة تحديات في إدارة المبيعات والعملاء.</p>
          
          <h2>التحديات</h2>
          <ul>
            <li>صعوبة في تتبع العملاء والطلبات</li>
            <li>عدم وجود نظام موحد للمبيعات</li>
            <li>ضعف في التواصل مع العملاء</li>
          </ul>
          
          <h2>الحل</h2>
          <p>قامت الشركة بتطبيق منصتنا المتكاملة التي تشمل:</p>
          <ul>
            <li>نظام CRM متطور</li>
            <li>منصة تجارة إلكترونية</li>
            <li>نظام إدارة المخزون</li>
            <li>أدوات التسويق الرقمي</li>
          </ul>
          
          <h2>النتائج</h2>
          <ul>
            <li>زيادة المبيعات بنسبة 150%</li>
            <li>تحسن رضا العملاء بنسبة 80%</li>
            <li>توفير 40% من الوقت في العمليات الإدارية</li>
          </ul>
        `,
        featuredImage: '/images/success-story.jpg',
        categoryId: 'CAT003',
        categoryName: 'دراسات حالة',
        tags: ['قصة نجاح', 'دراسة حالة', 'زيادة المبيعات'],
        status: 'published',
        authorId: '1',
        authorName: 'أحمد المدير',
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-15'),
        views: 189,
        likes: 23,
        comments: 8,
      }
    ];

    mockPosts.forEach(post => {
      this.posts.set(post.id, post);
    });

    // Mock navigation menu
    const mockMenu = {
      id: 'MENU001',
      name: 'القائمة الرئيسية',
      location: 'header',
      items: [
        {
          id: 'ITEM001',
          title: 'الرئيسية',
          url: '/',
          type: 'page',
          pageId: 'PAGE001',
          parentId: null,
          sortOrder: 1,
          isActive: true,
        },
        {
          id: 'ITEM002',
          title: 'من نحن',
          url: '/about',
          type: 'page',
          pageId: 'PAGE002',
          parentId: null,
          sortOrder: 2,
          isActive: true,
        },
        {
          id: 'ITEM003',
          title: 'المدونة',
          url: '/blog',
          type: 'custom',
          pageId: null,
          parentId: null,
          sortOrder: 3,
          isActive: true,
        },
        {
          id: 'ITEM004',
          title: 'اتصل بنا',
          url: '/contact',
          type: 'custom',
          pageId: null,
          parentId: null,
          sortOrder: 4,
          isActive: true,
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-05'),
    };

    this.menus.set(mockMenu.id, mockMenu);
  }

  /**
   * Create new page
   */
  async createPage(pageData) {
    try {
      const page = {
        id: this.generatePageId(),
        title: pageData.title,
        slug: pageData.slug || this.generateSlug(pageData.title),
        content: pageData.content,
        metaTitle: pageData.metaTitle || pageData.title,
        metaDescription: pageData.metaDescription || '',
        metaKeywords: pageData.metaKeywords || '',
        status: pageData.status || 'draft',
        isHomePage: pageData.isHomePage || false,
        template: pageData.template || 'page',
        authorId: pageData.authorId,
        authorName: pageData.authorName,
        publishedAt: pageData.status === 'published' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.pages.set(page.id, page);

      return {
        success: true,
        data: page,
        message: 'تم إنشاء الصفحة بنجاح'
      };
    } catch (error) {
      console.error('Error creating page:', error);
      return {
        success: false,
        error: 'فشل في إنشاء الصفحة'
      };
    }
  }

  /**
   * Create new blog post
   */
  async createPost(postData) {
    try {
      const post = {
        id: this.generatePostId(),
        title: postData.title,
        slug: postData.slug || this.generateSlug(postData.title),
        excerpt: postData.excerpt || '',
        content: postData.content,
        featuredImage: postData.featuredImage || null,
        categoryId: postData.categoryId,
        categoryName: postData.categoryName,
        tags: postData.tags || [],
        status: postData.status || 'draft',
        authorId: postData.authorId,
        authorName: postData.authorName,
        publishedAt: postData.status === 'published' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0,
        comments: 0,
      };

      this.posts.set(post.id, post);

      return {
        success: true,
        data: post,
        message: 'تم إنشاء المقال بنجاح'
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return {
        success: false,
        error: 'فشل في إنشاء المقال'
      };
    }
  }

  /**
   * Get pages
   */
  async getPages(filters = {}) {
    try {
      let pages = Array.from(this.pages.values());

      // Apply filters
      if (filters.status) {
        pages = pages.filter(page => page.status === filters.status);
      }

      if (filters.template) {
        pages = pages.filter(page => page.template === filters.template);
      }

      if (filters.authorId) {
        pages = pages.filter(page => page.authorId === filters.authorId);
      }

      // Sort by creation date (newest first)
      pages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        data: pages
      };
    } catch (error) {
      console.error('Error getting pages:', error);
      return {
        success: false,
        error: 'فشل في جلب الصفحات'
      };
    }
  }

  /**
   * Get blog posts
   */
  async getPosts(filters = {}) {
    try {
      let posts = Array.from(this.posts.values());

      // Apply filters
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }

      if (filters.categoryId) {
        posts = posts.filter(post => post.categoryId === filters.categoryId);
      }

      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }

      if (filters.tag) {
        posts = posts.filter(post => post.tags.includes(filters.tag));
      }

      // Sort by publication date (newest first)
      posts.sort((a, b) => {
        const dateA = a.publishedAt || a.createdAt;
        const dateB = b.publishedAt || b.createdAt;
        return new Date(dateB) - new Date(dateA);
      });

      // Pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedPosts = posts.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedPosts,
        pagination: {
          page,
          limit,
          total: posts.length,
          pages: Math.ceil(posts.length / limit)
        }
      };
    } catch (error) {
      console.error('Error getting posts:', error);
      return {
        success: false,
        error: 'فشل في جلب المقالات'
      };
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    try {
      const categories = Array.from(this.categories.values())
        .filter(category => category.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Error getting categories:', error);
      return {
        success: false,
        error: 'فشل في جلب التصنيفات'
      };
    }
  }

  /**
   * Get navigation menu
   */
  async getMenu(location = 'header') {
    try {
      const menu = Array.from(this.menus.values())
        .find(menu => menu.location === location);

      if (!menu) {
        return {
          success: false,
          error: 'القائمة غير موجودة'
        };
      }

      // Sort menu items
      menu.items.sort((a, b) => a.sortOrder - b.sortOrder);

      return {
        success: true,
        data: menu
      };
    } catch (error) {
      console.error('Error getting menu:', error);
      return {
        success: false,
        error: 'فشل في جلب القائمة'
      };
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats() {
    try {
      const pages = Array.from(this.pages.values());
      const posts = Array.from(this.posts.values());

      const stats = {
        totalPages: pages.length,
        publishedPages: pages.filter(p => p.status === 'published').length,
        draftPages: pages.filter(p => p.status === 'draft').length,
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        draftPosts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + p.views, 0),
        totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
        totalComments: posts.reduce((sum, p) => sum + p.comments, 0),
        categories: this.categories.size,
        recentPosts: posts
          .filter(p => p.status === 'published')
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 5)
          .map(p => ({
            id: p.id,
            title: p.title,
            views: p.views,
            publishedAt: p.publishedAt,
          })),
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      return {
        success: false,
        error: 'فشل في جلب إحصائيات المحتوى'
      };
    }
  }

  /**
   * Helper methods
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  generatePageId() {
    return `PAGE${Date.now().toString(36).toUpperCase()}`;
  }

  generatePostId() {
    return `POST${Date.now().toString(36).toUpperCase()}`;
  }
}

module.exports = new CMSService();
