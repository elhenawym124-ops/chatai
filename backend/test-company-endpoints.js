const axios = require('axios');

async function testCompanyEndpoints() {
  console.log('🏢 Testing Company Endpoints...\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Test company info
    console.log('1. Testing GET /companies/1');
    console.log('==============================');
    
    const companyResponse = await axios.get(`${baseURL}/companies/1`, { headers });
    console.log('✅ Company info retrieved:');
    console.log(`   ID: ${companyResponse.data.data.id}`);
    console.log(`   Name: ${companyResponse.data.data.name}`);
    console.log(`   Email: ${companyResponse.data.data.email}`);
    console.log(`   Settings: ${JSON.stringify(companyResponse.data.data.settings, null, 2)}`);
    
    // 2. Test company usage
    console.log('\n2. Testing GET /companies/1/usage');
    console.log('===================================');
    
    const usageResponse = await axios.get(`${baseURL}/companies/1/usage`, { headers });
    console.log('✅ Usage data retrieved:');
    console.log(`   Current Plan: ${usageResponse.data.data.currentPlan}`);
    console.log(`   Products: ${usageResponse.data.data.currentUsage.products}/${usageResponse.data.data.planLimits.products}`);
    console.log(`   Orders: ${usageResponse.data.data.currentUsage.orders}/${usageResponse.data.data.planLimits.orders}`);
    console.log(`   Storage: ${usageResponse.data.data.currentUsage.storage}/${usageResponse.data.data.planLimits.storage}`);
    console.log(`   API Calls: ${usageResponse.data.data.currentUsage.apiCalls}/${usageResponse.data.data.planLimits.apiCalls}`);
    
    // 3. Test company plans
    console.log('\n3. Testing GET /companies/plans');
    console.log('================================');
    
    const plansResponse = await axios.get(`${baseURL}/companies/plans`, { headers });
    console.log('✅ Plans retrieved:');
    plansResponse.data.data.forEach(plan => {
      console.log(`   ${plan.name} (${plan.id}): ${plan.price} ${plan.currency}`);
      console.log(`      Features: ${plan.features.join(', ')}`);
    });
    
    // 4. Test settings endpoints
    console.log('\n4. Testing Settings Endpoints');
    console.log('==============================');
    
    const settingsResponse = await axios.get(`${baseURL}/settings/company`, { headers });
    console.log('✅ Company settings retrieved:');
    console.log(`   Currency: ${settingsResponse.data.data.settings.currency}`);
    console.log(`   Symbol: ${settingsResponse.data.data.settings.currencySymbol}`);
    
    const currenciesResponse = await axios.get(`${baseURL}/settings/currencies`, { headers });
    console.log('✅ Available currencies:');
    currenciesResponse.data.data.forEach(currency => {
      console.log(`   ${currency.code}: ${currency.name} (${currency.symbol})`);
    });
    
    console.log('\n🎉 All company endpoints working correctly!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /companies/:id - Company info');
    console.log('✅ GET /companies/:id/usage - Usage statistics');
    console.log('✅ GET /companies/plans - Available plans');
    console.log('✅ GET /settings/company - Company settings');
    console.log('✅ GET /settings/currencies - Available currencies');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
  }
}

testCompanyEndpoints();
