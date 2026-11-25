import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/orders - جلب سجل الطلبات للإدارة (خاص بالمدير)
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

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

// POST /api/orders - تسجيل طلب جديد في قاعدة بيانات MySQL (متاح للعملاء مع التحقق من صحة المدخلات)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, total, notes, couponCode, discountAmount } = body;

    // Validate inputs
    const cleanName = (typeof customerName === 'string' ? customerName : 'عميلة متجر').trim().slice(0, 100);
    const cleanPhone = (typeof customerPhone === 'string' ? customerPhone : '').trim().slice(0, 30);
    const cleanAddress = (typeof customerAddress === 'string' ? customerAddress : '').trim().slice(0, 300);
    const cleanNotes = (typeof notes === 'string' ? notes : '').trim().slice(0, 500);
    const parsedTotal = Math.max(0, parseFloat(total) || 0);

    const orderNumber = `FZ-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: cleanName || 'عميلة متجر',
        customerPhone: cleanPhone || 'غير مسجل',
        customerAddress: cleanAddress || 'سيتم تأكيده عبر الواتساب',
        items: Array.isArray(items) ? items : [],
        total: parsedTotal,
        notes: cleanNotes || null,
        couponCode: couponCode ? String(couponCode).toUpperCase().trim().slice(0, 30) : null,
        discountAmount: discountAmount ? Math.max(0, parseFloat(discountAmount) || 0) : undefined,
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

// PATCH /api/orders - تحديث بيانات الطلب بالكامل أو حالته (خاص بالمدير)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

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

// DELETE /api/orders - حذف طلب محدد أو مسح سجل الطلبات (خاص بالمدير)
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.order.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'تم حذف الطلب بنجاح' });
    } else {
      const confirmWipe = searchParams.get('confirm') === 'wipe_all_orders_confirmed';
      if (!confirmWipe) {
        return NextResponse.json(
          { success: false, error: 'لمسح جميع الطلبات يجب تأكيد العملية بوضوح' },
          { status: 400 }
        );
      }
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
