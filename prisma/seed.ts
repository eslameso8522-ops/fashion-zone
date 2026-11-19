import { PrismaClient } from '@prisma/client';
import { CATEGORIES, PRODUCTS } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed to TiDB Cloud MySQL...');

  // 1. Clear existing data
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  // 2. Insert Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        image: cat.image,
      },
    });
    categoryMap.set(cat.slug, createdCat.id);
    console.log(`✅ Created Category: ${cat.name}`);
  }

  // 3. Insert Products
  for (const prod of PRODUCTS) {
    const categoryId = categoryMap.get(prod.categorySlug);
    if (!categoryId) continue;

    await prisma.product.create({
      data: {
        slug: prod.slug,
        name: prod.name,
        nameEn: prod.nameEn || null,
        description: prod.description,
        price: prod.price,
        originalPrice: prod.originalPrice || null,
        categoryId: categoryId,
        images: prod.images,
        sizes: prod.sizes || [],
        colors: prod.colors || [],
        isFeatured: prod.isFeatured || false,
        isNewArrival: prod.isNewArrival || false,
        inStock: prod.inStock,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
      },
    });
    console.log(`✅ Created Product: ${prod.name}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
