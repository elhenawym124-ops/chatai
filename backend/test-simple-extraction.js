// اختبار بسيط للنظام المحسن
console.log('🧪 اختبار النظام المحسن...');

// محاكاة دالة تنظيف البيانات
function cleanProductName(name) {
  if (!name || typeof name !== 'string') return 'كوتشي حريمي';
  
  let cleaned = name.trim()
    .replace(/[()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^(ال|كوتشي|حذاء)\s*/i, '');
  
  if (!cleaned.includes('كوتشي') && !cleaned.includes('حذاء')) {
    cleaned = 'كوتشي ' + cleaned;
  }
  
  return cleaned || 'كوتشي حريمي';
}

function cleanProductColor(color) {
  if (!color || typeof color !== 'string') return 'أبيض';
  
  const colorMap = {
    'اسود': 'أسود',
    'ابيض': 'أبيض',
    'احمر': 'أحمر',
    'ازرق': 'أزرق'
  };
  
  let cleaned = color.trim()
    .replace(/[()[\]{}]/g, '')
    .replace(/^(ال|لون)\s*/i, '');
  
  return colorMap[cleaned] || cleaned || 'أبيض';
}

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  
  const digits = String(phone).replace(/[^\d]/g, '');
  
  if (digits.length === 11 && digits.startsWith('01')) {
    return digits;
  }
  
  if (digits.length === 10 && digits.startsWith('1')) {
    return '0' + digits;
  }
  
  return '';
}

// اختبار التنظيف
console.log('\n🧹 اختبار تنظيف البيانات:');

const testCases = [
  {
    input: { name: '(كوتشي الاسكوتش)', color: 'اسود', phone: '01012345678' },
    expected: { name: 'كوتشي الاسكوتش', color: 'أسود', phone: '01012345678' }
  },
  {
    input: { name: 'الاسكوتش', color: '(ابيض)', phone: '1012345678' },
    expected: { name: 'كوتشي الاسكوتش', color: 'أبيض', phone: '01012345678' }
  },
  {
    input: { name: '', color: '', phone: '123' },
    expected: { name: 'كوتشي حريمي', color: 'أبيض', phone: '' }
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\nاختبار ${index + 1}:`);
  console.log('المدخل:', testCase.input);
  
  const result = {
    name: cleanProductName(testCase.input.name),
    color: cleanProductColor(testCase.input.color),
    phone: cleanPhoneNumber(testCase.input.phone)
  };
  
  console.log('النتيجة:', result);
  console.log('المتوقع:', testCase.expected);
  
  const isCorrect = 
    result.name === testCase.expected.name &&
    result.color === testCase.expected.color &&
    result.phone === testCase.expected.phone;
  
  console.log(isCorrect ? '✅ نجح' : '❌ فشل');
});

console.log('\n🎯 اختبار تقييم جودة البيانات:');

function assessDataQuality(data) {
  let score = 0;
  let maxScore = 0;
  
  const checks = [
    { field: 'productName', weight: 2, value: data.productName },
    { field: 'customerName', weight: 3, value: data.customerName },
    { field: 'customerPhone', weight: 3, value: data.customerPhone }
  ];
  
  checks.forEach(check => {
    maxScore += check.weight;
    if (check.value && check.value !== 'غير محدد' && check.value !== '') {
      score += check.weight;
    }
  });
  
  const qualityPercentage = (score / maxScore) * 100;
  
  let quality = 'منخفضة';
  if (qualityPercentage >= 80) quality = 'عالية';
  else if (qualityPercentage >= 60) quality = 'متوسطة';
  
  return {
    score: qualityPercentage.toFixed(0),
    level: quality
  };
}

const qualityTests = [
  {
    data: { productName: 'كوتشي الاسكوتش', customerName: 'فاطمة أحمد', customerPhone: '01012345678' },
    expected: 'عالية'
  },
  {
    data: { productName: 'كوتشي حريمي', customerName: '', customerPhone: '01012345678' },
    expected: 'متوسطة'
  },
  {
    data: { productName: '', customerName: '', customerPhone: '' },
    expected: 'منخفضة'
  }
];

qualityTests.forEach((test, index) => {
  const quality = assessDataQuality(test.data);
  console.log(`\nاختبار الجودة ${index + 1}:`);
  console.log('البيانات:', test.data);
  console.log(`الجودة: ${quality.level} (${quality.score}%)`);
  console.log(`المتوقع: ${test.expected}`);
  console.log(quality.level === test.expected ? '✅ نجح' : '❌ فشل');
});

console.log('\n🚀 تم الانتهاء من الاختبارات!');
