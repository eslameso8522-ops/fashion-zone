import { MetadataRoute } from 'next';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600; // Revalidate sitemap every 1 hour

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Database timeout for sitemap')), timeoutMs)),
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://fashion-zone.vercel.app';

  // Base static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // Category pages from DB with fallback
  let categorySlugs: string[] = CATEGORIES.map((c) => c.slug);
  try {
    const dbCats = await withTimeout(
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      })
    );
    if (dbCats && dbCats.length > 0) {
      categorySlugs = dbCats.map((c) => c.slug);
    }
  } catch (e) {
    console.warn('Fallback to static categories in sitemap due to DB status');
  }

  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Product pages from DB with fallback
  let productSlugs: string[] = PRODUCTS.map((p) => p.slug);
  try {
    const dbProducts = await withTimeout(
      prisma.product.findMany({
        select: { slug: true, updatedAt: true },
      })
    );
    if (dbProducts && dbProducts.length > 0) {
      productSlugs = dbProducts.map((p) => p.slug);
    }
  } catch (e) {
    console.warn('Fallback to static products in sitemap due to DB status');
  }

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
