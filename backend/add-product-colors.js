const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProductColors() {
  console.log('🎨 Adding Product Colors Information...\n');
  
  try {
    // الحصول على جميع المنتجات
    const products = await prisma.product.findMany({
      where: { isActive: true }
    });
    
    console.log(`📦 Found ${products.length} products to update:`);
    
    // إضافة معلومات الألوان لكل منتج
    const productColors = {
      'كوتشي اسكوتش': {
        colors: ['أبيض', 'بيج', 'أسود'],
        colorPrices: {
          'أبيض': 320,
          'بيج': 310,
          'أسود': 310
        },
        description: 'كوتشي اسكوتش عملي ومريح، متوفر بثلاثة ألوان رائعة: أبيض بسعر 320 جنيه، بيج وأسود بسعر 310 جنيه لكل منهما. جودة عالية ونعل طبي مريح. المقاسات من 37 إلى 41.'
      },
      'كوتشي نايك اير فورس 1 أبيض': {
        colors: ['أبيض', 'أسود', 'رمادي'],
        colorPrices: {
          'أبيض': 320,
          'أسود': 320,
          'رمادي': 320
        },
        description: 'كوتشي نايك اير فورس 1 الكلاسيكي، متوفر بألوان: أبيض، أسود، ورمادي. جميع الألوان بسعر 320 جنيه. تصميم عصري ومريح للاستخدام اليومي.'
      },
      'كوتشي أديداس ستان سميث': {
        colors: ['أبيض مع أخضر', 'أبيض مع أزرق', 'أبيض كامل'],
        colorPrices: {
          'أبيض مع أخضر': 280,
          'أبيض مع أزرق': 280,
          'أبيض كامل': 280
        },
        description: 'كوتشي أديداس ستان سميث الكلاسيكي، متوفر بثلاثة تصاميم: أبيض مع أخضر، أبيض مع أزرق، وأبيض كامل. جميع الألوان بسعر 280 جنيه. تصميم عصري وكلاسيكي.'
      },
      'كوتشي بوما سويد كلاسيك': {
        colors: ['أزرق', 'أحمر', 'أسود', 'رمادي'],
        colorPrices: {
          'أزرق': 290,
          'أحمر': 290,
          'أسود': 290,
          'رمادي': 290
        },
        description: 'كوتشي بوما سويد الكلاسيكي، متوفر بأربعة ألوان: أزرق، أحمر، أسود، ورمادي. جميع الألوان بسعر 290 جنيه. خامة سويد عالية الجودة.'
      },
      'حذاء رياضي نسائي': {
        colors: ['وردي', 'أبيض', 'أسود', 'بنفسجي'],
        colorPrices: {
          'وردي': 250,
          'أبيض': 250,
          'أسود': 250,
          'بنفسجي': 250
        },
        description: 'حذاء رياضي نسائي أنيق، متوفر بألوان: وردي، أبيض، أسود، وبنفسجي. جميع الألوان بسعر 250 جنيه. تصميم عصري ومريح للسيدات.'
      }
    };
    
    for (const product of products) {
      const colorInfo = productColors[product.name];
      
      if (colorInfo) {
        // تحديث وصف المنتج ليشمل معلومات الألوان
        const updatedDescription = colorInfo.description;
        
        // إضافة معلومات الألوان كـ JSON في حقل منفصل
        const colorsData = JSON.stringify({
          availableColors: colorInfo.colors,
          colorPrices: colorInfo.colorPrices,
          defaultPrice: product.price
        });
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: updatedDescription,
            // يمكن إضافة حقل colors إذا كان موجود في schema
            // colors: colorsData
          }
        });
        
        console.log(`✅ Updated ${product.name}:`);
        console.log(`   Colors: ${colorInfo.colors.join(', ')}`);
        console.log(`   Price range: ${Math.min(...Object.values(colorInfo.colorPrices))} - ${Math.max(...Object.values(colorInfo.colorPrices))} جنيه`);
        console.log('');
      } else {
        console.log(`⚠️ No color info defined for: ${product.name}`);
      }
    }
    
    // إضافة FAQs عن الألوان
    console.log('📋 Adding color FAQs...');
    
    const company = await prisma.company.findFirst();
    
    const colorFAQs = [
      {
        question: 'ايه الألوان المتوفرة؟',
        answer: `🎨 **الألوان المتوفرة لمنتجاتنا:**

**كوتشي اسكوتش:** أبيض (320ج)، بيج (310ج)، أسود (310ج)
**كوتشي نايك:** أبيض، أسود، رمادي (320ج لكل لون)
**كوتشي أديداس:** أبيض مع أخضر، أبيض مع أزرق، أبيض كامل (280ج)
**كوتشي بوما:** أزرق، أحمر، أسود، رمادي (290ج)
**حذاء نسائي:** وردي، أبيض، أسود، بنفسجي (250ج)

أي لون تفضل؟ 😊`,
        category: 'ألوان',
        isActive: true,
        companyId: company.id
      },
      {
        question: 'كم سعر كل لون؟',
        answer: 'الأسعار تختلف حسب اللون والمنتج. أخبرني عن المنتج واللون المحدد وسأعطيك السعر الدقيق! 💰',
        category: 'أسعار',
        isActive: true,
        companyId: company.id
      }
    ];
    
    for (const faq of colorFAQs) {
      try {
        await prisma.fAQ.create({
          data: faq
        });
        console.log(`✅ Created FAQ: ${faq.question}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ FAQ already exists: ${faq.question}`);
        }
      }
    }
    
    console.log('\n🎉 Product colors added successfully!');
    console.log('🔄 Please restart the server to reload RAG knowledge base');
    
  } catch (error) {
    console.error('❌ Error adding product colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductColors();
