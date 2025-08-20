async function testFeaturesSaving() {
  console.log('🧪 اختبار حفظ المميزات...\n');
  
  try {
    // 1. اختبار تعطيل المميزات
    console.log('🔴 1. تعطيل المميزات...');
    
    const disableResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isEnabled: true,
        workingHours: { start: "09:00", end: "18:00" },
        maxRepliesPerCustomer: 5,
        multimodalEnabled: false,
        ragEnabled: false
      })
    });
    
    const disableData = await disableResponse.json();
    console.log('📤 نتيجة التعطيل:', disableData.success ? 'نجح' : 'فشل');
    
    // التحقق من التغيير
    const checkResponse1 = await fetch('http://localhost:3001/api/v1/ai/settings');
    const checkData1 = await checkResponse1.json();
    console.log('📊 الحالة بعد التعطيل:', {
      multimodalEnabled: checkData1.data?.multimodalEnabled,
      ragEnabled: checkData1.data?.ragEnabled
    });
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. اختبار تفعيل المميزات
    console.log('\n🟢 2. تفعيل المميزات...');
    
    const enableResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isEnabled: true,
        workingHours: { start: "09:00", end: "18:00" },
        maxRepliesPerCustomer: 5,
        multimodalEnabled: true,
        ragEnabled: true
      })
    });
    
    const enableData = await enableResponse.json();
    console.log('📤 نتيجة التفعيل:', enableData.success ? 'نجح' : 'فشل');
    
    // التحقق من التغيير
    const checkResponse2 = await fetch('http://localhost:3001/api/v1/ai/settings');
    const checkData2 = await checkResponse2.json();
    console.log('📊 الحالة بعد التفعيل:', {
      multimodalEnabled: checkData2.data?.multimodalEnabled,
      ragEnabled: checkData2.data?.ragEnabled
    });
    
    // 3. اختبار تفعيل واحد وتعطيل الآخر
    console.log('\n🔄 3. تفعيل واحد وتعطيل الآخر...');
    
    const mixedResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isEnabled: true,
        workingHours: { start: "09:00", end: "18:00" },
        maxRepliesPerCustomer: 5,
        multimodalEnabled: true,
        ragEnabled: false
      })
    });
    
    const mixedData = await mixedResponse.json();
    console.log('📤 نتيجة الحفظ المختلط:', mixedData.success ? 'نجح' : 'فشل');
    
    // التحقق من التغيير
    const checkResponse3 = await fetch('http://localhost:3001/api/v1/ai/settings');
    const checkData3 = await checkResponse3.json();
    console.log('📊 الحالة المختلطة:', {
      multimodalEnabled: checkData3.data?.multimodalEnabled,
      ragEnabled: checkData3.data?.ragEnabled
    });
    
    // 4. إعادة تفعيل الكل
    console.log('\n✅ 4. إعادة تفعيل الكل...');
    
    const finalResponse = await fetch('http://localhost:3001/api/v1/ai/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isEnabled: true,
        workingHours: { start: "09:00", end: "18:00" },
        maxRepliesPerCustomer: 5,
        multimodalEnabled: true,
        ragEnabled: true
      })
    });
    
    const finalData = await finalResponse.json();
    console.log('📤 نتيجة الإعادة:', finalData.success ? 'نجح' : 'فشل');
    
    // التحقق النهائي
    const finalCheck = await fetch('http://localhost:3001/api/v1/ai/settings');
    const finalCheckData = await finalCheck.json();
    console.log('📊 الحالة النهائية:', {
      isEnabled: finalCheckData.data?.isEnabled,
      multimodalEnabled: finalCheckData.data?.multimodalEnabled,
      ragEnabled: finalCheckData.data?.ragEnabled,
      workingHours: finalCheckData.data?.workingHours,
      maxRepliesPerCustomer: finalCheckData.data?.maxRepliesPerCustomer
    });
    
    console.log('\n🎉 انتهى اختبار المميزات!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testFeaturesSaving();
