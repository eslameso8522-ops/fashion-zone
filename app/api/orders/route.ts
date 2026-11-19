import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/orders - جلب سجل الطلبات للإدارة
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب سجل الطلبات' },
      { status: 500 }
    );
  }
}

// POST /api/orders - تسجيل طلب جديد في قاعدة بيانات MySQL
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, total, notes } = body;

    const orderNumber = `FZ-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'عميلة واتساب',
        customerPhone: customerPhone || 'غير مسجل',
        customerAddress: customerAddress || 'سيتم تأكيده عبر الشات',
        items: items || [],
        total: parseFloat(total) || 0,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error creating order in MySQL:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حفظ بيانات الطلب' },
      { status: 500 }
    );
  }
}

// PATCH /api/orders - تحديث حالة الطلب ورقم التتبع
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, trackingNumber, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (notes !== undefined) dataToUpdate.notes = notes;

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث حالة الطلب' },
      { status: 500 }
    );
  }
}
