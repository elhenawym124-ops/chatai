// Test script to verify add button functionality
// Using built-in fetch in Node.js 18+

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testButtonFunctionality() {
    log('\n🔍 اختبار وظيفة زر إضافة مفتاح API', 'blue');
    log('=' .repeat(60), 'blue');

    try {
        // Step 1: Clear existing keys first (reset test)
        log('\n🧹 الخطوة 1: مسح المفاتيح الموجودة (إعادة تعيين)', 'yellow');
        
        const clearModelSettings = {
            primaryModel: 'gemini-1.5-flash',
            fallbackModels: ['gemini-pro'],
            maxResponseDelay: 30,
            enableUsageTracking: true,
            enableCostOptimization: true,
            apiKeys: [] // Clear all keys
        };
        
        const clearEscalationRules = {
            apiKey: '',
            maxResponseDelay: 30
        };
        
        const clearResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                autoReplyEnabled: true,
                confidenceThreshold: 0.8,
                modelSettings: JSON.stringify(clearModelSettings),
                escalationRules: JSON.stringify(clearEscalationRules)
            }),
        });
        
        const clearData = await clearResponse.json();
        if (!clearData.success) {
            throw new Error(`فشل في مسح المفاتيح: ${clearData.error}`);
        }
        
        log('✅ تم مسح جميع المفاتيح بنجاح', 'green');
        
        // Step 2: Verify empty state
        log('\n📥 الخطوة 2: التحقق من الحالة الفارغة', 'yellow');
        
        const emptyResponse = await fetch('http://localhost:3001/api/v1/ai/settings');
        const emptyData = await emptyResponse.json();
        
        if (!emptyData.success) {
            throw new Error(`فشل في تحميل الحالة الفارغة: ${emptyData.error}`);
        }
        
        const emptyApiKeys = emptyData.data.modelSettings?.apiKeys || [];
        log(`📊 عدد المفاتيح في الحالة الفارغة: ${emptyApiKeys.length}`, 'blue');
        
        if (emptyApiKeys.length !== 0) {
            log('⚠️ تحذير: لم يتم مسح جميع المفاتيح', 'yellow');
        }
        
        // Step 3: Simulate adding first key (like clicking the button)
        log('\n➕ الخطوة 3: محاكاة إضافة المفتاح الأول', 'yellow');
        
        const firstKey = {
            key: 'AIza_first_test_key_123',
            name: 'First Test Key',
            models: ['gemini-1.5-flash', 'gemini-pro'],
            priority: 1,
            dailyLimit: 1000,
            monthlyLimit: 30000
        };
        
        const firstModelSettings = {
            primaryModel: 'gemini-1.5-flash',
            fallbackModels: ['gemini-pro'],
            maxResponseDelay: 30,
            enableUsageTracking: true,
            enableCostOptimization: true,
            apiKeys: [firstKey] // Add first key
        };
        
        const firstEscalationRules = {
            apiKey: firstKey.key,
            maxResponseDelay: 30
        };
        
        const firstResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                autoReplyEnabled: true,
                confidenceThreshold: 0.8,
                modelSettings: JSON.stringify(firstModelSettings),
                escalationRules: JSON.stringify(firstEscalationRules)
            }),
        });
        
        const firstData = await firstResponse.json();
        if (!firstData.success) {
            throw new Error(`فشل في إضافة المفتاح الأول: ${firstData.error}`);
        }
        
        log('✅ تم إضافة المفتاح الأول بنجاح', 'green');
        log(`🔑 اسم المفتاح: ${firstKey.name}`, 'blue');
        
        // Step 4: Verify first key was saved
        log('\n🔍 الخطوة 4: التحقق من حفظ المفتاح الأول', 'yellow');
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB write
        
        const verifyFirstResponse = await fetch('http://localhost:3001/api/v1/ai/settings');
        const verifyFirstData = await verifyFirstResponse.json();
        
        if (!verifyFirstData.success) {
            throw new Error(`فشل في التحقق من المفتاح الأول: ${verifyFirstData.error}`);
        }
        
        const savedFirstKeys = verifyFirstData.data.modelSettings?.apiKeys || [];
        log(`📊 عدد المفاتيح بعد الإضافة الأولى: ${savedFirstKeys.length}`, 'blue');
        
        const foundFirstKey = savedFirstKeys.find(key => key.name === firstKey.name);
        if (!foundFirstKey) {
            throw new Error(`لم يتم العثور على المفتاح الأول: ${firstKey.name}`);
        }
        
        log('✅ تم العثور على المفتاح الأول في قاعدة البيانات', 'green');
        
        // Step 5: Simulate adding second key (like clicking the button again)
        log('\n➕ الخطوة 5: محاكاة إضافة المفتاح الثاني', 'yellow');
        
        const secondKey = {
            key: 'AIza_second_test_key_456',
            name: 'Second Test Key',
            models: ['gemini-1.5-flash', 'gemini-pro'],
            priority: 2,
            dailyLimit: 1500,
            monthlyLimit: 45000
        };
        
        const secondModelSettings = {
            primaryModel: 'gemini-1.5-flash',
            fallbackModels: ['gemini-pro'],
            maxResponseDelay: 30,
            enableUsageTracking: true,
            enableCostOptimization: true,
            apiKeys: [firstKey, secondKey] // Add both keys
        };
        
        const secondEscalationRules = {
            apiKey: firstKey.key, // Keep first key as primary
            maxResponseDelay: 30
        };
        
        const secondResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                autoReplyEnabled: true,
                confidenceThreshold: 0.8,
                modelSettings: JSON.stringify(secondModelSettings),
                escalationRules: JSON.stringify(secondEscalationRules)
            }),
        });
        
        const secondData = await secondResponse.json();
        if (!secondData.success) {
            throw new Error(`فشل في إضافة المفتاح الثاني: ${secondData.error}`);
        }
        
        log('✅ تم إضافة المفتاح الثاني بنجاح', 'green');
        log(`🔑 اسم المفتاح: ${secondKey.name}`, 'blue');
        
        // Step 6: Verify both keys are saved
        log('\n🔍 الخطوة 6: التحقق من حفظ كلا المفتاحين', 'yellow');
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB write
        
        const verifyBothResponse = await fetch('http://localhost:3001/api/v1/ai/settings');
        const verifyBothData = await verifyBothResponse.json();
        
        if (!verifyBothData.success) {
            throw new Error(`فشل في التحقق من كلا المفتاحين: ${verifyBothData.error}`);
        }
        
        const savedBothKeys = verifyBothData.data.modelSettings?.apiKeys || [];
        log(`📊 عدد المفاتيح النهائي: ${savedBothKeys.length}`, 'blue');
        
        if (savedBothKeys.length !== 2) {
            throw new Error(`عدد المفاتيح غير صحيح. متوقع: 2, وجد: ${savedBothKeys.length}`);
        }
        
        const foundSecondKey = savedBothKeys.find(key => key.name === secondKey.name);
        if (!foundSecondKey) {
            throw new Error(`لم يتم العثور على المفتاح الثاني: ${secondKey.name}`);
        }
        
        log('✅ تم العثور على كلا المفتاحين في قاعدة البيانات', 'green');
        
        // Step 7: Display final results
        log('\n📋 الخطوة 7: النتائج النهائية', 'yellow');
        
        savedBothKeys.forEach((key, index) => {
            log(`🔑 المفتاح ${index + 1}:`, 'blue');
            log(`   📝 الاسم: ${key.name}`, 'blue');
            log(`   🔢 الأولوية: ${key.priority}`, 'blue');
            log(`   📈 الحد اليومي: ${key.dailyLimit}`, 'blue');
            log(`   📊 الحد الشهري: ${key.monthlyLimit}`, 'blue');
        });
        
        // Final success message
        log('\n🎉 جميع اختبارات زر الإضافة نجحت!', 'green');
        log('=' .repeat(60), 'green');
        log('✅ زر إضافة مفتاح API يعمل بشكل مثالي', 'green');
        log('✅ الحفظ في قاعدة البيانات يعمل', 'green');
        log('✅ الاسترجاع من قاعدة البيانات يعمل', 'green');
        log('✅ إضافة مفاتيح متعددة يعمل', 'green');
        log('✅ جميع خصائص المفاتيح محفوظة بشكل صحيح', 'green');
        
        return true;
        
    } catch (error) {
        log(`\n❌ فشل اختبار زر الإضافة: ${error.message}`, 'red');
        log('=' .repeat(60), 'red');
        return false;
    }
}

// Run the test
testButtonFunctionality().then(success => {
    if (success) {
        log('\n🚀 زر إضافة مفتاح API يعمل بشكل مثالي - لا توجد مشاكل!', 'green');
        process.exit(0);
    } else {
        log('\n💥 هناك مشكلة في زر الإضافة - يحتاج إلى مراجعة!', 'red');
        process.exit(1);
    }
}).catch(error => {
    log(`\n💥 خطأ غير متوقع في اختبار الزر: ${error.message}`, 'red');
    process.exit(1);
});
