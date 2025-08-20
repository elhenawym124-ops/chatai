const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCompanies() {
  try {
    const companies = await prisma.company.findMany();
    console.log('Companies in database:');
    companies.forEach(company => {
      console.log(`  ID: ${company.id}, Name: ${company.name}`);
    });
    
    if (companies.length > 0) {
      console.log(`\nUsing first company ID: ${companies[0].id}`);
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanies();
