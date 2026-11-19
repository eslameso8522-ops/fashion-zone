const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.order.deleteMany({});
  console.log('Orders deleted:', result.count);
  await prisma.$disconnect();
}

main().catch(console.error);
