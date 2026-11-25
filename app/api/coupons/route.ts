import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/coupons - جلب الكوبونات أو فحص كود خصم
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim();
    const orderTotal = parseFloat(searchParams.get('total') || '0');

    // 1. If checking a specific coupon for checkout / cart
    if (code) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return NextResponse.json(
          { success: false, error: 'كود الخصم غير موجود، تأكدي من كتابته بشكل صحيح' },
          { status: 404 }
        );
      }

      if (!coupon.isActive) {
        return NextResponse.json(
          { success: false, error: 'عذراً، هذا الكود تم إيقافه حالياً' },
          { status: 400 }
        );
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'عذراً، انتهت صلاحية كود الخصم هذا' },
          { status: 400 }
        );
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, error: 'عذراً، تم الوصول إلى الحد الأقصى لاستخدام هذا الكود' },
          { status: 400 }
        );
      }

      if (orderTotal < coupon.minOrderAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `الحد الأدنى لتفعيل هذا الكود هو ${coupon.minOrderAmount} ج.م (إجمالي طلبك الحالي: ${orderTotal} ج.م)`,
          },
          { status: 400 }
        );
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (orderTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, orderTotal);
      }

      return NextResponse.json({
        success: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discountAmount: Math.round(discountAmount),
      });
    }

    // 2. Admin: Get all coupons (خاص بالمدير)
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    console.error('Error fetching/validating coupons:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في معالجة طلب كوبونات الخصم' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - إنشاء كود خصم جديد للإدارة (خاص بالمدير)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال كود الخصم وقيمة الخصم' },
        { status: 400 }
      );
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'هذا الكود مسجل بالفعل، يرجى اختيار كود آخر' },
        { status: 400 }
      );
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description || null,
        discountType: discountType || 'PERCENTAGE',
        discountValue: parseFloat(discountValue),
        minOrderAmount: parseFloat(minOrderAmount || '0'),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon: newCoupon });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء كود الخصم' },
      { status: 500 }
    );
  }
}

// PATCH /api/coupons - تعديل الكوبون أو تفعيله/تعطيله (خاص بالمدير)
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { id, isActive, discountValue, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الكوبون مطلوب' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);
    if (discountValue !== undefined) dataToUpdate.discountValue = parseFloat(discountValue);
    if (description !== undefined) dataToUpdate.description = description;

    const updated = await prisma.coupon.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تعديل الكوبون' },
      { status: 500 }
    );
  }
}

// DELETE /api/coupons - حذف الكوبون (خاص بالمدير)
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الكوبون مطلوب' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف الكوبون بنجاح' });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الكوبون' },
      { status: 500 }
    );
  }
}
