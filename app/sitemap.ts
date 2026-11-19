import { MetadataRoute } from 'next';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://fashion-zone.vercel.app';

  // Base pages
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
  ];

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Fetch all product slugs directly from MySQL
  let productSlugs: string[] = PRODUCTS.map((p) => p.slug);
  try {
    const dbProducts = await prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    });
    if (dbProducts.length > 0) {
      productSlugs = dbProducts.map((p) => p.slug);
    }
  } catch (e) {
    console.error('Error loading slugs for sitemap from MySQL:', e);
  }

  const productPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
