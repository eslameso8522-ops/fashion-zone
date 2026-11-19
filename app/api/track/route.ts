import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('query')?.trim() || '';

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال كود الطلب (مثل FZ-123456) أو رقم الهاتف المسجل به' },
        { status: 400 }
      );
    }

    const upperQuery = rawQuery.toUpperCase();

    // Query MySQL TiDB
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: upperQuery },
          { orderNumber: { contains: rawQuery } },
          { customerPhone: { contains: rawQuery } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لم نتمكن من العثور على طلب بهذا الرقم. تأكدي من كتابة كود الطلب بالكامل (مثال: FZ-123456) أو رقم الهاتف المسجل.',
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
