import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_REELS = [
  {
    title: 'بيجامة هايدي زراير مطعمة فرو 😍',
    code: '#2061',
    views: '14.2K',
    duration: '0:24',
    thumbnail: 'https://res.cloudinary.com/p4abpsol/image/upload/v1795214686/fashion_zone_products/og1uxgytaio9nqh870cm.jpg',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-off-a-dress-41551-large.mp4',
    price: 650,
    slug: '6268',
    orderIndex: 0,
    isActive: true,
  },
  {
    title: 'ترينج وسوت خروج ميلتون شتوي فاخر',
    code: '#4102',
    views: '18.9K',
    duration: '0:31',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-modelling-a-dress-in-a-studio-41549-large.mp4',
    price: 720,
    slug: '6268',
    orderIndex: 1,
    isActive: true,
  },
  {
    title: 'جاكت ووتر بروف مبطن فرو مستورد',
    code: '#3095',
    views: '22.4K',
    duration: '0:28',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-turning-around-in-a-dress-41550-large.mp4',
    price: 890,
    slug: '6268',
    orderIndex: 2,
    isActive: true,
  },
  {
    title: 'طقم بيجامة قطيفة شين فاخرة للمنزل',
    code: '#1088',
    views: '11.6K',
    duration: '0:20',
    thumbnail: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-studio-41552-large.mp4',
    price: 580,
    slug: '6268',
    orderIndex: 3,
    isActive: true,
  },
];

// GET: Fetch all reels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';

    let reels = await prisma.fashionReel.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });

    // If completely empty in DB, auto-seed defaults once
    if (reels.length === 0) {
      try {
        await prisma.fashionReel.createMany({
          data: DEFAULT_REELS,
        });
        reels = await prisma.fashionReel.findMany({
          where: includeInactive ? undefined : { isActive: true },
          orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
        });
      } catch (seedErr) {
        console.warn('Could not auto-seed default reels:', seedErr);
        // Fallback to static array in response
        return NextResponse.json({
          success: true,
          reels: DEFAULT_REELS.map((r, idx) => ({ ...r, id: `default-${idx}` })),
        });
      }
    }

    return NextResponse.json({ success: true, reels });
  } catch (error: any) {
    console.error('Error fetching reels:', error);
    return NextResponse.json({
      success: true,
      reels: DEFAULT_REELS.map((r, idx) => ({ ...r, id: `default-${idx}` })),
    });
  }
}

// POST: Add new reel (Admin only)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { title, code, views, duration, thumbnail, videoUrl, price, slug, orderIndex, isActive } = body;

    if (!title || !thumbnail || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'عنوان الفيديو، صورة الغلاف، ورابط الفيديو مطلوبين' },
        { status: 400 }
      );
    }

    const reel = await prisma.fashionReel.create({
      data: {
        title: title.trim(),
        code: code ? String(code).trim() : null,
        views: views ? String(views).trim() : '10.5K',
        duration: duration ? String(duration).trim() : '0:30',
        thumbnail: thumbnail.trim(),
        videoUrl: videoUrl.trim(),
        price: price ? parseFloat(price) : null,
        slug: slug ? String(slug).trim() : null,
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, reel });
  } catch (error: any) {
    console.error('Error creating reel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إضافة الفيديو' },
      { status: 500 }
    );
  }
}

// PATCH: Update existing reel (Admin only)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { id, title, code, views, duration, thumbnail, videoUrl, price, slug, orderIndex, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الفيديو مطلوب' }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (code !== undefined) updateData.code = code ? String(code).trim() : null;
    if (views !== undefined) updateData.views = String(views).trim();
    if (duration !== undefined) updateData.duration = String(duration).trim();
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail.trim();
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl.trim();
    if (price !== undefined) updateData.price = price ? parseFloat(price) : null;
    if (slug !== undefined) updateData.slug = slug ? String(slug).trim() : null;
    if (orderIndex !== undefined) updateData.orderIndex = parseInt(orderIndex, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const reel = await prisma.fashionReel.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, reel });
  } catch (error: any) {
    console.error('Error updating reel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في تعديل الفيديو' },
      { status: 500 }
    );
  }
}

// DELETE: Remove reel (Admin only)
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الفيديو مطلوب' }, { status: 400 });
    }

    await prisma.fashionReel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting reel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في حذف الفيديو' },
      { status: 500 }
    );
  }
}
