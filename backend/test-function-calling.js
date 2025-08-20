// مثال على Function Calling مع Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai');

// محاكاة قاعدة البيانات
const mockDatabase = {
  products: [
    { id: '1', name: 'كوتشي رياضي نايك', category: 'أحذية', price: 299.99, description: 'كوتشي رياضي مريح' },
    { id: '2', name: 'كوتشي حريمي أنيق', category: 'أحذية', price: 250.00, description: 'كوتشي حريمي للمناسبات' },
    { id: '3', name: 'حذاء رسمي رجالي', category: 'أحذية', price: 450.00, description: 'حذاء رسمي جلد طبيعي' },
    { id: '4', name: 'طقم أدوات المطبخ', category: 'مطبخ', price: 599.99, description: 'طقم كامل لأدوات المطبخ' },
    { id: '5', name: 'قميص قطني', category: 'ملابس', price: 199.99, description: 'قميص قطني مريح' }
  ]
};

// دالة البحث في قاعدة البيانات
function searchProducts(keywords, category = null, priceRange = null) {
  console.log(`🔍 البحث عن: "${keywords}" في فئة: ${category || 'الكل'}`);
  
  let results = mockDatabase.products.filter(product => {
    // البحث بالكلمات المفتاحية
    const matchesKeywords = keywords.split(' ').some(keyword => 
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      product.description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // فلترة بالفئة
    const matchesCategory = !category || product.category === category;
    
    // فلترة بالسعر
    let matchesPrice = true;
    if (priceRange) {
      if (priceRange.min) matchesPrice = matchesPrice && product.price >= priceRange.min;
      if (priceRange.max) matchesPrice = matchesPrice && product.price <= priceRange.max;
    }
    
    return matchesKeywords && matchesCategory && matchesPrice;
  });
  
  console.log(`✅ وُجد ${results.length} منتج`);
  return results;
}

// دالة الحصول على تفاصيل منتج
function getProductDetails(productId) {
  const product = mockDatabase.products.find(p => p.id === productId);
  console.log(`📦 تفاصيل المنتج: ${product ? product.name : 'غير موجود'}`);
  return product;
}

// تعريف الأدوات المتاحة لـ Gemini
const availableTools = [
  {
    function_declarations: [
      {
        name: "search_products",
        description: "البحث عن منتجات في قاعدة البيانات بناءً على كلمات مفتاحية",
        parameters: {
          type: "object",
          properties: {
            keywords: {
              type: "string",
              description: "كلمات البحث مثل: كوتشي، حذاء، رياضي، حريمي"
            },
            category: {
              type: "string",
              description: "فئة المنتج: أحذية، ملابس، مطبخ (اختياري)"
            },
            priceRange: {
              type: "object",
              description: "نطاق السعر (اختياري)",
              properties: {
                min: { type: "number", description: "أقل سعر" },
                max: { type: "number", description: "أعلى سعر" }
              }
            }
          },
          required: ["keywords"]
        }
      },
      {
        name: "get_product_details", 
        description: "الحصول على تفاصيل منتج محدد",
        parameters: {
          type: "object",
          properties: {
            productId: {
              type: "string",
              description: "معرف المنتج"
            }
          },
          required: ["productId"]
        }
      }
    ]
  }
];

async function testFunctionCalling() {
  console.log('🧪 اختبار Function Calling مع Gemini...\n');
  
  // محاكاة استجابة Gemini مع Function Calling
  const customerMessage = "عايزة كوتشي رياضي بسعر أقل من 300 جنيه";
  
  console.log(`💬 رسالة العميل: "${customerMessage}"`);
  console.log('\n🤖 Gemini يقرر استخدام أداة البحث...');
  
  // محاكاة قرار Gemini باستخدام search_products
  const functionCall = {
    name: "search_products",
    args: {
      keywords: "كوتشي رياضي",
      category: "أحذية", 
      priceRange: { max: 300 }
    }
  };
  
  console.log(`🔧 Function Call: ${JSON.stringify(functionCall, null, 2)}`);
  
  // تنفيذ البحث
  const searchResults = searchProducts(
    functionCall.args.keywords,
    functionCall.args.category,
    functionCall.args.priceRange
  );
  
  console.log('\n📋 نتائج البحث:');
  searchResults.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} - ${product.price} جنيه`);
    console.log(`      ${product.description}`);
  });
  
  console.log('\n🤖 Gemini يكتب الرد النهائي بناءً على النتائج...');
  console.log('\n💬 الرد المقترح:');
  console.log(`"وجدت لك ${searchResults.length} كوتشي رياضي في حدود ميزانيتك:`);
  searchResults.forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name} - ${product.price} جنيه`);
    console.log(`   ${product.description}`);
  });
  console.log('\nأي واحد يعجبك أكثر؟"');
}

// تشغيل الاختبار
testFunctionCalling().catch(console.error);
