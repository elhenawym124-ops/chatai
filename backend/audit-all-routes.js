const fs = require('fs');
const path = require('path');

function auditAllRoutes() {
  console.log('🔍 مراجعة شاملة لجميع Routes في النظام\n');

  try {
    // قراءة server.js
    const serverPath = path.join(__dirname, 'server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');

    // البحث عن جميع routes
    const routePatterns = [
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];

    const routes = new Map();
    const duplicates = new Map();
    const unprotectedRoutes = [];

    // استخراج جميع routes
    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(serverContent)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        const fullRoute = `${method} ${path}`;
        
        if (routes.has(fullRoute)) {
          if (!duplicates.has(fullRoute)) {
            duplicates.set(fullRoute, [routes.get(fullRoute)]);
          }
          duplicates.get(fullRoute).push(match.index);
        } else {
          routes.set(fullRoute, match.index);
        }
      }
    });

    console.log('📊 إحصائيات Routes:');
    console.log('═══════════════════════════════════════');
    console.log(`📈 إجمالي Routes: ${routes.size}`);
    console.log(`🔄 Routes مكررة: ${duplicates.size}`);

    // تحليل Routes حسب النوع
    const routesByType = new Map();
    routes.forEach((index, route) => {
      const [method, path] = route.split(' ');
      const category = categorizeRoute(path);
      
      if (!routesByType.has(category)) {
        routesByType.set(category, []);
      }
      routesByType.get(category).push({ method, path, route });
    });

    console.log('\n📋 Routes حسب النوع:');
    console.log('═══════════════════════════════════════');
    routesByType.forEach((routes, category) => {
      console.log(`\n🏷️ ${category} (${routes.length} routes):`);
      routes.forEach(({ method, path }) => {
        const security = analyzeRouteSecurity(method, path, serverContent);
        const status = security.isProtected ? '✅' : '❌';
        console.log(`   ${status} ${method} ${path} ${security.issues.length > 0 ? '⚠️' : ''}`);
        if (security.issues.length > 0) {
          security.issues.forEach(issue => {
            console.log(`      🔸 ${issue}`);
          });
        }
      });
    });

    // Routes مكررة
    if (duplicates.size > 0) {
      console.log('\n🔄 Routes مكررة:');
      console.log('═══════════════════════════════════════');
      duplicates.forEach((positions, route) => {
        console.log(`❌ ${route} (${positions.length} مرات)`);
      });
    }

    // تحليل الأمان
    console.log('\n🛡️ تحليل الأمان:');
    console.log('═══════════════════════════════════════');
    
    const securityAnalysis = analyzeOverallSecurity(routes, serverContent);
    
    console.log(`✅ Routes محمية: ${securityAnalysis.protected}`);
    console.log(`❌ Routes غير محمية: ${securityAnalysis.unprotected}`);
    console.log(`⚠️ Routes تحتاج مراجعة: ${securityAnalysis.needsReview}`);
    console.log(`📊 معدل الأمان: ${Math.round((securityAnalysis.protected / routes.size) * 100)}%`);

    // توصيات
    console.log('\n💡 التوصيات:');
    console.log('═══════════════════════════════════════');
    
    if (duplicates.size > 0) {
      console.log('🔴 عاجل: إزالة Routes المكررة');
    }
    
    if (securityAnalysis.unprotected > 0) {
      console.log('🔴 عاجل: حماية Routes غير المحمية');
    }
    
    if (securityAnalysis.needsReview > 0) {
      console.log('🟡 مراجعة Routes التي تحتاج تحسين');
    }

    console.log('🟢 تطبيق middleware شامل على مستوى التطبيق');
    console.log('🟢 إنشاء اختبارات شاملة للأمان');

    // إنشاء تقرير مفصل
    const report = {
      totalRoutes: routes.size,
      duplicates: duplicates.size,
      security: securityAnalysis,
      routesByType: Object.fromEntries(routesByType),
      duplicateRoutes: Object.fromEntries(duplicates)
    };

    fs.writeFileSync('backend/routes-audit-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 تم حفظ التقرير المفصل في: routes-audit-report.json');

  } catch (error) {
    console.error('❌ خطأ في مراجعة Routes:', error.message);
  }
}

function categorizeRoute(path) {
  if (path.includes('/auth/')) return 'Authentication';
  if (path.includes('/admin/')) return 'Admin';
  if (path.includes('/companies')) return 'Companies';
  if (path.includes('/products')) return 'Products';
  if (path.includes('/customers')) return 'Customers';
  if (path.includes('/conversations')) return 'Conversations';
  if (path.includes('/orders')) return 'Orders';
  if (path.includes('/users')) return 'Users';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/upload')) return 'Upload';
  if (path.includes('/health') || path.includes('/monitor')) return 'System';
  return 'Other';
}

function analyzeRouteSecurity(method, path, content) {
  const issues = [];
  let isProtected = false;

  // البحث عن route في المحتوى
  const routeRegex = new RegExp(`app\\.(${method.toLowerCase()})\\s*\\(\\s*['"\`]${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'i');
  const match = content.match(routeRegex);
  
  if (match) {
    const routeIndex = content.indexOf(match[0]);
    const routeSection = content.substring(routeIndex, routeIndex + 1000);
    
    // فحص وجود authentication middleware
    if (routeSection.includes('authenticateToken') || routeSection.includes('authMiddleware')) {
      isProtected = true;
    }
    
    // فحص وجود company isolation
    if (!routeSection.includes('companyId') && !path.includes('/auth/') && !path.includes('/health')) {
      issues.push('لا يطبق عزل الشركات');
    }
    
    // فحص routes حساسة بدون حماية
    if ((path.includes('/companies') || path.includes('/admin/')) && !isProtected) {
      issues.push('route حساس بدون مصادقة');
    }
  }

  return { isProtected, issues };
}

function analyzeOverallSecurity(routes, content) {
  let protected = 0;
  let unprotected = 0;
  let needsReview = 0;

  routes.forEach((index, route) => {
    const [method, path] = route.split(' ');
    const security = analyzeRouteSecurity(method, path, content);
    
    if (security.isProtected) {
      protected++;
    } else if (path.includes('/auth/') || path.includes('/health') || method === 'OPTIONS') {
      // Routes عامة مقبولة
      protected++;
    } else {
      unprotected++;
    }
    
    if (security.issues.length > 0) {
      needsReview++;
    }
  });

  return { protected, unprotected, needsReview };
}

auditAllRoutes();
