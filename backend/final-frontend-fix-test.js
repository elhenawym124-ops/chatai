const axios = require('axios');

async function finalFrontendFixTest() {
  console.log('🔧 Final Frontend Fix Test\n');
  console.log('==========================\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  const companyId = 'cmd5c0c9y0000ymzdd7wtv7ib'; // Correct company ID
  
  try {
    // 1. Test Company Info
    console.log('1. Testing Company Info');
    console.log('========================');
    
    const companyResponse = await axios.get(`${baseURL}/companies/${companyId}`, { headers });
    console.log('✅ Company info retrieved:');
    console.log(`   ID: ${companyResponse.data.data.id}`);
    console.log(`   Name: ${companyResponse.data.data.name}`);
    console.log(`   Settings: ${JSON.stringify(companyResponse.data.data.settings)}`);
    
    // 2. Test Company Usage
    console.log('\n2. Testing Company Usage');
    console.log('=========================');
    
    const usageResponse = await axios.get(`${baseURL}/companies/${companyId}/usage`, { headers });
    console.log('✅ Usage data retrieved:');
    console.log(`   Current Plan: ${usageResponse.data.data.currentPlan}`);
    console.log(`   Products: ${usageResponse.data.data.currentUsage.products}/${usageResponse.data.data.planLimits.products}`);
    console.log(`   Storage: ${usageResponse.data.data.currentUsage.storage}/${usageResponse.data.data.planLimits.storage}`);
    
    // 3. Test Company Plans
    console.log('\n3. Testing Company Plans');
    console.log('=========================');
    
    const plansResponse = await axios.get(`${baseURL}/companies/plans`, { headers });
    console.log('✅ Plans retrieved:');
    console.log(`   Plans count: ${plansResponse.data.data.length}`);
    console.log(`   Data type: ${typeof plansResponse.data.data}`);
    console.log(`   Is array: ${Array.isArray(plansResponse.data.data)}`);
    
    plansResponse.data.data.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name}: ${plan.price} ${plan.currency}`);
    });
    
    // 4. Test Settings
    console.log('\n4. Testing Settings');
    console.log('===================');
    
    const settingsResponse = await axios.get(`${baseURL}/settings/company`, { headers });
    console.log('✅ Settings retrieved:');
    console.log(`   Currency: ${settingsResponse.data.data.settings.currency}`);
    console.log(`   Symbol: ${settingsResponse.data.data.settings.currencySymbol}`);
    
    // 5. Test Currencies
    console.log('\n5. Testing Currencies');
    console.log('=====================');
    
    const currenciesResponse = await axios.get(`${baseURL}/settings/currencies`, { headers });
    console.log('✅ Currencies retrieved:');
    console.log(`   Count: ${currenciesResponse.data.data.length}`);
    currenciesResponse.data.data.forEach(currency => {
      console.log(`   ${currency.code}: ${currency.name} (${currency.symbol})`);
    });
    
    console.log('\n🎉 All Frontend APIs Working!');
    console.log('\n📋 Summary for Frontend:');
    console.log('✅ GET /companies/:id - Company info');
    console.log('✅ GET /companies/:id/usage - Usage data (no null objects)');
    console.log('✅ GET /companies/plans - Plans array (not object)');
    console.log('✅ GET /settings/company - Company settings');
    console.log('✅ GET /settings/currencies - Currency options');
    
    console.log('\n🔧 Frontend should now work without errors!');
    console.log('   - No more 404 errors');
    console.log('   - No more JSON parse errors');
    console.log('   - No more Object.entries() errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
  }
}

finalFrontendFixTest();
