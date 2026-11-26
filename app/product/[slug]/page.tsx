import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductDetailsClient from './ProductDetailsClient';

interface Props {
  params: { slug: string };
}

async function getProductBySlug(slug: string) {
  try {
    const raw = (slug || '').trim();
    const decoded = decodeURIComponent(raw).trim();
    const stripped = decoded.replace(/^-+|-+$/g, '');

    // 1. Direct match on decoded
    let dbProduct = await prisma.product.findUnique({
      where: { slug: decoded },
      include: { category: true },
    });

    // 2. Match without leading/trailing hyphens
    if (!dbProduct && stripped && stripped !== decoded) {
      dbProduct = await prisma.product.findUnique({
        where: { slug: stripped },
        include: { category: true },
      });
    }

    // 3. Match with leading hyphen if needed
    if (!dbProduct && stripped) {
      dbProduct = await prisma.product.findUnique({
        where: { slug: `-${stripped}` },
        include: { category: true },
      });
    }

    // 4. Match by product ID directly
    if (!dbProduct) {
      dbProduct = await prisma.product.findUnique({
        where: { id: decoded },
        include: { category: true },
      }).catch(() => null);
    }

    // 5. Match by product code or partial slug
    if (!dbProduct && stripped) {
      dbProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { code: stripped },
            { slug: { contains: stripped } },
          ],
        },
        include: { category: true },
      });
    }

    if (dbProduct) {
      return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        nameEn: dbProduct.nameEn || undefined,
        description: dbProduct.description,
        price: dbProduct.price,
        originalPrice: dbProduct.originalPrice || undefined,
        category: dbProduct.category.name,
        categorySlug: dbProduct.category.slug,
        images: (dbProduct.images as string[]) || [],
        sizes: (dbProduct.sizes as string[]) || [],
        colors: (dbProduct.colors as { name: string; hex: string }[]) || [],
        isFeatured: dbProduct.isFeatured,
        isNewArrival: dbProduct.isNewArrival,
        inStock: dbProduct.inStock,
        rating: dbProduct.rating,
        reviewsCount: dbProduct.reviewsCount,
      };
    }
  } catch (err) {
    console.error('Error fetching product from DB:', err);
  }

  return null;
}

// Generate Dynamic SEO & Open Graph Meta Tags for Facebook & WhatsApp
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: 'المنتج غير موجود | Fashion Zone',
    };
  }

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || 'https://fashion-zone.vercel.app';
  const productUrl = `${storeUrl}/product/${product.slug}`;
  const ogImage = product.images[0] || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200';

  return {
    title: `${product.name} | Fashion Zone`,
    description: `${product.description.slice(0, 160)}... تسوقي الآن بسعر ${product.price} جنيه مع شحن سريع ومعاينة قبل الاستلام.`,
    keywords: [product.name, product.category, 'Fashion Zone', 'أزياء بنات', 'فساتين'],
    openGraph: {
      title: `${product.name} - ${product.price} جنيه | Fashion Zone`,
      description: product.description,
      url: productUrl,
      siteName: 'Fashion Zone',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1000,
          alt: product.name,
        },
      ],
      type: 'website',
      locale: 'ar_EG',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${product.price} جنيه`,
      description: product.description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Schema.org / JSON-LD structured data for Google Search rich snippet
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Fashion Zone',
    },
    offers: {
      '@type': 'Offer',
      url: `https://fashion-zone.vercel.app/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Fashion Zone',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
    },
  };

  return (
    <>
      {/* Inject Google Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailsClient product={product} />
    </>
  );
}
