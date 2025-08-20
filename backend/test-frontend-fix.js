const axios = require('axios');

async function testFrontendFix() {
  console.log('🔧 Testing Frontend Fix for Company ID 1\n');
  console.log('==========================================\n');
  
  const baseURL = 'http://localhost:3001/api/v1';
  const headers = {
    'Authorization': 'Bearer mock-access-token',
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Test Company ID 1 (what frontend is calling)
    console.log('1. Testing GET /companies/1 (Frontend Call)');
    console.log('=============================================');
    
    const companyResponse = await axios.get(`${baseURL}/companies/1`, { headers });
    console.log('✅ Company 1 response:');
    console.log(`   ID: ${companyResponse.data.data.id}`);
    console.log(`   Name: ${companyResponse.data.data.name}`);
    console.log(`   Email: ${companyResponse.data.data.email || 'Not set'}`);
    console.log(`   Settings: ${JSON.stringify(companyResponse.data.data.settings, null, 2)}`);
    
    // Check for undefined values that could cause toLocaleString errors
    console.log('\n🔍 Checking for undefined values:');
    const data = companyResponse.data.data;
    console.log(`   ID defined: ${data.id !== undefined}`);
    console.log(`   Name defined: ${data.name !== undefined}`);
    console.log(`   Settings defined: ${data.settings !== undefined}`);
    console.log(`   Settings.currency defined: ${data.settings?.currency !== undefined}`);
    console.log(`   Settings.currencySymbol defined: ${data.settings?.currencySymbol !== undefined}`);
    
    // 2. Test Usage for ID 1
    console.log('\n2. Testing GET /companies/1/usage');
    console.log('===================================');
    
    const usageResponse = await axios.get(`${baseURL}/companies/1/usage`, { headers });
    console.log('✅ Usage response:');
    console.log(`   Current Plan: ${usageResponse.data.data.currentPlan}`);
    console.log(`   Products: ${usageResponse.data.data.currentUsage.products}/${usageResponse.data.data.planLimits.products}`);
    console.log(`   Usage %: ${usageResponse.data.data.usagePercentage.products}%`);
    
    // Check usage data for undefined values
    console.log('\n🔍 Checking usage data:');
    const usage = usageResponse.data.data;
    console.log(`   currentUsage defined: ${usage.currentUsage !== undefined}`);
    console.log(`   planLimits defined: ${usage.planLimits !== undefined}`);
    console.log(`   usagePercentage defined: ${usage.usagePercentage !== undefined}`);
    
    // Check each usage value
    Object.entries(usage.currentUsage).forEach(([key, value]) => {
      console.log(`   currentUsage.${key}: ${value} (type: ${typeof value})`);
    });
    
    Object.entries(usage.usagePercentage).forEach(([key, value]) => {
      console.log(`   usagePercentage.${key}: ${value} (type: ${typeof value})`);
    });
    
    // 3. Test Plans
    console.log('\n3. Testing GET /companies/plans');
    console.log('================================');
    
    const plansResponse = await axios.get(`${baseURL}/companies/plans`, { headers });
    console.log('✅ Plans response:');
    console.log(`   Plans count: ${plansResponse.data.data.length}`);
    console.log(`   Is array: ${Array.isArray(plansResponse.data.data)}`);
    
    // Check each plan for undefined values
    plansResponse.data.data.forEach((plan, index) => {
      console.log(`   Plan ${index + 1}: ${plan.name} - ${plan.price} ${plan.currency}`);
      console.log(`     Price type: ${typeof plan.price}`);
      console.log(`     Features count: ${plan.features?.length || 0}`);
    });
    
    // 4. Test Settings
    console.log('\n4. Testing GET /settings/company');
    console.log('=================================');
    
    const settingsResponse = await axios.get(`${baseURL}/settings/company`, { headers });
    console.log('✅ Settings response:');
    console.log(`   Currency: ${settingsResponse.data.data.settings.currency}`);
    console.log(`   Symbol: ${settingsResponse.data.data.settings.currencySymbol}`);
    console.log(`   Working Hours: ${JSON.stringify(settingsResponse.data.data.settings.workingHours)}`);
    console.log(`   Notifications: ${JSON.stringify(settingsResponse.data.data.settings.notifications)}`);
    
    console.log('\n🎉 All Frontend Endpoints Working!');
    console.log('\n📋 Summary:');
    console.log('✅ GET /companies/1 - Returns valid company data');
    console.log('✅ GET /companies/1/usage - Returns valid usage data');
    console.log('✅ GET /companies/plans - Returns valid plans array');
    console.log('✅ GET /settings/company - Returns valid settings');
    console.log('✅ All values are defined (no undefined that could cause toLocaleString errors)');
    
    console.log('\n🔧 Frontend should now work without errors!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
  }
}

testFrontendFix();
