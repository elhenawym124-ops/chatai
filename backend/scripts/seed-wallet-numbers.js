const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedWalletNumbers() {
  console.log('🏦 إضافة أرقام المحافظ الأولية...');

  const walletNumbers = [
    {
      name: 'فودافون كاش',
      number: '01234567890',
      icon: '📱',
      color: '#E60026',
      isActive: true
    },
    {
      name: 'أورانج موني',
      number: '01098765432',
      icon: '🟠',
      color: '#FF6600',
      isActive: true
    },
    {
      name: 'إتصالات فلوس',
      number: '01156789012',
      icon: '🔵',
      color: '#0066CC',
      isActive: true
    },
    {
      name: 'CIB Wallet',
      number: '01087654321',
      icon: '🏦',
      color: '#1B365D',
      isActive: true
    }
  ];

  for (const wallet of walletNumbers) {
    try {
      const existing = await prisma.walletNumber.findFirst({
        where: { number: wallet.number }
      });

      if (!existing) {
        await prisma.walletNumber.create({
          data: wallet
        });
        console.log(`✅ تم إضافة: ${wallet.name} - ${wallet.number}`);
      } else {
        console.log(`⚠️ موجود بالفعل: ${wallet.name} - ${wallet.number}`);
      }
    } catch (error) {
      console.error(`❌ خطأ في إضافة ${wallet.name}:`, error.message);
    }
  }

  console.log('✅ انتهى إضافة أرقام المحافظ');
}

async function main() {
  try {
    await seedWalletNumbers();
  } catch (error) {
    console.error('❌ خطأ في السكريبت:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
