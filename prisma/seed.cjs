const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Aa251389!!!', 10);

  await prisma.user.upsert({
    where: { email: 'bricyovlogs@gmail.com' },
    update: {
      name: 'Void',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      name: 'Void',
      email: 'bricyovlogs@gmail.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  await prisma.product.upsert({
    where: { type: 'OPTIMIZER' },
    update: { name: 'VKS Boost Optimizer', priceCents: 4990 },
    create: { name: 'VKS Boost Optimizer', type: 'OPTIMIZER', priceCents: 4990 },
  });

  await prisma.product.upsert({
    where: { type: 'PRECISSION_FIX' },
    update: { name: 'VKS Precision FIX', priceCents: 7990 },
    create: { name: 'VKS Precision FIX', type: 'PRECISSION_FIX', priceCents: 7990 },
  });

  await prisma.product.upsert({
    where: { type: 'CROSSHAIR' },
    update: { name: 'VKS Crosshair', priceCents: 1000 },
    create: { name: 'VKS Crosshair', type: 'CROSSHAIR', priceCents: 1000 },
  });

  console.log('Conta mãe criada/atualizada: bricyovlogs@gmail.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
