import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/categories - جلب الأقسام
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const navbarOnly = searchParams.get('navbar') === 'true';

    const whereClause: any = {};
    if (navbarOnly) {
      whereClause.showInNavbar = true;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      image: cat.image,
      showInNavbar: cat.showInNavbar,
      orderIndex: cat.orderIndex,
      itemCount: cat._count.products,
    }));

    return NextResponse.json({ success: true, categories: formattedCategories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الأقسام' },
      { status: 500 }
    );
  }
}

// POST /api/categories - إنشاء قسم جديد من لوحة التحكم (خاص بالمدير)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { name, image, showInNavbar } = body;

    if (!name || !image) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم القسم واختيار صورته' },
        { status: 400 }
      );
    }

    // Auto slug
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `category-${Date.now().toString().slice(-4)}`;
    
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        showInNavbar: showInNavbar !== undefined ? Boolean(showInNavbar) : true,
      },
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إنشاء القسم' },
      { status: 500 }
    );
  }
}

// PATCH /api/categories - تعديل القسم (الاسم، الصورة، أو الظهور في الناف بار) (خاص بالمدير)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { id, name, image, showInNavbar, orderIndex } = body;

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (image !== undefined) dataToUpdate.image = image;
    if (showInNavbar !== undefined) dataToUpdate.showInNavbar = Boolean(showInNavbar);
    if (orderIndex !== undefined) dataToUpdate.orderIndex = parseInt(orderIndex, 10);

    const updated = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تعديل القسم' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - حذف قسم (خاص بالمدير)
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف القسم مطلوب' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف القسم بنجاح' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف القسم' },
      { status: 500 }
    );
  }
}
