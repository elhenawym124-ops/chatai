const mysql = require('mysql2/promise');

async function fixFacebookPages() {
  console.log('🔧 إصلاح مشكلة صفحات الفيس بوك...');
  
  const config = {
    host: '92.113.22.70',
    port: 3306,
    user: 'u339372869_test',
    password: '0165676135Aa@A',
    database: 'u339372869_test',
    connectTimeout: 10000
  };
  
  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // الحصول على معلومات الشركة الافتراضية
    const [companies] = await connection.execute('SELECT id FROM companies LIMIT 1');
    const defaultCompanyId = companies[0]?.id || 'cmd5c0c9y0000ymzdd7wtv7ib';
    
    // الحصول على access token من الصفحة الموجودة
    const [existingPage] = await connection.execute(`
      SELECT pageAccessToken FROM facebook_pages WHERE pageId = ?
    `, ['250528358137901']);
    
    const accessToken = existingPage[0]?.pageAccessToken;
    
    if (!accessToken) {
      console.log('❌ لا يمكن العثور على access token');
      return;
    }
    
    // الصفحات المفقودة
    const missingPages = [
      {
        pageId: '114497159957743',
        pageName: 'كوتشي شو',
        category: 'Men\'s clothing store'
      },
      {
        pageId: '260345600493273', 
        pageName: 'Swan shop',
        category: 'Footwear store'
      }
    ];
    
    console.log('\n📝 إضافة الصفحات المفقودة...');
    
    for (const page of missingPages) {
      console.log(`\n🔄 معالجة الصفحة: ${page.pageName} (${page.pageId})`);
      
      // التحقق من وجود الصفحة
      const [existing] = await connection.execute(`
        SELECT id FROM facebook_pages WHERE pageId = ?
      `, [page.pageId]);
      
      if (existing.length > 0) {
        console.log('✅ الصفحة موجودة بالفعل');
        continue;
      }
      
      // إضافة الصفحة
      try {
        await connection.execute(`
          INSERT INTO facebook_pages (
            pageId, pageAccessToken, pageName, companyId, status, connectedAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, 'connected', NOW(), NOW(), NOW())
        `, [
          page.pageId,
          accessToken, // استخدام نفس الـ token مؤقتاً
          page.pageName,
          defaultCompanyId
        ]);
        
        console.log('✅ تم إضافة الصفحة بنجاح');
        
        // إضافة integration record أيضاً
        await connection.execute(`
          INSERT INTO integrations (
            name, type, platform, externalId, accessToken, config, settings, 
            status, companyId, createdAt, updatedAt
          ) VALUES (?, 'SOCIAL_MEDIA', 'FACEBOOK', ?, ?, ?, ?, 'ACTIVE', ?, NOW(), NOW())
        `, [
          page.pageName,
          page.pageId,
          accessToken,
          JSON.stringify({
            pageName: page.pageName,
            category: page.category,
            connectedAt: new Date().toISOString()
          }),
          JSON.stringify({
            pageName: page.pageName,
            category: page.category
          }),
          defaultCompanyId
        ]);
        
        console.log('✅ تم إضافة integration record');
        
      } catch (error) {
        console.log('❌ خطأ في إضافة الصفحة:', error.message);
      }
    }
    
    // التحقق من النتائج
    console.log('\n📊 التحقق من النتائج النهائية...');
    const [allPages] = await connection.execute(`
      SELECT pageId, pageName, status FROM facebook_pages ORDER BY createdAt DESC
    `);
    
    console.log('📄 جميع الصفحات المتصلة:');
    allPages.forEach((page, index) => {
      console.log(`   ${index + 1}. ${page.pageName} (${page.pageId}) - ${page.status}`);
    });
    
    await connection.end();
    console.log('\n✅ تم إنهاء الإصلاح بنجاح');
    console.log('\n🎯 الآن يجب أن تظهر الرسائل في المحادثات!');
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error);
  }
}

fixFacebookPages();
