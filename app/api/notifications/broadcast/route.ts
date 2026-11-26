import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { sendPushNotificationToAll } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.authorized) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { title, body: content, url, role } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'عنوان الإشعار والمحتوى مطلوبان' },
        { status: 400 }
      );
    }

    const result = await sendPushNotificationToAll(
      {
        title: title.trim(),
        body: content.trim(),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: {
          url: url && typeof url === 'string' && url.trim() ? url.trim() : '/',
        },
      },
      role || 'CUSTOMER'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in broadcast route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في إرسال الإشعار' },
      { status: 500 }
    );
  }
}
