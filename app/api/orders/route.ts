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

// PATCH /api/orders - تحديث بيانات الطلب بالكامل أو حالته
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      status,
      trackingNumber,
      notes,
      customerName,
      customerPhone,
      customerAddress,
      total,
      items,
      couponCode,
      discountAmount,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (trackingNumber !== undefined) dataToUpdate.trackingNumber = trackingNumber;
    if (notes !== undefined) dataToUpdate.notes = notes;
    if (customerName !== undefined) dataToUpdate.customerName = customerName;
    if (customerPhone !== undefined) dataToUpdate.customerPhone = customerPhone;
    if (customerAddress !== undefined) dataToUpdate.customerAddress = customerAddress;
    if (total !== undefined) dataToUpdate.total = parseFloat(total);
    if (items !== undefined) dataToUpdate.items = items;
    if (couponCode !== undefined) dataToUpdate.couponCode = couponCode;
    if (discountAmount !== undefined) dataToUpdate.discountAmount = parseFloat(discountAmount);

    const updated = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث بيانات الطلب' },
      { status: 500 }
    );
  }
}

// DELETE /api/orders - حذف طلب محدد أو مسح سجل الطلبات
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.order.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
    } else {
      const deleted = await prisma.order.deleteMany({});
      return NextResponse.json({ success: true, count: deleted.count, message: 'تم مسح سجل الطلبات بنجاح' });
    }
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الطلب' },
      { status: 500 }
    );
  }
}
