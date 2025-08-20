// Using built-in fetch in Node.js 18+

const API_URL = 'http://localhost:3001/api/v1';

// Test colors
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

async function testApiKeyIntegration() {
    log('\n🧪 بدء اختبار تكامل مفاتيح API', 'blue');
    log('=' .repeat(50), 'blue');

    try {
        // Test 1: Load current settings
        log('\n📥 الاختبار 1: تحميل الإعدادات الحالية', 'yellow');
        const loadResponse = await fetch(`${API_URL}/ai/settings`);
        const loadData = await loadResponse.json();
        
        if (!loadData.success) {
            throw new Error(`فشل في تحميل الإعدادات: ${loadData.error}`);
        }
        
        log('✅ تم تحميل الإعدادات بنجاح', 'green');
        
        const currentModelSettings = loadData.data.modelSettings || {};
        const currentApiKeys = currentModelSettings.apiKeys || [];
        log(`📊 عدد مفاتيح API الحالية: ${currentApiKeys.length}`, 'blue');
        
        // Test 2: Add new API key
        log('\n➕ الاختبار 2: إضافة مفتاح API جديد', 'yellow');
        
        const testApiKey = {
            key: `AIza_test_${Date.now()}`,
            name: `Test Key ${new Date().toLocaleTimeString()}`,
            models: ['gemini-1.5-flash', 'gemini-pro'],
            priority: currentApiKeys.length + 1,
            dailyLimit: 1500,
            monthlyLimit: 45000
        };
        
        const newApiKeys = [...currentApiKeys, testApiKey];
        
        const newModelSettings = {
            primaryModel: 'gemini-1.5-flash',
            fallbackModels: ['gemini-pro'],
            maxResponseDelay: 30,
            enableUsageTracking: true,
            enableCostOptimization: true,
            apiKeys: newApiKeys
        };
        
        const escalationRules = {
            apiKey: newApiKeys.length > 0 ? newApiKeys[0].key : '',
            maxResponseDelay: 30
        };
        
        // Test 3: Save settings
        log('\n💾 الاختبار 3: حفظ الإعدادات', 'yellow');
        
        const saveResponse = await fetch(`${API_URL}/ai/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                autoReplyEnabled: true,
                confidenceThreshold: 0.8,
                modelSettings: JSON.stringify(newModelSettings),
                escalationRules: JSON.stringify(escalationRules)
            }),
        });
        
        const saveData = await saveResponse.json();
        
        if (!saveData.success) {
            throw new Error(`فشل في حفظ الإعدادات: ${saveData.error}`);
        }
        
        log('✅ تم حفظ الإعدادات بنجاح', 'green');
        log(`📝 تم إضافة مفتاح: ${testApiKey.name}`, 'blue');
        
        // Test 4: Reload settings to verify persistence
        log('\n🔄 الاختبار 4: إعادة تحميل الإعدادات للتحقق من الحفظ', 'yellow');
        
        // Wait a bit to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const reloadResponse = await fetch(`${API_URL}/ai/settings`);
        const reloadData = await reloadResponse.json();
        
        if (!reloadData.success) {
            throw new Error(`فشل في إعادة تحميل الإعدادات: ${reloadData.error}`);
        }
        
        log('✅ تم إعادة تحميل الإعدادات بنجاح', 'green');
        
        // Test 5: Verify the new API key exists
        log('\n🔍 الاختبار 5: التحقق من وجود المفتاح الجديد', 'yellow');
        
        const reloadedModelSettings = reloadData.data.modelSettings || {};
        const reloadedApiKeys = reloadedModelSettings.apiKeys || [];
        
        log(`📊 عدد مفاتيح API بعد الحفظ: ${reloadedApiKeys.length}`, 'blue');
        
        const foundKey = reloadedApiKeys.find(key => key.name === testApiKey.name);
        
        if (!foundKey) {
            throw new Error(`لم يتم العثور على المفتاح الجديد: ${testApiKey.name}`);
        }
        
        log('✅ تم العثور على المفتاح الجديد بنجاح', 'green');
        log(`🔑 اسم المفتاح: ${foundKey.name}`, 'blue');
        log(`🔢 الأولوية: ${foundKey.priority}`, 'blue');
        log(`📈 الحد اليومي: ${foundKey.dailyLimit}`, 'blue');
        log(`📊 الحد الشهري: ${foundKey.monthlyLimit}`, 'blue');
        
        // Test 6: Verify key properties
        log('\n✅ الاختبار 6: التحقق من خصائص المفتاح', 'yellow');
        
        const checks = [
            { name: 'اسم المفتاح', expected: testApiKey.name, actual: foundKey.name },
            { name: 'الأولوية', expected: testApiKey.priority, actual: foundKey.priority },
            { name: 'الحد اليومي', expected: testApiKey.dailyLimit, actual: foundKey.dailyLimit },
            { name: 'الحد الشهري', expected: testApiKey.monthlyLimit, actual: foundKey.monthlyLimit }
        ];
        
        let allChecksPass = true;
        
        checks.forEach(check => {
            if (check.expected === check.actual) {
                log(`✅ ${check.name}: ${check.actual}`, 'green');
            } else {
                log(`❌ ${check.name}: متوقع ${check.expected}, وجد ${check.actual}`, 'red');
                allChecksPass = false;
            }
        });
        
        if (!allChecksPass) {
            throw new Error('بعض خصائص المفتاح لا تطابق القيم المتوقعة');
        }
        
        // Final success message
        log('\n🎉 جميع الاختبارات نجحت!', 'green');
        log('=' .repeat(50), 'green');
        log('✅ إضافة مفاتيح API تعمل بشكل مثالي', 'green');
        log('✅ الحفظ في قاعدة البيانات يعمل', 'green');
        log('✅ الاسترجاع من قاعدة البيانات يعمل', 'green');
        log('✅ جميع خصائص المفاتيح محفوظة بشكل صحيح', 'green');
        
        return true;
        
    } catch (error) {
        log(`\n❌ فشل الاختبار: ${error.message}`, 'red');
        log('=' .repeat(50), 'red');
        return false;
    }
}

// Run the test
testApiKeyIntegration().then(success => {
    if (success) {
        log('\n🚀 الاختبار مكتمل بنجاح - النظام جاهز للاستخدام!', 'green');
        process.exit(0);
    } else {
        log('\n💥 الاختبار فشل - يحتاج إلى مراجعة!', 'red');
        process.exit(1);
    }
}).catch(error => {
    log(`\n💥 خطأ غير متوقع: ${error.message}`, 'red');
    process.exit(1);
});
