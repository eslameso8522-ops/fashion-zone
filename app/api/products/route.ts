import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { notifyCustomersOnNewProduct } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// GET /api/products - جلب جميع المنتجات من قاعدة بيانات MySQL
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const featuredOnly = searchParams.get('featured') === 'true';

    const whereClause: any = {};
    if (categorySlug) {
      whereClause.category = { slug: categorySlug };
    }
    if (featuredOnly) {
      whereClause.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('Error fetching products from MySQL:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المنتجات من قاعدة البيانات' },
      { status: 500 }
    );
  }
}

// POST /api/products - إضافة منتج جديد إلى قاعدة بيانات MySQL (خاص بالمدير)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      code,
      description,
      price,
      originalPrice,
      categoryId,
      images,
      sizes,
      colors,
      reviews,
      rating,
      reviewsCount,
      isFeatured,
      isNewArrival,
    } = body;

    // Generate or use custom unique slug for SEO
    let slug = '';
    if (body.slug && typeof body.slug === 'string' && body.slug.trim()) {
      slug = body.slug
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        .replace(/^-+|-+$/g, '');
    }

    if (!slug) {
      const baseSlug = (nameEn || name || 'product')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '')
        .replace(/^-+|-+$/g, '');
      const codePart = code && typeof code === 'string' && code.trim() ? `-${code.trim()}` : '';
      slug = `${baseSlug || 'item'}${codePart}-${Date.now().toString().slice(-4)}`;
    }

    // Ensure slug uniqueness
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-3)}`;
    }

    const reviewItems = Array.isArray(reviews) ? reviews : [];
    const computedRating = rating ? parseFloat(rating) : reviewItems.length > 0 ? 5.0 : 5.0;
    const computedCount = reviewsCount ? parseInt(reviewsCount, 10) : reviewItems.length > 0 ? reviewItems.length : 1;

    const newProduct = await prisma.product.create({
      data: {
        name,
        nameEn: nameEn || null,
        code: code || null,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId,
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        reviews: reviewItems,
        rating: computedRating,
        reviewsCount: computedCount,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        inStock: true,
      },
    });

    // Notify Customers via Web Push (non-blocking)
    const primaryImg =
      Array.isArray(newProduct.images) && newProduct.images.length > 0
        ? String(newProduct.images[0])
        : undefined;

    notifyCustomersOnNewProduct({
      name: newProduct.name,
      price: newProduct.price,
      slug: newProduct.slug,
      image: primaryImg,
    }).catch((err) => {
      console.warn('Failed to notify customers of new product:', err);
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Error creating product in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في حفظ المنتج' },
      { status: 500 }
    );
  }
}
