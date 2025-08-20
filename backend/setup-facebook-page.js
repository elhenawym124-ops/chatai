const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupFacebookPage() {
  try {
    console.log('🔧 Setting up Facebook page...');

    // Page details from API test
    const pageData = {
      pageId: '351400718067673',
      pageName: 'Simple A42',
      accessToken: 'EAAUpPO0SIEABPBOz6JqTlbB1o8qLiOSQhDlpsdU4qf7o7q50GE2vqHqW87xk4emwqLce0xesto9AHQezBs98bHLoEMZADPNQZAesauXs9LwKbGratfGsuklxTn51SZBpZCYjv8Jp4MY8mxqiBLYEul93FyRspMy5blQHL6crdOHFeZC3fCUdWwrcHUB6brnBpeJaMb7BNJeSwM7UbGl86EenMOQZDZD'
    };

    // Check if company exists, create if not
    let company = await prisma.company.findFirst();
    if (!company) {
      console.log('📊 Creating default company...');
      company = await prisma.company.create({
        data: {
          name: 'Test Company',
          email: 'test@company.com',
          phone: '+1234567890',
          address: 'Test Address',
          website: 'https://test.com',
          industry: 'Technology',
          size: 'SMALL',
          status: 'ACTIVE'
        }
      });
      console.log('✅ Company created:', company.id);
    }

    // Check if page already exists
    const existingPage = await prisma.facebookPage.findFirst({
      where: {
        pageId: pageData.pageId
      }
    });

    if (existingPage) {
      console.log('📄 Page already exists, updating...');
      const updatedPage = await prisma.facebookPage.update({
        where: { id: existingPage.id },
        data: {
          pageAccessToken: pageData.accessToken
        }
      });
      console.log('✅ Page updated:', updatedPage.pageId);
    } else {
      console.log('📄 Creating new page...');
      const newPage = await prisma.facebookPage.create({
        data: {
          pageId: pageData.pageId,
          pageAccessToken: pageData.accessToken,
          companyId: company.id
        }
      });
      console.log('✅ Page created:', newPage.pageId);
    }

    // Test the connection
    console.log('🧪 Testing Facebook API connection...');
    const axios = require('axios');
    try {
      const response = await axios.get(`https://graph.facebook.com/v18.0/me?access_token=${pageData.accessToken}`);
      console.log('✅ Facebook API test successful:', response.data);
    } catch (error) {
      console.log('❌ Facebook API test failed:', error.response?.data || error.message);
    }

    console.log('🎉 Facebook page setup completed!');
    console.log('📋 Summary:');
    console.log(`   Page ID: ${pageData.pageId}`);
    console.log(`   Page Name: ${pageData.pageName}`);
    console.log(`   Company ID: ${company.id}`);
    console.log('');
    console.log('🔗 Next steps:');
    console.log('1. Make sure your webhook URL is accessible from the internet');
    console.log('2. Configure Facebook App webhook settings');
    console.log('3. Test by sending a message to the page');

  } catch (error) {
    console.error('❌ Error setting up Facebook page:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFacebookPage();
