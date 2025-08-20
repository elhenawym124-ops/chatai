// استخدام fetch المدمج في Node.js 18+

async function testAPI() {
    const API_URL = 'http://localhost:3001/api/v1';
    
    console.log('🔍 اختبار API الخلفي...\n');
    
    try {
        // 1. اختبار جلب الإعدادات
        console.log('1️⃣ اختبار جلب الإعدادات...');
        const getResponse = await fetch(`${API_URL}/ai/settings`);
        const getData = await getResponse.json();
        
        console.log('✅ استجابة الجلب:', JSON.stringify(getData, null, 2));
        
        // 2. اختبار حفظ الإعدادات
        console.log('\n2️⃣ اختبار حفظ الإعدادات...');
        const testSettings = {
            apiKey: 'test-key-12345',
            autoReplyEnabled: true,
            confidenceThreshold: 0.9,
            maxResponseDelay: 45,
            modelSettings: JSON.stringify({
                primaryModel: 'gemini-1.5-pro',
                enableUsageTracking: true,
                enableCostOptimization: false
            }),
            escalationRules: JSON.stringify({
                apiKey: 'test-key-12345',
                maxResponseDelay: 45
            })
        };
        
        const saveResponse = await fetch(`${API_URL}/ai/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testSettings)
        });
        
        const saveData = await saveResponse.json();
        console.log('✅ استجابة الحفظ:', JSON.stringify(saveData, null, 2));
        
        // 3. اختبار جلب الإعدادات مرة أخرى للتأكد من الحفظ
        console.log('\n3️⃣ اختبار جلب الإعدادات بعد الحفظ...');
        const getResponse2 = await fetch(`${API_URL}/ai/settings`);
        const getData2 = await getResponse2.json();
        
        console.log('✅ الإعدادات بعد الحفظ:', JSON.stringify(getData2, null, 2));
        
        // 4. التحقق من أن البيانات تم حفظها
        if (getData2.success && getData2.data.autoReplyEnabled === true) {
            console.log('\n🎉 نجح الحفظ! البيانات محفوظة في قاعدة البيانات');
        } else {
            console.log('\n❌ فشل الحفظ! البيانات لم تُحفظ بشكل صحيح');
        }
        
    } catch (error) {
        console.error('❌ خطأ في الاختبار:', error.message);
    }
}

testAPI();
