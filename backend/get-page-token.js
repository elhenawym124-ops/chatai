const mysql = require('mysql2/promise');

async function getPageToken() {
  console.log('🔍 البحث عن مفتاح الصفحة 250528358137901...');
  
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
    
    // البحث عن الصفحة
    const [pages] = await connection.execute(`
      SELECT pageId, pageName, pageAccessToken, status, connectedAt 
      FROM facebook_pages 
      WHERE pageId = ?
    `, ['250528358137901']);
    
    if (pages.length > 0) {
      const page = pages[0];
      console.log('✅ تم العثور على الصفحة:');
      console.log('Page ID:', page.pageId);
      console.log('Page Name:', page.pageName);
      console.log('Status:', page.status);
      console.log('Connected At:', page.connectedAt);
      console.log('Access Token:', page.pageAccessToken.substring(0, 30) + '...');
      
      // حفظ المفتاح في ملف .env
      const fs = require('fs');
      const envPath = '.env';
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // تحديث أو إضافة FACEBOOK_PAGE_ACCESS_TOKEN
      if (envContent.includes('FACEBOOK_PAGE_ACCESS_TOKEN=')) {
        envContent = envContent.replace(
          /FACEBOOK_PAGE_ACCESS_TOKEN=.*/,
          `FACEBOOK_PAGE_ACCESS_TOKEN=${page.pageAccessToken}`
        );
      } else {
        envContent += `\nFACEBOOK_PAGE_ACCESS_TOKEN=${page.pageAccessToken}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ تم تحديث ملف .env بمفتاح الصفحة');
      
    } else {
      console.log('❌ لم يتم العثور على الصفحة في قاعدة البيانات');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

getPageToken();
