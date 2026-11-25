import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';

// GET /api/expenses - جلب قائمة المصروفات (خاص بالمدير)
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب المصروفات' },
      { status: 500 }
    );
  }
}

// POST /api/expenses - إضافة مصروف جديد (خاص بالمدير)
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { title, category, amount, notes, date } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال اسم المصروف وقيمته' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        title: title.trim(),
        category: category || 'OTHER',
        amount: parseFloat(amount) || 0,
        notes: notes ? notes.trim() : null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حفظ المصروف' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses - حذف مصروف (خاص بالمدير)
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف المصروف مطلوب' },
        { status: 400 }
      );
    }

    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف المصروف بنجاح' });
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف المصروف' },
      { status: 500 }
    );
  }
}
