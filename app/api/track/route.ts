import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('query')?.trim() || '';

    if (!rawQuery || rawQuery.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'يرجى إدخال كود الطلب بالكامل (مثال: FZ-123456) أو رقم الهاتف المكون من 11 رقماً للبحث.',
        },
        { status: 400 }
      );
    }

    const upperQuery = rawQuery.toUpperCase();
    const cleanDigits = rawQuery.replace(/[^0-9]/g, '');

    const whereConditions: any[] = [
      { orderNumber: upperQuery },
    ];

    // If query contains at least 9 numeric digits, allow exact phone lookup
    if (cleanDigits.length >= 9) {
      whereConditions.push({ customerPhone: cleanDigits });
      whereConditions.push({ customerPhone: `+2${cleanDigits}` });
      whereConditions.push({ customerPhone: `0${cleanDigits.replace(/^0+/, '')}` });
    }

    // Query MySQL TiDB
    const orders = await prisma.order.findMany({
      where: {
        OR: whereConditions,
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        total: true,
        items: true,
        couponCode: true,
        discountAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لم نتمكن من العثور على طلب بهذا الرقم. تأكدي من كتابة كود الطلب بالكامل (مثال: FZ-123456) أو رقم الهاتف المسجل به الطلب.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: 'تعذر الاستعلام عن حالة الطلب حالياً. يرجى المحاولة مجدداً.' },
      { status: 500 }
    );
  }
}
