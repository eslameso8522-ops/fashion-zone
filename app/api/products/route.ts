import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// POST /api/products - إضافة منتج جديد إلى قاعدة بيانات MySQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      nameEn,
      description,
      price,
      originalPrice,
      categoryId,
      images,
      sizes,
      colors,
      isFeatured,
      isNewArrival,
    } = body;

    // Generate unique slug
    const baseSlug = (nameEn || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newProduct = await prisma.product.create({
      data: {
        name,
        nameEn: nameEn || null,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        categoryId,
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        inStock: true,
        rating: 5.0,
        reviewsCount: 1,
      },
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
