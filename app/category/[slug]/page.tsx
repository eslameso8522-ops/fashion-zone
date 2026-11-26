import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: { slug: string };
}

async function getCategoryData(slug: string) {
  try {
    const dbCategory = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (dbCategory) {
      const category = {
        id: dbCategory.id,
        slug: dbCategory.slug,
        name: dbCategory.name,
        image: dbCategory.image,
        itemCount: dbCategory.products.length,
      };

      const products = dbCategory.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        nameEn: p.nameEn || undefined,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice || undefined,
        category: dbCategory.name,
        categorySlug: dbCategory.slug,
        images: (p.images as string[]) || [],
        sizes: (p.sizes as string[]) || [],
        colors: (p.colors as { name: string; hex: string }[]) || [],
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        inStock: p.inStock,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
      }));

      return { category, products };
    }
  } catch (e) {
    console.error('Error fetching category data from DB:', e);
  }

  return { category: null, products: [] };
}

export async function generateMetadata({ params }: Props) {
  const { category } = await getCategoryData(params.slug);
  if (!category) return { title: 'القسم غير موجود | Fashion Zone' };

  return {
    title: `${category.name} | Fashion Zone`,
    description: `تسوقي تشكيلة ${category.name} المميزة من متجر Fashion Zone بأفضل الأسعار وأرقى الخامات.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category, products } = await getCategoryData(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">أقسام المتجر</span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 font-serif">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          اكتشفي تشكيلة {category.name} الحصرية المختارة بعناية لأناقتك وجمالك ({products.length} قطعة)
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-pink-50/50 rounded-3xl border border-pink-100">
          <p className="text-stone-600 font-bold text-sm">
            جاري إضافة تشكيلات جديدة لهذا القسم قريباً جداً ✨
          </p>
        </div>
      )}
    </div>
  );
}
