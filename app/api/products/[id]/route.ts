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

// PATCH /api/products/[id] - تحديث توفر المنتج أو سعره أو بياناته والمقاسات
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dataToUpdate: any = {};
    
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.nameEn !== undefined) dataToUpdate.nameEn = body.nameEn;
    if (body.code !== undefined) dataToUpdate.code = body.code;
    if (body.price !== undefined) dataToUpdate.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) {
      dataToUpdate.originalPrice = body.originalPrice !== null && body.originalPrice !== '' ? parseFloat(body.originalPrice) : null;
    }
    if (body.costPrice !== undefined) {
      dataToUpdate.costPrice = body.costPrice !== null && body.costPrice !== '' ? parseFloat(body.costPrice) : null;
    }
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.categoryId && typeof body.categoryId === 'string' && body.categoryId.trim()) {
      dataToUpdate.categoryId = body.categoryId;
    }
    if (body.sizes !== undefined) dataToUpdate.sizes = body.sizes;
    if (body.colors !== undefined) dataToUpdate.colors = body.colors;
    if (body.images !== undefined) dataToUpdate.images = body.images;
    if (body.inStock !== undefined) dataToUpdate.inStock = Boolean(body.inStock);
    if (body.isNewArrival !== undefined) dataToUpdate.isNewArrival = Boolean(body.isNewArrival);
    if (body.isFeatured !== undefined) dataToUpdate.isFeatured = Boolean(body.isFeatured);

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: dataToUpdate,
    });
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تعديل المنتج: ' + (error.message || '') },
      { status: 500 }
    );
  }
}
