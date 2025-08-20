// Import the actual function from server.js
const { shouldSuggestProducts, analyzeMessageIntent, hasSpecificAnswer } = require('./server.js');

async function testSuggestionConditions() {
  console.log('🧪 Testing Product Suggestion Conditions...\n');
  
  const testCases = [
    // ✅ Cases that SHOULD trigger suggestions
    {
      message: 'قولي الموديلات',
      context: { messageCount: 3, recentlyProvidedSuggestions: false },
      expected: true,
      reason: 'كلمة "موديلات" تحفز الاقتراح'
    },
    {
      message: 'انصحني بحاجة حلوة',
      context: { messageCount: 5, recentlyProvidedSuggestions: false },
      expected: true,
      reason: 'كلمة "انصحني" تحفز الاقتراح'
    },
    {
      message: 'عندك ايه جديد',
      context: { messageCount: 2, recentlyProvidedSuggestions: false },
      expected: true,
      reason: 'كلمة "عندك ايه" تحفز الاقتراح'
    },
    {
      message: 'أهلاً، عايزة أشتري كوتشي',
      context: { messageCount: 1, recentlyProvidedSuggestions: false },
      expected: true,
      reason: 'تحية مع نية شراء في بداية المحادثة'
    },
    {
      message: 'عايزة كوتشي',
      context: { messageCount: 3, recentlyProvidedSuggestions: false, foundRequestedProduct: false },
      expected: true,
      reason: 'استفسار عام عن منتج'
    },
    
    // ❌ Cases that should NOT trigger suggestions
    {
      message: 'كام سعر الكوتشي الأحمر؟',
      context: { messageCount: 3, recentlyProvidedSuggestions: false },
      expected: false,
      reason: 'سؤال محدد له إجابة مباشرة'
    },
    {
      message: 'شكراً، ممتاز',
      context: { messageCount: 5, customerSatisfied: true },
      expected: false,
      reason: 'العميل راضي ومكتفي'
    },
    {
      message: 'عندي مشكلة في الطلب',
      context: { messageCount: 3, recentlyProvidedSuggestions: false },
      expected: false,
      reason: 'مشكلة دعم فني'
    },
    {
      message: 'ايه رأيك في المنتج ده؟',
      context: { 
        messageCount: 5, 
        recentlyProvidedSuggestions: true, 
        messagesSinceLastSuggestion: 1 
      },
      expected: false,
      reason: 'تم تقديم اقتراحات مؤخراً (أقل من 3 رسائل)'
    },
    {
      message: 'أهلاً، ازيك',
      context: { messageCount: 3, recentlyProvidedSuggestions: false },
      expected: false,
      reason: 'تحية بدون نية شراء أو متأخرة في المحادثة'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`🔍 Testing: "${testCase.message}"`);
    console.log(`📝 Expected: ${testCase.expected ? '✅ YES' : '❌ NO'} - ${testCase.reason}`);
    
    try {
      // Analyze message intent
      const messageIntent = analyzeMessageIntent(testCase.message);
      
      // Test the condition
      const result = shouldSuggestProducts(messageIntent, testCase.message, testCase.context);
      
      console.log(`🤖 Result: ${result ? '✅ YES' : '❌ NO'}`);
      
      if (result === testCase.expected) {
        console.log('✅ TEST PASSED\n');
      } else {
        console.log('❌ TEST FAILED\n');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎯 Summary of Conditions:');
  console.log('✅ WILL suggest for:');
  console.log('   - طلبات المساعدة: انصحني، اقترح، مش عارف، محتار');
  console.log('   - استفسارات المنتجات: موديلات، منتجات، عندك ايه، ايه اللي عندك');
  console.log('   - استفسارات عامة عن منتج بدون إجابة محددة');
  console.log('   - تحيات مع نية شراء في بداية المحادثة');
  console.log('   - عميل تائه مع تاريخ استفسارات منتجات');
  
  console.log('\n❌ WILL NOT suggest for:');
  console.log('   - مشاكل الدعم الفني');
  console.log('   - عميل راضي ومكتفي');
  console.log('   - أسئلة محددة لها إجابات مباشرة');
  console.log('   - بعد تقديم اقتراحات مؤخراً (أقل من 3 رسائل)');
  console.log('   - تحيات عادية بدون نية شراء');
}

testSuggestionConditions();
