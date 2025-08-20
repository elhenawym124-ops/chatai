// Simple test without starting server
function analyzeMessageIntent(message) {
  const text = message.toLowerCase();
  
  // Simple intent detection
  if (/مشكلة|خطأ|عطل|شكوى/.test(text)) {
    return { intent: 'support', confidence: 0.8 };
  }
  
  if (/كوتشي|حذاء|منتج|سلعة/.test(text)) {
    return { intent: 'product_inquiry', confidence: 0.8 };
  }
  
  if (/أهلا|السلام|ازيك|صباح/.test(text)) {
    return { intent: 'greeting', confidence: 0.8 };
  }
  
  return { intent: 'general', confidence: 0.5 };
}

function hasSpecificAnswer(text) {
  // Check if message asks for specific information
  const specificPatterns = [
    /كام سعر|كم سعر|بكام|بكم/,
    /متوفر|موجود|عندك/,
    /مقاس|لون|حجم/,
    /امتى|متى|وقت/
  ];
  
  return specificPatterns.some(pattern => pattern.test(text));
}

function shouldSuggestProducts(messageIntent, messageText, conversationContext = {}) {
  const { intent, confidence } = messageIntent;
  const text = messageText.toLowerCase();

  console.log(`🔍 Analyzing: "${messageText}"`);
  console.log(`📊 Intent: ${intent}, Confidence: ${confidence}`);

  // Never suggest for support issues
  if (intent === 'support') {
    console.log('❌ No suggestions: Support issue detected');
    return false;
  }

  // Never suggest if customer seems satisfied
  if (conversationContext.customerSatisfied) {
    console.log('❌ No suggestions: Customer seems satisfied');
    return false;
  }

  // Don't suggest if we recently provided suggestions
  if (conversationContext.recentlyProvidedSuggestions && 
      conversationContext.messagesSinceLastSuggestion < 3) {
    console.log('❌ No suggestions: Too soon after last suggestions');
    return false;
  }

  // Never suggest if customer is asking for specific information
  if (hasSpecificAnswer(text)) {
    console.log('❌ No suggestions: Specific question detected');
    return false;
  }

  // Suggest for explicit help requests or general product inquiries
  if (/مش عارف|انصحني|اقترح|إيه الأفضل|محتار|موديلات|منتجات|عندك ايه|ايه اللي عندك/.test(text)) {
    console.log('✅ Suggesting: Help request or product inquiry detected');
    return true;
  }

  // Suggest for product inquiries only if it's general
  if (intent === 'product_inquiry' && confidence > 0.7) {
    if (!hasSpecificAnswer(text) && !conversationContext.foundRequestedProduct) {
      console.log('✅ Suggesting: General product inquiry without specific match');
      return true;
    } else {
      console.log('❌ No suggestions: Specific question or found requested product');
      return false;
    }
  }

  // Suggest for greetings only if they mention shopping intent AND it's early in conversation
  if (intent === 'greeting') {
    const hasShoppingIntent = /منتج|سلعة|بضاعة|شراء|تسوق|أريد|عايز|محتاج/.test(text);
    const isEarlyInConversation = conversationContext.messageCount <= 2;

    if (hasShoppingIntent && isEarlyInConversation) {
      console.log('✅ Suggesting: Greeting with shopping intent');
      return true;
    } else {
      console.log('❌ No suggestions: Greeting without shopping intent or late in conversation');
      return false;
    }
  }

  // Default: don't suggest unless there's a clear need
  console.log('❌ No suggestions: No clear need detected');
  return false;
}

// Test cases
const testCases = [
  {
    message: 'قولي الموديلات',
    context: { messageCount: 3 },
    expected: true
  },
  {
    message: 'كام سعر الكوتشي؟',
    context: { messageCount: 3 },
    expected: false
  },
  {
    message: 'انصحني بحاجة حلوة',
    context: { messageCount: 5 },
    expected: true
  },
  {
    message: 'شكراً ممتاز',
    context: { messageCount: 5, customerSatisfied: true },
    expected: false
  },
  {
    message: 'عايزة كوتشي',
    context: { messageCount: 3, foundRequestedProduct: false },
    expected: true
  }
];

console.log('🧪 Testing Product Suggestion Conditions...\n');

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1} ---`);
  const messageIntent = analyzeMessageIntent(testCase.message);
  const result = shouldSuggestProducts(messageIntent, testCase.message, testCase.context);
  
  console.log(`Expected: ${testCase.expected ? '✅ YES' : '❌ NO'}`);
  console.log(`Got: ${result ? '✅ YES' : '❌ NO'}`);
  console.log(result === testCase.expected ? '✅ PASSED' : '❌ FAILED');
});

console.log('\n🎯 Summary:');
console.log('الشروط المحفزة للاقتراح:');
console.log('✅ كلمات المساعدة: انصحني، اقترح، مش عارف، محتار');
console.log('✅ كلمات المنتجات: موديلات، منتجات، عندك ايه');
console.log('✅ استفسارات عامة عن منتجات');
console.log('✅ تحيات مع نية شراء في بداية المحادثة');

console.log('\nالشروط المانعة للاقتراح:');
console.log('❌ مشاكل الدعم الفني');
console.log('❌ العميل راضي ومكتفي');
console.log('❌ أسئلة محددة (كام سعر، متوفر، مقاس)');
console.log('❌ اقتراحات حديثة (أقل من 3 رسائل)');
