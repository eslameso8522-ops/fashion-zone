import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - جلب التصنيفات مع عدد المنتجات من MySQL
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      image: cat.image,
      itemCount: cat._count.products,
    }));

    return NextResponse.json({ success: true, categories: formattedCategories });
  } catch (error: any) {
    console.error('Error fetching categories from MySQL:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الأقسام من قاعدة البيانات' },
      { status: 500 }
    );
  }
}
