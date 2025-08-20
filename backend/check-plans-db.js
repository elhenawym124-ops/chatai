const { PrismaClient } = require('@prisma/client');

async function checkPlans() {
  const prisma = new PrismaClient();
  
  try {
    const customPlans = await prisma.planConfiguration.findMany();
    console.log('📊 Custom Plans in Database:');
    if (customPlans.length === 0) {
      console.log('❌ No custom plans found in database');
    } else {
      customPlans.forEach(plan => {
        console.log(`- ${plan.planType}: ${plan.price} ${plan.currency}`);
      });
    }
    
    // Also check companies and their plans
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        currency: true
      }
    });
    
    console.log('\n🏢 Companies and their plans:');
    companies.forEach(company => {
      console.log(`- ${company.name}: ${company.plan} (${company.currency})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
