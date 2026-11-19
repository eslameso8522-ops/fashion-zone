const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearProducts() {
  try {
    const countBefore = await prisma.product.count();
    console.log(`Found ${countBefore} products in database.`);

    const deleted = await prisma.product.deleteMany({});
    console.log(`Successfully deleted ${deleted.count} products.`);

    const countAfter = await prisma.product.count();
    console.log(`Remaining products: ${countAfter}`);
  } catch (err) {
    console.error('Error deleting products:', err);
  } finally {
    await prisma.$disconnect();
  }
}

clearProducts();
