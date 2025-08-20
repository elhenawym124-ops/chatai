const { PrismaClient } = require('@prisma/client');

async function updatePlansPrices() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 تحديث أسعار الخطط للجنيه المصري...');
    
    // Update BASIC plan
    await prisma.planConfiguration.upsert({
      where: { planType: 'BASIC' },
      update: {
        price: 2500,
        currency: 'EGP'
      },
      create: {
        planType: 'BASIC',
        price: 2500,
        currency: 'EGP',
        billingCycle: 'monthly',
        features: {}
      }
    });
    console.log('✅ تم تحديث الخطة الأساسية: 2500 جنيه مصري');
    
    // Update PRO plan
    await prisma.planConfiguration.upsert({
      where: { planType: 'PRO' },
      update: {
        price: 7500,
        currency: 'EGP'
      },
      create: {
        planType: 'PRO',
        price: 7500,
        currency: 'EGP',
        billingCycle: 'monthly',
        features: {}
      }
    });
    console.log('✅ تم تحديث الخطة الاحترافية: 7500 جنيه مصري');
    
    // Update ENTERPRISE plan
    await prisma.planConfiguration.upsert({
      where: { planType: 'ENTERPRISE' },
      update: {
        price: 15000,
        currency: 'EGP'
      },
      create: {
        planType: 'ENTERPRISE',
        price: 15000,
        currency: 'EGP',
        billingCycle: 'monthly',
        features: {}
      }
    });
    console.log('✅ تم تحديث الخطة المؤسسية: 15000 جنيه مصري');
    
    console.log('\n🎉 تم تحديث جميع الخطط بنجاح!');
    
    // Verify updates
    const updatedPlans = await prisma.planConfiguration.findMany();
    console.log('\n📊 الأسعار المحدثة:');
    updatedPlans.forEach(plan => {
      console.log(`- ${plan.planType}: ${plan.price} ${plan.currency}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlansPrices();
