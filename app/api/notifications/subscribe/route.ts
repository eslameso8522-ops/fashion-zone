import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, role = 'CUSTOMER' } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'بيانات الاشتراك في الإشعارات غير مكتملة' },
        { status: 400 }
      );
    }

    const endpoint = String(subscription.endpoint);
    const p256dh = String(subscription.keys.p256dh || '');
    const auth = String(subscription.keys.auth || '');
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { success: false, error: 'مفاتيح التشفير p256dh و auth مطلوبة' },
        { status: 400 }
      );
    }

    const subscriber = await prisma.pushSubscriber.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh,
        auth,
        role: assignedRole,
      },
      update: {
        p256dh,
        auth,
        role: assignedRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل واشتراك الإشعارات بنجاح',
      subscriberId: subscriber.id,
    });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حفظ بيانات الاشتراك في الإشعارات' },
      { status: 500 }
    );
  }
}
