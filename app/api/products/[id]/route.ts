import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/products/[id] - حذف منتج من MySQL
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المنتج' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id] - تحديث توفر المنتج أو سعره
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تعديل المنتج' },
      { status: 500 }
    );
  }
}
